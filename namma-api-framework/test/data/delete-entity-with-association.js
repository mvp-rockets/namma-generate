const R = require('ramda');
module.exports = class DeleteEntityWithAssociation {

	constructor(query, parameter) {
		var entities = query.match(/\(:[\w,:,{,}]+\)/g)
		var entitiesToDelete = [];
		query = R.replace(/\(:/, "(entity" + 0 + ":", query)
		query = R.replace(/\)/, "{id:{id}})", query)
		for (var i = 1; i < entities.length; i++) {
			query = R.replace(/\(:/, "(entity" + i + ":", query)
			entitiesToDelete.push("entity" + i);

		}
		var queryToDelete = "detach delete " + entitiesToDelete.join(',')
		var finalQuery = "match" + query + " " + queryToDelete + " return true";
		this.detail = {
			query: finalQuery,
			parameter: parameter
		}
	}

	get() {
		return this.detail.query;
	}

	parameter() {
		return this.detail.parameter;
	}
};