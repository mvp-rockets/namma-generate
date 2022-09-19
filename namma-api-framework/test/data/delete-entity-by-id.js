const Models = require('models');

module.exports = class DeleteEntityById {
    constructor(id, modelName) {
        this.details = {
            id,
            modelName
        };
    }

    async get() {
        const deletedRow = await Models[this.details.modelName].destroy({
            where: {
                id: this.details.id
            },
            force: true
        });
        return deletedRow;
    }
};
