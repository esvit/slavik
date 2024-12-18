import OpenAI from "openai";
import {Socket} from "socket.io";
import OpenAIChat from "./OpenAIChat";

export type AssistantAction = (event:any, args:any, socket: Socket) => any;
export type AssistantActions = Record<string, AssistantAction>;

export default
class OpenAIAssistant {
  constructor(
    protected readonly _key: string,
    protected readonly _name: string,
    protected readonly _openai: OpenAI,
    protected readonly _assistant: OpenAI.Beta.Assistant,
    protected readonly _actions: AssistantActions
  ) {
  }

  static async create(key: string, name: string, assistantId: string, actions: AssistantActions):Promise<OpenAIAssistant> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_TOKEN });
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    return new OpenAIAssistant(key, name, openai, assistant, actions);
  }

  async newChat(socket: Socket) {
    const chat = await OpenAIChat.create(this._openai, socket, this._assistant);
    chat.onAction = async (event:any) => {
      const funcName = event.function.name;
      const funcArgs = event.function.arguments ? JSON.parse(event.function.arguments) : {};
      const action:AssistantAction = this._actions[funcName];
      if (!action) {
        return new Promise((resolve) => {
          socket.emit('bot_action', funcName, funcArgs, (response:any) => {
            console.log(response); // "got it"
            resolve(response);
          });
        });
        // throw new Error(`Action "${event.action}" not found`);
      }
      return action(funcArgs, event, socket);
    };
    return chat;
  }
}
