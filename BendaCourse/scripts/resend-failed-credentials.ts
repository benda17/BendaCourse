import { PrismaClient } from '@prisma/client'
import { hashPassword, verifyPassword } from '../lib/auth'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as crypto from 'crypto'
import * as fs from 'fs'
import nodemailer from 'nodemailer'

dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

// Generate a secure random password
function generatePassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const randomBytes = crypto.randomBytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length]
  }
  return password
}

// Hebrew marketing message
const getHebrewMessage = (email: string, password: string, platformUrl: string) => `
היי 🅱️!

זה בנדה, 

יש לי חדשות מצוינות בשבילך —

אני שמח לעדכן שעברנו לפלטפורמת לימוד חדשה, מתקדמת ונוחה הרבה יותר.

מהיום מחכה לך חוויית משתמש חלקה, מהירה ועם מעקב התקדמות חכם שיעזור לך ללמוד בצורה הכי טובה שיש.

כל הקורסים והשיעורים שלך כבר מחכים לך שם, עם שם וסיסמא שייעודיים רק לך ויאפשרו לך לקבל חווית למידה מעמיקה, עם סטטיסטיקות ודרכי ייעול למידה

פרטי הכניסה שלך:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 אימייל: ${email}

🔑 סיסמה: ${password}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

להתחברות ישירה:

${platformUrl}/login

מומלץ להחליף סיסמה אחרי הכניסה הראשונה, רק בשביל השקט שלך.

ואם משהו לא עובד כמו שצריך — אני כאן עבורך לכל שאלה.



באהבה,

צוות בנדה בע"מ 🅱️
`

async function resendFailedCredentials() {
  // Email configuration from environment variables
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_FROM,
      pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
    },
  }

  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER
  const platformUrl = process.env.PLATFORM_URL || 'https://bendacourse.vercel.app'

  if (!fromEmail || !emailConfig.auth.pass) {
    console.error('❌ Email configuration missing!')
    console.error('Please set the following environment variables:')
    console.error('  EMAIL_FROM or SMTP_USER - Your email address')
    console.error('  SMTP_PASSWORD or EMAIL_PASSWORD - Your email password or app password')
    process.exit(1)
  }

  // Create transporter
  const transporter = nodemailer.createTransport(emailConfig)

  // Verify connection
  try {
    await transporter.verify()
    console.log('✓ Email server connection verified\n')
  } catch (error) {
    console.error('❌ Email server connection failed:', error)
    process.exit(1)
  }

  // Get all users
  console.log('Connecting to database...')
  let allUsers
  try {
    allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    console.log(`✓ Found ${allUsers.length} total users\n`)
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('Error:', error instanceof Error ? error.message : String(error))
    console.error('\nPlease check your DATABASE_URL in .env file')
    await prisma.$disconnect()
    process.exit(1)
  }

  // Check if there's a failed-emails.txt file from previous run
  const failedEmailsFile = path.join(__dirname, '../failed-emails.txt')
  let specificEmails: string[] = []
  
  if (fs.existsSync(failedEmailsFile)) {
    const failedEmailsContent = fs.readFileSync(failedEmailsFile, 'utf-8')
    specificEmails = failedEmailsContent.split('\n').filter(email => email.trim())
    console.log(`Found ${specificEmails.length} failed emails from previous run`)
    console.log('Will resend only to these emails\n')
  }

  // Determine which users to process
  let usersToProcess
  if (specificEmails.length > 0) {
    // Only resend to previously failed emails
    usersToProcess = allUsers.filter(user => 
      specificEmails.includes(user.email.toLowerCase())
    )
    console.log(`Filtered to ${usersToProcess.length} users from failed list\n`)
  } else {
    // Resend to all users (since we don't have a record of failures)
    usersToProcess = allUsers
    console.log(`Will resend credentials to ALL ${usersToProcess.length} users\n`)
    console.log('(No failed-emails.txt found, so resending to everyone)\n')
  }

  let successCount = 0
  let failCount = 0
  const failedEmails: string[] = []

  // Process each user
  for (let i = 0; i < usersToProcess.length; i++) {
    const user = usersToProcess[i]
    const newPassword = generatePassword()
    
    try {
      // Hash and update password
      const hashedPassword = await hashPassword(newPassword)
      
      // Update password in database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })
      
      // Verify the password was saved correctly
      const passwordMatches = await verifyPassword(newPassword, updatedUser.password)
      if (!passwordMatches) {
        throw new Error(`Password verification failed after update for ${user.email}`)
      }
      
      console.log(`✓ [${i + 1}/${usersToProcess.length}] Password updated for: ${user.email}`)

      // Send email
      const mailOptions = {
        from: `"בית הספר של בנדה" <${fromEmail}>`,
        to: user.email,
        subject: 'פרטי הכניסה לפלטפורמה החדשה - בית הספר של בנדה',
        text: getHebrewMessage(user.email, newPassword, platformUrl),
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #1a1a1a; color: #e8dcc0; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px; text-align: center;">היי 🅱️! זה בנדה</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
                יש לי חדשות מצוינות בשבילך —
              </p>
              
              <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
                אני שמח לעדכן שעברנו לפלטפורמת לימוד חדשה, מתקדמת ונוחה הרבה יותר.
              </p>
              
              <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
                מהיום מחכה לך חוויית משתמש חלקה, מהירה ועם מעקב התקדמות חכם שיעזור לך ללמוד בצורה הכי טובה שיש.
              </p>
              
              <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
                כל הקורסים והשיעורים שלך כבר מחכים לך שם, עם שם וסיסמא שייעודיים רק לך ויאפשרו לך לקבל חווית למידה מעמיקה, עם סטטיסטיקות ודרכי ייעול למידה
              </p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0; border-right: 4px solid #3b82f6;">
                <h2 style="margin-top: 0; color: #1a1a1a; font-size: 18px;">פרטי הכניסה שלך:</h2>
                <p style="margin: 10px 0; font-size: 16px;">
                  <strong>📧 אימייל:</strong><br>
                  <span style="font-family: monospace; background-color: #e8e8e8; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px;">${user.email}</span>
                </p>
                <p style="margin: 10px 0; font-size: 16px;">
                  <strong>🔑 סיסמה:</strong><br>
                  <span style="font-family: monospace; background-color: #e8e8e8; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px; font-weight: bold; color: #3b82f6;">${newPassword}</span>
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${platformUrl}/login" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  להתחברות ישירה
                </a>
              </div>
              
              <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                מומלץ להחליף סיסמה אחרי הכניסה הראשונה, רק בשביל השקט שלך.<br><br>
                ואם משהו לא עובד כמו שצריך — אני כאן עבורך לכל שאלה.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>באהבה,<br>צוות בנדה בע"מ 🅱️</p>
            </div>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
      
      successCount++
      console.log(`✓ [${i + 1}/${usersToProcess.length}] Sent to: ${user.email}`)
      
      // Rate limiting - wait 2 seconds between emails to avoid spam filters
      if (i < usersToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      failCount++
      failedEmails.push(user.email)
      console.error(`❌ [${i + 1}/${usersToProcess.length}] Failed to send to: ${user.email}`)
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`)
      
      // Wait a bit longer on error before continuing
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Summary:')
  console.log(`   ✓ Successfully sent: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  
  if (failedEmails.length > 0) {
    console.log('\n   Failed emails:')
    failedEmails.forEach(email => console.log(`     - ${email}`))
    
    // Save failed emails to file for retry
    const failedFile = path.join(__dirname, '../failed-emails.txt')
    fs.writeFileSync(failedFile, failedEmails.join('\n'))
    console.log(`\n   Failed emails saved to: ${failedFile}`)
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  await prisma.$disconnect()
}

resendFailedCredentials().catch(console.error)

