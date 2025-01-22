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

    static calculateBalance({ chain, address }) {
        let hasConductedTransaction = false;
        let outputsTotal = 0;
        for (let i = chain.length - 1; i > 0; i--) {
            const block = chain[i];
            for (let transaction of block.data.data) {
                if (transaction.input.address === address) {
                    hasConductedTransaction = true;
                }
                const addressOutput = transaction.outputMap[address];
                if (addressOutput) {
                    outputsTotal = outputsTotal + addressOutput;
                }
            }
            if (hasConductedTransaction) {
                break;
            }
        }

        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
    }
}

export default Wallet;
