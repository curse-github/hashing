export {};
let alreadyImported: string[] = [];
async function preProcess(relPath: string): Promise<string> {
    if (alreadyImported.includes(relPath)) return "";
    alreadyImported.push(relPath);
    return (await Promise.all((await getFile(relPath)).split("\n").map(async (line: string) => {
        if (line.startsWith("import")) {
            let tmp: string = "";
            for (let i = line.length - 3; i > 0; i--) { // skips "; " at the end
                if (line[i] == "\"") break;
                tmp = line[i] + tmp;
            }
            console.log(tmp);
            if (tmp == "crypto") return "const crypto = require('crypto')";
            return await preProcess(tmp);
        }
        return line.replace("export ", "/*export */");
    }))).join("\n");
}
async function mapPathToLink(path: string): Promise<string> {
    return {
        "./TOTP": "https://gist.githubusercontent.com/curse-github/5476d00c288ad9a52f9201607f4ddb5a/raw/44a9a066a3ccb7587c5cb25f7edd55f91217b096/TOTP.js",
        "./HMAC": "https://gist.githubusercontent.com/curse-github/01d623a9a5ece68d00b1252e8339f77d/raw/ac6d7ae0ed57dad0bd6e0c5c1bac0dd37c98b3e0/HMAC.js",
        "./sha1": "https://gist.githubusercontent.com/curse-github/9624ad6cfa9dfecdd6adf01d6bb8cea1/raw/de2eda6a1d5f135ed8f391bf5069aab05526134a/sha1.js",
        "./numberHandling": "https://gist.githubusercontent.com/curse-github/466a6102545cf4312c8d7e0bb335812b/raw/102d27a43e359a17518f3a53fce339fcbde35859/numberHandling.js"
    }[path] ?? "";
}
async function getFile(relPath: string): Promise<string> {
    const link: string = await mapPathToLink(relPath);
    if (link == "") return "";
    return await (await fetch(link)).text();
}
async function importFile(str: string): Promise<void> {
    eval.bind(window)(await preProcess(str));
}
