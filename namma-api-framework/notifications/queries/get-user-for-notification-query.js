module.exports = class GetUserForNotificationQuery {
    constructor(userId) {
        this.details = { 
            userId
        };
    }

    parameter() {
        return this.details;
    }

    get() {
        return 'match(user:User{id:$userId})\
        return user{.id, .mobile}';
    }

    transform(record) {
        return record.get('user');
    }
};
