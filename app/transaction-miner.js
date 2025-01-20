import Transaction from '../wallet/transaction.js';

class TransactionMiner {
    constructor({ blockchain, transactionPool, wallet, pubsub }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        // Get the transaction pool's valid transactions
        const validTransactions = this.transactionPool.validTransactions();

        validTransactions.push(
            Transaction.rewardTransaction({ minerWallet: this.wallet })
        );

        // Generate the miner's reward
        this.blockchain.addBlock({data: validTransactions});

        this.pubsub.broadcastChain();

        this.transactionPool.clear();



    }
}

export default TransactionMiner;