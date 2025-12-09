# Vercel Email Environment Variables Setup

## ⚠️ IMPORTANT: Email Not Working in Production

If you're seeing errors like:
```
[sendWelcomeEmail] Email configuration missing. Email not sent.
Missing: EMAIL_FROM or SMTP_USER, SMTP_PASSWORD or EMAIL_PASSWORD
```

This means the email environment variables are **NOT set in Vercel**.

## Quick Fix: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your project: **BendaCourse**

### Step 2: Navigate to Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Click **Add New** for each variable below

### Step 3: Add These Variables

Add **ALL** of these variables (required for email to work):

| Variable Name | Value | Example |
|--------------|-------|---------|
| `EMAIL_FROM` | Your Gmail address | `yazambenda@gmail.com` |
| `SMTP_PASSWORD` | Your Gmail App Password | `ehnw ziqo dqqd quuh` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use secure connection | `false` |
| `PLATFORM_URL` | Your platform URL | `https://bendacourse.vercel.app` |

### Step 4: Set Environment for All Environments
For each variable, make sure to select:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### Step 5: Redeploy
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## How to Get Gmail App Password

If you don't have a Gmail App Password:

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "Benda Course Platform"
   - Copy the generated 16-character password
   - ⚠️ **IMPORTANT**: Remove ALL spaces from the password!
   - Example: If Google shows `ehnw ziqo dqqd quuh`, use `ehnwziqodqqdquuh`
   - Use this as your `SMTP_PASSWORD` in Vercel

### ⚠️ Common Mistake: Spaces in App Password

Gmail app passwords often display with spaces (like `ehnw ziqo dqqd quuh`), but you **MUST remove all spaces** when setting it in Vercel.

**Wrong:** `ehnw ziqo dqqd quuh` (with spaces)  
**Correct:** `ehnwziqodqqdquuh` (no spaces)

## Verify Setup

After setting variables and redeploying, test by:
1. Creating a new user in admin panel
2. Check Vercel logs - you should see:
   ```
   ✅ Email configuration is valid
   [sendWelcomeEmail] Welcome email sent successfully to: user@example.com
   ```

## Current Status Check

Run this locally to verify your `.env` file:
```bash
npm run test:email
```

This will show you what's configured locally. Make sure the same values are set in Vercel.

## Troubleshooting

### Still not working after setting variables?

1. **Remove spaces from SMTP_PASSWORD** - This is the #1 cause of "BadCredentials" errors
   - Gmail app passwords display with spaces but must be entered WITHOUT spaces
   - Example: `ehnw ziqo dqqd quuh` → `ehnwziqodqqdquuh`
2. **Double-check variable names** - They must match exactly (case-sensitive)
3. **Check for typos** - Especially in `SMTP_PASSWORD` 
4. **Redeploy** - Environment variables only apply to new deployments
5. **Check Vercel logs** - Look for the email configuration status messages
6. **Verify Gmail App Password** - Make sure 2FA is enabled and password is correct
7. **Regenerate App Password** - If still not working, generate a new one at https://myaccount.google.com/apppasswords

### Variables are set but emails still fail?

**If you see "BadCredentials" or "Username and Password not accepted" error:**

1. **Remove spaces from SMTP_PASSWORD** ⚠️ MOST COMMON ISSUE
   - Gmail app passwords must NOT have spaces
   - Copy the password and remove all spaces before pasting in Vercel
2. **Verify EMAIL_FROM matches your Gmail account** - Must be the exact email address
3. **Regenerate App Password** - Generate a fresh one at https://myaccount.google.com/apppasswords
4. **Check Vercel logs** - Look for specific error messages
5. **Verify 2FA is enabled** - App passwords only work with 2FA enabled
6. **Check Gmail sending limits** - Gmail has daily sending limits
7. **Verify `PLATFORM_URL` matches your actual domain**

## Required Variables Summary

**Minimum Required:**
- `EMAIL_FROM` (or `SMTP_USER`)
- `SMTP_PASSWORD` (or `EMAIL_PASSWORD`)

**Recommended (have defaults but should be set):**
- `SMTP_HOST` (defaults to `smtp.gmail.com`)
- `SMTP_PORT` (defaults to `587`)
- `SMTP_SECURE` (defaults to `false`)
- `PLATFORM_URL` (defaults to `https://bendacourse.vercel.app`)

