/**
 * Renders Bangla or multilingual text to PNG bytes via browser canvas.
 * This guarantees 100% correct Bengali conjuncts/ligatures (যুক্তাক্ষর)
 * in PDF rendering using browser HarfBuzz/Blink shaping.
 */
export function renderTextToPng(
  text: string,
  options: {
    fontSize?: number
    fontWeight?: string
    color?: string
    fontFamily?: string
    padding?: number
  } = {},
): Uint8Array | null {
  if (typeof document === 'undefined') {
    return null // Return null in non-browser (Node.js) environments
  }

  try {
    const fontSize = options.fontSize || 14
    const fontWeight = options.fontWeight || 'normal'
    const color = options.color || '#1e293b'
    const fontFamily = options.fontFamily || "'Noto Sans Bengali', sans-serif"
    const padding = options.padding || 4

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const fontStyle = `${fontWeight} ${fontSize}px ${fontFamily}`
    ctx.font = fontStyle

    const metrics = ctx.measureText(text)
    const textWidth = Math.ceil(metrics.width)
    const textHeight = Math.ceil(fontSize * 1.3)

    // Render at 2x resolution for retina-crisp PDF output
    const scale = 2
    canvas.width = (textWidth + padding * 2) * scale
    canvas.height = (textHeight + padding * 2) * scale

    ctx.scale(scale, scale)
    ctx.font = fontStyle
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(text, padding, (textHeight + padding * 2) / 2)

    const dataUrl = canvas.toDataURL('image/png')
    const base64 = dataUrl.split(',')[1]
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    return bytes
  } catch (err) {
    console.warn('Canvas Bangla text rendering failed:', err)
    return null
  }
}
