/* global describe:true, it:true */

// Constants:
import config from '../config/config';
const MAGIC_TIMEOUT_NUMBER = 10;

// Utilities:
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Test setup:
const expect = chai.expect;
chai.use(dirtyChai);
chai.use(sinonChai);

// Dependencies:
import childProcess from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';

// Under test:
import protractorRunner from './protractor-runner';

describe('server/sockets: protractor-runner:', () => {
    it('should run "protractor"', () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};
        let socket = {
            disconnect: () => {}
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');

        let options = {
            baseUrl: 'baseUrl'
        };

        let run = protractorRunner.run(socket, options);
        setTimeout(() => {
            spawnEmitter.emit('exit', 0);
        }, MAGIC_TIMEOUT_NUMBER);

        return run.then(() => {
            let protractorPath = path.join('node_modules', 'protractor', 'bin', 'protractor');
            let protractorConfPath = path.join('e2e-tests', 'protractor.conf.js');
            let specs = path.join(config.testDirectory, '/features/**/*.feature');
            expect(childProcess.spawn).to.have.been.calledWith('node', [protractorPath, protractorConfPath, '--baseUrl', 'baseUrl', '--specs', specs, '--params.debug', false]);
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.info.restore();
            console.log.restore();
        });
    });

    it('should run "protractor" for a single feature', () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};
        let socket = {
            disconnect: () => {}
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');

        let options = {
            baseUrl: 'baseUrl',
            feature: 'feature'
        };

        let run = protractorRunner.run(socket, options);
        setTimeout(() => {
            spawnEmitter.emit('exit', 0);
        }, MAGIC_TIMEOUT_NUMBER);

        return run.then(() => {
            let protractorPath = path.join('node_modules', 'protractor', 'bin', 'protractor');
            let protractorConfPath = path.join('e2e-tests', 'protractor.conf.js');
            let specs = path.join(config.testDirectory, '/features/**/feature.feature');
            expect(childProcess.spawn).to.have.been.calledWith('node', [protractorPath, protractorConfPath, '--baseUrl', 'baseUrl', '--specs', specs, '--params.debug', false]);
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.info.restore();
            console.log.restore();
        });
    });

    it('should run "protractor" for features that match a tag', () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};

        let socket = {
            disconnect: () => {}
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');

        let options = {
            baseUrl: 'baseUrl',
            tag: '@tag'
        };

        let run = protractorRunner.run(socket, options);
        setTimeout(() => {
            spawnEmitter.emit('exit', 0);
        }, MAGIC_TIMEOUT_NUMBER);

        return run.then(() => {
            let protractorPath = path.join('node_modules', 'protractor', 'bin', 'protractor');
            let protractorConfPath = path.join('e2e-tests', 'protractor.conf.js');
            let specs = path.join(config.testDirectory, '/features/**/*.feature');
            expect(childProcess.spawn).to.have.been.calledWith('node', [protractorPath, protractorConfPath, '--baseUrl', 'baseUrl', '--specs', specs, '--params.debug', false, '--cucumberOpts.tags', '@tag']);
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.info.restore();
            console.log.restore();
        });
    });

    it('should throw an `Error` if `baseUrl` is not defined:', () => {
        let socket = {
            disconnect: () => {}
        };

        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'error');
        sinon.stub(console, 'info');

        let options = {};

        return protractorRunner.run(socket, options)
        .then(() => {
            expect(console.error).to.have.been.calledWith('`baseUrl` must be defined.');
        })
        .finally(() => {
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.error.restore();
            console.info.restore();
        });
    });

    it(`shouldn't run "protractor" if it is already running`, () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};
        let socket = {
            disconnect: () => {}
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'error');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');

        let options = {
            baseUrl: 'baseUrl'
        };

        let run = protractorRunner.run(socket, options);
        protractorRunner.run().catch(() => {
            setTimeout(() => {
                spawnEmitter.emit('exit', 0);
            }, MAGIC_TIMEOUT_NUMBER);
        });

        return run.then(() => {
            expect(console.error).to.have.been.calledWith('Protractor already running.');
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.error.restore();
            console.info.restore();
            console.log.restore();
        });
    });

    it('should disconnect the socket when "protractor" finishes', () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};
        let socket = {
            disconnect: () => {}
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');
        sinon.spy(socket, 'disconnect');

        let options = {
            baseUrl: 'baseUrl'
        };

        let run = protractorRunner.run(socket, options);
        setTimeout(() => {
            spawnEmitter.emit('exit', 0);
        }, MAGIC_TIMEOUT_NUMBER);

        return run.then(() => {
            expect(socket.disconnect).to.have.been.calledOnce();
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.info.restore();
            console.log.restore();
        });
    });

    it('should log any errors that occur while running "protractor"', () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};
        let socket = {
            disconnect: () => {},
            lastMessage: ''
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'error');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');
        sinon.stub(console, 'warn');

        let options = {
            baseUrl: 'baseUrl'
        };

        let run = protractorRunner.run(socket, options);
        setTimeout(() => {
            spawnEmitter.emit('error', { message: 'error' });
        }, MAGIC_TIMEOUT_NUMBER);

        return run.then(() => {
            expect(console.error).to.have.been.calledOnce();
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.error.restore();
            console.info.restore();
            console.log.restore();
            console.warn.restore();
        });
    });

    it('should log any errors that cause "protractor" to exit with a bad error code', () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};
        let socket = {
            disconnect: () => {},
            lastMessage: ''
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'error');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');

        let options = {
            baseUrl: 'baseUrl'
        };

        let run = protractorRunner.run(socket, options);
        setTimeout(() => {
            spawnEmitter.emit('exit', 1);
        }, MAGIC_TIMEOUT_NUMBER);

        return run.then(() => {
            expect(console.error).to.have.been.calledOnce();
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.error.restore();
            console.info.restore();
            console.log.restore();
        });
    });

    it('should format messages from "stdout" and send them to the client', () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};
        let socket = {
            emit: () => {},
            disconnect: () => {}
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');
        sinon.spy(socket, 'emit');

        let options = {
            baseUrl: 'baseUrl'
        };

        let run = protractorRunner.run(socket, options);
        setTimeout(() => {
            spawnEmitter.stdout.emit('data', 'Scenario');
            spawnEmitter.stdout.emit('data', 'Error:');
            spawnEmitter.emit('exit', 0);
        }, MAGIC_TIMEOUT_NUMBER);

        return run.then(() => {
            expect(socket.emit).to.have.been.calledWith('protractor-out', {
                message: 'Scenario',
                type: 'info'
            });
            expect(socket.emit).to.have.been.calledWith('protractor-out', {
                message: 'Error:',
                type: 'error'
            });
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.info.restore();
            console.log.restore();
        });
    });

    it('should format messages from "stderr" and send them to the client', () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};
        let socket = {
            emit: () => {},
            disconnect: () => {}
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');
        sinon.spy(socket, 'emit');

        let options = {
            baseUrl: 'baseUrl'
        };

        let run = protractorRunner.run(socket, options);
        setTimeout(() => {
            spawnEmitter.stderr.emit('data', 'error');
            spawnEmitter.emit('exit', 0);
        }, MAGIC_TIMEOUT_NUMBER);

        return run.then(() => {
            expect(socket.emit).to.have.been.calledWith('protractor-err', {
                message: 'Something went really wrong - check the console for details.',
                type: 'error'
            });
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.info.restore();
            console.log.restore();
        });
    });

    it('should not send irrelevant messages to the client', () => {
        let spawnEmitter = new EventEmitter();
        spawnEmitter.stdout = new EventEmitter();
        spawnEmitter.stdout.pipe = () => {};
        spawnEmitter.stderr = new EventEmitter();
        spawnEmitter.stderr.pipe = () => {};
        let socket = {
            emit: () => {},
            disconnect: () => {}
        };

        sinon.stub(childProcess, 'spawn').returns(spawnEmitter);
        sinon.stub(config, 'beforeProtractor');
        sinon.stub(config, 'afterProtractor');
        sinon.stub(console, 'info');
        sinon.stub(console, 'log');
        sinon.spy(socket, 'emit');

        let options = {
            baseUrl: 'baseUrl'
        };

        let run = protractorRunner.run(socket, options);
        setTimeout(() => {
            spawnEmitter.stdout.emit('data', '');
            spawnEmitter.stdout.emit('data', 'something irrelevant');
            spawnEmitter.emit('exit', 0);
        }, MAGIC_TIMEOUT_NUMBER);

        return run.then(() => {
            expect(socket.emit).to.not.have.been.called();
        })
        .finally(() => {
            childProcess.spawn.restore();
            config.beforeProtractor.restore();
            config.afterProtractor.restore();
            console.info.restore();
            console.log.restore();
        });
    });
});
