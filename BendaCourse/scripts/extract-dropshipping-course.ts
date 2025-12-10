import 'dotenv/config'
import puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Automated Schooler Course Extractor for Dropshipping Course
 * 
 * This script will:
 * 1. Navigate to the course page
 * 2. Extract all modules and lessons
 * 3. Visit each lesson page to extract video URLs
 * 4. Save everything to dropshipping-course-data.json
 * 
 * Usage:
 * npm run extract:dropshipping-course
 */

const COURSE_URL = 'https://my.schooler.biz/s/35614/1631284218338'
const COURSE_TITLE = 'הקורס המלא של בנדה לדרופשיפינג באיביי'

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
  console.log('🚀 Starting automated dropshipping course extraction...\n')
  console.log('⚠️  IMPORTANT: If you see a login page, please log in manually in the browser window.')
  console.log('   The script will wait 30 seconds for you to log in...\n')
  
  const browser = await puppeteer.launch({
    headless: false,
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
    await new Promise(resolve => setTimeout(resolve, 5000))

    console.log('🔍 Extracting course structure...')

    // Extract course structure from the page
    const courseData: CourseData = await page.evaluate(() => {
      const data: CourseData = {
        title: 'הקורס המלא של בנדה לדרופשיפינג באיביי',
        description: 'קורס מקצועי למסחר אונליין באיביי - מסלול מסודר מהבסיס עד לרמה של עסק אונליין אמיתי',
        modules: []
      }

      // Try multiple selectors for sidebar/navigation
      const sidebarSelectors = [
        '.course-sidebar', '.course-navigation', 'nav', 'aside',
        '[class*="sidebar"]', '[class*="navigation"]', '[class*="menu"]',
        '[id*="sidebar"]', '[id*="navigation"]', '[id*="menu"]'
      ]

      let sidebar: Element | null = null
      for (const selector of sidebarSelectors) {
        sidebar = document.querySelector(selector)
        if (sidebar) break
      }

      if (!sidebar) {
        const courseLinks = Array.from(document.querySelectorAll('a[href*="/s/35614/1631284218338/"], a[href*="1631284218338"], a[href*="/s/35614/"]'))
        if (courseLinks.length > 0) {
          sidebar = courseLinks[0].closest('nav, aside, div, ul, ol, section') || document.body
        }
      }

      if (!sidebar) {
        console.error('Could not find sidebar')
        return data
      }

      // Find all lesson links
      const linkSelectors = [
        'a[href*="/s/35614/1631284218338/"]',
        'a[href*="1631284218338"]',
        'a[href*="/s/35614/"]'
      ]

      let links: HTMLAnchorElement[] = []
      for (const selector of linkSelectors) {
        const found = Array.from(sidebar.querySelectorAll(selector)) as HTMLAnchorElement[]
        if (found.length > 0) {
          links = found
          break
        }
      }

      if (links.length === 0) {
        links = Array.from(document.querySelectorAll('a[href*="/s/35614/1631284218338/"], a[href*="1631284218338"], a[href*="/s/35614/"]')) as HTMLAnchorElement[]
      }

      let currentModule: Module | null = null
      let moduleOrder = 1
      let lessonOrder = 1

      links.forEach((link) => {
        const href = link.getAttribute('href') || ''
        const text = link.textContent?.trim() || ''
        
        if (!text || (!href.includes('/s/35614/1631284218338/') && !href.includes('1631284218338'))) {
          return
        }

        const parent = link.closest('li, div, section')
        const isModuleHeader = text.includes('פרק') || text.includes('חלק') || text.includes('מודול') ||
                               parent?.querySelector('h2, h3, h4, .module-title, .chapter-title')

        if (isModuleHeader || (currentModule !== null && currentModule.lessons.length === 0 && text.match(/^פרק|^חלק|^מודול/))) {
          if (currentModule !== null && currentModule.lessons.length > 0) {
            data.modules.push(currentModule)
          }
          
          currentModule = {
            title: text,
            order: moduleOrder++,
            lessons: []
          }
          lessonOrder = 1
          return
        }

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

        const durationMatch = parent?.textContent?.match(/(\d+):(\d+)/)
        let duration: number | null = null
        if (durationMatch) {
          const minutes = parseInt(durationMatch[1])
          const seconds = parseInt(durationMatch[2])
          duration = minutes * 60 + seconds
        }

        const fullHref = href.startsWith('http') ? href : 
                        href.startsWith('/') ? `https://my.schooler.biz${href}` :
                        `https://my.schooler.biz/s/35614/1631284218338/${href}`

        currentModule.lessons.push({
          title: text,
          href: fullHref,
          order: lessonOrder++,
          duration: duration,
          videoUrl: null
        })
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

    // Save to file
    const outputPath = path.join(__dirname, '../dropshipping-course-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(courseData, null, 2), 'utf-8')

    console.log('✅ Extraction complete!')
    console.log(`📄 Saved to: ${outputPath}`)
    console.log(`\n📊 Summary:`)
    console.log(`   Modules: ${courseData.modules.length}`)
    console.log(`   Total Lessons: ${totalLessons}`)
    console.log(`\n🚀 Next step: Run 'npm run import:dropshipping-course' to import into database`)

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

