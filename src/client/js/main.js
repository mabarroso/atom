import { createSocketClient } from './socket-client.js'
import { initGameUI } from './game/game-ui.js'

const connectionStatus = document.getElementById('connection-status')
const statusButton = document.getElementById('btn-status')

const statusClassMap = {
  connected: 'text-bg-success',
  disconnected: 'text-bg-danger',
  connecting: 'text-bg-secondary'
}

function renderStatus (status) {
  const labels = {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    connecting: 'Conectando...'
  }

  Object.values(statusClassMap).forEach((className) => {
    connectionStatus.classList.remove(className)
  })

  connectionStatus.classList.add(statusClassMap[status])
  connectionStatus.textContent = labels[status]
}

const socket = createSocketClient()
window.__ATOM_SOCKET__ = socket
renderStatus('connecting')
initGameUI(socket)

socket.on('connect', () => {
  renderStatus('connected')
})

socket.on('disconnect', () => {
  renderStatus('disconnected')
})

socket.on('reconnect_attempt', () => {
  renderStatus('connecting')
})

socket.on('error:internal', () => {
  renderStatus('disconnected')
})

statusButton.addEventListener('click', () => {
  socket.emit('client:statusRequest')
})

socket.on('server:statusUpdate', () => {
  if (socket.connected) {
    renderStatus('connected')
  }
})
