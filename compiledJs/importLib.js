// #region ./importLib
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let alreadyImported = [];
function preProcess(relPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (alreadyImported.includes(relPath))
            return "";
        alreadyImported.push(relPath);
        return (yield Promise.all((yield getFile(relPath)).split("\n").map((line) => __awaiter(this, void 0, void 0, function* () {
            if (line.startsWith("import")) {
                let tmp = "";
                for (let i = line.length - 3; i > 0; i--) { // skips "; " at the end
                    if (line[i] == "\"")
                        break;
                    tmp = line[i] + tmp;
                }
                console.log(tmp);
                if (tmp == "crypto")
                    return "const crypto = require('crypto')";
                return yield preProcess(tmp);
            }
            return line.replace("export ", "/*export */");
        })))).join("\n");
    });
}
function mapPathToLink(path) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        return (_a = {
            "./TOTP": "https://gist.githubusercontent.com/curse-github/5476d00c288ad9a52f9201607f4ddb5a/raw/44a9a066a3ccb7587c5cb25f7edd55f91217b096/TOTP.js",
            "./HMAC": "https://gist.githubusercontent.com/curse-github/01d623a9a5ece68d00b1252e8339f77d/raw/ac6d7ae0ed57dad0bd6e0c5c1bac0dd37c98b3e0/HMAC.js",
            "./sha1": "https://gist.githubusercontent.com/curse-github/9624ad6cfa9dfecdd6adf01d6bb8cea1/raw/de2eda6a1d5f135ed8f391bf5069aab05526134a/sha1.js",
            "./numberHandling": "https://gist.githubusercontent.com/curse-github/466a6102545cf4312c8d7e0bb335812b/raw/102d27a43e359a17518f3a53fce339fcbde35859/numberHandling.js"
        }[path]) !== null && _a !== void 0 ? _a : "";
    });
}
function getFile(relPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const link = yield mapPathToLink(relPath);
        if (link == "")
            return "";
        return yield (yield fetch(link)).text();
    });
}
function importFile(str) {
    return __awaiter(this, void 0, void 0, function* () {
        eval.bind(window)(yield preProcess(str));
    });
}
{};
// #endregion ./importLib
