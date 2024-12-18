import {Server as SocketServer} from "socket.io";
import OpenAIAssistant, {AssistantActions} from "./OpenAIAssistant";

export type OpenAIServerOptions = {
  assistants: {
    key: string;
    name: string;
    assistantId: string;
  }[];
  actions: AssistantActions;
};

export default
class OpenAIServer {
  protected _assistants: Record<string, OpenAIAssistant> = {};

  async getAssistant(key: string): Promise<OpenAIAssistant> {
    if (!this._assistants[key]) {
      const config = this._options.assistants.find((item) => item.key === key);
      if (!config) {
        throw new Error(`Assistant config "${key}" not found`);
      }
      this._assistants[key] = await OpenAIAssistant.create(
        config.key, config.name, config.assistantId,
        this._options.actions
      );
    }
    return this._assistants[key];
  }

  protected constructor(protected _io: SocketServer, protected _options:OpenAIServerOptions) {
    _io.on('connection', async (socket) => {
      const assistantKey = socket.handshake.headers['x-assistant'];
      if (!assistantKey) {
        throw new Error('Assistant key not found');
      }
      const assistant = await this.getAssistant(assistantKey.toString());
      // const openAIAssistant = await OpenAIAssistant.create('test');
      const chat = await assistant.newChat(socket);
      console.info(chat);
      // const name = socket.account && socket.account.Email ? socket.account.Email : 'anonymous';

      // logger.log(`Socket connection from "${name}" started`);
      // socket.on('disconnect', () => this.log(`Socket connection from "${name}" closed`));
    });
  }

  static async create(io: SocketServer, options:OpenAIServerOptions): Promise<OpenAIServer> {
    return new OpenAIServer(io, options);
  }
}
