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
import { HelpCircle, Video, MessageSquare, Plus, Edit, Trash2, X, Send } from 'lucide-react'
import { AnimatedMeshBackground } from '@/components/animated-mesh-background'
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
import { Textarea } from '@/components/ui/textarea'

interface FAQ {
  id: string
  question: string
  answer: string
  order: number
  isActive: boolean
}

interface SupportVideo {
  id: string
  title: string
  description: string | null
  videoUrl: string
  youtubeId: string | null
  order: number
  isActive: boolean
}

interface UserRequest {
  id: string
  userId: string
  type: 'REQUEST' | 'DEBATE'
  title: string
  content: string
  status: 'PENDING' | 'ANSWERED' | 'CLOSED'
  adminResponse: string | null
  respondedBy: string | null
  respondedAt: string | null
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
}

type Tab = 'faq' | 'videos' | 'requests'

export default function AdminSupportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('faq')
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [videos, setVideos] = useState<SupportVideo[]>([])
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  
  // FAQ state
  const [showFaqForm, setShowFaqForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', order: 0, isActive: true })
  
  // Video state
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<SupportVideo | null>(null)
  const [videoForm, setVideoForm] = useState({ title: '', description: '', videoUrl: '', youtubeId: '', order: 0, isActive: true })
  
  // Request state
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)
  const [responseText, setResponseText] = useState('')
  const [requestStatus, setRequestStatus] = useState<'ANSWERED' | 'CLOSED'>('ANSWERED')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'faq') {
        const res = await fetch('/api/admin/faq')
        if (res.ok) {
          const data = await res.json()
          setFaqs(data.faqs || [])
        }
      } else if (activeTab === 'videos') {
        const res = await fetch('/api/admin/support-videos')
        if (res.ok) {
          const data = await res.json()
          setVideos(data.videos || [])
        }
      } else if (activeTab === 'requests') {
        const res = await fetch('/api/admin/requests')
        if (res.ok) {
          const data = await res.json()
          setRequests(data.requests || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFaq = async () => {
    try {
      const url = '/api/admin/faq'
      const method = editingFaq ? 'PUT' : 'POST'
      const body = editingFaq
        ? { id: editingFaq.id, ...faqForm }
        : faqForm

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast({
          title: 'הצלחה',
          description: editingFaq ? 'השאלה עודכנה בהצלחה' : 'השאלה נוספה בהצלחה',
        })
        setShowFaqForm(false)
        setEditingFaq(null)
        setFaqForm({ question: '', answer: '', order: 0, isActive: true })
        fetchData()
      } else {
        throw new Error('Failed to save FAQ')
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בשמירת השאלה',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteFaq = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({
          title: 'השאלה נמחקה',
          description: 'השאלה נמחקה בהצלחה',
        })
        fetchData()
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל במחיקת השאלה',
        variant: 'destructive',
      })
    }
  }

  const handleSaveVideo = async () => {
    try {
      const url = '/api/admin/support-videos'
      const method = editingVideo ? 'PUT' : 'POST'
      const body = editingVideo
        ? { id: editingVideo.id, ...videoForm }
        : videoForm

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast({
          title: 'הצלחה',
          description: editingVideo ? 'הסרטון עודכן בהצלחה' : 'הסרטון נוסף בהצלחה',
        })
        setShowVideoForm(false)
        setEditingVideo(null)
        setVideoForm({ title: '', description: '', videoUrl: '', youtubeId: '', order: 0, isActive: true })
        fetchData()
      } else {
        throw new Error('Failed to save video')
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בשמירת הסרטון',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteVideo = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/support-videos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({
          title: 'הסרטון נמחק',
          description: 'הסרטון נמחק בהצלחה',
        })
        fetchData()
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל במחיקת הסרטון',
        variant: 'destructive',
      })
    }
  }

  const handleRespondToRequest = async () => {
    if (!selectedRequest || !responseText.trim()) return

    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          adminResponse: responseText,
          status: requestStatus,
        }),
      })

      if (res.ok) {
        toast({
          title: 'תגובה נשלחה',
          description: 'התגובה נשלחה בהצלחה למשתמש',
        })
        setSelectedRequest(null)
        setResponseText('')
        fetchData()
      } else {
        throw new Error('Failed to respond')
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בשליחת התגובה',
        variant: 'destructive',
      })
    }
  }

  const startEditFaq = (faq: FAQ) => {
    setEditingFaq(faq)
    setFaqForm({ question: faq.question, answer: faq.answer, order: faq.order, isActive: faq.isActive })
    setShowFaqForm(true)
  }

  const startEditVideo = (video: SupportVideo) => {
    setEditingVideo(video)
    setVideoForm({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      youtubeId: video.youtubeId || '',
      order: video.order,
      isActive: video.isActive,
    })
    setShowVideoForm(true)
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
          <Link href="/admin" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Benda Academy
          </Link>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="ghost">חזרה ללוח הבקרה</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">לוח הבקרה</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-8">ניהול מרכז תמיכה</h1>

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
              variant={activeTab === 'requests' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('requests')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              בקשות ודיבייטים ({requests.filter(r => r.status === 'PENDING').length})
            </Button>
          </div>

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">שאלות נפוצות</h2>
                <Button onClick={() => { setShowFaqForm(true); setEditingFaq(null); setFaqForm({ question: '', answer: '', order: 0, isActive: true }) }}>
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף שאלה
                </Button>
              </div>

              {showFaqForm && (
                <Card className="mb-6 border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{editingFaq ? 'ערוך שאלה' : 'הוסף שאלה חדשה'}</span>
                      <Button variant="ghost" size="sm" onClick={() => { setShowFaqForm(false); setEditingFaq(null) }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="faq-question">שאלה *</Label>
                      <Input
                        id="faq-question"
                        value={faqForm.question}
                        onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                        placeholder="הזן שאלה"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faq-answer">תשובה *</Label>
                      <Textarea
                        id="faq-answer"
                        value={faqForm.answer}
                        onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                        placeholder="הזן תשובה"
                        rows={5}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="faq-order">סדר</Label>
                        <Input
                          id="faq-order"
                          type="number"
                          value={faqForm.order}
                          onChange={(e) => setFaqForm({ ...faqForm, order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="faq-active">סטטוס</Label>
                        <Select
                          value={faqForm.isActive ? 'active' : 'inactive'}
                          onValueChange={(value) => setFaqForm({ ...faqForm, isActive: value === 'active' })}
                        >
                          <SelectTrigger id="faq-active">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">פעיל</SelectItem>
                            <SelectItem value="inactive">לא פעיל</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleSaveFaq} className="w-full">
                      שמור
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">טוען...</div>
                ) : faqs.length === 0 ? (
                  <Card className="border-border/40">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">אין שאלות עדיין</p>
                    </CardContent>
                  </Card>
                ) : (
                  faqs.map((faq) => (
                    <Card key={faq.id} className="border-border/40">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{faq.question}</CardTitle>
                            <CardDescription className="mt-2 whitespace-pre-wrap">{faq.answer}</CardDescription>
                            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                              <span>סדר: {faq.order}</span>
                              <span>•</span>
                              <span>{faq.isActive ? 'פעיל' : 'לא פעיל'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => startEditFaq(faq)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteFaq(faq.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">סרטוני תמיכה</h2>
                <Button onClick={() => { setShowVideoForm(true); setEditingVideo(null); setVideoForm({ title: '', description: '', videoUrl: '', youtubeId: '', order: 0, isActive: true }) }}>
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף סרטון
                </Button>
              </div>

              {showVideoForm && (
                <Card className="mb-6 border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{editingVideo ? 'ערוך סרטון' : 'הוסף סרטון חדש'}</span>
                      <Button variant="ghost" size="sm" onClick={() => { setShowVideoForm(false); setEditingVideo(null) }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="video-title">כותרת *</Label>
                      <Input
                        id="video-title"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        placeholder="הזן כותרת"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video-description">תיאור</Label>
                      <Textarea
                        id="video-description"
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                        placeholder="הזן תיאור"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video-url">קישור לסרטון *</Label>
                      <Input
                        id="video-url"
                        value={videoForm.videoUrl}
                        onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video-youtube-id">מזהה YouTube (אופציונלי)</Label>
                      <Input
                        id="video-youtube-id"
                        value={videoForm.youtubeId}
                        onChange={(e) => setVideoForm({ ...videoForm, youtubeId: e.target.value })}
                        placeholder="YouTube ID"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="video-order">סדר</Label>
                        <Input
                          id="video-order"
                          type="number"
                          value={videoForm.order}
                          onChange={(e) => setVideoForm({ ...videoForm, order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="video-active">סטטוס</Label>
                        <Select
                          value={videoForm.isActive ? 'active' : 'inactive'}
                          onValueChange={(value) => setVideoForm({ ...videoForm, isActive: value === 'active' })}
                        >
                          <SelectTrigger id="video-active">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">פעיל</SelectItem>
                            <SelectItem value="inactive">לא פעיל</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleSaveVideo} className="w-full">
                      שמור
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">טוען...</div>
                ) : videos.length === 0 ? (
                  <Card className="border-border/40">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">אין סרטונים עדיין</p>
                    </CardContent>
                  </Card>
                ) : (
                  videos.map((video) => (
                    <Card key={video.id} className="border-border/40">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{video.title}</CardTitle>
                            {video.description && (
                              <CardDescription className="mt-2">{video.description}</CardDescription>
                            )}
                            <div className="mt-2">
                              <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                {video.videoUrl}
                              </a>
                            </div>
                            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                              <span>סדר: {video.order}</span>
                              <span>•</span>
                              <span>{video.isActive ? 'פעיל' : 'לא פעיל'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => startEditVideo(video)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteVideo(video.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">בקשות ודיבייטים</h2>
                <div className="flex gap-2">
                  <Select
                    value="all"
                    onValueChange={(value) => {
                      // Filter logic can be added here
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">הכל</SelectItem>
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="answered">נענה</SelectItem>
                      <SelectItem value="closed">סגור</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
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
                            <CardDescription className="mt-2 whitespace-pre-wrap">{req.content}</CardDescription>
                            <div className="mt-2 text-sm text-muted-foreground">
                              <p>מאת: {req.user.email} {req.user.name ? `(${req.user.name})` : ''}</p>
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
                          </div>
                          {req.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(req)
                                setResponseText('')
                                setRequestStatus('ANSWERED')
                              }}
                            >
                              <Send className="w-4 h-4 ml-2" />
                              הגב
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Response Dialog */}
          {selectedRequest && (
            <AlertDialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>הגב על {selectedRequest.type === 'REQUEST' ? 'בקשה' : 'דיבייט'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="font-semibold mb-2">{selectedRequest.title}</p>
                        <p className="text-sm whitespace-pre-wrap">{selectedRequest.content}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="response-text">תגובה *</Label>
                        <Textarea
                          id="response-text"
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="הזן את תגובתך..."
                          rows={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="response-status">סטטוס</Label>
                        <Select
                          value={requestStatus}
                          onValueChange={(value: 'ANSWERED' | 'CLOSED') => setRequestStatus(value)}
                        >
                          <SelectTrigger id="response-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ANSWERED">נענה</SelectItem>
                            <SelectItem value="CLOSED">סגור</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRespondToRequest} disabled={!responseText.trim()}>
                    שלח תגובה
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </motion.div>
      </div>
    </div>
  )
}

