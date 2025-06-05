// Simple favicon version of the Gurl Aesthetic logo
export default function FaviconLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      {/* White circle background */}
      <circle cx="16" cy="16" r="16" fill="white"/>
      {/* Black G */}
      <text x="6" y="22" fontSize="14" fontWeight="900" fontFamily="Arial, sans-serif" fill="#000000">G</text>
      {/* Pink a */}
      <text x="17" y="22" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" fill="#EC4899">a</text>
    </svg>
  )
}