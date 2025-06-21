export {};
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, rmdirSync } from "fs";
let alreadyImported: string[] = [];
async function preProcessFile(relPath: string): Promise<string> {
    if (alreadyImported.includes(relPath))
        return "";
    alreadyImported.push(relPath);
    const file: string = await getFile(relPath);
    return "// #region " + relPath + "\n" + await preProcess(file) + "// #endregion " + relPath + "\n";
}
async function preProcess(file: string): Promise<string> {
    if (file.length == 0) return "";
    else return (await Promise.all(file.split("\n").map(async (line: string) => {
        if (line.startsWith("import")) {
            let tmp: string = "";
            for (let i = line.length - 3; i > 0; i--) { // skips "; " at the end
                if ((line[i] == "\"") || (line[i] == "'")) break;
                tmp = line[i] + tmp;
            }
            if (tmp == "crypto") return "import crypto from \"crypto\";";
            const processed: string = await preProcessFile(tmp);
            if (processed.length == 0) return "";
            else return processed;
        }
        return line.replace(/^\s*export\s/g, "");// "/*export */");
    }))).join("\n");
}
async function mapPathToLink(path: string): Promise<string> {
    return "./moduleJs/" + path.substring(1) + ".js";
}
async function getFile(relPath: string): Promise<string> {
    const link: string = await mapPathToLink(relPath);
    return readFileSync(link).toString();
}
async function run(): Promise<void> {
    if (!existsSync("./compiledJs")) mkdirSync("./compiledJs");
    const files: string[] = readdirSync("./moduleJs/");
    for (let i = 0; i < files.length; i++) {
        const path: string = files[i];
        const relPath: string = "./" + path.replace(".js", "");
        writeFileSync("./compiledJs/" + path, new Uint8Array(Buffer.from(await preProcessFile(relPath))));
        alreadyImported = [];
    }
    writeFileSync("./compiledJs/ShaTotpAesEcc.js", new Uint8Array(Buffer.from(await preProcess("import { sha256 } from \"./sha256\";import { getTOTP } from \"./TOTP\";\nimport { AES } from \"./AES\";\nimport { multPoint } from \"./ECC\";"))));
    alreadyImported = [];
    for (let i = 0; i < files.length; i++)
        rmSync("./moduleJs/" + files[i]);
    rmdirSync("./moduleJs/");
}
run();