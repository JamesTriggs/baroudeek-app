// Baroudique Brand Identity - Sophisticated Emerald Green
// Distinctive from competitors like Komoot (bright lime) and Strava (orange)

export const brandColors = {
  // Primary emerald green palette
  primary: '#047857',     // Deep emerald - Main brand color
  secondary: '#065f46',   // Darker emerald - For depth and contrast
  accent: '#10b981',      // Bright emerald - For highlights and CTAs
  light: '#34d399',       // Light emerald - For subtle accents
  surface: '#064e3b',     // Dark emerald surface - For cards/backgrounds
  
  // Extended palette for UI components
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5', 
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',  // light
    500: '#10b981',  // accent
    600: '#059669',
    700: '#047857',  // primary
    800: '#065f46',  // secondary
    900: '#064e3b',  // surface
  },
  
  // Semantic colors
  success: '#10b981',     // Same as accent for consistency
  warning: '#f59e0b',     // Amber for warnings
  error: '#ef4444',       // Red for errors
  info: '#3b82f6',        // Blue for info
  
  // Neutral grays for dark theme
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0a0a0a',
  }
}

// Brand gradients for consistent use
export const brandGradients = {
  primary: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.accent})`,
  hero: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.accent})`,
  card: `linear-gradient(135deg, rgba(4,120,87,0.1), rgba(16,185,129,0.1))`,
  text: `linear-gradient(45deg, ${brandColors.accent}, ${brandColors.light})`,
}

// Brand shadows for consistent depth
export const brandShadows = {
  primary: `0 8px 32px rgba(4, 120, 87, 0.3)`,
  primaryHover: `0 12px 40px rgba(4, 120, 87, 0.4)`,
  card: `0 4px 20px rgba(0,0,0,0.1)`,
  cardHover: `0 8px 32px rgba(4, 120, 87, 0.2)`,
}

export default brandColors