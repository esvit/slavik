export type ChatMessage = {
  id?: string;
  role: 'user'|'assistant';
  text: string;
  html?: string;
  buttons?: string[];
  callback?: (buttonText: string) => void;
  __fired?: boolean;
};

export default
class ChatWindow {
  protected _messages:ChatMessage[] = [];
  protected _messagesContainer:HTMLElement;
  protected _scrollingContainer:HTMLElement;
  protected _loadingElement:HTMLElement;
  protected _input:HTMLTextAreaElement;
  protected _isLocked = false;

  constructor(protected readonly el: HTMLElement, protected readonly options: any) {
  }

  createMessage(message: ChatMessage) {
    const id = message.id ?? Math.random().toString(36).substring(7);
    this._messages.push(message);

    const messageContainer = document.createElement("div");
    messageContainer.classList.add('ai-dialog__message-container');
    messageContainer.classList.add(`type-${message.role}`);

    const messageContent = document.createElement("div");
    messageContent.classList.add('ai-dialog__message');
    messageContent.innerText = message.text ?? '';
    messageContent.setAttribute('data-id', id);
    messageContainer.append(messageContent);

    this._messagesContainer.append(messageContainer);
    this.scrollToBottom();
    return id;
  }

  scrollToBottom() {
    setTimeout(() => {
      this._scrollingContainer.scrollTop = this._scrollingContainer.scrollHeight;
    }, 100);
  }

  updateMessage(message: ChatMessage) {
    const historyMessage = this._messages.find(m => m.id === message.id);
    if (!historyMessage) {
      return;
    }

    const messageContent:HTMLElement = this._messagesContainer.querySelector(`[data-id="${historyMessage.id}"]`);
    if (!messageContent) {
      return;
    }
    messageContent.innerHTML = message.html ?? '';
    if (message.buttons) {
      const buttonsContainer = document.createElement("div");
      buttonsContainer.classList.add('ai-dialog__message-buttons');
      message.__fired = false;
      for (const buttonText of message.buttons) {
        const buttonElement = document.createElement("button");
        buttonElement.classList.add('ai-dialog__message-button');
        buttonElement.innerText = buttonText;
        buttonElement.addEventListener('click', (e) => {
          if (message.__fired) {
            return;
          }
          message.__fired = true;
          buttonElement.classList.add('active');
          message.callback?.(buttonText);
        });
        buttonsContainer.append(buttonElement);
      }
      messageContent.append(buttonsContainer);
    }

    this.scrollToBottom();
  }

  init() {
    const shadow = this.el.attachShadow({ mode: "open" });
    // add style
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = this.options.cssPath;
    shadow.appendChild(style);
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap";
    this.el.appendChild(font);

    const mainDialog = document.createElement("div");
    mainDialog.classList.add('ai-dialog');
    mainDialog.style.display = 'none';

    const header = document.createElement("div");
    header.classList.add('ai-dialog__header');
    mainDialog.append(header);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add('ai-dialog__header-buttons');
    header.append(buttonContainer);

    const buttonContainer2 = document.createElement("div");
    buttonContainer2.classList.add('ai-dialog__header-buttons-right');
    header.append(buttonContainer2);

    // const button = document.createElement("button");
    // button.setAttribute('type', 'button');
    // button.classList.add('ai-dialog__header-button');
    // button.innerHTML = 'Back';
    // button.onclick = () => {
    //   // shadow.remove();
    // };
    // buttonContainer.append(button);
    const title = document.createElement("button");
    title.classList.add('ai-dialog__header-title');
    title.innerHTML = this.options.title ?? '';
    buttonContainer.append(title);

    if (this.options.showFullscreen) {
      const extendButton = document.createElement("button");
      extendButton.setAttribute('type', 'button');
      extendButton.classList.add('ai-dialog__header-button');
      extendButton.innerHTML = '<svg aria-hidden="true" focusable="false" class="octicon octicon-screen-full" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="display: inline-block; user-select: none; vertical-align: text-bottom; overflow: visible;"><path d="M1.75 10a.75.75 0 0 1 .75.75v2.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 1 13.25v-2.5a.75.75 0 0 1 .75-.75Zm12.5 0a.75.75 0 0 1 .75.75v2.5A1.75 1.75 0 0 1 13.25 15h-2.5a.75.75 0 0 1 0-1.5h2.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 .75-.75ZM2.75 2.5a.25.25 0 0 0-.25.25v2.5a.75.75 0 0 1-1.5 0v-2.5C1 1.784 1.784 1 2.75 1h2.5a.75.75 0 0 1 0 1.5ZM10 1.75a.75.75 0 0 1 .75-.75h2.5c.966 0 1.75.784 1.75 1.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>';
      extendButton.onclick = () => {
        this.onFullscreen();
      };
      buttonContainer2.append(extendButton);
    }

    const closeButton = document.createElement("button");
    closeButton.setAttribute('type', 'button');
    closeButton.classList.add('ai-dialog__header-button');
    closeButton.innerHTML = '<svg aria-hidden="true" focusable="false" class="octicon octicon-x" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="display: inline-block; user-select: none; vertical-align: text-bottom; overflow: visible;"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path></svg>';
    closeButton.onclick = () => {
      this.onClose();
    };
    buttonContainer2.append(closeButton);

    this.createChatBlock(mainDialog);

    shadow.appendChild(mainDialog);
  }

  onClose() {}
  onFullscreen() {}

  createChatBlock(container) {
    const chatBlock = document.createElement("div");
    chatBlock.classList.add('ai-dialog__chat-block');
    container.append(chatBlock);

    this._scrollingContainer = document.createElement("div");
    this._scrollingContainer.classList.add('ai-dialog__chat-scrolling-content');
    chatBlock.append(this._scrollingContainer);

    this._messagesContainer = document.createElement("div");
    this._scrollingContainer.append(this._messagesContainer);

    this._loadingElement = document.createElement("div");
    this._loadingElement.classList.add('ai-dialog__loading');
    this._loadingElement.innerText = 'Loading...';
    this._scrollingContainer.append(this._loadingElement);

    const textareaContainer = document.createElement("div");
    textareaContainer.classList.add('ai-dialog__textarea-container');
    chatBlock.append(textareaContainer);

    const textarea = document.createElement("div");
    textarea.classList.add('ai-dialog__textarea');
    textareaContainer.append(textarea);

    if (this.options.warningText) {
      const warning = document.createElement("div");
      warning.classList.add('ai-dialog__warning');
      warning.innerHTML = this.options.warningText;
      textareaContainer.append(warning);
    }

    const form = document.createElement("form");
    form.classList.add('ai-dialog__form');
    textarea.append(form);
    form.addEventListener('submit', this.onSubmit.bind(this));

    this._input = document.createElement("textarea");
    this._input.classList.add('ai-dialog__input');
    this._input.placeholder = this.options.textareaPlaceholder ?? '';
    form.append(this._input);
    this._input.addEventListener('keyup', this.onKeyUp.bind(this));

    // testing layout
    // chatScrollingContent.innerHTML = '<div class="ai-dialog__message-container type-assistant"><div class="ai-dialog__message" data-id="call_q5DDUoR0l4EzQ84LrCcUmOFn"><p>Що саме ти хотів обрати?</p> <div class="ai-dialog__message-buttons"><button class="ai-dialog__message-button">📄 Звіт</button><button class="ai-dialog__message-button"> 💹 Транзакції</button><button class="ai-dialog__message-button"> 🏢 Контрагент</button></div></div></div>';
  }

  onAskBot(text) {
    console.info('Ask bot', text);
  }

  onKeyUp(e) {
    if (e.key === 'Enter' && e.target.value !== '' && !e.shiftKey) {
      let text = (e.target.value ?? '').toString().trim();
      if (text.length && !this._isLocked) {
        this.onAskBot(e.target.value);
        this.createMessage({
          role: 'user',
          text: e.target.value
        });
        e.target.value = '';
        this.lockSendButton(true);
      }
    }
  }

  onSubmit(e) {
    console.info(e);
  }

  lockSendButton(lock: boolean) {
    this._isLocked = lock;
    if (lock) {
      this._loadingElement.classList.add('show');
    } else {
      this._loadingElement.classList.remove('show');
    }
  }

  focus() {
    this._input.focus();
  }
}
