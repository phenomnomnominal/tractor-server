// Utilities:
import Promise from 'bluebird';
import childProcess from 'child_process';
import path from 'path';
import { error, info } from 'tractor-logger';

// Constants:
const PROTRACTOR_PATH = path.join('node_modules', 'protractor', 'bin', 'protractor');

// Errors:
import { TractorError } from 'tractor-error-handler';

export function run (config, socket, runOptions) {
    if (module.exports.running) {
        info('Protractor already running.');
        return Promise.reject(new TractorError('Protractor already running.'));
    } else {
        module.exports.running = true;

        return Promise.resolve(config.beforeProtractor())
        .then(() => {
            info('Starting Protractor...');
            return startProtractor(config, socket, runOptions);
        })
        .catch(e => {
            socket.lastMessage = socket.lastMessage || '';
            let [lastMessage] = socket.lastMessage.split(/\r\n|\n/);
            error(`${e.message}${lastMessage}`);
        })
        .finally(() => {
            socket.disconnect();
            return Promise.resolve(config.afterProtractor())
            .then(() => {
                module.exports.running = false;
                info('Protractor finished.');
            });
        });
    }
}

function startProtractor (config, socket, options) {
    let protractorConfigPath = path.join(config.directory, 'protractor.conf.js');
    let protractorArgs = [PROTRACTOR_PATH, protractorConfigPath];

    let { baseUrl, debug, feature, tag } = options;

    if (!baseUrl) {
        return Promise.reject(new TractorError('`baseUrl` must be defined.'));
    } else {
        protractorArgs = protractorArgs.concat(['--baseUrl', baseUrl]);
    }

    if (feature) {
        debug = !!debug;
    } else {
        feature = '*';
        debug = false;
    }

    let specsGlob = path.join(config.directory, 'features', '**', `${feature}.feature`);

    protractorArgs = protractorArgs.concat(['--specs', specsGlob]);
    protractorArgs = protractorArgs.concat(['--params.debug', debug]);

    if (tag) {
        protractorArgs = protractorArgs.concat(['--cucumberOpts.tags', tag]);
        info(`Running cucumber with tag: ${tag}`);
     }

    let protractor = childProcess.spawn('node', protractorArgs);

    protractor.stdout.on('data', sendDataToClient.bind(socket));
    protractor.stderr.on('data', sendDataToClient.bind(socket));
    protractor.stdout.pipe(process.stdout);
    protractor.stderr.pipe(process.stderr);

    let resolve, reject;
    let deferred = new Promise((...args) => [resolve, reject] = args);

    protractor.on('error', error => reject(new TractorError(error.message)));
    protractor.on('exit', (code) => {
        if (code) {
            reject(new TractorError('Protractor Exit Error - '));
        } else {
            resolve();
        }
    });
    return deferred;
}

function sendDataToClient (data) {
    this.emit('protractor-out', data.toString());
}
