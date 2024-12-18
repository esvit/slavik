"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const socket_io_1 = require("socket.io");
const OpenAIServer_1 = tslib_1.__importDefault(require("./providers/OpenAIServer"));
(async function bootstrap() {
    const io = new socket_io_1.Server({
        serveClient: false,
        path: '/api/v1/chat',
        cors: {
            origin: 'http://127.0.0.1:8080',
            methods: ['GET', 'POST'],
            allowedHeaders: ['x-assistant'],
            credentials: true
        },
    });
    const server = await OpenAIServer_1.default.create(io, {
        assistants: [
            { key: 'test', name: 'Test Assistant', assistantId: process.env.OPENAI_ASSISTANT_ID },
        ],
        actions: {
            'getCounterparties': async (toolCall) => {
                console.info(toolCall);
                return [{ name: 'Савчук', id: '1' }, { name: 'Кушнір', id: '2' }];
            }
        }
    });
    console.info(server);
    io.listen(3001);
    console.info(`Listening on http://localhost:3001`);
})();
