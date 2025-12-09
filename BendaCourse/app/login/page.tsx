'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { AnimatedMeshBackground } from '@/components/animated-mesh-background'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Starting login for:', email)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      console.log('Response received, status:', response.status)
      
      let data
      try {
        data = await response.json()
        console.log('Response data:', data)
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError)
        const text = await response.text()
        console.error('Response text:', text)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        console.error('Login failed:', data.error)
        throw new Error(data.error || 'Login failed')
      }

      console.log('Login successful! User:', data.user)
      
      // Check if cookie was set
      console.log('Cookies after login:', document.cookie)
      
      // Show success message
      toast({
        title: 'ברוך שובך!',
        description: 'התחברת בהצלחה.',
      })
      
      // Force redirect - use replace to prevent back button issues
      console.log('About to redirect to /dashboard...')
      
      // Try multiple redirect methods
      try {
        window.location.replace('/dashboard')
      } catch (e) {
        console.error('Replace failed, trying href:', e)
        window.location.href = '/dashboard'
      }
      
      // Fallback after delay
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          console.error('Still on login page after redirect attempt!')
          console.log('Cookies:', document.cookie)
          // Try one more time
          window.location.href = '/dashboard'
        }
      }, 1000)
      
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false) // Re-enable form on error
      toast({
        title: 'התחברות נכשלה',
        description: error instanceof Error ? error.message : 'אנא בדוק את פרטי ההתחברות שלך.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 200% 50% at bottom, hsl(var(--primary) / 0.45) 0%, hsl(var(--primary) / 0.35) 20%, hsl(var(--primary) / 0.25) 35%, hsl(var(--primary) / 0.15) 50%, hsl(var(--primary) / 0.08) 65%, hsl(var(--background) / 0.95) 80%, hsl(var(--background)) 100%)'
      }}
    >
      <AnimatedMeshBackground className="z-0" opacity={{ min: 0.1, max: 0.15 }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border/40">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">ברוך שובך</CardTitle>
            <CardDescription className="text-center">
              התחבר לחשבון שלך כדי להמשיך
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
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                  שכחת סיסמה?
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'מתחבר...' : 'התחבר'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              אין לך חשבון?{' '}
              <Link href="/register" className="text-primary hover:underline">
                הירשם
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

