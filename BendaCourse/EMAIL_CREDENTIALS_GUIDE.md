# Email Credentials Guide

This guide explains how to send login credentials to all users via email.

## Setup Email Configuration

### Option 1: Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "Benda Course Platform"
   - Copy the generated 16-character password

3. **Add to `.env` file**:
   ```env
   EMAIL_FROM=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   PLATFORM_URL=https://bendacourse.vercel.app
   ```

### Option 2: Other Email Providers

**Outlook/Hotmail:**
```env
EMAIL_FROM=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Custom SMTP:**
```env
EMAIL_FROM=your-email@yourdomain.com
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
```

## How to Send Credentials

1. **Make sure your `.env` file is configured** with email settings (see above)

2. **Run the script**:
   ```bash
   npm run send:credentials
   ```

   Or directly:
   ```bash
   npx tsx scripts/send-user-credentials.ts
   ```

## What the Script Does

1. **Gets all users** from the database
2. **Generates a new secure password** for each user (12 characters with letters, numbers, and symbols)
3. **Resets their password** in the database
4. **Sends an email** to each user with:
   - Their email (username)
   - Their new password
   - A Hebrew marketing message about the new platform
   - A link to the login page

## Email Content

The email includes:
- **Hebrew marketing message** explaining the move to the new platform
- **Login credentials** (email and password)
- **Link to login page**
- **Recommendation** to change password after first login

## Important Notes

- ⚠️ **Passwords are reset**: All users will get NEW passwords. Old passwords won't work.
- ⚠️ **Rate limiting**: The script waits 1 second between emails to avoid spam filters
- ⚠️ **Test first**: Consider testing with a few users first before sending to everyone
- ✅ **Progress tracking**: The script shows progress and lists any failed emails
- ✅ **HTML email**: Emails are sent in both plain text and HTML format

## Troubleshooting

### "Email server connection failed"
- Check your SMTP settings in `.env`
- For Gmail: Make sure you're using an App Password, not your regular password
- Verify 2FA is enabled on Gmail

### "Failed to send" errors
- Check your email provider's sending limits
- Some providers limit the number of emails per day
- Wait and try again later if you hit limits

### Emails going to spam
- Make sure your email address is verified
- Consider using a professional email service (SendGrid, Resend, etc.) for better deliverability

## Testing

To test with a single user first, you can modify the script temporarily to only process one user, or create a test script that sends to your own email.

