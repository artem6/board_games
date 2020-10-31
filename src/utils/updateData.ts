import { config } from '../config';

export const updateData = async <T>(data: T, updateFn: { (d: T): T }, retries = 3): Promise<T> => {
  const res = await fetch(`${config('API_HOST')}update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (json.status === 'success') return json.data;
  else {
    if (retries <= 0) throw new Error('Could not update');
    await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 1000)));
    return updateData(updateFn(json.data), updateFn, retries - 1);
  }
};
