/* global describe:true, it:true */
'use strict';

// Constants:
import constants from '../constants';

// Utilities:
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Test setup:
const expect = chai.expect;
chai.use(sinonChai);

// Under test:
import TractorError from './TractorError';

describe('server/errors: TractorError:', () => {
    it('should create a new TractorError', () => {
        let error = new TractorError();

        expect(error).to.be.an.instanceof(TractorError);
        expect(error.name).to.equal('TractorError');
    });

    it('should inherit from Error', () => {
        let error = new TractorError();

        expect(error).to.be.an.instanceof(Error);
    });

    it('should have an error message', () => {
        let error = new TractorError('message');

        expect(error.message).to.equal('message');
    });

    it('should have a status code', () => {
        let error = new TractorError(null, constants.REQUEST_ERROR);

        expect(error.status).to.equal(constants.REQUEST_ERROR);
    });

    it('should have an default status of 500', () => {
        let error = new TractorError();

        expect(error.status).to.equal(constants.SERVER_ERROR);
    });

    it('should capture the stack trace', () => {
        sinon.stub(Error, 'captureStackTrace');

        /* eslint-disable */
        let error = new TractorError();
        /* eslint-enable */

        expect(Error.captureStackTrace).to.have.been.called();

        Error.captureStackTrace.restore();
    });
});
