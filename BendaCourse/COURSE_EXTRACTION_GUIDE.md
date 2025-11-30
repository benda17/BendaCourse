# Course Extraction Guide

## Extracting YouTube Videos from Schooler Platform

Since the Schooler platform requires authentication to view videos, you have two options:

### Option 1: Manual Extraction (Recommended for now)

1. **Log into Schooler**: Go to https://my.schooler.biz/s/35614/login

2. **Navigate through lessons**: Visit each lesson page (e.g., `/s/35614/1631284218338/1`)

3. **Extract video URLs**: 
   - Open browser console (F12)
   - Run the script from `scripts/extract-schooler-videos.js`
   - Or manually inspect the page to find YouTube iframe/video elements

4. **Update seed file**: 
   - Open `prisma/seed.ts`
   - Replace `PLACEHOLDER_YOUTUBE_URL_X` with actual YouTube URLs
   - Run `npm run db:seed` to populate database

### Option 2: Automated Extraction Script

Create a browser extension or Puppeteer script that:
1. Logs into Schooler
2. Navigates through all lesson pages
3. Extracts YouTube URLs automatically
4. Generates the seed data

### Course Structure

Based on the Schooler platform, your course has:
- **35 Modules** (פרקים)
- **114+ Lessons** (שיעורים)
- All lessons are in Hebrew
- Videos are hosted on YouTube

### Quick Extraction Method

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "youtube" or "embed"
4. Navigate through lessons
5. Find the YouTube embed requests
6. Extract video IDs from URLs

### Example Video URL Format

YouTube URLs typically look like:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

### After Extraction

1. Update `prisma/seed.ts` with all video URLs
2. Run `npm run db:seed` to populate database
3. Test the course viewer to ensure videos load correctly

### Notes

- Some lessons might be text-only (like "תקנון הקורס")
- Duration is already extracted from the course structure
- Make sure to maintain the correct order for modules and lessons

