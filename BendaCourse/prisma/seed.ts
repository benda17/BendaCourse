import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

// Course structure extracted from Schooler platform
// You'll need to add actual YouTube video URLs
const courseData = {
  title: "הקורס המלא של בנדה לדרופשיפינג באיביי",
  description: "קורס מקצועי למסחר אונליין באיביי - מסלול מסודר מהבסיס עד לרמה של עסק אונליין אמיתי",
  slug: "benda-dropshipping-ebay-course",
  price: 0, // Set your price
  thumbnail: null,
  modules: [
    {
      title: "פרק מספר 1 - הקדמה >> לפני הכל.",
      description: "הקדמה לקורס והכרות עם המערכת",
      order: 1,
      lessons: [
        { title: "שיעור 1 : מה לעשות אם כבר יש לכם חשבון איביי?", duration: 139, order: 1, videoUrl: "PLACEHOLDER_YOUTUBE_URL_1" },
        { title: "שיעור 2 : מה לעשות אם אתם מתחת לגיל 18?", duration: 196, order: 2, videoUrl: "PLACEHOLDER_YOUTUBE_URL_2" },
        { title: "שיעור 3 : מה זה בכלל דרופשיפינג?", duration: 148, order: 3, videoUrl: "PLACEHOLDER_YOUTUBE_URL_3" },
        { title: "שיעור 4 : תודה שאתם פה.", duration: 55, order: 4, videoUrl: "PLACEHOLDER_YOUTUBE_URL_4" },
        { title: "שיעור 5 : מה אני דורש מכם?", duration: 263, order: 5, videoUrl: "PLACEHOLDER_YOUTUBE_URL_5" },
        { title: "שיעור 6 : הצטרפות לקבוצת הוואטסאפ", duration: 58, order: 6, videoUrl: "PLACEHOLDER_YOUTUBE_URL_6" },
        { title: "הקהילה של בנדה בדיסקורד", duration: 354, order: 7, videoUrl: "PLACEHOLDER_YOUTUBE_URL_7" },
      ]
    },
    {
      title: "פרק בונוס - ניהול חנויות",
      description: "בונוס על ניהול חנויות",
      order: 2,
      lessons: [
        { title: "ניהול החנויות של בנדה", duration: 744, order: 1, videoUrl: "PLACEHOLDER_YOUTUBE_URL_8" },
      ]
    },
    {
      title: "פרק מספר 2 - יצירת החשבונות שלנו",
      description: "יצירת כל החשבונות הנדרשים",
      order: 3,
      lessons: [
        { title: "שיעור 7 : מה זה בכלל Payoneer?", duration: 65, order: 1, videoUrl: "PLACEHOLDER_YOUTUBE_URL_9" },
        { title: "שיעור 8 : יצירת חשבון Gmail", duration: 239, order: 2, videoUrl: "PLACEHOLDER_YOUTUBE_URL_10" },
        { title: "שיעור 9 : יצירת חשבון אלי אקספרס", duration: 124, order: 3, videoUrl: "PLACEHOLDER_YOUTUBE_URL_11" },
        { title: "שיעור 10 : יצירת חשבון eBay", duration: 68, order: 4, videoUrl: "PLACEHOLDER_YOUTUBE_URL_12" },
        { title: "שיעור 11 : יצירת חשבון פיוניר", duration: 545, order: 5, videoUrl: "PLACEHOLDER_YOUTUBE_URL_13" },
        { title: "שיעור 12 : איך מאמתים חשבון פיוניר?", duration: 472, order: 6, videoUrl: "PLACEHOLDER_YOUTUBE_URL_14" },
        { title: "שיעור 13 : איך מקשרים את חשבון האיביי שלנו עם החשבון הפיוניר?", duration: 383, order: 7, videoUrl: "PLACEHOLDER_YOUTUBE_URL_15" },
        { title: "שיעור בונוס ממני! - איך מטפלים בבעיות Payoneer?", duration: 93, order: 8, videoUrl: "PLACEHOLDER_YOUTUBE_URL_16" },
      ]
    },
    {
      title: "פרק מספר 3 - חימום החנות שלנו",
      description: "איך לחמם את החנות לפני שמתחילים למכור",
      order: 4,
      lessons: [
        { title: "שיעור 14: למה חשוב לחמם את החנות שלנו?", duration: 152, order: 1, videoUrl: "PLACEHOLDER_YOUTUBE_URL_17" },
        { title: "שיעור 15: מה הם פידבקים?", duration: 212, order: 2, videoUrl: "PLACEHOLDER_YOUTUBE_URL_18" },
        { title: "שיעור 16: איך קונים פידבקים?", duration: 296, order: 3, videoUrl: "PLACEHOLDER_YOUTUBE_URL_19" },
        { title: "שיעור 17: מה הם קבצי קוקיז?", duration: 242, order: 4, videoUrl: "PLACEHOLDER_YOUTUBE_URL_20" },
        { title: "שיעור 18: איך יוצרים קבצי קוקיז?", duration: 133, order: 5, videoUrl: "PLACEHOLDER_YOUTUBE_URL_21" },
        { title: "שיעור 19: תוכנית העבודה שלנו לחימום החנות", duration: 205, order: 6, videoUrl: "PLACEHOLDER_YOUTUBE_URL_22" },
        { title: "שיעור 20: הסברים נוספים על תוכנית העבודה שלנו.", duration: 226, order: 7, videoUrl: "PLACEHOLDER_YOUTUBE_URL_23" },
      ]
    },
    // Add remaining modules - this is a template structure
    // You'll need to extract all 35 modules and 114+ lessons from Schooler
  ]
}

async function main() {
  console.log('Starting seed...')

  // Create course
  const course = await prisma.course.upsert({
    where: { slug: courseData.slug },
    update: {
      title: courseData.title,
      description: courseData.description,
      price: courseData.price,
    },
    create: {
      title: courseData.title,
      description: courseData.description,
      slug: courseData.slug,
      price: courseData.price,
      thumbnail: courseData.thumbnail,
    },
  })

  console.log(`Created course: ${course.title}`)

  // Create modules and lessons
  for (const moduleData of courseData.modules) {
    const module = await prisma.module.upsert({
      where: {
        courseId_order: {
          courseId: course.id,
          order: moduleData.order,
        },
      },
      update: {
        title: moduleData.title,
        description: moduleData.description || null,
      },
      create: {
        courseId: course.id,
        title: moduleData.title,
        description: moduleData.description || null,
        order: moduleData.order,
      },
    })

    console.log(`Created module: ${module.title}`)

    for (const lessonData of moduleData.lessons) {
      // Extract YouTube ID from URL if provided
      const youtubeId = lessonData.videoUrl.includes('youtube.com') || lessonData.videoUrl.includes('youtu.be')
        ? extractYouTubeId(lessonData.videoUrl)
        : null

      await prisma.lesson.upsert({
        where: {
          moduleId_order: {
            moduleId: module.id,
            order: lessonData.order,
          },
        },
        update: {
          title: lessonData.title,
          videoUrl: lessonData.videoUrl,
          youtubeId: youtubeId,
          duration: lessonData.duration,
        },
        create: {
          moduleId: module.id,
          title: lessonData.title,
          videoUrl: lessonData.videoUrl,
          youtubeId: youtubeId,
          duration: lessonData.duration,
          order: lessonData.order,
        },
      })
    }
  }

  console.log('Seed completed!')
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

