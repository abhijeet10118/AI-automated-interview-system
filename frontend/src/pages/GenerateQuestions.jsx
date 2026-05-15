import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import StarBackground from '../components/StarBackground'
import GlassCard from '../components/GlassCard'
import logo from '../components/interview_logo.png'
const ROLES = [
  { label: 'Frontend Dev' },
  { label: 'Backend Dev' },
  { label: 'Full Stack' },
  { label: 'Data Scientist' },
  { label: 'ML Engineer' },
  { label: 'DevOps Engineer' },
  { label: 'System Design' },
  { label: 'Mobile Dev' },
  { label: 'Cloud Engineer' },
  { label: 'Security Engineer' },
]

const DIFFICULTIES = [
  { label: 'Easy', desc: 'Fundamentals & basics', color: '#22c55e' },
  { label: 'Medium', desc: 'Intermediate concepts', color: '#eab308' },
  { label: 'Hard', desc: 'Advanced & complex', color: '#ef4444' },
]

const TOPICS = [
  { label: 'DSA' },
  { label: 'System Design' },
  { label: 'Django REST' },
  { label: 'React' },
  { label: 'Python' },
  { label: 'Databases' },
  { label: 'Machine Learning' },
  { label: 'Docker & K8s' },
  { label: 'TypeScript' },
  { label: 'Node.js' },
  { label: 'AWS / Cloud' },
  { label: 'GraphQL' },
  { label: 'CI/CD' },
  { label: 'Microservices' },
  { label: 'OS Concepts' },
  { label: 'Networking' },
]

export default function GenerateQuestions() {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [topic, setTopic] = useState('')
  const [resume, setResume] = useState(null)
  const [mode, setMode] = useState('topic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = role && difficulty && (mode === 'topic' ? topic : resume)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('role', role)
      formData.append('difficulty', difficulty.toLowerCase())
      if (mode === 'resume' && resume) {
        formData.append('resume', resume)
      } else {
        formData.append('topic', topic)
      }

      const res = await api.post('/questions/generate/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const interviewRes = await api.post('/interviews/start/', { question_set_id: res.data.id })
      navigate(`/interview/${interviewRes.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 40%, #1a0a2e 70%, #0a0a1a 100%)' }} />
      <div className="fixed top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <StarBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Interview AI" className="h-12 w-auto object-contain"/>
          </Link>
          <Link to="/" className="text-sm transition px-3 py-2 rounded-xl whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            ← Dashboard
          </Link>
        </nav>

        <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">New Interview</h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Configure your mock interview session</p>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-6 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

            {/* Role */}
            <GlassCard className="p-4 sm:p-6">
              <p className="text-sm font-medium mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Target Role <span style={{ color: 'rgba(255,255,255,0.2)' }}>— pick one</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLES.map(({ label }) => (
                  <button key={label} type="button" onClick={() => setRole(label)}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium transition text-center"
                    style={{
                      background: role === label ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                      border: role === label ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.06)',
                      color: role === label ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                      boxShadow: role === label ? '0 0 12px rgba(99,102,241,0.15)' : 'none',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Difficulty */}
            <GlassCard className="p-4 sm:p-6">
              <p className="text-sm font-medium mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Difficulty Level</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {DIFFICULTIES.map(({ label, desc, color }) => (
                  <button key={label} type="button" onClick={() => setDifficulty(label)}
                    className="flex flex-col items-center py-3 sm:py-4 px-2 sm:px-3 rounded-xl transition"
                    style={{
                      background: difficulty === label ? `${color}18` : 'rgba(255,255,255,0.03)',
                      border: difficulty === label ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: difficulty === label ? `0 0 20px ${color}20` : 'none',
                    }}>
                    <span className="text-sm font-semibold text-white mb-0.5">{label}</span>
                    <span className="text-xs text-center leading-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>{desc}</span>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Topic Source Toggle */}
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Question Source</p>
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {['topic', 'resume'].map(m => (
                    <button key={m} type="button" onClick={() => setMode(m)}
                      className="px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition"
                      style={{
                        background: mode === m ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                        color: mode === m ? '#fff' : 'rgba(255,255,255,0.4)',
                      }}>
                      {m === 'topic' ? 'Topics' : 'Resume'}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'topic' ? (
                <>
                  <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Select a topic to focus your interview on</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TOPICS.map(({ label }) => (
                      <button key={label} type="button" onClick={() => setTopic(label)}
                        className="px-3 py-2.5 rounded-xl text-xs font-medium transition text-center"
                        style={{
                          background: topic === label ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                          border: topic === label ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.06)',
                          color: topic === label ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Upload your resume — AI will auto-detect your skills and generate personalized questions
                  </p>
                  <label className="flex flex-col items-center justify-center py-8 sm:py-10 rounded-xl cursor-pointer transition"
                    style={{
                      border: resume ? '2px dashed rgba(99,102,241,0.5)' : '2px dashed rgba(255,255,255,0.1)',
                      background: resume ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
                    }}>
                    <input type="file" accept=".pdf" className="hidden" onChange={e => setResume(e.target.files[0])} />
                    {resume ? (
                      <>
                        <span className="text-sm font-medium" style={{ color: '#a5b4fc' }}>{resume.name}</span>
                        <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Tap to change file</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Tap to upload PDF resume</span>
                        <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>PDF only · Max 5MB</span>
                      </>
                    )}
                  </label>

                  {resume && (
                    <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <span className="text-xs" style={{ color: '#a5b4fc' }}>AI will extract topics automatically from your resume</span>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Summary bar */}
            {(role || difficulty || topic || resume) && (
              <div className="flex flex-wrap gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {role && <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>{role}</span>}
                {difficulty && <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>{difficulty}</span>}
                {topic && mode === 'topic' && <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>{topic}</span>}
                {resume && mode === 'resume' && <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>Resume uploaded</span>}
              </div>
            )}

            <button type="submit" disabled={loading || !canSubmit}
              className="w-full py-4 rounded-2xl font-semibold text-white text-base transition hover:opacity-90 hover:scale-[1.01] transform disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: canSubmit ? '0 8px 30px rgba(99,102,241,0.4)' : 'none',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating questions...
                </span>
              ) : 'Generate & Start Interview'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}