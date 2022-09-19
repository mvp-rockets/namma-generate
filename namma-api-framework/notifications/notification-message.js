module.exports = class NotificationMessage {
    constructor(message) {
        this.message = message;
   
         console.log(this.message);
        const messageTokens = this.message.match(/<[\w]*>/g);
        this.tokens = {};
        const self = this;
        if (messageTokens) {
            messageTokens.forEach((token) => {
                const shortenToken = token.replace('<', '').replace('>', '');
                self.tokens[shortenToken] = token;
            });
        }
    }

    getTokens() {
        return Object.keys(this.tokens);
    }

    format(record) {
        let { message } = this;
        for (const key in this.tokens) {
            const expression = new RegExp(this.tokens[key], 'g');
            if (record[key]) message = message.replace(expression, record[key]);
        }
        return message;
    }
};
