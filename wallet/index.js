import { STARTING_BALANCE } from "../config";
import { ec } from "../util/index.js"; // Import `ec` từ util
import cryptoHash from "../util/crypto-hash.js";

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair(); // Truy cập trực tiếp ec
        this.publicKey = this.keyPair.getPublic().encode("hex");
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }
}

export default Wallet;
