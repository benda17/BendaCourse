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

export async function sendWelcomeEmail(
  email: string,
  password: string,
  name: string | null,
  courses: Array<{ id: string; title: string }> = []
) {
  const fromEmail = getFromEmail()
  const platformUrl = getPlatformUrl()
  const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD

  if (!fromEmail || !smtpPassword) {
    console.error('Email configuration missing. Email not sent.')
    return false
  }

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
    return true
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return false
  }
}

