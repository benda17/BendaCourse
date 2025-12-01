import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as crypto from 'crypto'
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
שלום,

אנו שמחים לבשר לך שעברנו לפלטפורמה חדשה ומשופרת!

פלטפורמת הלמידה החדשה שלנו מציעה חוויית למידה מתקדמת, ממשק נוח יותר, ומעקב התקדמות מפורט. 
כל הקורסים והשיעורים שלך זמינים כעת בפלטפורמה החדשה.

פרטי הכניסה שלך:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 שם משתמש (אימייל): ${email}
🔑 סיסמה: ${password}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

אנא התחבר לפלטפורמה החדשה בכתובת:
${platformUrl}/login

אנו ממליצים לשנות את הסיסמה לאחר הכניסה הראשונה.

אם יש לך שאלות או בעיות, אנא צור איתנו קשר.

בברכה,
צוות בית הספר של בנדה
`

async function sendCredentialsEmail() {
  // Email configuration from environment variables
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
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
    console.error('  SMTP_HOST (optional, defaults to smtp.gmail.com)')
    console.error('  SMTP_PORT (optional, defaults to 587)')
    console.error('  PLATFORM_URL (optional, defaults to https://bendacourse.vercel.app)')
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
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  console.log(`Found ${users.length} users to process\n`)

  let successCount = 0
  let failCount = 0
  const failedEmails: string[] = []

  // Process each user
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const newPassword = generatePassword()
    
    try {
      // Hash and update password
      const hashedPassword = await hashPassword(newPassword)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      // Send email
      const mailOptions = {
        from: `"בית הספר של בנדה" <${fromEmail}>`,
        to: user.email,
        subject: 'פרטי הכניסה לפלטפורמה החדשה - בית הספר של בנדה',
        text: getHebrewMessage(user.email, newPassword, platformUrl),
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #1a1a1a; color: #e8dcc0; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px; text-align: center;">ברוכים הבאים לפלטפורמה החדשה!</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                שלום ${user.name || ''},
              </p>
              
              <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
                אנו שמחים לבשר לך שעברנו לפלטפורמה חדשה ומשופרת!
              </p>
              
              <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
                פלטפורמת הלמידה החדשה שלנו מציעה חוויית למידה מתקדמת, ממשק נוח יותר, ומעקב התקדמות מפורט. 
                כל הקורסים והשיעורים שלך זמינים כעת בפלטפורמה החדשה.
              </p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0; border-right: 4px solid #3b82f6;">
                <h2 style="margin-top: 0; color: #1a1a1a; font-size: 18px;">פרטי הכניסה שלך:</h2>
                <p style="margin: 10px 0; font-size: 16px;">
                  <strong>📧 שם משתמש (אימייל):</strong><br>
                  <span style="font-family: monospace; background-color: #e8e8e8; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px;">${user.email}</span>
                </p>
                <p style="margin: 10px 0; font-size: 16px;">
                  <strong>🔑 סיסמה:</strong><br>
                  <span style="font-family: monospace; background-color: #e8e8e8; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px; font-weight: bold; color: #3b82f6;">${newPassword}</span>
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${platformUrl}/login" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  התחבר לפלטפורמה החדשה
                </a>
              </div>
              
              <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <strong>חשוב:</strong> אנו ממליצים לשנות את הסיסמה לאחר הכניסה הראשונה.<br>
                אם יש לך שאלות או בעיות, אנא צור איתנו קשר.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>בברכה,<br>צוות בית הספר של בנדה</p>
            </div>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
      
      successCount++
      console.log(`✓ [${i + 1}/${users.length}] Sent to: ${user.email}`)
      
      // Rate limiting - wait 1 second between emails to avoid spam filters
      if (i < users.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      failCount++
      failedEmails.push(user.email)
      console.error(`❌ [${i + 1}/${users.length}] Failed to send to: ${user.email}`)
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Summary:')
  console.log(`   ✓ Successfully sent: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  
  if (failedEmails.length > 0) {
    console.log('\n   Failed emails:')
    failedEmails.forEach(email => console.log(`     - ${email}`))
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  await prisma.$disconnect()
}

sendCredentialsEmail().catch(console.error)

