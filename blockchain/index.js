import Block from "./block.js";
import Transaction from "../wallet/transaction.js";
import cryptoHash from "../util/crypto-hash.js";
import { MINING_REWARD, REWARD_INPUT } from "../config.js";
import Wallet from "../wallet/index.js";

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock(data) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);
        return newBlock;
    };
    replaceChain(chain, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        if (onSuccess) onSuccess();
        console.log('Replacing chain with', chain);
        this.chain = chain;
    }

    validTransactionData({ chain }) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            let rewardTransactionCount = 0;

            for (let transaction of block.data.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;
                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceed limit');
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid transaction');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount');
                        return false;
                    }
                }
            }
        }
        return true;
    }

    static isValidChain(chain) {
        if (!chain.length) return false;

        const genesisBlock = Block.genesis();
        if (
            chain[0].timestamp !== genesisBlock.timestamp ||
            chain[0].lastHash !== genesisBlock.lastHash ||
            chain[0].hash !== genesisBlock.hash ||
            chain[0].data !== genesisBlock.data ||
            chain[0].nonce !== genesisBlock.nonce ||
            chain[0].difficulty !== genesisBlock.difficulty
        ) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
            const actualLastHash = chain[i - 1].hash;

            if (lastHash !== actualLastHash) return false;

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (hash !== validatedHash) return false;

            const lastDifficulty = chain[i - 1].difficulty;
            if (Math.abs(lastDifficulty - difficulty) > 1) return false;
        }
        return true;
    }



}


export default Blockchain;