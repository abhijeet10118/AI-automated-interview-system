import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StarBackground from '../components/StarBackground'
import GlassCard from '../components/GlassCard'
import Navbar from '../components/Navbar'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, BarChart, Bar, Cell
} from 'recharts'

export default function Dashboard() {
  const [interviews, setInterviews] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const ivRes = await api.get('/interviews/')
      setInterviews(ivRes.data)
    } catch (err) { console.error(err) }
    try {
      const anRes = await api.get('/interviews/analytics/')
      setAnalytics(anRes.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const scoreColor = (s) => s >= 7 ? '#22c55e' : s >= 4 ? '#eab308' : '#ef4444'
  const overall = analytics?.score_trend?.length
    ? (analytics.score_trend.reduce((s, t) => s + t.score, 0) / analytics.score_trend.length).toFixed(1) : 0

  const radarData = analytics?.dimensions ? [
    { dim: 'Clarity', score: analytics.dimensions.clarity },
    { dim: 'Technical', score: analytics.dimensions.technical },
    { dim: 'Communication', score: analytics.dimensions.communication },
  ] : []

  const tooltipStyle = {
    contentStyle: { background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 },
    labelStyle: { color: '#fff' }, itemStyle: { color: '#a5b4fc' }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 40%, #1a0a2e 70%, #0a0a1a 100%)' }} />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <StarBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">

          {/* Tabs */}
          <div className="flex gap-1 w-fit mb-6 sm:mb-8 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {['overview', 'history'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 sm:px-5 py-2 rounded-lg text-sm font-medium capitalize transition"
                style={{
                  background: tab === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                  color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
                  boxShadow: tab === t ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
                }}>
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-32" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
          ) : tab === 'overview' ? (
            <div className="space-y-4 sm:space-y-6">

              {/* Stat cards — centered content, 2 cols mobile / 4 cols md+ */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'Total', value: interviews.length, color: '#fff' },
                  { label: 'Completed', value: interviews.filter(i => i.status === 'completed').length, color: '#22c55e' },
                  { label: 'Avg Score', value: `${overall}/10`, color: '#a5b4fc' },
                  { label: 'Topics', value: analytics?.topic_performance?.length || 0, color: '#fbbf24' },
                ].map(({ label, value, color }) => (
                  <GlassCard key={label} className="p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                    <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color }}>{value}</p>
                  </GlassCard>
                ))}
              </div>

              {/* Score trend */}
              {analytics?.score_trend?.length > 0 && (
                <GlassCard className="p-4 sm:p-6">
                  <h2 className="font-semibold text-white mb-4 sm:mb-6 text-sm sm:text-base">Score Progress</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.score_trend} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                        tickFormatter={v => {
                          const d = new Date(v)
                          return isNaN(d) ? v : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        }}
                        interval="preserveStartEnd"
                      />
                      <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} width={24} />
                      <Tooltip {...tooltipStyle} />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                        dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#0d1b3e' }}
                        activeDot={{ r: 6, fill: '#8b5cf6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </GlassCard>
              )}

              {/* Radar + Bar — stack on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {radarData.length > 0 && (
                  <GlassCard className="p-4 sm:p-6">
                    <h2 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Skill Breakdown</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="dim" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                        <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </GlassCard>
                )}

                {analytics?.topic_performance?.length > 0 && (
                  <GlassCard className="p-4 sm:p-6">
                    <h2 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Topic Performance</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.topic_performance} layout="vertical" margin={{ left: 0, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" domain={[0, 10]} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
                        <YAxis
                          dataKey="topic"
                          type="category"
                          stroke="rgba(255,255,255,0.2)"
                          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                          width={80}
                          tickFormatter={v => v.length > 10 ? v.slice(0, 10) + '…' : v}
                        />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                          {analytics.topic_performance.map((e, i) => <Cell key={i} fill={scoreColor(e.score)} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </GlassCard>
                )}
              </div>

              {analytics?.weak_topics?.length > 0 && (
                <GlassCard className="p-4 sm:p-6">
                  <h2 className="font-semibold mb-3 text-sm sm:text-base" style={{ color: '#fbbf24' }}>Focus Areas</h2>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {analytics.weak_topics.map(t => (
                      <div key={t.topic} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <span className="text-xs sm:text-sm text-white">{t.topic}</span>
                        <span className="text-xs sm:text-sm font-bold" style={{ color: '#f87171' }}>{t.score}/10</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {interviews.length === 0 && (
                <GlassCard className="p-10 sm:p-16 text-center">
                  <p className="mb-6 text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>No interviews yet. Start your first one.</p>
                  <Link to="/generate" className="px-6 py-3 rounded-xl font-medium text-white transition hover:opacity-80 text-sm sm:text-base"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    Start Interview
                  </Link>
                </GlassCard>
              )}
            </div>
          ) : (
            /* History tab */
            <div className="space-y-3">
              {interviews.length === 0 ? (
                <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.3)' }}>No interviews yet.</div>
              ) : interviews.map(interview => {
                const scores = interview.responses.filter(r => r.clarity_score)
                const avg = scores.length
                  ? (scores.reduce((s, r) => s + (r.clarity_score + r.technical_score + r.communication_score) / 3, 0) / scores.length).toFixed(1)
                  : null

                return (
                  <GlassCard key={interview.id} className="p-4 sm:p-5 hover:border-indigo-500/20 transition cursor-default">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm sm:text-base truncate">{interview.question_set.role}</p>
                        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {interview.question_set.topic} · {interview.question_set.difficulty}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          {new Date(interview.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {avg && (
                          <div className="text-right">
                            <p className="text-xl sm:text-2xl font-bold" style={{ color: scoreColor(avg) }}>{avg}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>score</p>
                          </div>
                        )}
                        <span className="text-xs px-2.5 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap"
                          style={{
                            background: interview.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                            color: interview.status === 'completed' ? '#4ade80' : '#facc15',
                            border: `1px solid ${interview.status === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}`,
                          }}>
                          {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                        {interview.status === 'completed' && (
                          <Link to={`/results/${interview.id}`}
                            className="text-sm font-medium transition flex-shrink-0" style={{ color: '#a5b4fc' }}
                            onMouseEnter={e => e.target.style.color = '#818cf8'}
                            onMouseLeave={e => e.target.style.color = '#a5b4fc'}>
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}