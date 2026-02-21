import { useRef } from 'react'
import gsap from 'gsap'

export default function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  ...props
}) {
  const buttonRef = useRef(null)
  const textRef = useRef(null)

  const handleMouseMove = (e) => {
    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(button, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out',
    })

    if (textRef.current) {
      gsap.to(textRef.current, {
        x: x * strength * 0.5,
        y: y * strength * 0.5,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
    })
    if (textRef.current) {
      gsap.to(textRef.current, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
      })
    }
  }

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      data-cursor-hover
      {...props}
    >
      <span ref={textRef} className="inline-block">
        {children}
      </span>
    </button>
  )
}
