import * as WebSocket from 'ws';

export interface WebsocketMessage {
  id: string; // response must match id of request
  type: string;
  message?: any;
  error?: any;
}

export interface Publisher {
  eventMatch: RegExp;
  startPublishing: {
    (
      event: RegExpMatchArray | null,
      messageAllSubscribers: { (message: object): void },
      getAnyToken: { (): string },
    ): void;
  }; // some
  stopPublishing: { (event: RegExpMatchArray | null): void };
  newSubscriber: {
    (
      event: RegExpMatchArray | null,
      messageThisSubscriber: { (message: object): void },
      getSubscriberToken: { (): string },
    ): void;
  };
}

interface Subscriber {
  id: string;
  event: string;
  connection: Connection;
}

interface Subscription {
  event: string;
  subscribers: Subscriber[];
  publisher: Publisher;
}

interface Connection {
  ws: WebSocket;
  subscribers: Subscriber[];
  lastHeartbeat: number;
  missedHeartbeats: number;
  heartbeatTimeout: any;
  authToken: string;
}

class WebSocketManager {
  subscriptions: { [event: string]: Subscription } = {};
  publishers: Publisher[] = [];
  connections: Connection[] = [];

  heartbeatInterval = 35 * 1000;

  info = () => {
    return {
      subscriptions: Object.keys(this.subscriptions).map((sub) => {
        const subscription = this.subscriptions[sub];
        return {
          event: subscription.event,
          subscribers: subscription.subscribers.length,
        };
      }),
      connections: this.connections.length,
    };
  };

  messageSubscriber = (subscriber: Subscriber) => (message: any) => {
    const websocketMessage: WebsocketMessage = {
      id: subscriber.id,
      type: 'SUBSCRIPTION',
    };
    if (message instanceof Error) websocketMessage.error = { msg: message.message };
    else websocketMessage.message = message;
    this.sendMessage(subscriber.connection, websocketMessage);
  };

  messageAllSubscribers = (eventSubscription: Subscription) => (message: any) => {
    eventSubscription.subscribers.forEach((subscriber) => {
      this.messageSubscriber(subscriber)(message);
    });
  };

  getAnyToken = (eventSubscription: Subscription) => () => {
    let token: string = '';
    eventSubscription.subscribers.forEach((subscriber) => {
      const subscriberToken = this.getSubscriberToken(subscriber)();
      if (subscriberToken) token = subscriberToken;
    });
    return token;
  };

  getSubscriberToken = (subscriber: Subscriber) => () => {
    return subscriber.connection.authToken;
  };

  subscribe(connection: Connection, message: WebsocketMessage) {
    const id = message.id;
    const event: string = message.message.event;

    const subscriber: Subscriber = { id, event, connection };

    // already subscribed
    if (connection.subscribers.find((sub) => sub.event === event)) {
      this.sendMessage(connection, {
        id,
        type: 'ERROR',
        error: { msg: `Already subscribed to ${event}` },
      });
      return;
    }

    // find the publisher
    const publisher = this.publishers.find((pub) => !!event.match(pub.eventMatch));
    if (!publisher) {
      this.sendMessage(connection, {
        id,
        type: 'ERROR',
        error: { msg: `No publishers found for the subscription ${event}` },
      });
      return;
    }

    // add the subscriber to the connection
    connection.subscribers.push(subscriber);

    // add the subscriber to the subscriptions
    const eventSubscription = this.subscriptions[event] || {
      event,
      subscribers: [],
      publisher,
    };
    this.subscriptions[event] = eventSubscription;
    eventSubscription.subscribers.push(subscriber);

    // tell the publisher to start publishing if this is the first
    if (eventSubscription.subscribers.length === 1) {
      eventSubscription.publisher.startPublishing(
        event.match(eventSubscription.publisher.eventMatch),
        this.messageAllSubscribers(eventSubscription),
        this.getAnyToken(eventSubscription),
      );
    }

    // tell the publisher about the new subscriber
    eventSubscription.publisher.newSubscriber(
      event.match(eventSubscription.publisher.eventMatch),
      this.messageSubscriber(subscriber),
      this.getSubscriberToken(subscriber),
    );
  }

  unsubscribe(connection: Connection, message: WebsocketMessage) {
    const id = message.id;
    const event: string = message.message.event;

    const eventSubscription = this.subscriptions[event];
    if (!eventSubscription) {
      // nobody ever subscribed to this event
      this.sendMessage(connection, {
        id,
        type: 'ERROR',
        error: { msg: `Not subscribed to ${event}` },
      });
      return;
    }
    const subscriber = eventSubscription.subscribers.find((sub) => sub.id === id);
    if (!subscriber) {
      // current connection is not subscribed to this event
      this.sendMessage(connection, {
        id,
        type: 'ERROR',
        error: { msg: `Not subscribed to ${event}` },
      });
      return;
    }

    // remove the subscriber from the connection
    // if the connection has no more subscribers, disconnect
    const connSubscribers = connection.subscribers;
    const connIndex = connSubscribers.indexOf(subscriber);
    if (connIndex !== -1) connSubscribers.splice(connIndex, 1);
    if (connSubscribers.length === 0) this.disconnect(subscriber.connection);

    // remove the subscriber from the subscriptions list for this event
    // if the event has no more subscribers, stop publishing
    const eventSubscribers = eventSubscription.subscribers;
    const subIndex = eventSubscribers.indexOf(subscriber);
    if (subIndex !== -1) eventSubscribers.splice(subIndex, 1);
    if (subIndex !== -1 && eventSubscribers.length === 0)
      eventSubscription.publisher.stopPublishing(
        subscriber.event.match(eventSubscription.publisher.eventMatch),
      );
  }

  cleanUpDeadSubscriptions() {
    Object.keys(this.subscriptions).forEach((event) => {
      const subscription = this.subscriptions[event];
      const subscribersBefore = subscription.subscribers.length;
      for (let i = subscription.subscribers.length - 1; i >= 0; i--) {
        const subscriber = subscription.subscribers[i];
        if (!this.connections.find((conn) => conn === subscriber.connection)) {
          subscription.subscribers.splice(i, 1);
        }
      }
      const subscribersAfter = subscription.subscribers.length;
      if (subscribersBefore !== 0 && subscribersAfter === 0) {
        subscription.publisher.stopPublishing(event.match(subscription.publisher.eventMatch));
      }
    });
  }

  authorize(connection: Connection, message: WebsocketMessage) {
    // TODO - add a few checks around the token
    // to handle the edge case of an authenticated user manually
    // injecting a bad token
    connection.authToken = message.message.token;
  }

  disconnect(conn: Connection) {
    const index = this.connections.indexOf(conn);
    if (index === -1) return;
    this.connections.splice(index, 1);
    conn.subscribers.forEach((sub) =>
      this.unsubscribe(conn, {
        id: sub.id,
        type: 'UNSUBSCRIBE',
        message: { event: sub.event },
      }),
    );
    conn.ws.terminate();

    this.cleanUpDeadSubscriptions();
  }

  errorHandler(conn: Connection, e: Error) {
    if (e.message === 'read ECONNRESET') {
      // the browser page was refreshed
      this.disconnect(conn);
      return;
    }
    console.error(e);
  }

  sendMessage(conn: Connection, message: WebsocketMessage) {
    try {
      conn.ws.send(JSON.stringify(message));
    } catch (e) {
      console.error('Could not Send', e);
      this.disconnect(conn);
    }
  }

  messageHandler(connection: Connection, msgStr: string) {
    connection.lastHeartbeat = Date.now();
    if (msgStr === 'PING') {
      try {
        connection.ws.send('PONG');
      } catch (e) {
        console.error('Could not Send', e);
        this.disconnect(connection);
      }
      return;
    }
    if (msgStr === 'PONG') return;
    let message: WebsocketMessage;
    try {
      message = JSON.parse(msgStr);
    } catch (e) {
      console.error(`Could not parse message ${msgStr}`);
      return;
    }
    if (message.type === 'SUBSCRIBE') this.subscribe(connection, message);
    if (message.type === 'UNSUBSCRIBE') this.unsubscribe(connection, message);
    if (message.type === 'AUTHORIZATION') this.authorize(connection, message);
  }

  registerPublisher(publisher: Publisher) {
    this.publishers.push(publisher);
  }

  connect = (ws: WebSocket) => {
    const conn = {
      ws,
      subscribers: <Subscriber[]>[],
      lastHeartbeat: 0,
      missedHeartbeats: 0,
      authToken: '',
      heartbeatTimeout: 0,
    };
    this.connections.push(conn);

    ws.on('close', () => this.disconnect(conn));
    ws.on('message', (message) => this.messageHandler(conn, message.toString()));
    ws.on('error', (e) => this.errorHandler(conn, e));
    ws.on('open', () => {
      this.sendHeartbeat(conn);
    });
  };

  sendHeartbeat = (connection: Connection) => {
    clearTimeout(connection.heartbeatTimeout);
    if (this.heartbeatInterval <= 0) return;
    if (!connection.ws.OPEN) {
      this.disconnect(connection);
      return;
    }
    const timeToNextHeartbeat = connection.lastHeartbeat + this.heartbeatInterval - Date.now();

    if (timeToNextHeartbeat * -1 > this.heartbeatInterval * 2) connection.missedHeartbeats++;
    else connection.missedHeartbeats = 0;

    if (timeToNextHeartbeat > 0) {
      setTimeout(() => this.sendHeartbeat(connection), timeToNextHeartbeat);
      return;
    }

    if (connection.missedHeartbeats > 2) {
      this.disconnect(connection);
      return;
    }

    try {
      connection.ws.send('PING');
    } catch (e) {
      console.error('Could not Send', e);
      this.disconnect(connection);
    }
    connection.heartbeatTimeout = setTimeout(
      () => this.sendHeartbeat(connection),
      this.heartbeatInterval,
    );
  };
}

export default new WebSocketManager();
