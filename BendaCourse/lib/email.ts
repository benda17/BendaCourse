import nodemailer from 'nodemailer'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export function createEmailTransporter() {
  const emailConfig: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_FROM || '',
      pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || '',
    },
  }

  return nodemailer.createTransport(emailConfig)
}

export function getFromEmail(): string {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || ''
}

export function getPlatformUrl(): string {
  return process.env.PLATFORM_URL || 'https://bendacourse.vercel.app'
}

/**
 * Validates email configuration and returns detailed status
 * @returns Object with isValid flag and missing/configured variables
 */
export function validateEmailConfig(): {
  isValid: boolean
  missing: string[]
  configured: string[]
  details: {
    fromEmail: string
    smtpPassword: string
    smtpHost: string
    smtpPort: number
    smtpSecure: boolean
    platformUrl: string
  }
} {
  const fromEmail = getFromEmail()
  const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || ''
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')
  const smtpSecure = process.env.SMTP_SECURE === 'true'
  const platformUrl = getPlatformUrl()

  const missing: string[] = []
  const configured: string[] = []

  // Check required variables
  if (!fromEmail) {
    missing.push('EMAIL_FROM or SMTP_USER')
  } else {
    configured.push('EMAIL_FROM/SMTP_USER')
  }

  if (!smtpPassword) {
    missing.push('SMTP_PASSWORD or EMAIL_PASSWORD')
  } else {
    configured.push('SMTP_PASSWORD/EMAIL_PASSWORD')
  }

  // Check optional variables (with defaults)
  if (process.env.SMTP_HOST) {
    configured.push('SMTP_HOST')
  } else {
    configured.push('SMTP_HOST (using default: smtp.gmail.com)')
  }

  if (process.env.SMTP_PORT) {
    configured.push('SMTP_PORT')
  } else {
    configured.push('SMTP_PORT (using default: 587)')
  }

  if (process.env.SMTP_SECURE) {
    configured.push('SMTP_SECURE')
  } else {
    configured.push('SMTP_SECURE (using default: false)')
  }

  if (process.env.PLATFORM_URL) {
    configured.push('PLATFORM_URL')
  } else {
    configured.push('PLATFORM_URL (using default: https://bendacourse.vercel.app)')
  }

  return {
    isValid: missing.length === 0,
    missing,
    configured,
    details: {
      fromEmail,
      smtpPassword: smtpPassword ? '[SET]' : '[MISSING]',
      smtpHost,
      smtpPort,
      smtpSecure,
      platformUrl,
    },
  }
}

/**
 * Logs email configuration status for debugging
 */
export function logEmailConfigStatus(): void {
  const config = validateEmailConfig()
  
  console.log('\n=== Email Configuration Status ===')
  if (config.isValid) {
    console.log('✅ Email configuration is valid')
  } else {
    console.error('❌ Email configuration is INVALID')
    console.error('Missing required variables:')
    config.missing.forEach(v => console.error(`  - ${v}`))
  }
  
  console.log('\nConfigured variables:')
  config.configured.forEach(v => console.log(`  ✓ ${v}`))
  
  console.log('\nConfiguration details:')
  console.log(`  From Email: ${config.details.fromEmail || '[NOT SET]'}`)
  console.log(`  SMTP Password: ${config.details.smtpPassword}`)
  console.log(`  SMTP Host: ${config.details.smtpHost}`)
  console.log(`  SMTP Port: ${config.details.smtpPort}`)
  console.log(`  SMTP Secure: ${config.details.smtpSecure}`)
  console.log(`  Platform URL: ${config.details.platformUrl}`)
  console.log('===================================\n')
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  name: string | null
) {
  const config = validateEmailConfig()
  
  if (!config.isValid) {
    console.error('[sendPasswordResetEmail] Email configuration missing. Email not sent.')
    console.error('[sendPasswordResetEmail] Missing:', config.missing.join(', '))
    logEmailConfigStatus()
    return false
  }

  const fromEmail = config.details.fromEmail
  const platformUrl = config.details.platformUrl

  const transporter = createEmailTransporter()
  const resetUrl = `${platformUrl}/forgot-password?token=${resetToken}`

  const emailHtml = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #1a1a1a; color: #e8dcc0; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px; text-align: center;">איפוס סיסמה 🔐</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
          היי ${name || ''}!
        </p>
        
        <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
          קיבלנו בקשה לאיפוס הסיסמה שלך. לחץ על הכפתור למטה כדי לאפס את הסיסמה שלך.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
            איפוס סיסמה
          </a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          אם לא ביקשת לאפס את הסיסמה, תוכל להתעלם מהאימייל הזה. הקישור תקף למשך שעה אחת בלבד.<br><br>
          אם הכפתור לא עובד, תוכל להעתיק ולהדביק את הקישור הבא בדפדפן שלך:<br>
          <span style="font-family: monospace; background-color: #e8e8e8; padding: 5px 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">${resetUrl}</span>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>באהבה,<br>צוות בנדה בע"מ 🅱️</p>
      </div>
    </div>
  `

  const emailText = `
איפוס סיסמה

היי ${name || ''}!

קיבלנו בקשה לאיפוס הסיסמה שלך. לחץ על הקישור למטה כדי לאפס את הסיסמה שלך.

${resetUrl}

אם לא ביקשת לאפס את הסיסמה, תוכל להתעלם מהאימייל הזה. הקישור תקף למשך שעה אחת בלבד.

באהבה,
צוות בנדה בע"מ 🅱️
  `

  try {
    await transporter.sendMail({
      from: `"בית הספר של בנדה" <${fromEmail}>`,
      to: email,
      subject: 'איפוס סיסמה - בית הספר של בנדה',
      text: emailText,
      html: emailHtml,
    })
    console.log(`[sendPasswordResetEmail] Password reset email sent successfully to: ${email}`)
    return true
  } catch (error) {
    console.error('[sendPasswordResetEmail] Failed to send password reset email:', error)
    return false
  }
}

export async function sendWelcomeEmail(
  email: string,
  password: string,
  name: string | null,
  courses: Array<{ id: string; title: string }> = []
) {
  const config = validateEmailConfig()
  
  if (!config.isValid) {
    console.error('[sendWelcomeEmail] Email configuration missing. Email not sent.')
    console.error('[sendWelcomeEmail] Missing:', config.missing.join(', '))
    logEmailConfigStatus()
    return false
  }

  const fromEmail = config.details.fromEmail
  const platformUrl = config.details.platformUrl

  const transporter = createEmailTransporter()

  const courseList = courses.length > 0
    ? courses.map(c => `• ${c.title}`).join('<br>')
    : 'עדיין לא נרשמת לקורסים. אנא צור קשר עם המנהל להרשמה.'

  const emailHtml = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #1a1a1a; color: #e8dcc0; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px; text-align: center;">ברוך הבא לפלטפורמת הלימוד! 🎓</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
          היי ${name || ''}!
        </p>
        
        <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
          ברוך הבא לפלטפורמת הלימוד החדשה שלנו! אנחנו שמחים שיש לך איתנו.
        </p>
        
        <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
          מחכה לך חוויית למידה מתקדמת עם מעקב התקדמות חכם, סטטיסטיקות מפורטות ודרכי ייעול למידה.
        </p>
        
        ${courses.length > 0 ? `
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #3b82f6;">
          <h2 style="margin-top: 0; color: #1a1a1a; font-size: 18px;">הקורסים שלך:</h2>
          <div style="font-size: 16px; color: #333;">
            ${courseList}
          </div>
        </div>
        ` : ''}
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0; border-right: 4px solid #3b82f6;">
          <h2 style="margin-top: 0; color: #1a1a1a; font-size: 18px;">פרטי הכניסה שלך:</h2>
          <p style="margin: 10px 0; font-size: 16px;">
            <strong>📧 אימייל:</strong><br>
            <span style="font-family: monospace; background-color: #e8e8e8; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px;">${email}</span>
          </p>
          <p style="margin: 10px 0; font-size: 16px;">
            <strong>🔑 סיסמה:</strong><br>
            <span style="font-family: monospace; background-color: #e8e8e8; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px; font-weight: bold; color: #3b82f6;">${password}</span>
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${platformUrl}/login" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
            להתחברות ישירה
          </a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          מומלץ להחליף סיסמה אחרי הכניסה הראשונה, רק בשביל השקט שלך.<br><br>
          ואם משהו לא עובד כמו שצריך — אנחנו כאן עבורך לכל שאלה.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>באהבה,<br>צוות בנדה בע"מ 🅱️</p>
      </div>
    </div>
  `

  const emailText = `
ברוך הבא לפלטפורמת הלימוד!

היי ${name || ''}!

ברוך הבא לפלטפורמת הלימוד החדשה שלנו! אנחנו שמחים שיש לך איתנו.

פרטי הכניסה שלך:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 אימייל: ${email}
🔑 סיסמה: ${password}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${courses.length > 0 ? `הקורסים שלך:\n${courses.map(c => `• ${c.title}`).join('\n')}\n\n` : ''}

להתחברות ישירה:
${platformUrl}/login

מומלץ להחליף סיסמה אחרי הכניסה הראשונה.

באהבה,
צוות בנדה בע"מ 🅱️
  `

  try {
    await transporter.sendMail({
      from: `"בית הספר של בנדה" <${fromEmail}>`,
      to: email,
      subject: 'ברוך הבא לפלטפורמת הלימוד - בית הספר של בנדה',
      text: emailText,
      html: emailHtml,
    })
    console.log(`[sendWelcomeEmail] Welcome email sent successfully to: ${email}`)
    return true
  } catch (error) {
    console.error('[sendWelcomeEmail] Failed to send welcome email:', error)
    if (error instanceof Error) {
      console.error('[sendWelcomeEmail] Error details:', error.message)
      console.error('[sendWelcomeEmail] Stack:', error.stack)
    }
    return false
  }
}

