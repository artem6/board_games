/**
 *
 * BROWSER ONLY
 *
 */
import { config } from './config';
import { v1 } from 'uuid';

const uuid = v1;

interface WebsocketMessage {
  id: string | null; // response must match id of request
  type: string;
  message?: any;
  error?: any;
}

export interface Subscription {
  event: string;
  id: string;
  callback: { (message: any): void };
}

const MIN_CONNECTION_DELAY = 500;
const MAX_CONN_DELAY = 1 * 60 * 60 * 1000;

function debug(...args: any[]) {
  // console.warn(...args);
}

export class WebsocketProvider {
  connection: WebSocket | null = null;
  connectionPending: any = null;
  subscriptions: Subscription[] = [];
  pendingSubscriptions: Subscription[] = [];
  connectionDelay = 0;
  serverUrl = '';

  authInterval = 5 * 60 * 1000;

  heartbeatInterval = 30 * 1000;
  lastHeartbeat = 0;
  missedHeartbeats = 0;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  increaseConnDelay = () => {
    this.connectionDelay *= 2;
    if (this.connectionDelay > MAX_CONN_DELAY) this.connectionDelay = MAX_CONN_DELAY;
    if (this.connectionDelay < MIN_CONNECTION_DELAY) this.connectionDelay = MIN_CONNECTION_DELAY;
    debug('ACTION: increase connection delay', this.connectionDelay);
  };
  decreaseConnDelay = () => {
    if (this.connectionDelay > MIN_CONNECTION_DELAY) {
      this.connectionDelay /= 2;
    } else {
      this.connectionDelay = 0;
    }
    debug('ACTION: reducing connection delay', this.connectionDelay);
  };

  onError = (err: any) => {
    console.error(err);
  };

  onClose = async () => {
    this.increaseConnDelay();
    debug('EVENT: onClose');
    this.disconnect();
    this.pendingSubscriptions.push(...this.subscriptions);
    this.subscriptions = [];

    const p = [];
    while (this.pendingSubscriptions.length) {
      const sub = this.pendingSubscriptions.shift();
      if (!sub) continue;
      p.push(this.subscribe(sub.event, sub.callback, sub.id));
    }
    await Promise.all(p);
    debug('EVENT: onClose complete');
  };

  // TODO - implement heartbeat : message=PING/PONG
  onMessage = (msg: { data: string }) => {
    debug('EVENT: onMessage');
    this.lastHeartbeat = Date.now();
    if (msg.data === 'PING') {
      this.connection?.send('PONG');
      return;
    }
    if (msg.data === 'PONG') return;
    try {
      const message: WebsocketMessage = JSON.parse(msg.data);
      const sub = this.subscriptions.find((sub) => sub.id === message.id);
      if (!sub) {
        console.error(`No subscription found to listen to: ${msg.data}`);
        return;
      }
      sub.callback(message.message);
      if (message.type === 'UNSUBSCRIBE') this.unsubscribe(sub.event);
    } catch (e) {
      console.error('Invalid Message from Server');
    }
  };

  disconnect = () => {
    debug('ACTION: disconnect');
    const connection = this.connection;
    if (connection && connection.OPEN) connection.close();
    this.connectionPending = null;
    this.connection = null;
  };

  connectionTimeout: any = null;
  connect = async () => {
    if (this.connection && !this.connectionPending) return;
    if (this.connectionPending) {
      await this.connectionPending;
      return;
    }
    debug('ACTION: connect');
    clearTimeout(this.connectionTimeout);
    this.connectionPending = new Promise(async (resolve) => {
      debug('ACTION: connection delay', this.connectionDelay);
      await new Promise((fn) => setTimeout(fn, this.connectionDelay));
      debug('ACTION: connection delay complete', this.connectionDelay);
      this.connection = new WebSocket(this.serverUrl);
      this.connection.addEventListener('error', this.onError);
      this.connection.addEventListener('close', this.onClose);
      this.connection.addEventListener('message', this.onMessage);
      let done = false;
      debug('ACTION: listen to open event');
      // connected
      this.connection.addEventListener('open', () => {
        if (done) return;
        clearTimeout(this.connectionTimeout);
        debug('EVENT: connection open');
        this.connectionPending = null;
        done = true;
        this.sendHeartbeat();
        this.sendAuth();
        resolve();
      });
      debug('ACTION: start waiting for a timeout');
      // if timed out, then retry
      this.connectionTimeout = setTimeout(async () => {
        if (done) return;
        debug('EVENT: connection timed out');
        await this.onClose();
        await this.connect();
        resolve();
      }, 10 * 1000);
    });
    while (this.connectionPending) {
      await this.connectionPending;
    }
    debug('ACTION: connect resolved', this.connection?.OPEN);
  };

  subscribe = async (event: string, callback: { (message: any): void }, id: string = uuid()) => {
    await this.connect();
    debug('ACTION: subscribe', event);
    if (this.subscriptions.find((sub) => sub.event === event))
      throw new Error(`Already subscribed to ${event}`);
    const sub = { id, callback, event };
    this.subscriptions.push(sub);
    await this.sendMessage({
      id: sub.id,
      type: 'SUBSCRIBE',
      message: { event },
    });
    return sub;
  };

  unsubscribe = async (event: string) => {
    debug('ACTION: unsubscribe', event);
    if (!this.subscriptions.length) throw new Error('No active subscriptions: ' + event);
    const sub = this.subscriptions.find((s) => s.event === event);
    if (!sub) return;
    const index = this.subscriptions.indexOf(sub);
    if (!sub || index === -1) throw new Error(`Not subscribed to ${event}`);
    this.subscriptions.splice(index, 1);
    await this.sendMessage({
      id: sub.id,
      type: 'UNSUBSCRIBE',
      message: { event: sub.event },
    });
    if (this.subscriptions.length === 0) this.disconnect();
  };

  sendMessage = async (message: WebsocketMessage) => {
    debug('ACTION: sending message start', message.message);
    await this.connect();
    debug('ACTION: sending message (connected)', message.message);
    if (this.connection && this.connection.OPEN) {
      this.connection.send(JSON.stringify(message));
    } else {
      setTimeout(() => this.sendMessage(message), 5000);
    }
  };

  sendAuthTimeout: any = null;
  sendAuth = async () => {
    if (this.authInterval <= 0) return;
    clearTimeout(this.sendAuthTimeout);
    const token = '';
    this.sendMessage({
      id: null,
      type: 'AUTHORIZATION',
      message: { token },
    });
    this.sendAuthTimeout = setTimeout(this.sendAuth, this.authInterval);
  };

  heartbeatTimeout: any = null;
  sendHeartbeat = () => {
    clearTimeout(this.heartbeatTimeout);
    if (!this.connection || this.connectionPending || !this.connection.OPEN) return;
    if (this.heartbeatInterval <= 0) return;
    const timeToNextHeartbeat = this.lastHeartbeat + this.heartbeatInterval - Date.now();

    if (timeToNextHeartbeat * -1 > this.heartbeatInterval * 2) {
      this.missedHeartbeats++;
      debug('ACTION: missed heatbeat');
    } else {
      this.missedHeartbeats = 0;
      this.decreaseConnDelay();
    }

    if (timeToNextHeartbeat > 0) {
      this.heartbeatTimeout = setTimeout(this.sendHeartbeat, timeToNextHeartbeat);
      return;
    }

    if (this.missedHeartbeats > 2) {
      this.missedHeartbeats = 0;
      this.onClose();
      return;
    }
    debug('ACTION: send heartbeat');

    this.connection.send('PING');
    this.heartbeatTimeout = setTimeout(this.sendHeartbeat, this.heartbeatInterval);
  };
}

export default new WebsocketProvider(config('WS_HOST'));
