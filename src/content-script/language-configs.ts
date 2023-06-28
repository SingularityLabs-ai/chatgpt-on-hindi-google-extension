export interface Language {
  name: string
  code: string
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, Language> = {
  hindi: {
    name: 'Hindi',
    code: 'hi-IN',
  },
  punjabi: {
    name: 'Punjabi',
    code: 'pa-IN',
  },
  marathi: {
    name: 'Marathi',
    code: 'mr',
  },
  gujarati: {
    name: 'Gujarati',
    code: 'gu',
  },
  bengali: {
    name: 'Bengali',
    code: 'bn',
  },
  odia: {
    name: 'Odia',
    code: 'or',
  },
  kannada: {
    name: 'Kannada',
    code: 'kn',
  },
  tamil: {
    name: 'Tamil',
    code: 'ta-IN',
  },
  telugu: {
    name: 'Telugu',
    code: 'te',
  },
  malayalam: {
    name: 'Malayalam',
    code: 'ml-IN',
  },
}
