import { Link } from 'react-router-dom'
import logo from './interview_logo.png'

export default function Logo({ size = 'md', linkTo = '/' }) {
const sizes = {
  sm: 'h-14',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-32',
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