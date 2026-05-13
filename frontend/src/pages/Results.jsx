import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import StarBackground from '../components/StarBackground'
import GlassCard from '../components/GlassCard'

export default function Results() {
  const { id } = useParams()
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const res = await api.get(`/interviews/${id}/`)
      setInterview(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const avgScore = (responses) => {
    const scored = responses.filter(r => r.clarity_score)
    if (!scored.length) return 0
    return (scored.reduce((s, r) => s + (r.clarity_score + r.technical_score + r.communication_score) / 3, 0) / scored.length).toFixed(1)
  }

  const scoreColor = (score) => {
    if (score >= 7) return '#22c55e'
    if (score >= 4) return '#eab308'
    return '#ef4444'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a1a, #0d1b3e, #1a0a2e)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">📊</div>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading results...</p>
      </div>
    </div>
  )

  const overall = avgScore(interview.responses)
  const scored = interview.responses.filter(r => r.clarity_score)

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ color: 'white' }}>
      <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 40%, #1a0a2e 70%, #0a0a1a 100%)' }} />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <StarBackground />

      {/* Navbar */}
      <nav className="relative z-10 px-4 sm:px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-sm">🎯</span>
          </div>
          <span className="font-bold text-white">PrepAI</span>
        </div>
        <Link to="/" className="text-sm px-3 py-2 rounded-xl transition"
          style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          ← Dashboard
        </Link>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">
            {overall >= 7 ? '🏆' : overall >= 4 ? '📈' : '💪'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {interview.question_set.role} · {interview.question_set.topic} · {interview.question_set.difficulty}
          </p>
        </div>

        {/* Overall score */}
        <GlassCard className="p-6 sm:p-8 mb-6 text-center">
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Overall Score</p>
          <p className="text-7xl font-bold mb-1" style={{ color: scoreColor(overall) }}>{overall}</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>out of 10</p>

          {scored.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
              {['clarity', 'technical', 'communication'].map(dim => {
                const avg = (scored.reduce((s, r) => s + r[`${dim}_score`], 0) / scored.length).toFixed(1)
                return (
                  <div key={dim}>
                    <p className="text-xs capitalize mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{dim}</p>
                    <p className="text-xl sm:text-2xl font-bold" style={{ color: scoreColor(avg) }}>{avg}</p>
                    <div className="h-1.5 rounded-full mt-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${(avg / 10) * 100}%`, background: scoreColor(avg) }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </GlassCard>

        {/* Per question breakdown */}
        <h2 className="text-base sm:text-lg font-semibold mb-4">Question Breakdown</h2>
        <div className="space-y-4 mb-8">
          {interview.responses.map((response) => (
            <GlassCard key={response.id} className="p-4 sm:p-6">

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium" style={{ color: '#a5b4fc' }}>Q{response.question_order}</span>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{response.question_text}</p>
                </div>
                {response.clarity_score && (
                  <span className="text-xl sm:text-2xl font-bold flex-shrink-0"
                    style={{ color: scoreColor((response.clarity_score + response.technical_score + response.communication_score) / 3) }}>
                    {((response.clarity_score + response.technical_score + response.communication_score) / 3).toFixed(1)}
                  </span>
                )}
              </div>

              {/* Your answer */}
              <div className="rounded-xl p-3 sm:p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Your Answer</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{response.answer_text || 'No answer provided'}</p>
              </div>

              {/* Scores */}
              {response.clarity_score && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  {[
                    { label: 'Clarity', score: response.clarity_score },
                    { label: 'Technical', score: response.technical_score },
                    { label: 'Communication', score: response.communication_score },
                  ].map(({ label, score }) => (
                    <div key={label} className="rounded-xl p-2 sm:p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                      <p className="text-base sm:text-lg font-bold" style={{ color: scoreColor(score) }}>{score}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Feedback */}
              {response.feedback && (
                <div className="pl-3 sm:pl-4" style={{ borderLeft: '2px solid rgba(99,102,241,0.5)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#a5b4fc' }}>AI Feedback</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{response.feedback}</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/generate"
            className="flex-1 py-3 rounded-xl font-semibold text-white text-center transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
            Try Another Interview
          </Link>
          <Link to="/"
            className="flex-1 py-3 rounded-xl text-center font-medium transition"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}