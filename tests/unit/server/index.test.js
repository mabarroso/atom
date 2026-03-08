const request = require('supertest')
const { createServer } = require('../../../src/server/index')

describe('server', () => {
  let server

  afterEach((done) => {
    if (server) {
      server.close(() => {
        server = null
        done()
      })
      return
    }

    done()
  })

  it('Server starts on configured port', (done) => {
    const setup = createServer(0)
    server = setup.httpServer

    server.listen(0, () => {
      const address = server.address()
      expect(address.port).toBeGreaterThan(0)
      done()
    })
  })

  it('Server serves static files correctly', async () => {
    const setup = createServer(0)

    const response = await request(setup.app).get('/index.html')

    expect(response.statusCode).toBe(200)
    expect(response.text).toContain('<!doctype html>')
  })

  it('Error handling middleware catches errors', async () => {
    const setup = createServer(0)

    const response = await request(setup.app).get('/boom')

    expect(response.statusCode).toBe(500)
    expect(response.body.error).toBe('Error interno del servidor')
  })
})
