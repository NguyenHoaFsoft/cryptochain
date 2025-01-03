const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: 'GENESIS_HASH',
    hash: 'hash-one',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

export { GENESIS_DATA, MINE_RATE };
export default { GENESIS_DATA, MINE_RATE };
