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
import { Users, BookOpen, RefreshCw, UserPlus, Trash2, Search, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [enrollUserId, setEnrollUserId] = useState('')
  const [enrollCourseId, setEnrollCourseId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'STUDENT' as 'ADMIN' | 'STUDENT' })
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search query
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.email.toLowerCase().includes(query) ||
            user.name?.toLowerCase().includes(query) ||
            user.id.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, users])

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
        title: 'שגיאה',
        description: 'נכשל בטעינת המשתמשים.',
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
        title: 'הסנכרון הושלם',
        description: `סונכרנו ${data.coursesSynced} קורסים ו-${data.lessonsSynced} שיעורים.`,
      })
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error) {
      toast({
        title: 'הסנכרון נכשל',
        description: error instanceof Error ? error.message : 'אנא נסה שוב.',
        variant: 'destructive',
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleEnroll = async () => {
    if (!enrollUserId || !enrollCourseId) {
      toast({
        title: 'שדות חסרים',
        description: 'אנא מלא גם מזהה משתמש וגם מזהה קורס.',
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
        title: 'המשתמש נרשם',
        description: 'המשתמש נרשם בהצלחה לקורס.',
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
        title: 'ההרשמה נכשלה',
        description: error instanceof Error ? error.message : 'אנא נסה שוב.',
        variant: 'destructive',
      })
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({
        title: 'שדות חסרים',
        description: 'אנא מלא אימייל וסיסמה.',
        variant: 'destructive',
      })
      return
    }

    if (newUser.password.length < 8) {
      toast({
        title: 'סיסמה לא תקינה',
        description: 'הסיסמה חייבת להכיל לפחות 8 תווים.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
      toast({
        title: 'המשתמש נוצר',
        description: `המשתמש ${newUser.email} נוצר בהצלחה. אימייל נשלח עם פרטי הכניסה.`,
      })
        setNewUser({ email: '', password: '', name: '', role: 'STUDENT' })
        setShowAddUser(false)
        fetchUsers()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create user')
      }
    } catch (error) {
      toast({
        title: 'יצירת המשתמש נכשלה',
        description: error instanceof Error ? error.message : 'אנא נסה שוב.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return

    try {
      const response = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
      toast({
        title: 'המשתמש נמחק',
        description: 'המשתמש נמחק בהצלחה.',
      })
        fetchUsers()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }
    } catch (error) {
      toast({
        title: 'מחיקת המשתמש נכשלה',
        description: error instanceof Error ? error.message : 'אנא נסה שוב.',
        variant: 'destructive',
      })
    } finally {
      setShowDeleteDialog(false)
      setDeleteUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">טוען...</div>
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
            <Button variant="ghost">חזרה ללוח הבקרה</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-8">לוח בקרה למנהלים</h1>

          {/* Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  סנכרון קורסים
                </CardTitle>
                <CardDescription>
                  משיכת קורסים ושיעורים עדכניים מהפלטפורמה החיצונית
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSync} disabled={syncing} className="w-full">
                  {syncing ? 'מסנכרן...' : 'סנכרן עכשיו'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  הוספת משתמש חדש
                </CardTitle>
                <CardDescription>
                  יצירת חשבון משתמש חדש
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowAddUser(true)} className="w-full">
                  הוסף משתמש
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  הרשמת משתמש
                </CardTitle>
                <CardDescription>
                  הרשמת משתמש לקורס ידנית
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">מזהה משתמש</Label>
                  <Input
                    id="userId"
                    value={enrollUserId}
                    onChange={(e) => setEnrollUserId(e.target.value)}
                    placeholder="מזהה משתמש"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseId">מזהה קורס</Label>
                  <Input
                    id="courseId"
                    value={enrollCourseId}
                    onChange={(e) => setEnrollCourseId(e.target.value)}
                    placeholder="מזהה קורס"
                  />
                </div>
                <Button onClick={handleEnroll} className="w-full">
                  הרשם משתמש
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Add User Dialog */}
          {showAddUser && (
            <Card className="border-border/40 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    הוספת משתמש חדש
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddUser(false)
                      setNewUser({ email: '', password: '', name: '', role: 'STUDENT' })
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">אימייל *</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">סיסמה *</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="מינימום 8 תווים"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newName">שם (אופציונלי)</Label>
                    <Input
                      id="newName"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="שם מלא"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newRole">תפקיד</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: 'ADMIN' | 'STUDENT') =>
                        setNewUser({ ...newUser, role: value })
                      }
                    >
                      <SelectTrigger id="newRole">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">תלמיד</SelectItem>
                        <SelectItem value="ADMIN">מנהל</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddUser} className="flex-1">
                    צור משתמש
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddUser(false)
                      setNewUser({ email: '', password: '', name: '', role: 'STUDENT' })
                    }}
                  >
                    ביטול
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    משתמשים ({filteredUsers.length} מתוך {users.length})
                  </CardTitle>
                  <CardDescription>
                    ניהול משתמשים והרשמותיהם
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="חפש משתמשים..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'לא נמצאו משתמשים התואמים לחיפוש שלך.' : 'לא נמצאו משתמשים.'}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border border-border/40 rounded-md flex items-center justify-between hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{user.email}</span>
                          {user.role === 'ADMIN' && (
                            <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {user.name || 'ללא שם'} • {user.enrollments.length} קורס{user.enrollments.length !== 1 ? 'ים' : ''}
                        </div>
                        {user.enrollments.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            קורסים: {user.enrollments.map(e => e.course.title).join(', ')}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          נוצר: {new Date(user.createdAt).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground font-mono">
                          {user.id.substring(0, 8)}...
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(user.id)}
                          className="ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                <AlertDialogDescription>
                  פעולה זו לא ניתנת לביטול. זה ימחק לצמיתות את חשבון המשתמש
                  ואת כל הנתונים הקשורים (הרשמות, התקדמות וכו').
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  מחק
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  )
}

