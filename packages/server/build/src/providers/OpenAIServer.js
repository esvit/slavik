"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const OpenAIAssistant_1 = tslib_1.__importDefault(require("./OpenAIAssistant"));
class OpenAIServer {
    async getAssistant(key) {
        if (!this._assistants[key]) {
            const config = this.options.assistants.find((item) => item.key === key);
            if (!config) {
                throw new Error(`Assistant config "${key}" not found`);
            }
            this._assistants[key] = await OpenAIAssistant_1.default.create(config.key, config.name, config.assistantId);
        }
        return this._assistants[key];
    }
    constructor(io, options) {
        this.io = io;
        this.options = options;
        this._assistants = {};
        io.on('connection', async (socket) => {
            const assistantKey = socket.handshake.headers['x-assistant'];
            if (!assistantKey) {
                throw new Error('Assistant key not found');
            }
            const assistant = await this.getAssistant(assistantKey.toString());
            const chat = await assistant.newChat(socket);
            console.info(chat);
        });
    }
    static async create(io, options) {
        return new OpenAIServer(io, options);
    }
}
exports.default = OpenAIServer;
