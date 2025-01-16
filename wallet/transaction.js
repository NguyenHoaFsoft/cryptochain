import pkg from 'uuid';
const { v1: uuidv1 } = pkg;
import { verifySignature } from '../util/index.js';

class Transaction {
    constructor({ senderWallet, recipient, amount }) {
        this.id = uuidv1();
        this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        };
    }

    update({ senderWallet, nextRecipient, nextAmount }) {
        if (nextAmount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        }

        // Deduct amount from sender
        this.outputMap[senderWallet.publicKey] -= nextAmount;

        // Add the amount to the recipient
        if (!this.outputMap[nextRecipient]) {
            this.outputMap[nextRecipient] = nextAmount;
        } else {
            this.outputMap[nextRecipient] += nextAmount;
        }

        // Update the input with the new signature
        this.input = {
            ...this.input,
            amount: Object.values(this.outputMap).reduce((total, output) => total + output),
            signature: senderWallet.sign(this.outputMap),
        };
    }


    static validTransaction(transaction) {
        const { input: { address, amount, signature }, outputMap } = transaction;
        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount);
        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }
        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }
        return true;
    }
}

export default Transaction;