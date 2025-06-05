interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export default function GUrlAestheticLogo({ 
  size = 'md', 
  showText = true, 
  className = '' 
}: LogoProps) {
  const sizeClasses = {
    sm: showText ? 'w-12 h-12' : 'w-8 h-8',
    md: showText ? 'w-20 h-20' : 'w-12 h-12', 
    lg: showText ? 'w-32 h-32' : 'w-20 h-20',
    xl: showText ? 'w-48 h-48' : 'w-32 h-32'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base', 
    xl: 'text-xl'
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo Circle */}
      <div className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center shadow-lg relative`}>
        {/* G and a letters */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg 
            viewBox="0 0 100 100" 
            className="w-3/4 h-3/4"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Black G */}
            <text 
              x="25" 
              y="65" 
              fontSize="45" 
              fontWeight="900" 
              fontFamily="Arial, sans-serif" 
              fill="#000000"
            >
              G
            </text>
            {/* Pink a */}
            <text 
              x="55" 
              y="65" 
              fontSize="35" 
              fontWeight="700" 
              fontFamily="Arial, sans-serif" 
              fill="#EC4899"
              style={{ transform: 'translateY(-2px)' }}
            >
              a
            </text>
          </svg>
        </div>
      </div>
      
      {/* Text below logo */}
      {showText && (
        <div className={`mt-2 text-center ${textSizes[size]}`}>
          <div className="font-bold text-gray-900 tracking-wider">
            GURL AESTHETIC
          </div>
        </div>
      )}
    </div>
  )
}