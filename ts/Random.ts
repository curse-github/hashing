import { wordsToBytes, bytesToBase16, bytesToBase32, bytesToBase64, base16ToBytes, bytesToWords } from "./numberHandling";
import { sha256Bytes } from "./sha256";
function xor(A: number[], B: number[]): number[] {
    return A.map((a: number, i: number) => (a ^ B[i]!));
}

function time(): number {
    return (new Date()).getTime();
}
// use this for browser code
// let seed = Array.from(self.crypto.getRandomValues(new Uint8Array(127))); // sha25 of current time
import * as crypto from "crypto";
let seed: number[] = sha256Bytes(crypto.randomBytes(127).toJSON().data);// sha25 of some random bytes
// https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator#Practical_schemes
export function generateNum(bytes: number): number[] {
    const num: number[] = [];
    while (num.length < bytes) {
        const D: number[] = wordsToBytes([ time() ]);
        const tmp: number[] = sha256Bytes(D);
        const x: number[] = sha256Bytes(xor(seed, tmp));
        for (let i = 0; i < x.length; i++) num.push(x[i]!);
        seed = sha256Bytes(xor(x, tmp));
    }
    return num.slice(undefined, bytes);
}
export function generateBase16Num(bytes: number): string {
    return bytesToBase16(generateNum(bytes));
}
export function generateBase32Num(bytes: number): string {
    return bytesToBase32(generateNum(bytes));
}
export function generateBase64Num(bytes: number): string {
    return bytesToBase64(generateNum(bytes));
}
for (let i = 0; i < 16; i++) {
    console.log(generateBase16Num(17 * 4));
}