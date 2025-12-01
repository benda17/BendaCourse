'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { Play, BookOpen, TrendingUp } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  modules: Array<{
    lessons: Array<{ id: string }>
  }>
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Dashboard: Component mounted')
    console.log('Dashboard: Cookies:', typeof document !== 'undefined' ? document.cookie : 'N/A')
    fetchUser()
    fetchCourses()
  }, [])

  const fetchUser = async () => {
    try {
      console.log('Dashboard: Fetching user...')
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      console.log('Dashboard: User response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard: User data received:', data)
        setUser(data.user)
      } else {
        const errorText = await response.text()
        console.error('Dashboard: Failed to fetch user:', response.status, errorText)
        // Don't redirect immediately - wait a bit to see what's happening
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      }
    } catch (error) {
      console.error('Dashboard: Error fetching user:', error)
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    }
  }

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...')
      const response = await fetch('/api/courses', {
        credentials: 'include',
      })
      console.log('Courses response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Courses data:', data)
        console.log('Courses fetched:', data.courses?.length || 0)
        setCourses(data.courses || [])
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch courses:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20">
        <div className="text-center">
          <div className="text-muted-foreground mb-2">טוען...</div>
          <div className="text-xs text-muted-foreground">אנא המתן</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20">
        <Card className="border-border/40">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-2">לא אותרת</h3>
            <p className="text-muted-foreground mb-4">
              אנא התחבר מחדש
            </p>
            <Link href="/login">
              <Button>התחבר</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log('Dashboard render - user:', user, 'courses:', courses.length, 'loading:', loading)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            בית הספר של בנדה
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                {user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="outline">ניהול</Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={handleLogout}>התנתק</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold mb-2">ברוך שובך{user?.name ? `, ${user.name}` : ''}</h1>
              <p className="text-muted-foreground mb-8">המשך את מסע הלמידה שלך</p>
          
          {courses.length > 0 && (
            <div className="mb-4 text-sm text-muted-foreground">
              נמצאו {courses.length} קורסים
            </div>
          )}

          {courses.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="pt-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">אין קורסים עדיין</h3>
                <p className="text-muted-foreground mb-4">
                  עדיין לא נרשמת לקורסים.
                </p>
                <div className="text-xs text-muted-foreground mb-4">
                  משתמש: {user?.email || 'לא זוהה'}
                </div>
                <Link href="/">
                  <Button>עיין בקורסים</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="border-border/40 hover:border-primary/50 transition-colors h-full flex flex-col">
                      {course.thumbnail && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.description || 'Premium course content'}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{totalLessons} שיעורים</span>
                          </div>
                        </div>
                        <Link href={`/courses/${course.id}`}>
                          <Button className="w-full">
                            <Play className="w-4 h-4 ml-2" />
                            המשך ללמוד
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Icon logo at bottom left */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Image
            src="/icon.png"
            alt="Benda Course Platform"
            width={64}
            height={64}
            className="object-contain drop-shadow-lg"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

