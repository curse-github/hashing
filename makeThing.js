var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, rmdirSync } from "fs";
let alreadyImported = [];
function preProcessFile(relPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (alreadyImported.includes(relPath))
            return "";
        alreadyImported.push(relPath);
        const file = yield getFile(relPath);
        return "// #region " + relPath + "\n" + (yield preProcess(file)) + "// #endregion " + relPath + "\n";
    });
}
function preProcess(file) {
    return __awaiter(this, void 0, void 0, function* () {
        if (file.length == 0)
            return "";
        else
            return (yield Promise.all(file.split("\n").map((line) => __awaiter(this, void 0, void 0, function* () {
                if (line.startsWith("import")) {
                    let tmp = "";
                    for (let i = line.length - 3; i > 0; i--) { // skips "; " at the end
                        if ((line[i] == "\"") || (line[i] == "'"))
                            break;
                        tmp = line[i] + tmp;
                    }
                    if (tmp == "crypto")
                        return "import crypto from \"crypto\";";
                    const processed = yield preProcessFile(tmp);
                    if (processed.length == 0)
                        return "";
                    else
                        return processed;
                }
                return line.replace(/^\s*export\s/g, ""); // "/*export */");
            })))).join("\n");
    });
}
function mapPathToLink(path) {
    return __awaiter(this, void 0, void 0, function* () {
        return "./moduleJs/" + path.substring(1) + ".js";
    });
}
function getFile(relPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const link = yield mapPathToLink(relPath);
        return readFileSync(link).toString();
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!existsSync("./compiledJs"))
            mkdirSync("./compiledJs");
        const files = readdirSync("./moduleJs/");
        for (let i = 0; i < files.length; i++) {
            const path = files[i];
            const relPath = "./" + path.replace(".js", "");
            writeFileSync("./compiledJs/" + path, new Uint8Array(Buffer.from(yield preProcessFile(relPath))));
            alreadyImported = [];
        }
        writeFileSync("./compiledJs/ShaTotpAesEcc.js", new Uint8Array(Buffer.from(yield preProcess("import { sha256 } from \"./sha256\";import { getTOTP } from \"./TOTP\";\nimport { AES } from \"./AES\";\nimport { multPoint } from \"./ECC\";"))));
        alreadyImported = [];
        for (let i = 0; i < files.length; i++)
            rmSync("./moduleJs/" + files[i]);
        rmdirSync("./moduleJs/");
    });
}
run();
