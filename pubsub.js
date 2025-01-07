import redis from 'redis';

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
};

class PubSub {
    constructor({ blockchain }) {
        this.blockchain = blockchain;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        // Kết nối Redis clients
        this.publisher.connect().catch(err => console.error('Publisher error:', err));
        this.subscriber.connect().catch(err => console.error('Subscriber error:', err));

        // Lắng nghe các kênh
        this.subscribeToChannels();
    }

    async handleMessage(channel, message) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}`);
        const parsedMessage = JSON.parse(message);

        if (channel === CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parsedMessage);
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
        try {
            if (!this.publisher.isOpen) {
                await this.publisher.connect();
            }

            await this.publisher.publish(channel, message);
        } catch (error) {
            console.error('Error publishing message:', error);
        }
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain),
        });
    }
}

export default PubSub;
