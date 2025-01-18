import bodyParser from 'body-parser';
const { json } = bodyParser;
import redis from 'redis';
import { v1 as uuidv1 } from 'uuid';

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
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
        const parsedMessage = JSON.parse(message);
        const { instanceId, payload } = parsedMessage;

        if (instanceId === this.instanceId) {
            console.log(`Ignored message from self. Channel: ${channel}`);
            return;
        }

        console.log(`Message received. Channel: ${channel}. Message: ${JSON.stringify(payload)}`);
        // Parse thêm payload nếu cần
        let parsedPayload;
        try {
            parsedPayload = JSON.parse(payload);
        } catch (error) {
            console.error('Failed to parse payload:', payload);
            return;
        }
        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedPayload);
                break;
            case CHANNELS.TRANSACTION:
                // Kiểm tra xem parsedPayload có hợp lệ không
                if (!parsedPayload || !parsedPayload.id) {
                    console.error('Invalid transaction parsedPayload received:', parsedPayload);
                    return;
                }
                try {
                    this.transactionPool.setTransaction(parsedPayload);
                } catch (error) {
                    console.error('Failed to set transaction:', error.message);
                }
                break;
            default:
                console.error(`Unknown channel: ${channel}`);
        }
    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach(async (channel) => {
            await this.subscriber.subscribe(channel, (message) => {
                this.handleMessage(channel, message);
            });
        });
    }

    async publish({ channel, message }) {
        const wrappedMessage = JSON.stringify({
            instanceId: this.instanceId, // Đính kèm UUID của instance phát
            payload: message, // Nội dung thực tế
        });

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
}

export default PubSub;
