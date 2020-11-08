import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import GamePicker from './GamePicker';
import { Pears } from './pearsToPears/pears';
import { Categories } from './categories/categories';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <Redirect to='/board_games' />
        </Route>
        <Route exact path='/board_games'>
          <GamePicker />
        </Route>
        <Route exact path='/board_games/pears'>
          <Pears />
        </Route>
        <Route exact path='/board_games/categories'>
          <Categories />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
