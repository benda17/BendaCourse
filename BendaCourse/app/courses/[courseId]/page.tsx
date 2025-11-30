'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LessonViewer } from '@/components/lesson-viewer'
import { useToast } from '@/components/ui/use-toast'

interface Course {
  id: string
  title: string
  description: string | null
  modules: Array<{
    id: string
    title: string
    description: string | null
    order: number
    lessons: Array<{
      id: string
      title: string
      description: string | null
      videoUrl: string
      youtubeId: string | null
      duration: number | null
      order: number
      isLocked: boolean
    }>
  }>
}

interface LessonProgress {
  lessonId: string
  completed: boolean
  progress: number
  notes: string | null
}

export default function CourseViewerPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [course, setCourse] = useState<Course | null>(null)
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourse()
  }, [params.courseId])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}`)
      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: 'Access Denied',
            description: 'אינך רשום לקורס זה.',
            variant: 'destructive',
          })
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch course')
      }

      const data = await response.json()
      setCourse(data.course)
      setProgress(data.progress || [])
    } catch (error) {
      toast({
        title: 'Error',
            description: 'נכשל בטעינת הקורס.',
        variant: 'destructive',
      })
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleProgressUpdate = () => {
    fetchCourse()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">טוען קורס...</div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
              ← חזרה לדשבורד
            </Link>
            <h1 className="text-xl font-bold mt-1">{course.title}</h1>
          </div>
        </div>
      </div>

      {/* Lesson Viewer */}
      <div className="flex-1 min-h-0">
        <LessonViewer
          courseId={course.id}
          modules={course.modules}
          progress={progress}
          onProgressUpdate={handleProgressUpdate}
        />
      </div>
    </div>
  )
}

