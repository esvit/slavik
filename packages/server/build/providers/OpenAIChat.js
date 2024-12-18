"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OpenAIChat {
    constructor(openai, socket, thread, assistant) {
        this.openai = openai;
        this.socket = socket;
        this.thread = thread;
        this.assistant = assistant;
        socket.data.chat = this;
        socket.on('ask', async (data) => {
            console.info(data);
            await this.askMessage(data.text);
        });
        socket.on('abort', () => {
            if (socket.data.currentChatStream) {
                socket.data.currentChatStream.controller.abort();
                socket.data.currentChatStream = undefined;
            }
        });
    }
    async askMessage(content = '') {
        if (this.socket.data.currentChatStream) {
            return;
        }
        if (content !== '') {
            const message = await this.openai.beta.threads.messages.create(this.thread.id, { role: "user", content });
            console.info(message);
        }
        const stream = this.openai.beta.threads.runs.stream(this.thread.id, { assistant_id: this.assistant.id });
        this.socket.data.currentChatStream = stream;
        for await (const event of stream) {
            await this.onMessage(event);
        }
    }
    static async create(openai, socket, assistant) {
        const thread = await openai.beta.threads.create();
        return new OpenAIChat(openai, socket, thread, assistant);
    }
    async onMessage(event) {
        try {
            console.info(event.event);
            if (event.event === 'thread.run.completed') {
                this.socket.data.currentChatStream = undefined;
                this.socket.send('stop_typing', { id: event.data.id });
            }
            else if (event.event === 'thread.run.created') {
                this.socket.send('start_typing', { id: event.data.id });
            }
            else if (event.event === 'thread.run.requires_action') {
                await this.handleRequiresAction(event.data, event.data.id, event.data.thread_id);
            }
            else if (event.event === "thread.message.delta") {
                this.socket.send('typing', {
                    content: event.data.delta.content,
                    id: event.data.id
                });
            }
            else {
                console.log(event);
            }
        }
        catch (error) {
            console.error("Error handling event:", error);
        }
    }
    async handleRequiresAction(data, runId, threadId) {
        try {
            const toolOutputs = data.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
                if (toolCall.function.name === "getCounterparties") {
                    return {
                        tool_call_id: toolCall.id,
                        output: JSON.stringify([{ name: 'Савчук', id: '1' }, { name: 'Кушнір', id: '2' }])
                    };
                }
                return {
                    tool_call_id: toolCall.id,
                    output: null
                };
            });
            console.info(toolOutputs);
            await this.submitToolOutputs(toolOutputs, runId, threadId);
        }
        catch (error) {
            console.error("Error processing required action:", error);
        }
    }
    async submitToolOutputs(toolOutputs, runId, threadId) {
        try {
            const stream = this.openai.beta.threads.runs.submitToolOutputsStream(threadId, runId, { tool_outputs: toolOutputs });
            for await (const event of stream) {
                await this.onMessage(event);
            }
        }
        catch (error) {
            console.error("Error submitting tool outputs:", error);
        }
    }
}
exports.default = OpenAIChat;
