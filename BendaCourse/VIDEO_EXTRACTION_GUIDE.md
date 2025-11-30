# Video Extraction Guide

This guide explains how to extract video URLs from Schooler and add them to your course platform.

## Option 1: Automated Extraction with Puppeteer (Recommended)

This is the fastest method - it will automatically visit all lessons and extract video URLs.

### Prerequisites
- Node.js installed
- Schooler login credentials

### Steps

1. **Set your Schooler credentials** (choose one):
   - Add to `.env` file:
     ```
     SCHOOLER_EMAIL=your-email@example.com
     SCHOOLER_PASSWORD=your-password
     ```
   - Or pass as command line arguments (see step 2)

2. **Run the extraction script**:
   ```bash
   # Using .env file
   npm run extract:videos
   
   # Or with command line arguments
   tsx scripts/extract-videos-puppeteer.ts your-email@example.com your-password
   ```

3. **Wait for completion**:
   - The script will open a browser window
   - It will log into Schooler automatically
   - It will visit each lesson and extract video URLs
   - Progress will be shown in the terminal
   - This may take 10-30 minutes depending on the number of lessons

4. **Import the extracted data**:
   ```bash
   npm run import:course course-data-with-videos.json
   ```

## Option 2: Manual Browser Console Extraction

If automated extraction doesn't work, you can extract videos manually using the browser console.

### Steps

1. **Log into Schooler**: https://my.schooler.biz/s/35614/login

2. **Navigate to course**: https://my.schooler.biz/s/35614/1631284218338

3. **Open browser console** (F12)

4. **Run the extraction script**:
   - Copy the entire contents of `scripts/extract-all-videos.js`
   - Paste into the browser console
   - Press Enter
   - Wait for extraction to complete (this will navigate through all lessons)

5. **Copy the JSON output**:
   - The script will output JSON in the console
   - Copy it and save to `course-data-with-videos.json`

6. **Import the data**:
   ```bash
   npm run import:course course-data-with-videos.json
   ```

## Option 3: One-by-One Manual Extraction

If you prefer to extract videos one at a time:

1. **Log into Schooler** and navigate to a lesson page

2. **Open browser console** (F12)

3. **Run this function**:
   ```javascript
   function extractVideoUrl() {
     const iframes = Array.from(document.querySelectorAll('iframe'));
     for (const iframe of iframes) {
       if (iframe.src && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
         const match = iframe.src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&]+)/);
         if (match) {
           const videoId = match[1];
           const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
           console.log('Video URL:', videoUrl);
           console.log('Video ID:', videoId);
           return { videoId, videoUrl };
         }
       }
     }
     
     const scripts = Array.from(document.querySelectorAll('script'));
     for (const script of scripts) {
       if (script.textContent) {
         const match = script.textContent.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
         if (match) {
           const videoId = match[1];
           const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
           console.log('Video URL:', videoUrl);
           console.log('Video ID:', videoId);
           return { videoId, videoUrl };
         }
       }
     }
     
     console.log('No video found');
     return null;
   }
   
   extractVideoUrl();
   ```

4. **Copy the video URL** and manually add it to `course-data-cleaned.json`

5. **Repeat for each lesson**

6. **Import the updated data**:
   ```bash
   npm run import:course course-data-cleaned.json
   ```

## Troubleshooting

### Puppeteer script fails to login
- Make sure your credentials are correct
- Check if Schooler has any CAPTCHA or 2FA enabled
- Try running in non-headless mode (already set in the script)

### Browser console script doesn't work
- Make sure you're logged into Schooler
- Check that you're on the correct course page
- Try refreshing the page and running the script again

### Videos not found
- Some lessons might be text-only (no video)
- Check the lesson page manually to confirm
- The script will mark these as "no video found"

## After Extraction

Once you have `course-data-with-videos.json`:

1. **Update the database**:
   ```bash
   npm run update:videos course-data-with-videos.json
   ```
   
   Or use the import script:
   ```bash
   npm run import:course course-data-with-videos.json
   ```

2. **Verify in your platform**:
   - Log into your course platform
   - Navigate to a course
   - Check that videos are playing correctly

## Notes

- The automated script may take 10-30 minutes depending on the number of lessons
- Some lessons might not have videos (text-only lessons)
- The script includes delays to avoid overwhelming the server
- Make sure you have a stable internet connection

