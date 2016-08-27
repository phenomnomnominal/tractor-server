'use strict';

// Constants:
import constants from '../constants';

// NOTE -
// This could be written as `class TractorError extends Error`
// but that doesn't play nicely with Bluebird typed catches.
// Instead we do it the ES5 way:
function TractorError(message, status) {
    this.message = message;
    this.name = 'TractorError';
    this.status = status || constants.SERVER_ERROR;
    Error.captureStackTrace(this, TractorError);
}

TractorError.prototype = Object.create(Error.prototype);
TractorError.prototype.constructor = TractorError;

export default TractorError;
