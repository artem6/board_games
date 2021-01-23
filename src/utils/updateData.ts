import { config } from '../config';

export const updateData = async <T>(
  data: T,
  updateFn: { (d: T): T | null },
  retries = 5,
  wait = 50,
): Promise<T> => {
  const newData = updateFn(data);
  if (!newData) return data;
  const res = await fetch(`${config('API_HOST')}update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newData),
  });
  const json = JSON.parse(await res.text());
  if (json.status === 'success') return json.data;
  else {
    if (retries <= 0) throw new Error('Could not update');
    await new Promise((r) => setTimeout(r, Math.floor(Math.random() * wait)));
    return updateData(json.data, updateFn, retries - 1, wait * 2);
  }
};

export const getData = async <T>(id: string): Promise<T> => {
  const res = await fetch(`${config('API_HOST')}get/${id}`);
  const json = await res.json();
  return json;
};

export const primeServer = () => fetch(`${config('API_HOST')}`);
