const Route = require('route');
const { respond, logInfo } = require('lib');
const GetUsersQuery = require('resources/users/queries/get-users-query');
const db = require('db/repository.js');
async function get(req) {
    logInfo('Request to get users api ', {});

    const result = await db.find(new GetUsersQuery());
    return respond(result, 'Successfully get users!', 'Failed to get users!');
}

Route.withOutSecurity().noAuth().get('/users', get).bind();

module.exports.get = get;
