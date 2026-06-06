import { WebSocket, WebSocketServer } from 'ws';

export default class WebSocketService {
    constructor(loggerService) {
        this.loggerService = loggerService;
    }

    init(server) {
        this.ws = new WebSocketServer({ server })

        this.ws.on('connection', (socket) => {
            this.loggerService.logInfo('WebSocket client connected');

            socket.on('close', (code, reasonBuffer) => {
                const reason = reasonBuffer?.toString() || 'No reason provided.';
                this.loggerService.logInfo(`WebSocket client disconnected. Code: ${code}. Reason: ${reason}`);
            })

            socket.on('error', (error) => {
                this.loggerService.logError(`WebSocket client error: ${error.message}`);
            })
        })

        this.ws.on('close', () => {
            this.loggerService.logInfo('WebSocket server closed.');
        })

        this.ws.on('error', (error) => {
            this.loggerService.logError(error.message);
        });
    }

    sendMessage(message) {
        if (!this.ws) {
            this.loggerService.logError('WebSocket server is not initialized.');
            return;
        }
        
        this.ws.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        })
    }

    async shutdown({ message, code = 1001, reason = 'Server shutting down.' } = {}) {
        if (!this.ws) {
            return;
        }

        if (message) {
            this.sendMessage(message);
        }

        const clients = [...this.ws.clients]
        await Promise.all(clients.map(client => new Promise((resolve) => {
            if (client.readyState === WebSocket.CLOSED) {
                resolve()
                return
            }

            const finish = () => {
                clearTimeout(timeoutId)
                client.off('close', finish)
                resolve()
            }

            const timeoutId = setTimeout(() => {
                client.off('close', finish)
                if (client.readyState !== WebSocket.CLOSED) {
                    client.terminate()
                }
                resolve()
            }, 1000)

            client.on('close', finish)

            if (client.readyState === WebSocket.OPEN) {
                client.close(code, reason)
                return
            }

            if (client.readyState !== WebSocket.CLOSING) {
                client.terminate()
                finish()
            }
        })))

        await new Promise((resolve, reject) => {
            this.ws.close((error) => {
                if (error) {
                    reject(error)
                    return
                }

                resolve()
            })
        })

        this.ws = null
    }

}
