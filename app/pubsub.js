import bodyParser from 'body-parser';
const { json } = bodyParser;
import redis from 'redis';
import { v1 as uuidv1 } from 'uuid';

function isValidJSON(string) {
    try {
        JSON.parse(string);
        return true;
    } catch (e) {
        return false;
    }
}

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION',
    TRANSACTION_POOL: 'TRANSACTION_POOL'
};

class PubSub {
    constructor({ blockchain, transactionPool }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        // Tạo UUID cho instance hiện tại
        this.instanceId = uuidv1();

        // Kết nối Redis clients
        this.publisher.connect().catch(err => console.error('Publisher error:', err));
        this.subscriber.connect().catch(err => console.error('Subscriber error:', err));

        // Lắng nghe các kênh
        this.subscribeToChannels();
    }

    async handleMessage(channel, message) {
        let parsedMessage;

        // Kiểm tra xem message có phải JSON hợp lệ không
        if (!isValidJSON(message)) {
            console.error(`Invalid message received on channel ${channel}:`, message);
            return;
        }

        parsedMessage = JSON.parse(message);
        const { instanceId, payload } = parsedMessage;

        if (instanceId === this.instanceId) {
            console.log(`Ignored message from self. Channel: ${channel}`);
            return;
        }

        console.log(`Message received. Channel: ${channel}. Message: ${JSON.stringify(payload)}`);

        if (!isValidJSON(payload)) {
            console.error('Failed to parse payload:', payload);
            return;
        }

        const parsedPayload = JSON.parse(payload);

        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedPayload, true, () => {
                    this.transactionPool.clearBlockchainTransactions({ chain: parsedPayload });
                });
                this.broadcastChain();
                break;
            case CHANNELS.TRANSACTION:
                if (!parsedPayload || !parsedPayload.id) {
                    console.error('Invalid transaction payload received:', parsedPayload);
                    return;
                }
                try {
                    this.transactionPool.setTransaction(parsedPayload);
                } catch (error) {
                    console.error('Failed to set transaction:', error.message);
                }
                break;
            case CHANNELS.TRANSACTION_POOL:
                console.log('Received TRANSACTION_POOL message:', parsedPayload);

                if (!parsedPayload || typeof parsedPayload !== 'object') {
                    console.error('Invalid TRANSACTION_POOL payload received:', parsedPayload);
                    return;
                }

                let poolData = parsedPayload.transactionPoolMap;

                // Nếu `transactionPoolMap` là JSON string, parse nó
                if (typeof poolData === 'string') {
                    try {
                        poolData = JSON.parse(poolData);
                    } catch (error) {
                        console.error('Failed to parse transactionPoolMap:', error);
                        return;
                    }
                }

                if (typeof poolData !== 'object') {
                    console.error('Invalid transactionPoolMap structure:', poolData);
                    return;
                }

                console.log('Applying transaction pool update:', poolData);
                this.transactionPool.setMap(poolData);
                console.log('Updated transaction pool:', JSON.stringify(this.transactionPool.transactionMap, null, 2));
                break;



            default:
                console.error(`Unknown channel: ${channel}`);
        }
    }

    async subscribeToChannels() {
        for (const channel of Object.values(CHANNELS)) {
            try {
                await this.subscriber.subscribe(channel, (message) => {
                    // Không parse message ở đây, để handleMessage tự xử lý
                    this.handleMessage(channel, message);
                });
                console.log(`Subscribed to channel: ${channel}`);
            } catch (error) {
                console.error(`Failed to subscribe to channel ${channel}:`, error);
            }
        }
    }
    

    async publish({ channel, message }) {
        let wrappedMessage;

        try {
            wrappedMessage = JSON.stringify({
                instanceId: this.instanceId, // Đính kèm UUID của instance phát
                payload: message, // Nội dung thực tế
            });
        } catch (error) {
            console.error('Failed to stringify message payload:', message, error);
            return;
        }

        try {
            console.log(`Publishing message. Channel: ${channel}, Message: ${wrappedMessage}`);
            await this.publisher.publish(channel, wrappedMessage);
        } catch (error) {
            console.error(`Failed to publish message: ${error}`);
        }
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: this.blockchain.chain,
        });
    }

    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        });
    }

    broadcastTransactionPool(transactionPoolMap) {
        this.publish({
            channel: CHANNELS.TRANSACTION_POOL,
            message: JSON.stringify({ transactionPoolMap }) // Gửi object có key transactionPoolMap
        });
    }

}

export default PubSub;
