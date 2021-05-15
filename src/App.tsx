import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import GamePicker from './GamePicker/GamePicker';
import { Pears } from './games/pearsToPears/pears';
import { Categories } from './games/categories/categories';
import { OnlyOne } from './games/onlyOne/onlyOne';
import { ArtistSF } from './games/artistSF/artistSF';
import { StraightLines } from './games/straightLines/straightLines';
import { Sequencing } from './games/sequencing/sequencing';

function App() {
  return (
    <Router basename='/board_games'>
      <Switch>
        <Route exact path='/' render={(props) => <GamePicker {...props} />}></Route>
        <Route exact path='/pears' render={(props) => <Pears {...props} />}></Route>
        <Route exact path='/categories' render={(props) => <Categories {...props} />}></Route>
        <Route exact path='/onlyone' render={(props) => <OnlyOne {...props} />}></Route>
        <Route exact path='/artistsf' render={(props) => <ArtistSF {...props} />}></Route>
        <Route exact path='/straightlines' render={(props) => <StraightLines {...props} />}></Route>
        <Route exact path='/sequencing' render={(props) => <Sequencing {...props} />}></Route>
      </Switch>
    </Router>
  );
}

export default App;
