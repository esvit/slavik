import { Server as SocketServer } from 'socket.io';
import OpenAIServer from "./providers/OpenAIServer";

(async function bootstrap() {
  const io = new SocketServer({
    serveClient: false,
    path: '/api/v1/chat',
    cors: {
      origin: 'http://127.0.0.1:8080',
      methods: ['GET', 'POST'],
      allowedHeaders: ['x-assistant'],
      credentials: true
    },
    // allowRequest: (req, callback) => {
    //   console.info(req.headers);
    //   // const noOriginHeader = req.headers.origin === undefined;
    //   callback(null, true);
    // }
  });
  const server = await OpenAIServer.create(io, {
    assistants: [
      { key: 'test', name: 'Nomi Assistant', assistantId: process.env.OPENAI_ASSISTANT_ID as string },
    ],
    actions: {
      'getCounterparties': async (event, args) => {
        console.info(event, args);
        return [{name: 'Савчук', id: '1'}, {name: 'Кушнір', id: '2'}];
      },
      saveUnknownQuestion: async () => {
        // save args.userQuestion to database
        return null;
      }
    }
  });
  console.info(server);

  // io.use((socket:Socket, next:any) => this.onHandshake(socket).then(next).catch((err) => {
  //   console.error(err);
  //   next(null, err);
  // }));
  io.listen(3001);
  console.info(`Listening on http://localhost:3001`);
})();
