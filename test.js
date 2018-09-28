#!/usr/bin/env node
const Aplay = require('./node-aplay');

const filename = process.argv[2];

if (typeof filename !== 'string')
{
    console.error('To test this library, you must pass as first argument a WAV file, preferably a long one.');
    process.exit(1);
}

function test1()
{
    console.log('Should play completely...');
    const a = new Aplay();

    a.on('complete', () =>
    {
        console.log('SUCCESS!\n');
        test2();
    });

    a.on('error', (code, sig) =>
    {
        console.error('FAIL: received an error. code:', code, 'signal:', sig);
        process.exit(1);
    });

    a.play(filename);
}

function test2()
{
    console.log('Should start playback, pause after 1 second and resume after 1 more second.');
    const a = new Aplay();

    a.on('complete', () =>
    {
        console.log('SUCCESS!\n');
        test3();
    });

    a.on('error', (code, sig) =>
    {
        console.error('FAIL: received an error. code:', code, 'signal:', sig);
        process.exit(1);
    });

    setTimeout(() =>
    {
        a.pause();
    }, 1000);

    setTimeout(() =>
    {
        a.resume();
    }, 2000);

    a.play(filename);
}

function test3()
{
    console.log('Should start playback, stop after 2 seconds. Should play again from beginning and complete the playback.');

    let shouldComplete = false;
    let stopReceived = false;
    const a = new Aplay();

    a.on('complete', () =>
    {
        if (shouldComplete)
        {
            console.log('SUCCESS!\n');
            test4();
        }
        else
        {
            console.error('FAIL: should not emit complete.');
        }
    });

    a.on('stop', () =>
    {
        stopReceived = true;
    });

    a.on('error', (code, sig) =>
    {
        console.error('FAIL: received an error. code:', code, 'signal:', sig);
        process.exit(1);
    });

    setTimeout(() =>
    {
        a.stop();
    }, 2000);

    setTimeout(() =>
    {
        if (!stopReceived)
        {
            console.error('FAIL: should have emitted a stop event.');
            process.exit(1);
        }

        shouldComplete = true;
        a.play(filename);
    }, 3000);

    a.play(filename);
}

function test4()
{
    console.log('Testing errors cases... If I get stuck, it is a FAIL.');

    let timeoutId = setTimeout(() =>
    {
        console.error('FAIL: didn\'t emitted error event.');
        process.exit(1);
    }, 1000);

    const a = new Aplay();
    a.on('error', () =>
    {
        clearTimeout(timeoutId);
        timeoutId = null;
        test5();
    })
    a.play('NOPENOPENOPE');
}

function check_if_it_throwed(haveThrowed)
{
    if (!haveThrowed)
    {
        console.error('FAIL: should throw.');
        process.exit(1);
    }
}

function test5()
{
    let haveThrowed = false;

    try
    {
        const a = new Aplay({channels: -1});
    }
    catch (e)
    {
        haveThrowed = true;
    }

    check_if_it_throwed(haveThrowed);
    haveThrowed = false;

    try
    {
        const a = new Aplay({channels: 33});
    }
    catch (e)
    {
        haveThrowed = true;
    }

    check_if_it_throwed(haveThrowed);
    haveThrowed = false;

    try
    {
        const a = new Aplay({channels: 'hey'});
    }
    catch (e)
    {
        haveThrowed = true;
    }

    check_if_it_throwed(haveThrowed);
    haveThrowed = false;

    try
    {
        const a = new Aplay({channels: 1});
    }
    catch (e)
    {
        console.error('FAIL: should not throw.');
        process.exit(1);
    }

    try
    {
        const a = new Aplay({channels: 32});
    }
    catch (e)
    {
        console.error('FAIL: should not throw.');
        process.exit(1);
    }

    console.log('SUCCESS!');
    console.log('Congrats, all tests passed.');
}

console.log('Hello! Welcome in this interactive test. Everything will be described during this process.');
console.log('If your hear anything wrong, if it get stuck or it print "FAIL", that means the test is a fail.\n');
test1();