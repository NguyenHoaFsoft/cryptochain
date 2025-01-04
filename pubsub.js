import { createClient } from 'redis';

const CHANNELS = {
    TEST: 'TEST',
};

class PubSub {
    constructor() {
        this.publisher = createClient();
        this.subscriber = createClient();

        // Connect both publisher and subscriber
        this.publisher.connect();
        this.subscriber.connect();

        this.subscriber.subscribe(CHANNELS.TEST, (message) => {
            this.handleMessage(CHANNELS.TEST, message);
        });
    }

    handleMessage(channel, message) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}`);
    }

    publish(channel, message) {
        this.publisher.publish(channel, message);
    }
}

// Testing PubSub
const testPubSub = new PubSub();

setTimeout(() => {
    testPubSub.publish(CHANNELS.TEST, 'Hello world');
}, 1000); // Publish after 1 second to allow connections to establish
