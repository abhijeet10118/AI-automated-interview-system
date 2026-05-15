import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import logo from '../components/interview_logo.png'
const FLOATING_WORDS = [
  'smart', 'confident', 'prepared', 'focused',
  'technical', 'articulate', 'impressive', 'hired'
]

const FEATURES = [
  {
    n: '01',
    title: 'AI-Generated Questions',
    desc: 'Role-specific questions powered by Groq LLaMA — spanning DSA, system design, behavioral, and domain-specific topics tailored to your exact job target.',
    tag: 'Groq LLaMA',
    accent: '#6366f1',
  },
  {
    n: '02',
    title: 'Voice Mode',
    desc: 'Speak your answers naturally using browser-native speech recognition. Simulate real interview pressure without typing a single word.',
    tag: 'Speech API',
    accent: '#818cf8',
  },
  {
    n: '03',
    title: 'Instant Feedback',
    desc: 'Real-time scoring across clarity, technical depth, and communication — with specific, actionable improvement tips after every answer.',
    tag: 'Scoring Engine',
    accent: '#a5b4fc',
  },
  {
    n: '04',
    title: 'Resume Analysis',
    desc: 'Upload your PDF and the AI extracts your skills, experience, and tech stack to generate deeply personalized interview questions.',
    tag: 'PDF Parser',
    accent: '#c7d2fe',
  },
  {
    n: '05',
    title: 'Progress Tracking',
    desc: 'A dashboard with score trends over time, a skill radar chart, and alerts pinpointing the weak topics you need to revisit most.',
    tag: 'Analytics',
    accent: '#818cf8',
  },
  {
    n: '06',
    title: 'Secure by Default',
    desc: 'JWT-based authentication with email verification baked in. Your session data, answers, and resume remain completely private.',
    tag: 'JWT Auth',
    accent: '#6366f1',
  },
]

function FeatureRow({ feature, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const isEven = index % 2 === 0

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="feature-row"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(48px)',
        transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
        borderBottom: '1px solid #0d1117',
        background: isEven ? '#07090f' : '#05070e',
        width: '100%',
      }}
    >
      <div
        className="feature-inner"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '80px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: '64px',
          flexDirection: isEven ? 'row' : 'row-reverse',
        }}
      >
        {/* Number + tag */}
        <div className="feature-number-col" style={{ flexShrink: 0, width: '160px', textAlign: isEven ? 'left' : 'right' }}>
          <div
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '96px',
              lineHeight: 1,
              color: '#0d1424',
              letterSpacing: '-6px',
              userSelect: 'none',
              marginBottom: '16px',
            }}
          >
            {feature.n}
          </div>
          <span
            style={{
              display: 'inline-block',
              fontFamily: "'Syne', sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: feature.accent,
              border: `1px solid ${feature.accent}35`,
              borderRadius: '4px',
              padding: '4px 10px',
              background: `${feature.accent}08`,
            }}
          >
            {feature.tag}
          </span>
        </div>

        {/* Accent line — hidden on mobile via CSS */}
        <div
          className="feature-divider"
          style={{
            width: '1px',
            height: '120px',
            background: `linear-gradient(180deg, transparent, ${feature.accent}50, transparent)`,
            flexShrink: 0,
          }}
        />

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              color: '#f1f5f9',
              marginBottom: '14px',
              lineHeight: 1.12,
              fontWeight: 400,
            }}
          >
            {feature.title}
          </h3>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 300,
              color: '#6b7280',
              lineHeight: 1.85,
            }}
          >
            {feature.desc}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' })
  const [feedbackSent, setFeedbackSent] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 3 + 1
      if (progress >= 100) {
        progress = 100
        setLoadingProgress(100)
        clearInterval(interval)
        setTimeout(() => setLoaded(true), 400)
      } else {
        setLoadingProgress(Math.floor(progress))
      }
    }, 30)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % FLOATING_WORDS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!loaded) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }))

    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [loaded])

  const handleFeedback = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users/feedback/', feedback)
      setFeedbackSent(true)
      setTimeout(() => {
        setFeedbackOpen(false)
        setFeedbackSent(false)
        setFeedback({ name: '', email: '', message: '' })
      }, 3000)
    } catch {
      alert('Failed to send. Try again.')
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        </div>
       <img src={logo} alt="Interview AI" className="h-24 w-auto object-contain mb-2" />
        <div className="relative z-10 w-64 text-center">
          <div className="text-6xl font-mono font-bold text-white mb-4 tabular-nums">
            {String(loadingProgress).padStart(3, '0')}
            <span className="text-indigo-400 text-3xl">%</span>
          </div>
          <div className="h-px bg-gray-800 w-full relative overflow-hidden">
            <div
              className="h-px bg-indigo-500 transition-all duration-100 absolute top-0 left-0"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-gray-600 text-xs mt-3 tracking-widest uppercase">Initializing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-gray-800/50 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Interview AI" className="h-8 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          {/* Hide "Suggest a feature" text on mobile, keep as icon-less button */}
          <button
            onClick={() => setFeedbackOpen(true)}
            className="hidden sm:block text-gray-400 hover:text-white text-sm transition px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            Suggest a feature
          </button>
          <Link to="/login" className="text-gray-400 hover:text-white text-sm transition px-2 py-1.5">
            Sign in
          </Link>
          <Link
            to="/register"
            className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-16 pb-20 sm:pt-24 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5 sm:px-4 mb-6 sm:mb-8">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse flex-shrink-0" />
          <span className="text-indigo-400 text-xs sm:text-sm font-medium">AI-Powered Interview Coach</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-5 sm:mb-6">
          Become{' '}
          <span className="relative inline-block">
            <span
              key={wordIndex}
              className="text-indigo-400"
              style={{ animation: 'fadeSlide 0.4s ease' }}
            >
              {FLOATING_WORDS[wordIndex]}
            </span>
          </span>
          <br />
          at interviews
        </h1>

        <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
          Practice with AI-generated questions tailored to your role and resume.
          Get instant feedback on clarity, technical depth, and communication.
        </p>

        {/* CTA buttons — stack on very small screens */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl text-base sm:text-lg font-semibold transition shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-105 transform text-center"
          >
            Start for free →
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto border border-gray-700 hover:border-gray-500 px-8 py-4 rounded-xl text-base sm:text-lg font-medium text-gray-300 hover:text-white transition text-center"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Features header */}
      <div className="relative z-10 text-center pb-12 sm:pb-16 px-5">
        <p
          style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-xs font-semibold tracking-[0.18em] uppercase text-indigo-500 mb-4"
        >
          Everything you need
        </p>
        <h2
          style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
          className="text-3xl sm:text-4xl md:text-5xl text-white"
        >
          Six tools. One goal:{' '}
          <em className="italic text-indigo-300">getting hired.</em>
        </h2>
      </div>

      {/* Feature rows */}
      <div className="relative z-10 w-full" style={{ borderTop: '1px solid #0d1117' }}>
        {FEATURES.map((feature, i) => (
          <FeatureRow key={feature.n} feature={feature} index={i} />
        ))}
      </div>

      {/* CTA section */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 py-16 sm:py-24 text-center">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to ace your next interview?</h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            Join hundreds of developers leveling up their interview skills with PrepAI
          </p>
          <Link
            to="/register"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition hover:scale-105 transform shadow-xl shadow-indigo-500/20"
          >
            Get started free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 px-5 py-6 flex flex-col sm:flex-row items-center gap-2 sm:justify-between text-sm text-gray-600 text-center sm:text-left">
        <span>© 2026 PrepAI. Built by Abhijeet for job seekers.</span>
        <button onClick={() => setFeedbackOpen(true)} className="hover:text-gray-400 transition">
          Suggest a feature
        </button>
      </footer>

      {/* Feedback modal */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setFeedbackOpen(false)}
          />
          <div className="relative bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 w-full sm:max-w-md">
            {/* Drag handle on mobile */}
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5 sm:hidden" />
            <button
              onClick={() => setFeedbackOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-white transition text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-1">Suggest a feature</h2>
            <p className="text-gray-500 text-sm mb-5">Have an idea? I'd love to hear it.</p>
            {feedbackSent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-green-400 font-medium">Thanks for your feedback!</p>
                <p className="text-gray-500 text-sm mt-1">I'll review it soon.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedback} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Your Name</label>
                  <input
                    type="text"
                    required
                    value={feedback.name}
                    onChange={e => setFeedback({ ...feedback, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-indigo-500 focus:outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Your Email</label>
                  <input
                    type="email"
                    required
                    value={feedback.email}
                    onChange={e => setFeedback({ ...feedback, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-indigo-500 focus:outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Your Idea</label>
                  <textarea
                    required
                    value={feedback.message}
                    onChange={e => setFeedback({ ...feedback, message: e.target.value })}
                    placeholder="I'd love to see..."
                    rows={4}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-indigo-500 focus:outline-none transition text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition"
                >
                  Send Feedback →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Feature rows: mobile overrides ── */
        @media (max-width: 640px) {
          .feature-inner {
            flex-direction: column !important;
            gap: 20px !important;
            padding: 40px 20px !important;
          }
          .feature-number-col {
            width: auto !important;
            display: flex;
            align-items: center;
            gap: 16px;
            text-align: left !important;
          }
          /* Shrink the giant number on mobile */
          .feature-number-col > div:first-child {
            font-size: 56px !important;
            letter-spacing: -3px !important;
            margin-bottom: 0 !important;
          }
          .feature-divider {
            display: none;
          }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          .feature-inner {
            flex-direction: column !important;
            gap: 28px !important;
            padding: 56px 32px !important;
          }
          .feature-number-col {
            width: auto !important;
            display: flex;
            align-items: center;
            gap: 20px;
            text-align: left !important;
          }
          .feature-number-col > div:first-child {
            font-size: 72px !important;
            margin-bottom: 0 !important;
          }
          .feature-divider {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}