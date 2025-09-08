import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TradeExplanation from './components/TradeExplanation';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/trade-explanation" component={TradeExplanation} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;