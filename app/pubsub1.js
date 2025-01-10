import Pubnub from "pubnub";

const credentials = {
    publishKey: "pub-c-695b2dee-c6a5-483d-a509-dc016cd86a02",
    subscribeKey: "sub-c-c5413014-39e1-4230-afe1-32eeaea50b45",
    secretKey: "sec-c-N2U5YmUzOTQtZGE2ZS00NzZlLWJjNTItZDk4ZTU1YzNmMWFm"
};

const CHANNELS = {
    TEST: 'TEST'
};

class PubSub {
    constructor() {
        this.pubnub = new Pubnub(credentials);

        this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

        this.pubnub.addListener(this.listener());
    }

    listener() {
        return {
            message: messageObject => {
                const { channel, message } = messageObject;
                console.log(`Message received. Channel: ${channel}. Message: ${message}`);
            }
        }
    }

    publish({ channel, message }) {
        this.pubnub.publish({ channel, message });
    }
}

export default PubSub;