import { WebSocketServer } from 'ws';

export default class WebSocketService {
    constructor(loggerService) {
        this.loggerService = loggerService;
    }

    init(server) {
        this.ws = new WebSocketServer({ server })

        this.ws.on('connection', (socket) => {
            this.loggerService.logInfo('WebSocket client connected');
        })

        this.ws.on('close', () => {
            this.loggerService.logInfo('WebSocket client disconnected');
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
            if (client.readyState === 1) {
                client.send(message);
            }
        })
    }

}
