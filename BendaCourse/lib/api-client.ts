// External course platform API client
// This will fetch YouTube video URLs from your existing course system

interface CoursePlatformConfig {
  apiUrl: string
  apiKey: string
  apiSecret: string
}

interface ExternalCourse {
  id: string
  title: string
  description?: string
  thumbnail?: string
  price: number
  modules: ExternalModule[]
}

interface ExternalModule {
  id: string
  title: string
  description?: string
  order: number
  lessons: ExternalLesson[]
}

interface ExternalLesson {
  id: string
  title: string
  description?: string
  videoUrl: string
  youtubeId?: string
  duration?: number
  order: number
}

export async function fetchCoursesFromPlatform(): Promise<ExternalCourse[]> {
  const config: CoursePlatformConfig = {
    apiUrl: process.env.COURSE_PLATFORM_API_URL || '',
    apiKey: process.env.COURSE_PLATFORM_API_KEY || '',
    apiSecret: process.env.COURSE_PLATFORM_API_SECRET || '',
  }

  if (!config.apiUrl || !config.apiKey) {
    console.warn('Course platform API credentials not configured')
    return []
  }

  try {
    const response = await fetch(`${config.apiUrl}/api/courses`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-API-Secret': config.apiSecret,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.courses || []
  } catch (error) {
    console.error('Error fetching courses from platform:', error)
    throw error
  }
}

export function extractYouTubeId(url: string): string | null {
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

export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
}

