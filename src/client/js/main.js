import { createSocketClient } from './socket-client.js'
import { initGameUI } from './game/game-ui.js'

const socket = createSocketClient()
window.__ATOM_SOCKET__ = socket
initGameUI(socket)
