import { Link } from 'react-router-dom'
import logo from './interview_logo.png'

export default function Logo({ size = 'md', linkTo = '/' }) {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  }

  return (
    <Link to={linkTo} className="inline-flex items-center group">
      <img
        src={logo}
        alt="Interview AI"
        className={`${sizes[size]} w-auto object-contain group-hover:scale-105 transition`}
      />
    </Link>
  )
}