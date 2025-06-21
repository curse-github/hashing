import { stringToBytes } from "./numberHandling";
import { sha0Bytes } from "./sha0";
import { sha1Bytes } from "./sha1";
import { sha256Bytes } from "./sha256";
// implementation of Hash-Based Message Authentication Code(HMAC) in javascript
// by Curse
// https://en.wikipedia.org/wiki/HMAC
function padEnd(input: any[], padTo: number) {
    const output: any[] = input.slice();
    for (let i = input.length; i < padTo; i++)
        output[i] = 0;
    return output;
}
function computeBlockSizedKey(key: number[], hashFunc: (bytes: number[])=> number[], blockSize: number): number[] {
    if (key.length > blockSize)
        return hashFunc(key);
    else if (key.length < blockSize)
        return padEnd(key, blockSize); // Pad key with zeros to make it blockSize bytes long
    return key;
}
export function hmac(key: number[], message: number[], hashFunc: (bytes: number[])=> number[], blockSize: number): number[] {
    if (typeof key == "string") key = stringToBytes(key);
    if (typeof message == "string") message = stringToBytes(message);
    const block_sized_key: number[] = computeBlockSizedKey(key, hashFunc, blockSize);
    let o_key_pad: number[] = [];
    let i_key_pad: number[] = [];
    for (let i = 0; i < blockSize; i++) {
        o_key_pad[i] = block_sized_key[i]! ^ 0x5c;
        i_key_pad[i] = block_sized_key[i]! ^ 0x36;
    }
    return hashFunc(o_key_pad.concat(hashFunc(i_key_pad.concat(message))));
}
export function hmac0(key: number[], message: number[]): number[] {
    return hmac(key, message, sha0Bytes, 64);
}
export function hmac1(key: number[], message: number[]): number[] {
    return hmac(key, message, sha1Bytes, 64);
}
export function hmac256(key: number[], message: number[]): number[] {
    return hmac(key, message, sha256Bytes, 64);
}