const fs = require('fs')
const path = require('path')

describe('settings timing controls markup', () => {
  const htmlPath = path.resolve(__dirname, '../../../src/client/index.html')
  const html = fs.readFileSync(htmlPath, 'utf8')

  function getInputTagById (id) {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const inputRegex = new RegExp(`<input[^>]*id=["']${escapedId}["'][^>]*>`, 'i')
    const match = html.match(inputRegex)
    return match ? match[0] : ''
  }

  test('uses horizontal slider controls with configured ranges and steps', () => {
    const animationInputTag = getInputTagById('animation-delay-control')
    const machineInputTag = getInputTagById('machine-delay-control')

    expect(animationInputTag).toContain('type="range"')
    expect(animationInputTag).toContain('min="0"')
    expect(animationInputTag).toContain('max="24000"')
    expect(animationInputTag).toContain('step="100"')

    expect(machineInputTag).toContain('type="range"')
    expect(machineInputTag).toContain('min="0"')
    expect(machineInputTag).toContain('max="5000"')
    expect(machineInputTag).toContain('step="100"')
  })

  test('keeps spanish labels and descriptive aria labels', () => {
    expect(html).toContain('for="animation-delay-control">Velocidad animación (ms)</label>')
    expect(html).toContain('for="machine-delay-control">Respuesta máquina (ms)</label>')

    const animationInputTag = getInputTagById('animation-delay-control')
    const machineInputTag = getInputTagById('machine-delay-control')

    expect(animationInputTag).toContain('aria-label="Velocidad de animación en milisegundos"')
    expect(machineInputTag).toContain('aria-label="Tiempo de respuesta de máquina en milisegundos"')
  })

  test('renders timing value elements for synchronized visible feedback', () => {
    expect(html).toContain('id="animation-delay-value">300</span>')
    expect(html).toContain('id="machine-delay-value">100</span>')
  })
})
