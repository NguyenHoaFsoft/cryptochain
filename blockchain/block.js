import { GENESIS_DATA, MINE_RATE } from '../config.js';
import cryptoHash from '../util/crypto-hash.js';
import hexToBinary from 'hex-to-binary';

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
        const lastHash = lastBlock.hash;
        let hash, timestamp;
        let { difficulty } = lastBlock;
        let nonce = 0;
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({
            timestamp,
            data,
            lastHash,
            hash: cryptoHash(timestamp, lastHash, data, nonce, difficulty),
            difficulty,
            nonce
        });
    }

    static adjustDifficulty({ originalBlock, timestamp }) {
        const { difficulty } = originalBlock;
        if (difficulty < 1) return 1;
        if ((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty - 1;
        return difficulty + 1;
    }
}
export default Block;