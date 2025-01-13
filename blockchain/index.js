import Block from "./block.js";
import {cryptoHash} from "../util";

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
    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        console.log('Replacing chain with', chain);
        this.chain = chain;
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