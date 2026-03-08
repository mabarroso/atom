const path = require('path')
const { spawn } = require('child_process')

describe('server startup and shutdown', () => {
  it('handles SIGINT gracefully', (done) => {
    const serverPath = path.resolve(__dirname, '../../../src/server/index.js')
    const child = spawn(process.execPath, [serverPath], {
      env: {
        ...process.env,
        PORT: '3100'
      }
    })

    let output = ''

    child.stdout.on('data', (chunk) => {
      output += chunk.toString()
      if (output.includes('Server listening on port 3100')) {
        child.kill('SIGINT')
      }
    })

    child.on('exit', (code) => {
      expect(code).toBe(0)
      expect(output).toContain('Server listening on port 3100')
      done()
    })
  })
})
