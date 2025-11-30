# Schooler Course Extraction Instructions

## Step 1: Extract Course Structure

1. **Log into Schooler**: https://my.schooler.biz/s/35614/login
2. **Navigate to course**: https://my.schooler.biz/s/35614/1631284218338
3. **Open browser console** (F12 → Console tab)
4. **Copy the script** from `scripts/schooler-extractor-v2.js`
5. **Paste and run** in the console
6. **Copy the JSON output** that appears in the console
7. **Save it** to `course-data.json` in the project root

## Step 2: Extract Video URLs (Optional - can be done later)

For each lesson that has a video:

1. **Click on the lesson link** in the course navigation
2. **On the lesson page**, open console (F12)
3. **Run**: `getVideoUrl()`
4. **Copy the YouTube URL** that appears
5. **Add it** to the corresponding lesson in `course-data.json` as `videoUrl`

Example:
```json
{
  "title": "שיעור 1 : מה לעשות אם כבר יש לכם חשבון איביי?",
  "href": "/s/35614/1631284218338/1",
  "duration": "00:02:19",
  "order": 2,
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID_HERE"
}
```

## Step 3: Import Course Data

Once you have `course-data.json`:

```bash
npm run import:course course-data.json
```

This will:
- Create/update the course in the database
- Create all modules and lessons
- Link YouTube videos (if provided)
- Set up the complete course structure

## Notes

- **Text lessons** (like "תקנון הקורס") don't need video URLs - they can be left without `videoUrl`
- **Video URLs can be added later** - you can import the course structure first and add videos incrementally
- The import script will update existing lessons if you run it again with updated data

## Troubleshooting

### Script doesn't extract modules
- Make sure you're on the main course page (not a lesson page)
- Check that the sidebar navigation is visible
- Try scrolling to make sure all content is loaded

### No video URL found
- Some lessons might be text-only (no video)
- Make sure you're on the actual lesson page (not the course overview)
- Check if the video is embedded as an iframe

### Import fails
- Check that `course-data.json` is valid JSON
- Ensure all required fields are present (title, order)
- Check database connection

