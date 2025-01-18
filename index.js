import bodyParser from 'body-parser';
import express from 'express';
import request from 'request';
import Blockchain from './blockchain/index.js';
import PubSub from './app/pubsub.js';
import TransactionPool from './wallet/transaction-pool.js';
import Wallet from './wallet/index.js';

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const { recipient, amount } = req.body;
    let transaction = transactionPool
        .existingTransaction({ inputAddress: wallet.publicKey });

    try {
        if (transaction) {
            console.log('Updating existing transaction...');
            transaction.update({ senderWallet: wallet, nextRecipient: recipient, nextAmount: amount });
        } else {
            console.log('Creating new transaction...');
            transaction = wallet.createTransaction({ recipient, amount });
        }
    } catch (error) {
        console.error('Transaction failed:', error.message);
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
    console.log('Transaction Pool:', JSON.stringify(transactionPool, null, 2));
    res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`Listening at localhost: ${PORT}`);

    if (PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }

});