import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

export function Plane({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <g transform="rotate(90 16 16)">
        <path
          d="m27 5-7 22-5-10-10-5L27 5Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path d="m15 17 12-12" stroke="currentColor" strokeWidth="1.3" />
      </g>
    </svg>
  )
}
export function TravelRoute() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const x = useTransform(scrollYProgress, [0, 1], [-80, 140])
  const y = useTransform(scrollYProgress, [0, 1], [-25, 65])
  return (
    <div ref={ref} className="travel-route" aria-hidden="true">
      <svg viewBox="0 0 1200 230" preserveAspectRatio="none">
        <path
          className="route-base"
          d="M-30 165C180 210 180 15 410 65S700 240 835 105 1080 45 1240 70"
        />
        <motion.path
          className="route-progress"
          d="M-30 165C180 210 180 15 410 65S700 240 835 105 1080 45 1240 70"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: reduced ? 0 : 2.4,
            delay: reduced ? 0 : 0.4,
            ease: 'easeInOut',
          }}
        />
      </svg>
      <motion.div
        className="route-plane"
        style={reduced ? undefined : { x, y }}
      >
        <Plane />
      </motion.div>
    </div>
  )
}
