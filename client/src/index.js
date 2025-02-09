import React from 'react';
import ReactDOM from 'react-dom/client';  
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import App from './components/App';  // Đảm bảo đường dẫn đúng
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction';
import TransactionPool from './components/TransactionPool';
import './index.css';

// Kiểm tra nếu import bị lỗi
console.log({ App, Blocks, ConductTransaction, TransactionPool });

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Router>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/blocks" element={<Blocks />} />
            <Route path="/conduct-transaction" element={<ConductTransaction />} />
            <Route path="/transaction-pool" element={<TransactionPool />} />
        </Routes>
    </Router>
);



