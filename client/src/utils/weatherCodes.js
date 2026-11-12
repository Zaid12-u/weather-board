import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from 'lucide-react'

const CODE_MAP = {
  0: { label: 'Clear sky', dayIcon: Sun, nightIcon: Moon },
  1: { label: 'Mainly clear', dayIcon: Sun, nightIcon: Moon },
  2: { label: 'Partly cloudy', dayIcon: CloudSun, nightIcon: CloudMoon },
  3: { label: 'Overcast', dayIcon: Cloud, nightIcon: Cloud },
  45: { label: 'Fog', dayIcon: CloudFog, nightIcon: CloudFog },
  48: { label: 'Depositing rime fog', dayIcon: CloudFog, nightIcon: CloudFog },
  51: { label: 'Light drizzle', dayIcon: CloudDrizzle, nightIcon: CloudDrizzle },
  53: { label: 'Moderate drizzle', dayIcon: CloudDrizzle, nightIcon: CloudDrizzle },
  55: { label: 'Dense drizzle', dayIcon: CloudDrizzle, nightIcon: CloudDrizzle },
  56: { label: 'Light freezing drizzle', dayIcon: CloudDrizzle, nightIcon: CloudDrizzle },
  57: { label: 'Dense freezing drizzle', dayIcon: CloudDrizzle, nightIcon: CloudDrizzle },
  61: { label: 'Slight rain', dayIcon: CloudRain, nightIcon: CloudRain },
  63: { label: 'Moderate rain', dayIcon: CloudRain, nightIcon: CloudRain },
  65: { label: 'Heavy rain', dayIcon: CloudRain, nightIcon: CloudRain },
  66: { label: 'Light freezing rain', dayIcon: CloudRain, nightIcon: CloudRain },
  67: { label: 'Heavy freezing rain', dayIcon: CloudRain, nightIcon: CloudRain },
  71: { label: 'Slight snow', dayIcon: CloudSnow, nightIcon: CloudSnow },
  73: { label: 'Moderate snow', dayIcon: CloudSnow, nightIcon: CloudSnow },
  75: { label: 'Heavy snow', dayIcon: CloudSnow, nightIcon: CloudSnow },
  77: { label: 'Snow grains', dayIcon: CloudSnow, nightIcon: CloudSnow },
  80: { label: 'Slight rain showers', dayIcon: CloudRain, nightIcon: CloudRain },
  81: { label: 'Moderate rain showers', dayIcon: CloudRain, nightIcon: CloudRain },
  82: { label: 'Violent rain showers', dayIcon: CloudRain, nightIcon: CloudRain },
  85: { label: 'Slight snow showers', dayIcon: CloudSnow, nightIcon: CloudSnow },
  86: { label: 'Heavy snow showers', dayIcon: CloudSnow, nightIcon: CloudSnow },
  95: { label: 'Thunderstorm', dayIcon: CloudLightning, nightIcon: CloudLightning },
  96: { label: 'Thunderstorm with slight hail', dayIcon: CloudLightning, nightIcon: CloudLightning },
  99: { label: 'Thunderstorm with heavy hail', dayIcon: CloudLightning, nightIcon: CloudLightning },
}

/**
 * Map a WMO weather code to a human label and Lucide icon component.
 * @param {number} code
 * @param {boolean} [isDay=true]
 * @returns {{ label: string, icon: import('lucide-react').LucideIcon }}
 */
export function getWeatherDisplay(code, isDay = true) {
  const entry = CODE_MAP[code] ?? {
    label: 'Unknown conditions',
    dayIcon: Cloud,
    nightIcon: Cloud,
  }

  return {
    label: entry.label,
    icon: isDay ? entry.dayIcon : entry.nightIcon,
  }
}
