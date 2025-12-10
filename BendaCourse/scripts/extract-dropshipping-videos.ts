import 'dotenv/config'
import puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Extract video URLs from dropshipping course lessons
 * 
 * This script will:
 * 1. Load dropshipping-course-data.json
 * 2. Visit each lesson page
 * 3. Extract video URLs
 * 4. Update the JSON file with video URLs
 * 
 * Usage:
 * npm run extract:dropshipping-videos
 */

interface Lesson {
  title: string
  href: string
  order: number
  duration?: number | null
  videoUrl?: string | null
}

interface Module {
  title: string
  order: number
  description?: string
  lessons: Lesson[]
}

interface CourseData {
  title: string
  description?: string
  modules: Module[]
}

async function extractVideos() {
  console.log('🎥 Starting video URL extraction for dropshipping course...\n')
  
  // Load existing course data
  const dataPath = path.join(__dirname, '../dropshipping-course-data.json')
  if (!fs.existsSync(dataPath)) {
    console.error('❌ dropshipping-course-data.json not found!')
    console.error('   Please run the extraction script first: npm run extract:dropshipping-course')
    process.exit(1)
  }

  const courseData: CourseData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  
  console.log(`📚 Course: ${courseData.title}`)
  console.log(`📦 Modules: ${courseData.modules.length}`)
  const totalLessons = courseData.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  console.log(`📹 Lessons: ${totalLessons}\n`)

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    let extractedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const module of courseData.modules) {
      console.log(`📁 Module: ${module.title}`)
      
      for (const lesson of module.lessons) {
        // Skip if video URL already exists
        if (lesson.videoUrl) {
          console.log(`  ⏭️  Lesson ${lesson.order}: ${lesson.title.substring(0, 50)}... (already has video)`)
          skippedCount++
          continue
        }

        // Skip text-only lessons (like "תקנון הקורס")
        if (!lesson.href || lesson.href.includes('Nse-b7o')) {
          console.log(`  ⏭️  Lesson ${lesson.order}: ${lesson.title.substring(0, 50)}... (text-only, skipping)`)
          skippedCount++
          continue
        }

        try {
          console.log(`  📹 Lesson ${lesson.order}: ${lesson.title.substring(0, 50)}...`)
          
          await page.goto(lesson.href, { waitUntil: 'networkidle2', timeout: 30000 })
          await new Promise(resolve => setTimeout(resolve, 3000))

          // Extract video URL using comprehensive method
          const videoUrl = await page.evaluate(() => {
            // Method 1: Check for YouTube iframes
            const iframes = Array.from(document.querySelectorAll('iframe'))
            for (const iframe of iframes) {
              if (iframe.src.includes('youtube') || iframe.src.includes('youtu.be')) {
                const embedMatch = iframe.src.match(/youtube\.com\/embed\/([^?&]+)/)
                if (embedMatch) {
                  return `https://www.youtube.com/watch?v=${embedMatch[1]}`
                }
                const shortMatch = iframe.src.match(/youtu\.be\/([^?&]+)/)
                if (shortMatch) {
                  return `https://www.youtube.com/watch?v=${shortMatch[1]}`
                }
              }
            }

            // Method 2: Check for video elements
            const videos = Array.from(document.querySelectorAll('video'))
            for (const video of videos) {
              if (video.src && (video.src.includes('youtube') || video.src.includes('youtu.be'))) {
                const match = video.src.match(/youtube\.com\/watch\?v=([^&]+)/) || 
                             video.src.match(/youtu\.be\/([^?&]+)/)
                if (match) {
                  return `https://www.youtube.com/watch?v=${match[1]}`
                }
              }
            }

            // Method 3: Check script tags
            const scripts = Array.from(document.querySelectorAll('script'))
            for (const script of scripts) {
              const content = script.textContent || script.innerHTML || ''
              
              const watchMatch = content.match(/youtube\.com\/watch\?v=([^"'\s&]+)/)
              if (watchMatch) {
                return `https://www.youtube.com/watch?v=${watchMatch[1]}`
              }
              
              const embedMatch = content.match(/youtube\.com\/embed\/([^"'\s?&]+)/)
              if (embedMatch) {
                return `https://www.youtube.com/watch?v=${embedMatch[1]}`
              }
              
              const shortMatch = content.match(/youtu\.be\/([^"'\s?&]+)/)
              if (shortMatch) {
                return `https://www.youtube.com/watch?v=${shortMatch[1]}`
              }
            }

            // Method 4: Check page source
            const pageSource = document.documentElement.innerHTML
            const sourceMatches = [
              ...pageSource.matchAll(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g),
              ...pageSource.matchAll(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g),
              ...pageSource.matchAll(/youtu\.be\/([a-zA-Z0-9_-]{11})/g)
            ]
            
            if (sourceMatches.length > 0) {
              return `https://www.youtube.com/watch?v=${sourceMatches[0][1]}`
            }

            return null
          })

          if (videoUrl) {
            lesson.videoUrl = videoUrl
            extractedCount++
            console.log(`    ✅ Found video: ${videoUrl}`)
          } else {
            console.log(`    ⚠️  No video found (might be text-only or different format)`)
          }

          await new Promise(resolve => setTimeout(resolve, 1500))

        } catch (error) {
          errorCount++
          console.error(`    ❌ Error extracting video:`, error instanceof Error ? error.message : error)
        }
      }
      
      console.log('')
    }

    // Save updated data
    fs.writeFileSync(dataPath, JSON.stringify(courseData, null, 2), 'utf-8')

    console.log('✅ Video extraction complete!')
    console.log(`📄 Updated: ${dataPath}`)
    console.log(`\n📊 Summary:`)
    console.log(`   Videos extracted: ${extractedCount}`)
    console.log(`   Already had videos: ${skippedCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   Total lessons: ${totalLessons}`)
    console.log(`\n🚀 Next step: Run 'npm run import:dropshipping-course' to update videos in database`)

  } catch (error) {
    console.error('❌ Error during extraction:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  } finally {
    await browser.close()
  }
}

extractVideos().catch(console.error)

