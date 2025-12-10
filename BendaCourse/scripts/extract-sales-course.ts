import 'dotenv/config'
import puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Automated Schooler Course Extractor for Sales Training Course
 * 
 * This script will:
 * 1. Navigate to the course page
 * 2. Extract all modules and lessons
 * 3. Visit each lesson page to extract video URLs
 * 4. Save everything to sales-course-data.json
 * 
 * Usage:
 * npm run extract:sales-course
 */

const COURSE_URL = 'https://my.schooler.biz/s/87065/1735483080234'
const COURSE_TITLE = 'הקורס להכשרת אנשי מכירות - בנדה בע"מ'

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

async function extractCourse() {
  console.log('🚀 Starting automated course extraction...\n')
  console.log('⚠️  IMPORTANT: If you see a login page, please log in manually in the browser window.')
  console.log('   The script will wait 30 seconds for you to log in...\n')
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    console.log(`📖 Navigating to course page: ${COURSE_URL}`)
    await page.goto(COURSE_URL, { waitUntil: 'networkidle2', timeout: 60000 })

    // Check if we're on a login page
    const isLoginPage = await page.evaluate(() => {
      return document.body.textContent?.toLowerCase().includes('login') ||
             document.body.textContent?.toLowerCase().includes('התחבר') ||
             window.location.href.includes('login')
    })

    if (isLoginPage) {
      console.log('🔐 Login page detected!')
      console.log('⏳ Waiting 30 seconds for manual login...')
      console.log('   Please log in to Schooler in the browser window that opened.')
      await new Promise(resolve => setTimeout(resolve, 30000))
      
      // Navigate to course page again after login
      console.log('📖 Navigating to course page again...')
      await page.goto(COURSE_URL, { waitUntil: 'networkidle2', timeout: 60000 })
    }

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000))

    console.log('🔍 Extracting course structure...')

    // Wait a bit more for content to load
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Take a screenshot for debugging
    await page.screenshot({ path: 'course-page-debug.png', fullPage: true })
    console.log('📸 Screenshot saved to: course-page-debug.png')

    // First, let's debug what's actually on the page
    const pageInfo = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a'))
      const courseLinks = allLinks.filter(a => {
        const href = a.getAttribute('href') || ''
        return href.includes('87065') || href.includes('1735483080234')
      })

      return {
        title: document.title,
        url: window.location.href,
        totalLinks: allLinks.length,
        courseLinks: courseLinks.length,
        sampleCourseLinks: courseLinks.slice(0, 10).map(a => ({
          href: a.getAttribute('href'),
          text: a.textContent?.trim().substring(0, 60),
          parent: a.closest('li, div, section')?.tagName || 'none'
        })),
        navs: document.querySelectorAll('nav').length,
        asides: document.querySelectorAll('aside').length,
        lists: document.querySelectorAll('ul, ol').length
      }
    })

    console.log('\n📄 Page Debug Info:')
    console.log(`   Title: ${pageInfo.title}`)
    console.log(`   URL: ${pageInfo.url}`)
    console.log(`   Total links on page: ${pageInfo.totalLinks}`)
    console.log(`   Course-related links: ${pageInfo.courseLinks}`)
    console.log(`   Nav elements: ${pageInfo.navs}`)
    console.log(`   Aside elements: ${pageInfo.asides}`)
    console.log(`   List elements: ${pageInfo.lists}`)
    
    if (pageInfo.sampleCourseLinks.length > 0) {
      console.log('\n   Sample course links found:')
      pageInfo.sampleCourseLinks.forEach((link, i) => {
        console.log(`   ${i + 1}. "${link.text}"`)
        console.log(`      href: ${link.href}`)
        console.log(`      parent: ${link.parent}`)
      })
    } else {
      console.log('\n   ⚠️  No course links found!')
      console.log('   This might mean:')
      console.log('   1. You need to log in to Schooler first')
      console.log('   2. The page structure is different than expected')
      console.log('   3. Content loads dynamically via JavaScript')
    }

    // Extract course structure from the page
    const courseData: CourseData = await page.evaluate(() => {
      const data: CourseData = {
        title: 'הקורס להכשרת אנשי מכירות - בנדה בע"מ',
        description: 'קורס מקצועי להכשרת אנשי מכירות',
        modules: []
      }

      // Debug: Log what we find
      console.log('Looking for navigation elements...')
      
      // Try multiple selectors for sidebar/navigation
      const sidebarSelectors = [
        '.course-sidebar',
        '.course-navigation', 
        'nav',
        'aside',
        '[class*="sidebar"]',
        '[class*="navigation"]',
        '[class*="menu"]',
        '[class*="course-menu"]',
        '.sidebar',
        '#sidebar',
        '[id*="sidebar"]',
        '[id*="navigation"]',
        '[id*="menu"]'
      ]

      let sidebar: Element | null = null
      for (const selector of sidebarSelectors) {
        sidebar = document.querySelector(selector)
        if (sidebar) {
          console.log(`Found sidebar with selector: ${selector}`)
          break
        }
      }

      // If no sidebar found, try to find any container with links
      if (!sidebar) {
        console.log('No sidebar found, looking for any container with course links...')
        // Try to find any element containing links to the course
        const allLinks = Array.from(document.querySelectorAll('a[href*="/s/87065/1735483080234/"]'))
        if (allLinks.length > 0) {
          console.log(`Found ${allLinks.length} course links in document`)
          // Use the parent of the first link as the container
          sidebar = allLinks[0].closest('nav, aside, div, ul, ol, section') || document.body
        }
      }
      
      if (!sidebar) {
        console.error('Could not find sidebar or navigation container')
        console.log('Available elements:', {
          navs: document.querySelectorAll('nav').length,
          asides: document.querySelectorAll('aside').length,
          links: document.querySelectorAll('a[href*="/s/87065/"]').length
        })
        return data
      }

      // Find all lesson links - try multiple patterns
      const linkSelectors = [
        'a[href*="/s/87065/1735483080234/"]',
        'a[href*="1735483080234"]',
        'a[href*="/s/87065/"]',
        'a[href*="lesson"]',
        'a[href*="course"]'
      ]

      let links: HTMLAnchorElement[] = []
      for (const selector of linkSelectors) {
        const found = Array.from(sidebar.querySelectorAll(selector)) as HTMLAnchorElement[]
        if (found.length > 0) {
          console.log(`Found ${found.length} links with selector: ${selector}`)
          links = found
          break
        }
      }

      // If still no links, search the whole document with more patterns
      if (links.length === 0) {
        console.log('No links found in sidebar, searching entire document...')
        
        // Try different patterns
        const patterns = [
          'a[href*="/s/87065/1735483080234/"]',
          'a[href*="1735483080234"]',
          'a[href*="/s/87065/"]',
          'a[href*="87065"]'
        ]
        
        for (const pattern of patterns) {
          const found = Array.from(document.querySelectorAll(pattern)) as HTMLAnchorElement[]
          if (found.length > 0) {
            console.log(`Found ${found.length} links with pattern: ${pattern}`)
            links = found
            break
          }
        }
        
        console.log(`Total links found: ${links.length}`)
        
        // Log first few links for debugging
        if (links.length > 0) {
          console.log('Sample links:')
          links.slice(0, 5).forEach((link, i) => {
            console.log(`  ${i + 1}. "${link.textContent?.trim()}" -> ${link.getAttribute('href')}`)
          })
        }
      }
      
      let currentModule: Module | null = null
      let moduleOrder = 1
      let lessonOrder = 1

      console.log(`Processing ${links.length} links...`)

      links.forEach((link, index) => {
        const href = link.getAttribute('href') || ''
        const text = link.textContent?.trim() || ''
        
        // More flexible matching - check if it's a lesson link
        const isLessonLink = href.includes('/s/87065/1735483080234/') || 
                            href.includes('1735483080234') ||
                            (href.includes('/s/87065/') && href.match(/\/(\d+)$/))
        
        if (!text || !isLessonLink) {
          if (index < 5) {
            console.log(`Skipping link ${index}: "${text}" (href: ${href})`)
          }
          return
        }

        // Check if this is a module header
        const parent = link.closest('li, div, section')
        const isModuleHeader = text.includes('פרק') || text.includes('חלק') || text.includes('מודול') || 
                               parent?.querySelector('h2, h3, h4, .module-title, .chapter-title')

        if (isModuleHeader || (currentModule !== null && currentModule.lessons.length === 0 && text.match(/^פרק|^חלק|^מודול/))) {
          // Save previous module
          if (currentModule !== null && currentModule.lessons.length > 0) {
            data.modules.push(currentModule)
          }
          
          // Start new module
          currentModule = {
            title: text,
            order: moduleOrder++,
            lessons: []
          }
          lessonOrder = 1
          return
        }

        // If no current module, create one
        if (currentModule === null) {
          currentModule = {
            title: `פרק ${moduleOrder}`,
            order: moduleOrder++,
            lessons: []
          }
        }
        
        // TypeScript guard - ensure currentModule is not null
        if (currentModule === null) {
          return
        }

        // Extract duration if available
        const durationMatch = parent?.textContent?.match(/(\d+):(\d+)/)
        let duration: number | null = null
        if (durationMatch) {
          const minutes = parseInt(durationMatch[1])
          const seconds = parseInt(durationMatch[2])
          duration = minutes * 60 + seconds
        }

        // Add lesson
        const fullHref = href.startsWith('http') ? href : 
                        href.startsWith('/') ? `https://my.schooler.biz${href}` :
                        `https://my.schooler.biz/s/87065/1735483080234/${href}`
        
        currentModule.lessons.push({
          title: text,
          href: fullHref,
          order: lessonOrder++,
          duration: duration,
          videoUrl: null
        })
        
        if (lessonOrder <= 3) {
          console.log(`Added lesson: ${text} (href: ${fullHref})`)
        }
      })

      // Add last module if it exists and has lessons
      if (currentModule !== null) {
        const finalModule = currentModule as Module
        if (finalModule.lessons.length > 0) {
          data.modules.push(finalModule)
        }
      }

      return data
    })

    console.log(`✅ Found ${courseData.modules.length} modules`)
    const totalLessons = courseData.modules.reduce((sum, m) => sum + m.lessons.length, 0)
    console.log(`✅ Found ${totalLessons} lessons\n`)

    // Now extract video URLs from each lesson
    console.log('🎥 Extracting video URLs from lessons...\n')
    
    for (const module of courseData.modules) {
      console.log(`📁 Module: ${module.title}`)
      
      for (const lesson of module.lessons) {
        try {
          console.log(`  📹 Lesson ${lesson.order}: ${lesson.title.substring(0, 50)}...`)
          
          await page.goto(lesson.href, { waitUntil: 'networkidle2', timeout: 30000 })
          await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for video to load

          // Extract video URL
          const videoUrl = await page.evaluate(() => {
            // Check for YouTube iframes
            const iframes = Array.from(document.querySelectorAll('iframe'))
            for (const iframe of iframes) {
              if (iframe.src.includes('youtube')) {
                const match = iframe.src.match(/youtube\.com\/embed\/([^?&]+)/)
                if (match) {
                  return `https://www.youtube.com/watch?v=${match[1]}`
                }
              }
            }

            // Check for video elements
            const videos = Array.from(document.querySelectorAll('video'))
            for (const video of videos) {
              if (video.src && video.src.includes('youtube')) {
                return video.src
              }
            }

            // Check script tags
            const scripts = Array.from(document.querySelectorAll('script'))
            for (const script of scripts) {
              const content = script.textContent || script.innerHTML
              const match = content.match(/youtube\.com\/watch\?v=([^"'\s&]+)/)
              if (match) {
                return `https://www.youtube.com/watch?v=${match[1]}`
              }
            }

            return null
          })

          if (videoUrl) {
            lesson.videoUrl = videoUrl
            console.log(`    ✅ Found video: ${videoUrl}`)
          } else {
            console.log(`    ⚠️  No video found (might be text-only)`)
          }

          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
          console.error(`    ❌ Error extracting video for lesson "${lesson.title}":`, error instanceof Error ? error.message : error)
        }
      }
      
      console.log('')
    }

    // Save to file
    const outputPath = path.join(__dirname, '../sales-course-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(courseData, null, 2), 'utf-8')

    console.log('✅ Extraction complete!')
    console.log(`📄 Saved to: ${outputPath}`)
    console.log(`\n📊 Summary:`)
    console.log(`   Modules: ${courseData.modules.length}`)
    console.log(`   Total Lessons: ${totalLessons}`)
    const lessonsWithVideos = courseData.modules.reduce((sum, m) => 
      sum + m.lessons.filter(l => l.videoUrl).length, 0
    )
    console.log(`   Lessons with Videos: ${lessonsWithVideos}`)
    console.log(`\n🚀 Next step: Run 'npm run import:sales-course' to import into database`)

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

extractCourse().catch(console.error)

