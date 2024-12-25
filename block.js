import GENESIS_DATA from './config.js';
import cryptoHash from './crypto-hash';

class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }) {
        let hash, timestamp;
        // const timestamp = Date.now();
        const lastHash = lastBlock.hash;
        const { difficulty } = lastBlock;
        let nonce = 0;
        do {
            nonce++;
            timestamp = Date.now();
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({
            timestamp,
            data,
            lastHash, 
            hash: cryptoHash(timestamp, lastHash, data, nonce, difficulty),
            difficulty,
            nonce
        });
    }
}
export default Block;