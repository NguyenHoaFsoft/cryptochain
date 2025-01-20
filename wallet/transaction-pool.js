import Transaction from './transaction.js';
class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    clear() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        if (!transaction || !transaction.id) {
            throw new Error('Invalid transaction: Missing transaction or transaction ID');
        }

        this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap);
        return transactions.find(transaction => transaction.input.address === inputAddress);
    }

    validTransactions() {
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction)
        );
    }

    clearBlockchainTransactions({ chain }) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            console.log('Current block:', block);
    
            // if (Array.isArray(block.data)) {
            //     block.data.forEach(transaction => {
            //         delete this.transactionMap[transaction.id];
            //     });
            // }
            for (let transaction of block.data.data) {
                if (this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
    
}

export default TransactionPool;