const { HTTP_CONSTANT } = require('@mvp-rockets/namma-lib');
const { ApiError } = require('lib')
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const TestRoutes = require('helpers/test-route');
const db = require('db/repository');
const {
    resolveOk,
    resolveError
} = require('helpers/resolvers');
const { verifyArgs } = require('helpers/verifiers');
const GetUsersQuery = require('resources/users/queries/get-users-query');

const { expect } = chai;
chai.use(sinonChai);

describe('Get users api', () => {
    const sandbox = sinon.createSandbox();
    let req;
    let res;
    let result;
    beforeEach(() => {
        res = {
            setHeader: sandbox.spy(),
            send: sandbox.spy(),
            status: sandbox.spy(() => res)
        };
        result = {
            count: 1,
            rows: [
                {
                    name: 'check',
                    email: 'check@gmail.com'
                }
            ]
        };
    });

    it('should return users for a valid request', async () => {
        sandbox
            .mock(db)
            .expects('find')
            .withArgs(verifyArgs((query) => {
                expect(query).to.be.instanceOf(GetUsersQuery);
            }))
            .returns(resolveOk(result));

        const response = await TestRoutes.execute('/users', 'Get', req, res);
        expect(response).to.eql(
            {
                status: true,
                message: 'Successfully get users!',
                entity: result
            }
        );
    });

    it('should return error when something goes wrong', async () => {
        sandbox.stub(db, 'find').returns(resolveError('Something went wrong'));
        const response = await TestRoutes.executeWithError('/users', 'Get', req, res);
        expect(response).to.eql(new ApiError('Something went wrong', 'Failed to get users!', HTTP_CONSTANT.INTERNAL_SERVER_ERROR));
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
    });
});
