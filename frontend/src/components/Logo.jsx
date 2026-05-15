import { Link } from 'react-router-dom'
import logo from './interview_logo.png'

export default function Logo({ size = 'md', linkTo = '/' }) {
  const sizes = {
  sm: 'h-12',   // was h-8
  md: 'h-14',   // was h-10
  lg: 'h-20',   // was h-14
  xl: 'h-28',   // was h-20
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