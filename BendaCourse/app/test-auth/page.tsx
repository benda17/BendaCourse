'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState('Checking...')
  const [userData, setUserData] = useState<any>(null)
  const [coursesData, setCoursesData] = useState<any>(null)

  useEffect(() => {
    // Test auth
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUserData(data)
        setAuthStatus(data.user ? 'Authenticated' : 'Not authenticated')
      })
      .catch(err => {
        setAuthStatus('Error: ' + err.message)
      })

    // Test courses
    fetch('/api/courses', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setCoursesData(data)
      })
      .catch(err => {
        console.error('Courses error:', err)
      })
  }, [])

  return (
    <div className="min-h-screen p-8 bg-background">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Auth Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Auth Status:</h3>
            <p className="text-muted-foreground">{authStatus}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">User Data:</h3>
            <pre className="bg-secondary p-4 rounded text-xs overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Courses Data:</h3>
            <pre className="bg-secondary p-4 rounded text-xs overflow-auto">
              {JSON.stringify(coursesData, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cookies:</h3>
            <p className="text-muted-foreground text-xs">
              {typeof document !== 'undefined' ? document.cookie : 'Server-side'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

