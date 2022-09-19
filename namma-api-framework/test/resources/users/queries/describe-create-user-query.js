const chai = require('chai');
const { verifyResultOk } = require('helpers/verifiers');
const db = require('db/repository');
const ds = require('helpers/dataSetup');
const runQuery = require('data/run-query');
const createUserQuery = require('resources/users/queries/create-user-query');

const { expect } = chai;

describe('create users query', () => {
    let user;

    beforeEach(async () => {
        user = await ds.buildSingle(ds.user);
    });

    it('should create user', async () => {
        const createdUser = await db.execute(new createUserQuery({ id: user.id, name: user.name }));
        verifyResultOk(
            (createdUser) => {
                expect(createdUser.dataValues.id).to.eql(user.id);
                expect(createdUser.dataValues.name).to.eql(user.name);
            }
        )(createdUser);

        const fetchedUser = await db.execute(new runQuery('select * from public."users" where id=:id', { id: user.id }));

        verifyResultOk(
            (fetchedUser) => {
                expect(fetchedUser.id).to.eql(user.id);
                expect(fetchedUser.name).to.eql(user.name);
            }
        )(fetchedUser);
    });

    after(async () => {
        await ds.deleteAll();
    });
});
