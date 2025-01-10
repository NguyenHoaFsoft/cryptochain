import redis from 'redis';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg; // Sử dụng cách import tương thích với CommonJS

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
};

class PubSub {
    constructor({ blockchain }) {
        this.blockchain = blockchain;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        // Tạo UUID cho instance hiện tại
        this.instanceId = uuidv4();

        // Kết nối Redis clients
        this.publisher.connect().catch(err => console.error('Publisher error:', err));
        this.subscriber.connect().catch(err => console.error('Subscriber error:', err));

        // Lắng nghe các kênh
        this.subscribeToChannels();
    }

    async handleMessage(channel, message) {
        const parsedMessage = JSON.parse(message);
        const { instanceId, payload } = parsedMessage;

        // Bỏ qua thông điệp từ chính instance
        if (instanceId === this.instanceId) {
            console.log(`Ignored message from self. Channel: ${channel}`);
            return;
        }

        console.log(`Message received. Channel: ${channel}. Message: ${JSON.stringify(payload)}`);

        if (channel === CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(payload);
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
}

export default PubSub;
