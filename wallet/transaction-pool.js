class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        if (!transaction || !transaction.id) {
            throw new Error('Invalid transaction');
        }
        this.transactionMap[transaction.id] = transaction;
    }


    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap);
        return transactions.find(transaction => transaction.input.address === inputAddress);
    }
}

export default TransactionPool;