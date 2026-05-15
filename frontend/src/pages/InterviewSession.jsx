import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import StarBackground from '../components/StarBackground'
import GlassCard from '../components/GlassCard'
import logo from '../components/interview_logo.png'
export default function InterviewSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [answered, setAnswered] = useState({})
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => { fetchInterview() }, [])

  useEffect(() => {
    if (!loading && questions.length > 0) {
      setTimeLeft(120)
      speakQuestion(questions[currentIndex]?.text)
    }
  }, [currentIndex, loading])

  useEffect(() => {
    if (loading) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [currentIndex, loading])

  const fetchInterview = async () => {
    try {
      const res = await api.get(`/interviews/${id}/`)
      setInterview(res.data)
      setQuestions(res.data.question_set.questions.sort((a, b) => a.order - b.order))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.9; u.pitch = 1
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Use Chrome or Edge for voice input.')
    window.speechSynthesis.cancel()
    setSpeaking(false)
    const r = new SR()
    r.continuous = true; r.interimResults = true; r.lang = 'en-US'
    r.onresult = e => setAnswer(Array.from(e.results).map(r => r[0].transcript).join(''))
    r.onend = () => setListening(false)
    r.start()
    recognitionRef.current = r
    setListening(true)
  }

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false) }

  const submitAnswer = async () => {
    if (!answer.trim()) return
    setSubmitting(true)
    clearInterval(timerRef.current)
    window.speechSynthesis.cancel()
    stopListening()
    try {
      await api.post(`/interviews/${id}/submit/`, {
        question_id: questions[currentIndex].id,
        answer_text: answer,
      })
      setAnswered(prev => ({ ...prev, [currentIndex]: true }))
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(p => p + 1); setAnswer('')
      } else {
        await api.post(`/interviews/${id}/complete/`)
        navigate(`/results/${id}`)
      }
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const skipQuestion = async () => {
    clearInterval(timerRef.current)
    window.speechSynthesis.cancel()
    stopListening()
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(p => p + 1); setAnswer('')
    } else {
      await api.post(`/interviews/${id}/complete/`)
      navigate(`/results/${id}`)
    }
  }

  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const progress = questions.length ? (currentIndex / questions.length) * 100 : 0
  const timerRed = timeLeft <= 30

 if (loading) return (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a1a, #0d1b3e, #1a0a2e)' }}>
    <div className="flex flex-col items-center justify-center gap-4">
       <div className="flex flex-col items-center justify-center gap-4">
  <img src={logo} alt="Interview AI" className="h-32 w-auto object-contain animate-pulse" />
  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading your interview...</p>
</div>
      </div>
    </div>
  )

  const q = questions[currentIndex]
  const isLastQuestion = currentIndex + 1 === questions.length

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 40%, #1a0a2e 70%, #0a0a1a 100%)' }} />
      <StarBackground />

      {/* Top bar — tightened for mobile */}
      <div
        className="relative z-10 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          minHeight: 52,
        }}
      >
        {/* Left: logo + role (role truncates gracefully) */}
        <div className="flex items-center gap-2 min-w-0">
          <img src={logo} alt="Interview AI" className="h-7 w-auto object-contain" />
          {interview?.question_set?.role && (
            <>
              <span className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span
                className="text-xs truncate"
                style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '30vw' }}
              >
                {interview.question_set.role}
              </span>
            </>
          )}
        </div>

        {/* Right: question count + timer */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {currentIndex + 1}/{questions.length}
          </span>
          <div
            className="px-2.5 py-1 rounded-xl font-mono font-bold text-xs"
            style={{
              background: timerRed ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
              border: `1px solid ${timerRed ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`,
              color: timerRed ? '#f87171' : '#a5b4fc',
            }}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-0.5 transition-all duration-500"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
        />
      </div>

      {/* Main content — reduced vertical padding on mobile */}
      <div className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-4 py-4 sm:px-6 sm:py-8 flex flex-col gap-3 sm:gap-5">

        {/* Question dots — scrollable row so they never wrap */}
        <div className="flex justify-center">
          <div className="flex gap-1.5 overflow-x-auto max-w-full px-1" style={{ scrollbarWidth: 'none' }}>
            {questions.map((_, i) => (
              <div
                key={i}
                className="rounded-full flex-shrink-0 transition-all duration-300"
                style={{
                  width: i === currentIndex ? 20 : 8,
                  height: 8,
                  background: i === currentIndex
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : answered[i] ? '#22c55e' : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Question card — reduced padding on mobile */}
        <GlassCard className="p-5 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: '#a5b4fc' }}
              >
                Question {currentIndex + 1}
              </span>
              {/* text-lg on mobile, text-xl on sm+ */}
              <p className="text-lg sm:text-xl font-medium text-white mt-2 sm:mt-3 leading-relaxed">
                {q?.text}
              </p>
            </div>
            {/* Speaker button — slightly smaller touch target on mobile */}
            <button
              onClick={() => speakQuestion(q?.text)}
              className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition hover:scale-105 active:scale-95"
              style={{
                background: speaking ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: speaking ? '0 0 20px rgba(99,102,241,0.4)' : 'none',
              }}
              aria-label="Read question aloud"
            >
              🔊
            </button>
          </div>
        </GlassCard>

        {/* Answer area */}
        <GlassCard className="p-4 sm:p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Your Answer
            </span>
            <button
              onClick={listening ? stopListening : startListening}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition active:scale-95"
              style={{
                background: listening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                border: listening ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: listening ? '#f87171' : 'rgba(255,255,255,0.6)',
                animation: listening ? 'pulse 2s infinite' : 'none',
              }}
            >
              {listening ? '⏹ Stop' : '🎤 Speak'}
            </button>
          </div>

          {/* Fewer rows on mobile to avoid pushing buttons off-screen */}
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer or tap 'Speak'..."
            rows={5}
            className="w-full rounded-xl px-3 py-3 text-white text-sm leading-relaxed resize-none outline-none transition placeholder:text-gray-600"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.4)'}
            onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.07)'}
          />

          {listening && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#f87171' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
              Listening… speak clearly
            </div>
          )}

          {answer && (
            <div
              className="flex items-center justify-between text-xs"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <span>{answer.split(' ').filter(Boolean).length} words</span>
              <button
                onClick={() => setAnswer('')}
                style={{ color: 'rgba(255,255,255,0.2)' }}
                onMouseEnter={e => e.target.style.color = '#f87171'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
              >
                Clear ✕
              </button>
            </div>
          )}
        </GlassCard>

        {/* Action buttons — full width stack on very small screens, row on sm+ */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={skipQuestion}
            className="py-3 rounded-xl font-medium text-sm transition hover:opacity-80 active:scale-95 whitespace-nowrap px-4 sm:flex-1"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Skip →
          </button>
          <button
            onClick={submitAnswer}
            disabled={submitting || !answer.trim()}
            className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: answer.trim() ? '0 8px 24px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="hidden xs:inline">Getting AI feedback…</span>
                <span className="xs:hidden">Processing…</span>
              </span>
            ) : isLastQuestion ? 'Finish 🎉' : 'Submit & Next →'}
          </button>
        </div>

      </div>
    </div>
  )
}