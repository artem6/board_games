import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import cors from 'cors';
import webSocketManager from './websocketManager';
import { dataUpdatePublisher, updateData } from './data';
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

webSocketManager.registerPublisher(dataUpdatePublisher);

app.post('/update', (req, res) => {
  try {
    const data = updateData(req.body);
    res.json({ data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  path: '/ws',
});
wss.on('connection', webSocketManager.connect);
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
