/* global describe:true, it:true */
'use strict';

// Constants:
import constants from '../constants';

// Utilities:
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import Promise from 'bluebird';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Test setup:
const expect = chai.expect;
chai.use(dirtyChai);
chai.use(sinonChai);

// Dependencies:
import errorHandler from '../errors/error-handler';
import fileStructure from '../file-structure';
import getFileStructure from './get-file-structure';
import path from 'path';
import TractorError from '../errors/TractorError';

// Under test:
import saveFile from './save-file';

describe('server/api: save-file:', () => {
    it('should save a file', () => {
        let data = 'data';
        let filePath = path.join('some', 'path');
        let type = 'type';
        let request = {
            body: {
                data,
                path: filePath
            },
            params: { type }
        };

        sinon.stub(fileStructure, 'saveFile').returns(Promise.resolve());
        sinon.stub(getFileStructure, 'handler').returns(Promise.resolve());

        return saveFile.handler(request)
        .then(() => {
            expect(fileStructure.saveFile).to.have.been.calledWith(type, data, path.join('some', 'path'));
        })
        .finally(() => {
            fileStructure.saveFile.restore();
            getFileStructure.handler.restore();
        });
    });

    it('should respond to the client with the current file structure', () => {
        let data = 'data';
        let filePath = path.join('some', 'path');
        let type = 'type';
        let request = {
            body: {
                data,
                path: filePath
            },
            params: { type }
        };
        let response = {};

        sinon.stub(fileStructure, 'saveFile').returns(Promise.resolve());
        sinon.stub(getFileStructure, 'handler').returns(Promise.resolve());

        return saveFile.handler(request, response)
        .then(() => {
            expect(getFileStructure.handler).to.have.been.calledWith(request, response);
        })
        .finally(() => {
            fileStructure.saveFile.restore();
            getFileStructure.handler.restore();
        });
    });

    it('should handle known TractorErrors', () => {
        let data = 'data';
        let error = new TractorError();
        let filePath = path.join('some', 'path');
        let type = 'type';
        let request = {
            body: {
                data,
                path: filePath
            },
            params: { type }
        };
        let response = { };

        sinon.stub(fileStructure, 'saveFile').returns(Promise.reject(error));
        sinon.stub(errorHandler, 'handler');

        return saveFile.handler(request, response)
        .then(() => {
            expect(errorHandler.handler).to.have.been.calledWith(response, error);
        })
        .finally(() => {
            fileStructure.saveFile.restore();
            errorHandler.handler.restore();
        });
    });

    it('should handle unknown errors', () => {
        let data = 'data';
        let error = new Error();
        let filePath = path.join('some', 'path');
        let type = 'type';
        let request = {
            body: {
                data,
                path: filePath
            },
            params: { type }
        };
        let response = { };

        sinon.stub(fileStructure, 'saveFile').returns(Promise.reject(error));
        sinon.stub(errorHandler, 'handler');

        return saveFile.handler(request, response)
        .then(() => {
            expect(errorHandler.handler).to.have.been.calledWith(response, new TractorError(`Could not save "${path.join('some', 'path')}"`, constants.SERVER_ERROR));
        })
        .finally(() => {
            fileStructure.saveFile.restore();
            errorHandler.handler.restore();
        });
    });
});
