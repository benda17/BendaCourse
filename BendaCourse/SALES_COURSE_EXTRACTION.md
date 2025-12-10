# Sales Course Extraction Guide

## Course Information
- **Course URL**: https://my.schooler.biz/s/87065/1735483080234
- **Course Title**: הקורס להכשרת אנשי מכירות - בנדה בע"מ
- **Schooler ID**: 87065
- **Course ID**: 1735483080234

## Method 1: Automated Extraction (Recommended)

This method uses Puppeteer to automatically extract the course structure and video URLs.

### Prerequisites
- You must be logged into Schooler in your default browser
- Or you can modify the script to handle login

### Steps

1. **Run the extraction script:**
   ```bash
   npm run extract:sales-course
   ```

2. **The script will:**
   - Open a browser window
   - Navigate to the course page
   - Extract all modules and lessons
   - Visit each lesson page to extract video URLs
   - Save everything to `sales-course-data.json`

3. **Import into database:**
   ```bash
   npm run import:sales-course
   ```

### Note
If you're not logged in, the script might fail. You can:
- Log into Schooler in your browser first
- Or modify the script to handle authentication

## Method 2: Manual Browser Extraction

If automated extraction doesn't work, use this manual method:

### Step 1: Extract Course Structure

1. **Log into Schooler:**
   - Go to: https://my.schooler.biz/s/87065/login
   - Log in with your credentials

2. **Navigate to course:**
   - Go to: https://my.schooler.biz/s/87065/1735483080234

3. **Open browser console:**
   - Press F12
   - Go to Console tab

4. **Run the scraper script:**
   - Open `scripts/schooler-scraper-sales.js`
   - Copy the entire script
   - Paste into browser console
   - Press Enter

5. **Copy the JSON output:**
   - The script will output JSON in the console
   - Copy the entire JSON
   - Save it to `sales-course-data.json` in the project root

### Step 2: Extract Video URLs

For each lesson that has a video:

1. **Click on the lesson link** in the course navigation

2. **On the lesson page, open console (F12)**

3. **Run this script:**
   ```javascript
   function getVideoUrl() {
     // Check for YouTube iframes
     const iframes = Array.from(document.querySelectorAll('iframe'));
     for (const iframe of iframes) {
       if (iframe.src.includes('youtube')) {
         const match = iframe.src.match(/youtube\.com\/embed\/([^?&]+)/);
         if (match) {
           return `https://www.youtube.com/watch?v=${match[1]}`;
         }
       }
     }
     
     // Check for video elements
     const videos = Array.from(document.querySelectorAll('video'));
     for (const video of videos) {
       if (video.src && video.src.includes('youtube')) {
         return video.src;
       }
     }
     
     // Check script tags for YouTube URLs
     const scripts = Array.from(document.querySelectorAll('script'));
     for (const script of scripts) {
       const content = script.textContent || script.innerHTML;
       const match = content.match(/youtube\.com\/watch\?v=([^"'\s&]+)/);
       if (match) {
         return `https://www.youtube.com/watch?v=${match[1]}`;
       }
     }
     
     return null;
   }
   
   getVideoUrl();
   ```

4. **Copy the YouTube URL** that appears

5. **Add it to the corresponding lesson** in `sales-course-data.json`:
   ```json
   {
     "title": "שיעור 1: ...",
     "href": "/s/87065/1735483080234/1",
     "order": 1,
     "duration": 120,
     "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID_HERE"
   }
   ```

### Step 3: Import Course

Once you have `sales-course-data.json` with all video URLs:

```bash
npm run import:sales-course
```

This will:
- Create the course "הקורס להכשרת אנשי מכירות - בנדה בע"מ"
- Create all modules and lessons
- Link YouTube videos to lessons
- Set up the complete course structure

## Troubleshooting

### Script doesn't find modules/lessons
- Make sure you're on the main course page (not a lesson page)
- Check that the sidebar navigation is visible
- Try scrolling to make sure all content is loaded
- Inspect the page HTML to find the correct selectors

### No video URL found
- Some lessons might be text-only (no video)
- Check if videos are embedded as iframes or in script tags
- Try the Network tab in DevTools to find YouTube requests

### Import fails
- Check JSON format is valid
- Ensure all required fields are present (title, order)
- Check database connection
- Verify the course title matches exactly

## Course Data Format

Your `sales-course-data.json` should look like this:

```json
{
  "title": "הקורס להכשרת אנשי מכירות - בנדה בע\"מ",
  "description": "קורס מקצועי להכשרת אנשי מכירות",
  "modules": [
    {
      "title": "פרק 1: הקדמה",
      "order": 1,
      "lessons": [
        {
          "title": "שיעור 1: מבוא",
          "href": "/s/87065/1735483080234/1",
          "order": 1,
          "duration": 120,
          "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
        }
      ]
    }
  ]
}
```

## After Import

1. Log in to your platform
2. Go to dashboard
3. You should see the new course "הקורס להכשרת אנשי מכירות - בנדה בע"מ"
4. Click on the course to view all modules and lessons
5. Click on a lesson to watch the video

