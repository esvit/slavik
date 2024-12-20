import ChatWindow from "./ChatWindow";

export default
class Assistant {
  messages = [];
  isTyping = false;
  typingId = null;

  constructor(readonly key: string, readonly socket: any, protected readonly chatWindow: ChatWindow, protected readonly marked: any) {
    socket.on('bot_action', async (funcName, args, { id }, callback) => {
      console.info(funcName, args)
      if (funcName === 'clarifyQuestion') {
        const buttons = args.options.split(',');
        this.onNewMessage({
          id,
          text: args.text,
          html: this.marked.parse(args.text),
        });
        this.onUpdateMessage({
          id,
          text: args.text,
          html: this.marked.parse(args.text),
          buttons,
          callback
        });
        return;
      }
      const res = await this.onAction(funcName, args);
      callback(res);
    });
    socket.on('message', (type, content) => {
      this.onMessage(type, content);
    });
  }

  async onAction(funcName, args) {
    console.info(funcName, args);
    return [{ type: 'text', content: 'Hello' }];
  }

  onMessage(type:string, content: any) {
    if (type === 'start_typing') {
      this.typingId = content.id;
      this.isTyping = true;
      this.chatWindow.lockSendButton(true);
      this.onStatusUpdate(true);
    } else if (type === 'stop_typing') {
      this.typingId = null;
      this.isTyping = false;
      this.chatWindow.lockSendButton(false);
      this.onStatusUpdate(false);
    }
    if (type === 'typing') {
      let message = this.messages.find(m => m.id === content.id);
      if (!message) {
        message = { id: content.id, text: '' };
        this.messages.push(message);
        this.onNewMessage(message);
      }
      for (const item of content.content) {
        message.text += item.text.value;
        message.html = this.marked.parse(message.text)
        this.onUpdateMessage(message);
      }
    }
  }

  onNewMessage(message) {
    this.chatWindow.createMessage({
      role: "assistant",
      ...message
    });
  }

  onUpdateMessage(message) {
    this.chatWindow.updateMessage({
      role: "assistant",
      ...message
    });
  }

  onStatusUpdate(lock: boolean) {
    console.info('Lock send button', lock);
  }

  focus() {
    this.chatWindow.focus();
  }
}
