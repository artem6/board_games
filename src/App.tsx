import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { useServerData } from './useServerData';
import { config } from './config';

function App() {
  const val = useServerData('abc');

  return (
    <div className='App'>
      <button
        onClick={async () => {
          const res = await fetch(`${config('API_HOST')}update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: 'abc', version: 0, ...val, test: 'xyz' }),
          });
          const json = await res.json();
        }}
      >
        add
      </button>
      <pre>{JSON.stringify(val, null, 4)}</pre>
    </div>
  );
}

export default App;
