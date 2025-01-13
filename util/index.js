import elliptic from 'elliptic';
const EC = elliptic.ec;

import cryptoHash from './crypto-hash.js';

const ec = new EC('secp256k1');

const verifySignature = ({ publicKey, data, signature }) => {
    try {
        const keyFromPublic = ec.keyFromPublic(publicKey, 'hex'); // Parse khóa công khai
        return keyFromPublic.verify(cryptoHash(data), signature); // Xác minh chữ ký
    } catch (error) {
        console.error("Invalid public key or signature:", error.message); // Debug lỗi
        return false; // Trả về false nếu khóa công khai không hợp lệ
    }
};


// Export riêng từng thành phần
export { ec, verifySignature, cryptoHash };
