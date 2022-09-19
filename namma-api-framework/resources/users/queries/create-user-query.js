const Models = require('models');

module.exports = class CreateUserQuery {
    constructor(details) {
        this.id = details.id;
        this.name = details.name;
    }

    get() {
        return Models.User.create({ id: this.id, name: this.name });
    }
};
