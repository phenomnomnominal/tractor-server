/* global describe:true, it:true */
'use strict';

// Constants:
import constants from '../constants';

// Utilities:
import _ from 'lodash';
import chai from 'chai';
import mockery from 'mockery';
import sinon from 'sinon';

// Test setup:
const expect = chai.expect;

// Dependencies:
import path from 'path';

// Under test:
import { createConfig } from './config';

describe('server/config: config:', () => {
    it('returns the default config when there is not a `tractor.conf.js` file', () => {
        sinon.stub(path, 'join').returns('');

        let config = createConfig();

        expect(config.testDirectory).to.equal('./e2e-tests');
        expect(config.port).to.equal(constants.DEFAULT_PORT);
        expect(config.environments).to.deep.equal(['http://localhost:8080']);
        expect(config.beforeProtractor).to.equal(_.noop);
        expect(config.afterProtractor).to.equal(_.noop);

        path.join.restore();
    });

    it('returns the custom values from a `tractor.conf.js` file', () => {
        sinon.stub(path, 'join').returns('./mock.conf');
        mockery.enable();
        mockery.registerMock('./mock.conf', {
            testDirectory: './tests'
        });

        let config = createConfig();

        expect(config.testDirectory).to.equal('./tests');

        path.join.restore();
        mockery.deregisterMock('./mock.conf');
        mockery.disable();
    });

    it('returns default values for properties that are not overridden by the user', () => {
        sinon.stub(path, 'join').returns('./mock.conf');
        mockery.enable();
        mockery.registerMock('./mock.conf', {
            testDirectory: './tests'
        });

        let config = createConfig();

        expect(config.port).to.equal(constants.DEFAULT_PORT);

        path.join.restore();
        mockery.deregisterMock('./mock.conf');
        mockery.disable();
    });
});
