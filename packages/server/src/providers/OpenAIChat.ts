import OpenAI from "openai";
import {Socket} from "socket.io";

export default
class OpenAIChat {
  protected constructor(protected openai: OpenAI, protected socket: Socket, protected thread: OpenAI.Beta.Thread, protected assistant: OpenAI.Beta.Assistant) {
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

  async askMessage(content: string = '') {
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

  static async create(openai: OpenAI, socket: Socket, assistant: OpenAI.Beta.Assistant) {
    const thread = await openai.beta.threads.create();
    return new OpenAIChat(openai, socket, thread, assistant);
  }

  async onAction(event: OpenAI.Beta.AssistantStreamEvent) {
    console.info('No action handler for:', event);
    return null;
  }

  async onMessage(event: OpenAI.Beta.AssistantStreamEvent) {
    try {
      // console.info(event.event);
      if (event.event === 'thread.run.completed') {
        this.socket.data.currentChatStream = undefined;
        this.socket.send('stop_typing', { id: event.data.id });
      } else if (event.event === 'thread.run.created') {
        this.socket.send('start_typing', { id: event.data.id });
      } else if (event.event === 'thread.run.requires_action') {
        await this.handleRequiresAction(
          event.data,
          event.data.id,
          event.data.thread_id,
        );
      } else if (event.event === "thread.message.delta") {
        this.socket.send('typing', { content: event.data.delta.content, id: event.data.id });
      }
    } catch (error) {
      console.error("Error handling event:", error);
    }
  }

  async handleRequiresAction(data:any, runId:string, threadId:string) {
    try {
      const toolOutputs = await Promise.all(data.required_action.submit_tool_outputs.tool_calls.map(async (toolCall:any) => {
        const res = await this.onAction(toolCall);
        return {
          tool_call_id: toolCall.id,
          output: res ? JSON.stringify(res) : null
        };
      }));
      await this.submitToolOutputs(toolOutputs, runId, threadId);
    } catch (error) {
      console.error("Error processing required action:", error);
    }
  }

  async submitToolOutputs(toolOutputs:any, runId:string, threadId:string) {
    try {
      const stream = this.openai.beta.threads.runs.submitToolOutputsStream(
        threadId,
        runId,
        { tool_outputs: toolOutputs },
      );
      for await (const event of stream) {
        await this.onMessage(event);
      }
    } catch (error) {
      console.error("Error submitting tool outputs:", error);
    }
  }
}
