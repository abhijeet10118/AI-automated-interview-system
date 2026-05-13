import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GenerateQuestions from './pages/GenerateQuestions'
import InterviewSession from './pages/InterviewSession'
import Results from './pages/Results'
import Home from './pages/Home'
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>
  return user ? children : <Navigate to="/home" />
}
export default function App() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/generate" element={<PrivateRoute><GenerateQuestions /></PrivateRoute>} />
      <Route path="/interview/:id" element={<PrivateRoute><InterviewSession /></PrivateRoute>} />
      <Route path="/results/:id" element={<PrivateRoute><Results /></PrivateRoute>} />
    </Routes>
  )
}