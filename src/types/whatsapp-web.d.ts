declare module "whatsapp-web.js" {
  export class Client {
    constructor(options?: ClientOptions);
    initialize(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): this;
    sendMessage(chatId: string, content: string): Promise<Message>;
    getChats(): Promise<Chat[]>;
  }

  export class Message {
    body: string;
    from: string;
    to: string;
    timestamp: number;
    reply(content: string): Promise<Message>;
  }

  export class Chat {
    id: string;
    name: string;
    sendMessage(content: string): Promise<Message>;
  }

  export class LocalAuth {
    constructor();
  }

  export interface ClientOptions {
    authStrategy?: any;
    puppeteer?: {
      headless?: boolean;
      args?: string[];
    };
  }
}
