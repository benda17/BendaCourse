'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setSent(true)
      toast({
        title: 'קישור איפוס נשלח',
        description: 'בדוק את האימייל שלך להוראות איפוס הסיסמה.',
      })
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'אנא נסה שוב.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: 'שגיאה',
        description: 'הסיסמאות אינן תואמות',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: 'שגיאה',
        description: 'הסיסמה חייבת להכיל לפחות 8 תווים',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setResetSuccess(true)
      toast({
        title: 'סיסמה אופסה בהצלחה',
        description: 'הסיסמה שלך עודכנה. תוכל להתחבר כעת.',
      })
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'אנא נסה שוב.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Show reset password form if token is present
  if (token) {
    if (resetSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-border/40">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">סיסמה אופסה בהצלחה!</CardTitle>
                <CardDescription className="text-center">
                  הסיסמה שלך עודכנה. מעביר אותך לדף ההתחברות...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login">
                  <Button className="w-full">התחבר</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/40">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">איפוס סיסמה</CardTitle>
              <CardDescription className="text-center">
                הזן סיסמה חדשה
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">סיסמה חדשה</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    dir="ltr"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'מאפס...' : 'איפוס סיסמה'}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  חזרה להתחברות
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/40">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">בדוק את האימייל שלך</CardTitle>
              <CardDescription className="text-center">
                שלחנו הוראות איפוס סיסמה ל-{email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full">חזרה להתחברות</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/40">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">שכחתי סיסמה</CardTitle>
            <CardDescription className="text-center">
              הזן את האימייל שלך כדי לקבל הוראות איפוס
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'שולח...' : 'שלח קישור איפוס'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              זוכר את הסיסמה שלך?{' '}
              <Link href="/login" className="text-primary hover:underline">
                התחבר
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

