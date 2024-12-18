"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const openai_1 = tslib_1.__importDefault(require("openai"));
const OpenAIChat_1 = tslib_1.__importDefault(require("./OpenAIChat"));
class OpenAIAssistant {
    constructor(_key, _name, _openai, _assistant) {
        this._key = _key;
        this._name = _name;
        this._openai = _openai;
        this._assistant = _assistant;
    }
    static async create(key, name, assistantId) {
        const openai = new openai_1.default({ apiKey: process.env.OPENAI_TOKEN });
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        return new OpenAIAssistant(key, name, openai, assistant);
    }
    async newChat(socket) {
        return OpenAIChat_1.default.create(this._openai, socket, this._assistant);
    }
}
exports.default = OpenAIAssistant;
