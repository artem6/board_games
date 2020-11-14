import { Publisher } from './websocketManager';

interface DataType {
  id: string;
  version: number;
  lastUpdated: number;
}

const allData: { [id: string]: DataType } = {};

// clean up old games
setInterval(() => {
  Object.keys(allData).forEach((key) => {
    if (allData[key] && allData[key].lastUpdated + 30 * 60 * 1000 < Date.now()) delete allData[key];
  });
}, 60 * 1000);

export const getData = (id: string) => {
  return (
    allData[id] ||
    allData['EntityChange:' + id] || { id: id.replace('EntityChange:', ''), version: 0 }
  );
};

let publishers: {
  [id: string]: {
    event: RegExpMatchArray;
    messageAllSubscribers: { (message: object): void };
  };
} = {};

export const updateData = (val: DataType) => {
  if (!val.id) throw new Error('Missing id');
  if (typeof val.version !== 'number') throw new Error('Version must be an integer');

  const key = `EntityChange:${val.id}`;
  console.log('change', key);

  if (!allData[key]) allData[key] = val;
  else {
    if (allData[key].version !== val.version) {
      return { status: 'failure', data: allData[key] };
    }
    allData[key] = val;
  }
  const data = allData[key];
  data.version++;
  data.lastUpdated = Date.now();

  publishers[key]?.messageAllSubscribers(data);

  return { status: 'success', data };
};

class EntityUpdatePublisher implements Publisher {
  eventMatch = /EntityChange:(.*)/;

  startPublishing = (
    event: RegExpMatchArray | null,
    messageAllSubscribers: { (message: object): void },
  ) => {
    if (!event) return;
    const id = event[0];
    console.log('start pub', id);
    publishers[id] = { event, messageAllSubscribers };
  };
  stopPublishing = (event: RegExpMatchArray | null) => {
    if (!event) return;
    const id = event[0];
    console.log('stop pub', id);
    delete publishers[id];
  };
  newSubscriber = (
    event: RegExpMatchArray | null,
    messageSubscriber: { (message: object): void },
  ) => {
    if (!event) return;
    const id = event[0];
    console.log('subscriber', id);
    messageSubscriber(getData(id));
  };
}

export const dataUpdatePublisher = new EntityUpdatePublisher();
