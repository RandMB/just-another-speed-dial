'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

const webpack = require('webpack');

const dialAppConfig = require('../speed-dial-app/config/webpack.config.dev');
const optionsAppConfig = require('../options-app/config/webpack.config.dev');
const webExt = require('web-ext').default;

const compiler = webpack([dialAppConfig, optionsAppConfig]);

const compilingPromise = new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
        if (err) {
            console.error(err.stack || err);
            if (err.details) {
                console.error(err.details);
            }
            reject(err);
        } else {
            resolve(stats);
        }

    });
});

compilingPromise.then(() => {
    return webExt.cmd.run({
        firefox: 'nightly',
        sourceDir: process.cwd() + '\\extension',
        firefoxProfile: 'Webextension',
        noInput: true,
        startUrl: '',
    }, { shouldExitProgram: false });
}).then((extensionRunner) => {

    const watching = compiler.watch({
        aggregateTimeout: 300,
        ignored: /node_modules/
    }, (err, stats) => {
        printStatus(err, stats);
    });

    // Stupid Windows workaround for graceful exit... 
    if (process.platform === "win32") {
        var rl = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('SIGINT', function () {
            console.log('Exiting...');
            watching.close();
            extensionRunner.exit();
            process.exit();
        });
    } else {
        ['SIGINT', 'SIGTERM'].forEach(function (sig) {
            process.on(sig, function () {
                console.log('Exiting...');
                watching.close();
                extensionRunner.exit();
                process.exit();
            });
        });
    }
});

function printStatus(err, stats) {
    if (err) {
        console.error(err.stack || err);
        if (err.details) {
            console.error(err.details);
        }
        return;
    }

    if (stats.hasErrors()) {
        console.error(stats.errors);
    } else {
        console.log('\nCompiled successfuly');
    }

    if (stats.hasWarnings()) {
        console.warn(stats.warnings);
    }
}