export function convertTemp(celsius, unit) {
  return unit === 'f' ? (celsius * 9) / 5 + 32 : celsius
}

export function formatTemp(celsius, unit) {
  if (celsius == null || Number.isNaN(celsius)) return '--'
  return `${Math.round(convertTemp(celsius, unit))}°`
}