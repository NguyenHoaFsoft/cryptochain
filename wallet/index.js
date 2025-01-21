import { STARTING_BALANCE } from "../config.js";
import { ec, cryptoHash } from "../util/index.js"; // Import `ec` từ util
import Transaction from "./transaction.js";

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;
        this.keyPair = ec.genKeyPair(); // Truy cập trực tiếp ec
        this.publicKey = this.keyPair.getPublic().encode("hex");
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ recipient, amount, chain }) {
        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey,
            });
        }

        if (amount > this.balance) {
            throw new Error("Amount exceeds balance");
        }
        return new Transaction({ senderWallet: this, recipient, amount });
    }

    calculateBalance({ chain, address }) {
        let outputsTotal = 0;
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            for (let transaction of block.data.data) {
                const addressOutput = transaction.outputMap[address];
                if (addressOutput) {
                    outputsTotal = outputsTotal + addressOutput;
                }
            }
        }

        return STARTING_BALANCE + outputsTotal;
    }
}

export default Wallet;
