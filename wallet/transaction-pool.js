import Transaction from './transaction.js';
class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        if (!transaction || !transaction.id) {
            throw new Error('Invalid transaction: Missing transaction or transaction ID');
        }

        // Sử dụng Transaction.validTransaction để kiểm tra tính hợp lệ
        if (!Transaction.validTransaction(transaction)) {
            throw new Error('Invalid transaction: Failed validation');
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
}

export default TransactionPool;