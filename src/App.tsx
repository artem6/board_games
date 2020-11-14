import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import GamePicker from './GamePicker/GamePicker';
import { Pears } from './pearsToPears/pears';
import { Categories } from './categories/categories';

/*


TODO
 - finish game after a set number of turns, and show winner
 - allow joining game via a code, without picking game first






*/

function App() {
  return (
    <Router basename='/board_games'>
      <Switch>
        <Route exact path='/' render={(props) => <GamePicker {...props} />}></Route>
        <Route exact path='/pears' render={(props) => <Pears {...props} />}></Route>
        <Route exact path='/categories' render={(props) => <Categories {...props} />}></Route>
      </Switch>
    </Router>
  );
}

export default App;
