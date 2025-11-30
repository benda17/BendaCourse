# Course Setup Instructions

## Quick Start

Your course platform is ready! Follow these steps to populate it with your course content:

### 1. Extract YouTube Video URLs

Your course videos are on Schooler. You need to extract the YouTube URLs:

**Method 1: Browser Console (Easiest)**
1. Log into Schooler: https://my.schooler.biz/s/35614/login
2. Visit a lesson page (e.g., `/s/35614/1631284218338/1`)
3. Open DevTools (F12) → Console
4. Run this code:
```javascript
// Find YouTube iframe
const iframe = document.querySelector('iframe[src*="youtube"]');
if (iframe) {
  const url = iframe.src;
  const videoId = url.match(/embed\/([^?]+)/)?.[1];
  console.log('Video ID:', videoId);
  console.log('Full URL:', `https://www.youtube.com/watch?v=${videoId}`);
}
```

**Method 2: Network Tab**
1. Open DevTools → Network tab
2. Filter by "youtube" or "embed"
3. Navigate through lessons
4. Find YouTube embed requests
5. Extract video IDs from URLs

### 2. Update Seed File

1. Open `prisma/seed.ts`
2. Replace `PLACEHOLDER_YOUTUBE_URL_X` with actual YouTube URLs
3. Format: `https://www.youtube.com/watch?v=VIDEO_ID`

Example:
```typescript
{ 
  title: "שיעור 1 : מה לעשות אם כבר יש לכם חשבון איביי?", 
  duration: 139, 
  order: 1, 
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Replace with actual URL
}
```

### 3. Seed the Database

```bash
# Install dependencies (if not done)
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with course data
npm run db:seed
```

### 4. Create Admin User

1. Register through `/register`
2. Update database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or use Prisma Studio:
```bash
npm run db:studio
```

### 5. Test the Platform

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- Course viewing
- Video playback
- Progress tracking
- Admin dashboard

## Course Structure

Your course has **35 modules** and **114+ lessons**. The structure is already defined in `prisma/seed.ts` - you just need to add the YouTube URLs.

## Troubleshooting

**Videos not loading?**
- Check YouTube URLs are correct
- Verify video IDs are valid
- Check browser console for errors

**Database errors?**
- Make sure DATABASE_URL is set in `.env`
- Run `npm run db:push` to sync schema
- Check Prisma logs for details

**Hebrew text not displaying?**
- Browser should support Hebrew fonts
- Check `dir="rtl"` is set in layout
- Verify font-family includes Hebrew support

## Next Steps

Once videos are extracted:
1. ✅ Test all lessons load correctly
2. ✅ Verify progress tracking works
3. ✅ Set up payment integration
4. ✅ Deploy to production

See `NEXT_STEPS.md` for complete deployment guide.

