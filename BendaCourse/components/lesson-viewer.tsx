'use client'

import { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player/youtube'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, Circle, Lock, Play, BookOpen } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string
  youtubeId: string | null
  duration: number | null
  order: number
  isLocked: boolean
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
}

interface LessonProgress {
  lessonId: string
  completed: boolean
  progress: number
  notes: string | null
}

interface LessonViewerProps {
  courseId: string
  modules: Module[]
  progress: LessonProgress[]
  onProgressUpdate?: () => void
}

export function LessonViewer({ courseId, modules, progress, onProgressUpdate }: LessonViewerProps) {
  const { toast } = useToast()
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [playerProgress, setPlayerProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const playerRef = useRef<ReactPlayer>(null)

  // Find first incomplete lesson or first lesson
  useEffect(() => {
    if (!selectedLessonId && modules.length > 0) {
      const allLessons = modules.flatMap(m => m.lessons)
      const incompleteLesson = allLessons.find(l => {
        const prog = progress.find(p => p.lessonId === l.id)
        return !prog?.completed && !l.isLocked
      })
      setSelectedLessonId(incompleteLesson?.id || allLessons[0]?.id || null)
    }
  }, [modules, progress, selectedLessonId])

  // Load notes for selected lesson
  useEffect(() => {
    if (selectedLessonId) {
      const lessonProgress = progress.find(p => p.lessonId === selectedLessonId)
      setNotes(lessonProgress?.notes || '')
    }
  }, [selectedLessonId, progress])

  const selectedLesson = modules
    .flatMap(m => m.lessons)
    .find(l => l.id === selectedLessonId)

  const handleProgress = async (state: { played: number, playedSeconds: number }) => {
    if (!selectedLessonId) return

    const newProgress = state.played * 100
    setPlayerProgress(newProgress)

    // Auto-save progress every 10 seconds
    if (Math.floor(state.playedSeconds) % 10 === 0) {
      await updateProgress(newProgress, false)
    }
  }

  const handleComplete = async () => {
    if (!selectedLessonId) return
    await updateProgress(100, true)
    toast({
      title: 'שיעור הושלם!',
      description: 'כל הכבוד על סיום השיעור.',
    })
    onProgressUpdate?.()
  }

  const updateProgress = async (progressValue: number, completed: boolean) => {
    if (!selectedLessonId) return

    try {
      await fetch(`/api/lessons/${selectedLessonId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: progressValue,
          completed,
        }),
      })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const saveNotes = async () => {
    if (!selectedLessonId) return
    setSavingNotes(true)

    try {
      await fetch(`/api/lessons/${selectedLessonId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      toast({
      title: 'הערות נשמרו',
      description: 'ההערות שלך נשמרו בהצלחה.',
      })
    } catch (error) {
      toast({
        title: 'שמירת הערות נכשלה',
        description: 'אנא נסה שוב.',
        variant: 'destructive',
      })
    } finally {
      setSavingNotes(false)
    }
  }

  const getLessonProgress = (lessonId: string) => {
    return progress.find(p => p.lessonId === lessonId)
  }

  const getCourseProgress = () => {
    const allLessons = modules.flatMap(m => m.lessons)
    const completedLessons = allLessons.filter(l => {
      const prog = getLessonProgress(l.id)
      return prog?.completed
    })
    return (completedLessons.length / allLessons.length) * 100
  }

  if (!selectedLesson) {
    return <div className="text-center text-muted-foreground">לא נבחר שיעור</div>
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-96 border-r border-border/40 bg-card overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-border/40">
          <h2 className="font-semibold mb-2 text-right">תוכן הקורס</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Progress value={getCourseProgress()} className="h-2 flex-1" />
            <span className="text-xs">{Math.round(getCourseProgress())}%</span>
          </div>
        </div>
        <div className="p-2">
          {modules.map((module) => (
            <div key={module.id} className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground text-right">
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-right break-words">{module.title}</span>
              </div>
              <div className="space-y-1">
                {module.lessons.map((lesson) => {
                  const lessonProg = getLessonProgress(lesson.id)
                  const isSelected = lesson.id === selectedLessonId
                  const isCompleted = lessonProg?.completed
                  const isLocked = lesson.isLocked

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !isLocked && setSelectedLessonId(lesson.id)}
                      disabled={isLocked}
                      className={`w-full text-right px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                        isSelected
                          ? 'bg-primary/20 text-primary font-medium'
                          : isLocked
                          ? 'text-muted-foreground/50 cursor-not-allowed'
                          : 'hover:bg-secondary text-foreground'
                      }`}
                      title={lesson.title}
                    >
                      {lesson.duration && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDuration(lesson.duration)}
                        </span>
                      )}
                      <span className="flex-1 text-right break-words min-w-0">{lesson.title}</span>
                      {isLocked ? (
                        <Lock className="w-4 h-4 flex-shrink-0" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-primary" />
                      ) : (
                        <Circle className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Video Player - Fixed Height */}
        <div className="w-full bg-black relative flex-shrink-0" style={{ height: '450px' }}>
          {selectedLesson.isLocked ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">שיעור נעול</h3>
                <p className="text-muted-foreground">השלם שיעורים קודמים כדי לפתוח את זה.</p>
              </div>
            </div>
          ) : (
            <ReactPlayer
              ref={playerRef}
              url={selectedLesson.videoUrl}
              playing={playing}
              controls
              width="100%"
              height="100%"
              onProgress={handleProgress}
              onEnded={handleComplete}
              config={{
                youtube: {
                  playerVars: {
                    autoplay: 0,
                  },
                },
              }}
            />
          )}
        </div>

        {/* Lesson Info - Scrollable Area */}
        <div 
          className="flex-1 p-6" 
          style={{ 
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            height: 0, // This forces flex-1 to work properly
            flex: '1 1 0%'
          }}
        >
          <div className="max-w-4xl mx-auto pb-40 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-right break-words">{selectedLesson.title}</h1>
              {selectedLesson.description && (
                <p className="text-muted-foreground text-right break-words mb-4">{selectedLesson.description}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button
                  onClick={() => setPlaying(!playing)}
                  disabled={selectedLesson.isLocked}
                >
                      <Play className="w-4 h-4 ml-2" />
                  {playing ? 'השהה' : 'נגן'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleComplete}
                  disabled={selectedLesson.isLocked}
                  className="flex-shrink-0"
                >
                  סמן כהושלם
                </Button>
                {getLessonProgress(selectedLesson.id) && (
                  <div className="flex-1 min-w-[200px]">
                    <Progress value={getLessonProgress(selectedLesson.id)?.progress || 0} />
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-right">הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="כתוב הערות תוך כדי למידה..."
                  className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-foreground resize-none text-right"
                  disabled={selectedLesson.isLocked}
                />
                <Button
                  onClick={saveNotes}
                  disabled={savingNotes || selectedLesson.isLocked}
                  className="mt-4"
                >
                  {savingNotes ? 'שומר...' : 'שמור הערות'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

