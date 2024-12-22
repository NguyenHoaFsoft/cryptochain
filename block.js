import GENESIS_DATA from './config.js';
import cryptoHash from './crypto-hash';

class Block {
    constructor({ timestamp, lastHash, hash, data }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }) {
        const timestamp = Date.now();
        const lastHash = lastBlock.hash;
        
        return new this({
            timestamp,
            lastHash,
            hash: cryptoHash(timestamp, lastHash, data),
            data
        });
    }
}
export default Block;