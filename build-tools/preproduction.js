const fs = require("fs");
const path = require("path");
const cwd = process.cwd();

const pathToPreact = path.resolve(cwd, "./modules/papertrainmodule/src/assets/js/page-builder.js");
if (fs.existsSync(pathToPreact)) {
    const dest = path.resolve(cwd, "./demo/page-builder.js");
    if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
    }
    fs.copyFileSync(pathToPreact, dest);
}
