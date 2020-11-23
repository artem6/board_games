import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import GamePicker from './GamePicker/GamePicker';
import { Pears } from './games/pearsToPears/pears';
import { Categories } from './games/categories/categories';
import { OnlyOne } from './games/onlyOne/onlyOne';

function App() {
  return (
    <Router basename='/board_games'>
      <Switch>
        <Route exact path='/' render={(props) => <GamePicker {...props} />}></Route>
        <Route exact path='/pears' render={(props) => <Pears {...props} />}></Route>
        <Route exact path='/categories' render={(props) => <Categories {...props} />}></Route>
        <Route exact path='/onlyone' render={(props) => <OnlyOne {...props} />}></Route>
      </Switch>
    </Router>
  );
}

export default App;
