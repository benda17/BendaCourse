/**
 * Schooler Platform API Client
 * 
 * This client can fetch course data from Schooler if you have API access.
 * Otherwise, use the manual extraction script in scripts/extract-schooler-videos.js
 */

interface SchoolerConfig {
  apiUrl?: string
  apiKey?: string
  sessionCookie?: string // If using cookie-based auth
}

interface SchoolerLesson {
  id: string
  title: string
  type: 'video' | 'text'
  duration?: string // Format: "00:02:19"
  videoUrl?: string
  youtubeId?: string
  order: number
}

interface SchoolerModule {
  id: string
  title: string
  description?: string
  order: number
  lessons: SchoolerLesson[]
}

interface SchoolerCourse {
  id: string
  title: string
  description?: string
  modules: SchoolerModule[]
}

export async function fetchCourseFromSchooler(
  courseId: string = '35614',
  config?: SchoolerConfig
): Promise<SchoolerCourse | null> {
  // If no API access, return null and use manual extraction
  if (!config?.apiUrl && !config?.sessionCookie) {
    console.warn('Schooler API not configured. Use manual extraction script instead.')
    return null
  }

  try {
    // This is a placeholder - you'll need to implement based on Schooler's actual API
    // or use web scraping with authenticated session
    
    // Build headers object, filtering out undefined values
    const headers: Record<string, string> = {}
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`
    }
    if (config.sessionCookie) {
      headers['Cookie'] = config.sessionCookie
    }

    const response = await fetch(
      `${config.apiUrl || 'https://my.schooler.biz'}/api/courses/${courseId}`,
      {
        headers,
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch course: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching from Schooler:', error)
    return null
  }
}

/**
 * Convert duration string "00:02:19" to seconds
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return 0
}

/**
 * Extract YouTube ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  
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

