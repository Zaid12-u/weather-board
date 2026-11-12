import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    transparent: {
      sizes: [192, 512],
      favicons: [[48, 'favicon.ico']],
      padding: 0,
    },
    maskable: {
      sizes: [512],
      padding: 0,
      resizeOptions: { background: '#0a0a0a' },
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: '#0a0a0a' },
    },
    assetName(type, size) {
      if (type === 'transparent') {
        return `pwa-${size.width}x${size.height}.png`
      }
      if (type === 'maskable') {
        return 'maskable-512x512.png'
      }
      if (type === 'apple') {
        return 'apple-touch-icon.png'
      }
      return `icon-${size.width}x${size.height}.png`
    },
  },
  images: ['public/icon.svg'],
})
