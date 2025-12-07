import React, { useState, useEffect } from 'react'

interface HalfMoonProgressBarProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  title?: string
  subtitle?: string
  paused?: boolean
}

const HalfMoonProgressBar: React.FC<HalfMoonProgressBarProps> = ({
  progress,
  title,
  subtitle,
  size = 200,
  strokeWidth = 20,
  color = 'custom-orange',
  paused = false
}) => {
  const [visible, setVisible] = useState(true)
  const radius = (size - strokeWidth) / 2
  const diameter = size - strokeWidth
  const circumference = radius * Math.PI
  const [strokeDashoffset, setStrokeDashoffset] = useState(
    circumference - ((progress === 0 ? 0.1 : progress) / 100) * circumference
  )

  // Calculate the position of the ball
  const angle = Math.PI - (progress / 100) * Math.PI;
  const ballX = size / 2 + radius * Math.cos(angle);
  const ballY = size / 2 - radius * Math.sin(angle);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (paused) {
      interval = setInterval(() => {
        setVisible((prev) => !prev)
      }, 1000) // Toggle visibility every second
    } else {
      setVisible(true)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [paused])

  useEffect(() => {
    setStrokeDashoffset(circumference - ((progress === 0 ? 0.1 : progress) / 100) * circumference)
  }, [progress, circumference])

  return (
    <div className='relative w-full max-w-sm mx-auto'>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          className="text-custom-gray-default dark:text-custom-blackSemi"
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          stroke="currentColor"
          fill="transparent"
          d={`M ${strokeWidth / 2},${size / 2} a ${radius},${radius} 0 0,1 ${diameter},0`}
        />
        <path
          className={`text-${color}`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          d={`M ${strokeWidth / 2},${size / 2} a ${radius},${radius} 0 0,1 ${diameter},0`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset || 0}
        />
        <circle
          cx={ballX || 0}
          cy={ballY || 0}
          r={strokeWidth / 5}
          className="fill-custom-gray-default dark:fill-custom-blackSemi"
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center' style={{ top: '15%' }}>
        {title && (
          <p
            className={`
                text-4xl font-bold leading-tight mt-4 transition-opacity duration-500
                ${'text-' + color}
                ${paused ? (visible ? 'opacity-100' : 'opacity-50') : 'opacity-100'}
              `}
          >
            {title}
          </p>
        )}
        {subtitle && (
          <p className='text-xl font-medium leading-tight mt-2 text-custom-gray-dark dark:text-custom-gray-light'>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export default HalfMoonProgressBar

