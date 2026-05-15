import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
export default function Navbar({ showNew = true }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="relative z-10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
     <Logo size="sm" linkTo="/" />

      <div className="flex items-center gap-2 sm:gap-3">
        {showNew && (
          <Link to="/generate"
            className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-white transition hover:opacity-80 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
            {/* Full label on sm+, icon-only on mobile */}
            <span className="hidden sm:inline">+ New Interview</span>
            <span className="sm:hidden">+ New</span>
          </Link>
        )}
        <button onClick={() => { logout(); navigate('/login') }}
          className="text-sm px-3 py-2 rounded-xl transition whitespace-nowrap"
          style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}