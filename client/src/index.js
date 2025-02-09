import React from 'react';
import { render } from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';
import App from './components/App.js';
import Blocks from './components/Blocks.js';
import ConductTransaction from './components/ConductTransaction.js';
import TransactionPool from './components/TransactionPool.js';
import './index.css';

render(
    <Router history={history}>
        <Switch>
            <Route exact path="/" component={App} />
            <Route path='/blocks' component={Blocks} />
            <Route path='/conduct-transaction' component={ConductTransaction} />
            <Route path='/transaction-pool' component={TransactionPool} />
        </Switch>
    </Router>,
    document.getElementById('root')
);

