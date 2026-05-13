import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function StarBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.twinkle += 0.02
        s.y -= s.speed
        if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width }
        const alpha = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

const glassInput = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}
const glassInputFocus = '1px solid rgba(99,102,241,0.6)'

export default function Register() {
  const [step, setStep] = useState('register')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/users/register/', form)
      setStep('verify')
    } catch (err) {
      setError(
        err.response?.data?.password?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        'Registration failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/users/verify-otp/', { email: form.email, otp })
      setMessage('Email verified! Redirecting...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    try {
      await api.post('/users/resend-otp/', { email: form.email })
      setMessage('New OTP sent!')
      setTimeout(() => setMessage(''), 3000)
    } catch { setError('Failed to resend OTP') }
  }

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{ padding: 'max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom))' }}
    >
      {/* Background */}
      <div className="fixed inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 40%, #1a0a2e 70%, #0a0a1a 100%)' }}
      />
      <div className="fixed top-1/4 left-1/3 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div className="fixed bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <StarBackground />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-5 sm:mb-8">
          <Link to="/home" className="inline-flex flex-col items-center group">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <span className="text-2xl sm:text-3xl">🎯</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">PrepAI</span>
          </Link>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
          />

          {step === 'register' ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Create account</h2>
              <p className="text-sm mb-5 sm:mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Start your interview prep journey today
              </p>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 mb-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {[
                  { label: 'Username', key: 'username', type: 'text', placeholder: 'johndoe', autoComplete: 'username' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email', inputMode: 'email' },
                ].map(({ label, key, type, placeholder, autoComplete, inputMode }) => (
                  <div key={key}>
                    <label className="text-sm mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      required
                      autoComplete={autoComplete}
                      inputMode={inputMode}
                      className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition placeholder:text-gray-600"
                      style={glassInput}
                      onFocus={e => e.target.style.border = glassInputFocus}
                      onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                    />
                  </div>
                ))}

                <div>
                  {/* Label row — wrap gracefully on narrow screens */}
                  <label className="text-sm mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Password
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>(min 8 characters)</span>
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition placeholder:text-gray-600"
                    style={glassInput}
                    onFocus={e => e.target.style.border = glassInputFocus}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                  />
                  {form.password && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            background: form.password.length >= i * 2 + 2
                              ? i <= 1 ? '#ef4444' : i <= 2 ? '#eab308' : i <= 3 ? '#22c55e' : '#6366f1'
                              : 'rgba(255,255,255,0.1)',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50 mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                  }}
                >
                  {loading ? 'Sending OTP...' : 'Create account →'}
                </button>
              </form>

              <p className="text-center text-sm mt-5 sm:mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-5 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📬</div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Check your inbox</h2>
                {/* Email wraps safely — break-all only if truly needed */}
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  We sent a 6-digit code to{' '}
                  <span
                    className="text-white font-medium inline-block max-w-full"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {form.email}
                  </span>
                </p>
              </div>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 mb-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                >
                  {error}
                </div>
              )}
              {message && (
                <div
                  className="rounded-xl px-4 py-3 mb-4 text-sm"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="text-sm mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    6-digit OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    /* Reduced tracking on mobile so digits don't overflow on 320px screens */
                    className="w-full rounded-xl px-4 py-4 text-white text-2xl outline-none transition text-center font-mono tracking-[0.3em] sm:tracking-[0.5em]"
                    style={glassInput}
                    onFocus={e => e.target.style.border = glassInputFocus}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                  />
                  {/* Progress dots */}
                  <div className="flex justify-center gap-2 mt-3">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full transition-all duration-200"
                        style={{
                          background: i < otp.length
                            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                            : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify Email →'}
                </button>
              </form>

              <button
                onClick={handleResend}
                className="w-full text-center text-sm mt-4 py-1 transition"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}
              >
                Didn't receive it? Resend OTP
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}