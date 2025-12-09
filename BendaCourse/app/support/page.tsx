'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { HelpCircle, Video, MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { AnimatedMeshBackground } from '@/components/animated-mesh-background'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ReactPlayer from 'react-player'

interface FAQ {
  id: string
  question: string
  answer: string
  order: number
}

interface SupportVideo {
  id: string
  title: string
  description: string | null
  videoUrl: string
  youtubeId: string | null
  order: number
}

interface UserRequest {
  id: string
  type: 'REQUEST' | 'DEBATE'
  title: string
  content: string
  status: 'PENDING' | 'ANSWERED' | 'CLOSED'
  adminResponse: string | null
  respondedAt: string | null
  createdAt: string
}

type Tab = 'faq' | 'videos' | 'request'

export default function SupportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('faq')
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [videos, setVideos] = useState<SupportVideo[]>([])
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  
  // Request form state
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestForm, setRequestForm] = useState({
    type: 'REQUEST' as 'REQUEST' | 'DEBATE',
    title: '',
    content: '',
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'faq') {
        const res = await fetch('/api/support/faq')
        if (res.ok) {
          const data = await res.json()
          setFaqs(data.faqs || [])
        }
      } else if (activeTab === 'videos') {
        const res = await fetch('/api/support/videos')
        if (res.ok) {
          const data = await res.json()
          setVideos(data.videos || [])
        }
      } else if (activeTab === 'request') {
        const res = await fetch('/api/support/requests')
        if (res.ok) {
          const data = await res.json()
          setRequests(data.requests || [])
        } else if (res.status === 401) {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async () => {
    if (!requestForm.title.trim() || !requestForm.content.trim()) {
      toast({
        title: 'שדות חסרים',
        description: 'אנא מלא את כל השדות',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/support/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm),
      })

      if (res.ok) {
        toast({
          title: 'הבקשה נשלחה',
          description: 'הבקשה שלך נשלחה בהצלחה. נציג יצור איתך קשר בקרוב.',
        })
        setRequestForm({ type: 'REQUEST', title: '', content: '' })
        setShowRequestForm(false)
        fetchData()
      } else if (res.status === 401) {
        router.push('/login')
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בשליחת הבקשה',
        variant: 'destructive',
      })
    }
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 200% 50% at bottom, hsl(var(--primary) / 0.45) 0%, hsl(var(--primary) / 0.35) 20%, hsl(var(--primary) / 0.25) 35%, hsl(var(--primary) / 0.15) 50%, hsl(var(--primary) / 0.08) 65%, hsl(var(--background) / 0.95) 80%, hsl(var(--background)) 100%)'
      }}
    >
      <AnimatedMeshBackground className="z-0" opacity={{ min: 0.1, max: 0.15 }} />
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Benda Academy
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">חזרה ללוח הבקרה</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-8">מרכז תמיכה</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border/40">
            <Button
              variant={activeTab === 'faq' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('faq')}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              שאלות נפוצות
            </Button>
            <Button
              variant={activeTab === 'videos' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('videos')}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              סרטוני תמיכה
            </Button>
            <Button
              variant={activeTab === 'request' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('request')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              בקשה או דיבייט
            </Button>
          </div>

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">שאלות נפוצות</h2>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">טוען...</div>
              ) : faqs.length === 0 ? (
                <Card className="border-border/40">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">אין שאלות זמינות כרגע</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <Card key={faq.id} className="border-border/40">
                      <CardHeader
                        className="cursor-pointer"
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{faq.question}</CardTitle>
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </CardHeader>
                      {expandedFaq === faq.id && (
                        <CardContent>
                          <CardDescription className="whitespace-pre-wrap">{faq.answer}</CardDescription>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">סרטוני תמיכה</h2>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">טוען...</div>
              ) : videos.length === 0 ? (
                <Card className="border-border/40">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">אין סרטונים זמינים כרגע</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {videos.map((video) => (
                    <Card key={video.id} className="border-border/40">
                      <CardHeader>
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        {video.description && (
                          <CardDescription>{video.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                          <ReactPlayer
                            url={video.videoUrl}
                            width="100%"
                            height="100%"
                            controls
                            config={{
                              youtube: {
                                playerVars: {
                                  modestbranding: 1,
                                  rel: 0,
                                },
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Request Tab */}
          {activeTab === 'request' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">בקשה או דיבייט</h2>
                <Button onClick={() => setShowRequestForm(true)}>
                  <MessageSquare className="w-4 h-4 ml-2" />
                  שלח בקשה חדשה
                </Button>
              </div>

              {showRequestForm && (
                <Card className="mb-6 border-border/40">
                  <CardHeader>
                    <CardTitle>שלח בקשה או התחל דיבייט</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="request-type">סוג</Label>
                      <Select
                        value={requestForm.type}
                        onValueChange={(value: 'REQUEST' | 'DEBATE') =>
                          setRequestForm({ ...requestForm, type: value })
                        }
                      >
                        <SelectTrigger id="request-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REQUEST">בקשה</SelectItem>
                          <SelectItem value="DEBATE">דיבייט</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="request-title">כותרת *</Label>
                      <Input
                        id="request-title"
                        value={requestForm.title}
                        onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                        placeholder="הזן כותרת"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="request-content">תוכן *</Label>
                      <Textarea
                        id="request-content"
                        value={requestForm.content}
                        onChange={(e) => setRequestForm({ ...requestForm, content: e.target.value })}
                        placeholder="תאר את הבקשה או הנושא לדיבייט..."
                        rows={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitRequest} className="flex-1">
                        <Send className="w-4 h-4 ml-2" />
                        שלח
                      </Button>
                      <Button variant="outline" onClick={() => { setShowRequestForm(false); setRequestForm({ type: 'REQUEST', title: '', content: '' }) }}>
                        ביטול
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">טוען...</div>
                ) : requests.length === 0 ? (
                  <Card className="border-border/40">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">אין בקשות עדיין</p>
                    </CardContent>
                  </Card>
                ) : (
                  requests.map((req) => (
                    <Card key={req.id} className="border-border/40">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{req.title}</CardTitle>
                          <span className={`px-2 py-1 text-xs rounded ${
                            req.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-600' :
                            req.status === 'ANSWERED' ? 'bg-green-500/20 text-green-600' :
                            'bg-gray-500/20 text-gray-600'
                          }`}>
                            {req.status === 'PENDING' ? 'ממתין' : req.status === 'ANSWERED' ? 'נענה' : 'סגור'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            req.type === 'REQUEST' ? 'bg-blue-500/20 text-blue-600' : 'bg-purple-500/20 text-purple-600'
                          }`}>
                            {req.type === 'REQUEST' ? 'בקשה' : 'דיבייט'}
                          </span>
                        </div>
                        <CardDescription className="whitespace-pre-wrap">{req.content}</CardDescription>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>תאריך: {new Date(req.createdAt).toLocaleString('he-IL')}</p>
                        </div>
                        {req.adminResponse && (
                          <div className="mt-4 p-4 bg-accent rounded-md">
                            <p className="font-semibold mb-2">תגובת מנהל:</p>
                            <p className="whitespace-pre-wrap">{req.adminResponse}</p>
                            {req.respondedAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                נענה ב: {new Date(req.respondedAt).toLocaleString('he-IL')}
                              </p>
                            )}
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

