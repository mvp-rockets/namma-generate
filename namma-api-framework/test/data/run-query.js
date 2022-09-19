const { sequelize } = require("models");
module.exports = class RunQuery {
  constructor(query, queryParameter,plain=true) {
    this.query = query;
    this.queryParameter = queryParameter;
    this.plain=plain;
  }

  get() {
    return sequelize.query(this.query, {
      replacements: this.queryParameter,
      plain:this.plain
    });
  }
};
