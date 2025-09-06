// Gurl Aesthetic brand colors
export const BRAND_COLORS = {
  primary: '#EC4899',      // Pink
  secondary: '#9333EA',    // Purple
  accent: '#FBBF24',       // Gold
  text: '#374151',         // Dark gray
  light: '#FDF2F8',        // Light pink
  white: '#FFFFFF',
  success: '#10B981',      // Green
}

// Company information
export const COMPANY_INFO = {
  name: 'Gurl Aesthetic',
  tagline: '✨ Nail Accessories & Girly Beauty Products ✨',
  address: 'Trinidad & Tobago',
  email: 'info@gurlaesthetic.com',
  phone: '+1 (868) 123-4567',
  website: 'www.gurlaesthetic.com'
}

// Simple SVG logo data URI for PDF embedding
export const LOGO_DATA_URI = `data:image/svg+xml;base64,${btoa(`
<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EC4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9333EA;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="30" cy="30" r="28" fill="url(#grad1)" stroke="#FBBF24" stroke-width="3"/>
  <text x="30" y="38" font-family="Arial Black" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">Ga</text>
  <circle cx="15" cy="15" r="2" fill="#FBBF24" opacity="0.8"/>
  <circle cx="45" cy="15" r="1.5" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="15" cy="45" r="1.5" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="45" cy="45" r="2" fill="#FBBF24" opacity="0.8"/>
</svg>
`)}`