const { User } = require('models');
module.exports = class GetUsersQuery {
    get() {
        return User.findAll();
    }
}