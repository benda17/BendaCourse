# Schooler Course Extraction Guide

## Quick Start

To extract your course from Schooler and import it into the platform:

### Step 1: Extract Course Structure

1. **Log into Schooler**: Go to https://my.schooler.biz/s/35614/login
2. **Navigate to course**: https://my.schooler.biz/s/35614/1631284218338
3. **Open browser console** (F12 → Console tab)
4. **Copy the script** from `scripts/browser-scraper.js`
5. **Paste and run** in the console
6. **Copy the JSON output** and save it to `course-data.json` in the project root

### Step 2: Extract Video URLs (Manual Process)

Since videos require visiting each lesson page:

1. **For each lesson** in the course:
   - Click on the lesson link
   - On the lesson page, run in console: `getVideoFromPage()`
   - Copy the YouTube URL that appears
   - Add it to the corresponding lesson in `course-data.json`

2. **Or use this helper script** on each lesson page:
   ```javascript
   // Run this on each lesson page
   function extractVideo() {
     const iframes = Array.from(document.querySelectorAll('iframe'));
     for (const iframe of iframes) {
       if (iframe.src.includes('youtube')) {
         const match = iframe.src.match(/youtube\.com\/embed\/([^?&]+)/);
         if (match) {
           return `https://www.youtube.com/watch?v=${match[1]}`;
         }
       }
     }
     return null;
   }
   extractVideo();
   ```

### Step 3: Import Course Data

Once you have `course-data.json` with all video URLs:

```bash
npm run import:course course-data.json
```

This will:
- Create/update the course in the database
- Create all modules and lessons
- Link YouTube videos to lessons
- Set up the complete course structure

### Step 4: Verify

1. Log in to your platform
2. Go to dashboard
3. You should see the course with all modules and lessons
4. Click on a lesson to watch the video

## Course Data Format

Your `course-data.json` should look like this:

```json
{
  "title": "הקורס המלא של בנדה לדרופשיפינג באיביי",
  "description": "קורס מקצועי למסחר אונליין באיביי",
  "modules": [
    {
      "title": "פרק מספר 1 - הקדמה",
      "order": 1,
      "lessons": [
        {
          "title": "שיעור 1 : מה לעשות אם כבר יש לכם חשבון איביי?",
          "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
          "duration": "00:02:19",
          "order": 1
        }
      ]
    }
  ]
}
```

## Automated Extraction (Advanced)

If you want to automate the video extraction, you can use Puppeteer:

1. Install Puppeteer: `npm install puppeteer`
2. Create a script that:
   - Logs into Schooler
   - Navigates through all lessons
   - Extracts video URLs
   - Generates the JSON file

## Troubleshooting

### No modules found
- Check if you're logged into Schooler
- Try different selectors in the browser console
- Inspect the page HTML to find the correct selectors

### No video URLs
- Make sure you're on the actual lesson page (not the course overview)
- Check if videos are embedded as iframes or in script tags
- Some lessons might be text-only (no video)

### Import fails
- Check JSON format is valid
- Ensure all required fields are present (title, order)
- Check database connection

