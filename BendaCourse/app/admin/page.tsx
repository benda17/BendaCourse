'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { Users, BookOpen, RefreshCw, UserPlus } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  enrollments: Array<{
    course: {
      id: string
      title: string
    }
  }>
}

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [enrollUserId, setEnrollUserId] = useState('')
  const [enrollCourseId, setEnrollCourseId] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Sync completed',
          description: `Synced ${data.coursesSynced} courses and ${data.lessonsSynced} lessons.`,
        })
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleEnroll = async () => {
    if (!enrollUserId || !enrollCourseId) {
      toast({
        title: 'Missing fields',
        description: 'Please provide both user ID and course ID.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${enrollUserId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: enrollCourseId }),
      })

      if (response.ok) {
        toast({
          title: 'User enrolled',
          description: 'The user has been enrolled in the course.',
        })
        setEnrollUserId('')
        setEnrollCourseId('')
        fetchUsers()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Enrollment failed')
      }
    } catch (error) {
      toast({
        title: 'Enrollment failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Benda Academy
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Sync Courses
                </CardTitle>
                <CardDescription>
                  Fetch latest courses and lessons from the external platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSync} disabled={syncing} className="w-full">
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Enroll User
                </CardTitle>
                <CardDescription>
                  Manually enroll a user in a course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={enrollUserId}
                    onChange={(e) => setEnrollUserId(e.target.value)}
                    placeholder="User ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseId">Course ID</Label>
                  <Input
                    id="courseId"
                    value={enrollCourseId}
                    onChange={(e) => setEnrollCourseId(e.target.value)}
                    placeholder="Course ID"
                  />
                </div>
                <Button onClick={handleEnroll} className="w-full">
                  Enroll User
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users ({users.length})
              </CardTitle>
              <CardDescription>
                Manage users and their enrollments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border border-border/40 rounded-md flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">{user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.name || 'No name'} • {user.role} • {user.enrollments.length} courses
                      </div>
                      {user.enrollments.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Courses: {user.enrollments.map(e => e.course.title).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {user.id}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

