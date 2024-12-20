import '../assets/index.scss';
import Assistant from "./Assistant";
import ChatWindow from "./ChatWindow";

export default {};

export type AssistantOptions = {
  container: HTMLElement;
  url: string;
  path: string;
  warningText?: string;
  textareaPlaceholder?: string;
  withCredentials: boolean;
  extraHeaders?: Record<string, string>;
  onClose?: () => void;
  onFullscreen?: () => void;
};

export async function useAssistant(key: string, options: AssistantOptions) {
  const { io, marked } = await getLibs();

  // always open links in new tab
  const renderer = new marked.Renderer();
  renderer.link = function({ href, title, text }) {
    console.info(arguments)
    const target = '_blank';
    const rel = 'noopener noreferrer'; // Безпека для зовнішніх посилань
    return `<a href="${href}" target="${target}" rel="${rel}" title="${title || ''}">${text}</a>`;
  };
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: true,
    sanitize: false,
  });

  const socket = io(options.url, {
    ...options,
    extraHeaders: {
      ...(options.extraHeaders || {}),
      'x-assistant': key
    }
  });
  const window = new ChatWindow(options.container, options);
  const assistant = new Assistant(key, socket, window, marked);
  window.init();
  window.onAskBot = async (text) => {
    socket.emit('ask', { id: '1', text });
  };
  window.onClose = () => {
    if (options.onClose) {
      options.onClose();
    }
  };
  window.onFullscreen = () => {
    if (options.onFullscreen) {
      options.onFullscreen();
    }
  };
  return assistant;
}

function getLibs() {
  if (typeof window["io"] !== 'undefined' && typeof window["marked"] !== 'undefined') {
    return {
      io: window["io"],
      marked: window["marked"],
    };
  }
  return Promise.all([
    loadScript('https://cdn.socket.io/4.7.2/socket.io.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js'),
  ]).then(() => {
    return {
      io: window["io"],
      marked: window["marked"],
    };
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject();
    };
    document.head.appendChild(script);
  });
}
