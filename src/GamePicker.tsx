import React from 'react';
import { Link } from 'react-router-dom';

function GamePicker() {
  return (
    <div>
      <h1>Pick a game</h1>

      <div>
        <Link to='/board_games/pears'>Pears</Link>
      </div>
      <div>
        <Link to='/board_games/categories'>Categories</Link>
      </div>
    </div>
  );
}

export default GamePicker;
