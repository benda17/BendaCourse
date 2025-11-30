# Deployment Guide

## Quick Start

1. **Set up your database** (Supabase recommended):
   - Create a new Supabase project
   - Copy the connection string (format: `postgresql://user:password@host:5432/database`)
   - Add to `.env` as `DATABASE_URL`

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Fill in all required values, especially:
   - `DATABASE_URL`
   - `JWT_SECRET` (generate a strong random string)
   - `NEXTAUTH_SECRET` (generate a strong random string)
   - External course platform API credentials
   - Payment provider keys (Stripe, PayPal, etc.)

3. **Initialize database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Create admin user**:
   - Register through `/register` page
   - Update database manually:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
   ```

## Vercel Deployment

1. **Connect repository to Vercel**:
   - Go to vercel.com
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Add environment variables**:
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env.example`

3. **Configure build settings**:
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Set up cron job** (for nightly sync):
   - The `vercel.json` file is already configured
   - Vercel will automatically set up the cron job
   - Runs daily at 2 AM UTC
   - Make sure `CRON_SECRET` is set in environment variables

5. **Deploy**:
   - Push to main branch or click "Deploy" in Vercel dashboard

## Supabase Setup

1. **Create project**:
   - Go to supabase.com
   - Create new project
   - Wait for database to initialize

2. **Get connection string**:
   - Go to Settings → Database
   - Copy "Connection string" (URI format)
   - Use this as `DATABASE_URL`

3. **Run migrations**:
   ```bash
   npx prisma db push
   ```

## Stripe Webhook Setup

1. **Create webhook endpoint**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`

2. **Get webhook secret**:
   - After creating endpoint, copy "Signing secret"
   - Add to `.env` as `STRIPE_WEBHOOK_SECRET`

3. **Test webhook**:
   - Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## PayPal Webhook Setup

1. **Create webhook**:
   - Go to PayPal Developer Dashboard
   - Create webhook endpoint: `https://your-domain.com/api/webhooks/paypal`
   - Select events: `PAYMENT.CAPTURE.COMPLETED`

2. **Verify webhook**:
   - PayPal requires webhook signature verification
   - Update `/api/webhooks/paypal/route.ts` with proper verification

## External Course Platform Integration

The platform expects your external API to return courses in this format:

```json
{
  "courses": [
    {
      "id": "course-1",
      "title": "Course Title",
      "description": "Course description",
      "thumbnail": "https://example.com/thumb.jpg",
      "price": 99.99,
      "modules": [
        {
          "id": "module-1",
          "title": "Module Title",
          "description": "Module description",
          "order": 1,
          "lessons": [
            {
              "id": "lesson-1",
              "title": "Lesson Title",
              "description": "Lesson description",
              "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
              "youtubeId": "VIDEO_ID",
              "duration": 3600,
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Environment variables configured
- [ ] Stripe webhook configured and tested
- [ ] PayPal webhook configured (if using)
- [ ] External course platform API credentials added
- [ ] Cron job running (check Vercel logs)
- [ ] Test user registration and login
- [ ] Test course sync from admin panel
- [ ] Test payment flow end-to-end
- [ ] Test lesson viewing and progress tracking

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format is correct
- Check if database allows connections from Vercel IPs
- For Supabase: Check connection pooling settings

### Webhook Not Working
- Verify webhook URL is accessible
- Check webhook secret matches
- Review webhook logs in Stripe/PayPal dashboard
- Check application logs in Vercel

### Sync Not Working
- Verify external API credentials
- Check API endpoint is accessible
- Review sync logs in database (`CourseSyncLog` table)
- Test sync manually from admin panel first

### Authentication Issues
- Verify `JWT_SECRET` is set
- Check cookie settings (should be httpOnly, secure in production)
- Clear browser cookies and try again

## Monitoring

- **Vercel Logs**: Check function logs in Vercel dashboard
- **Database Logs**: Check Supabase logs for query issues
- **Webhook Logs**: Check `WebhookLog` table in database
- **Sync Logs**: Check `CourseSyncLog` table for sync status

## Security Notes

- Never commit `.env` file
- Use strong, random secrets for JWT and auth
- Enable HTTPS in production (automatic with Vercel)
- Regularly rotate API keys and secrets
- Review admin actions in `AdminAction` table
- Monitor webhook logs for suspicious activity

