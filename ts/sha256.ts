import { rightRotate, stringToBytes, bytesToBase16, bytesToWords, wordsToBytes } from "./numberHandling";
// adapted from algorithm I found here https://stackoverflow.com/questions/59777670/how-can-i-hash-a-string-with-sha256, which was taken from https://geraintluff.github.io/sha256/
// and from pseudo-code at https://en.wikipedia.org/wiki/SHA-2
// by Curse
export function sha256(str: string): string {
    return bytesToBase16(sha256Bytes(stringToBytes(str)));
}
let h: number[] = [];
let k: number[] = [];
const maxWord: number = Math.pow(2, 32);
let primeCounter: number = 0;
let isComposite: {[key: number]: boolean} = {};
for (let candidate: number = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
        for (let i: number = 0; i < 313; i += candidate)
            isComposite[i] = true;
        h[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
}
export function sha256Bytes(bytes: number[]): number[] {
    let i: number, j: number; // Used as a counter across the whole file
    let bitLength: number = bytes.length * 8;
    let hash: [ number, number, number, number, number, number, number, number ] = h.slice(0, 8) as [ number, number, number, number, number, number, number, number ];
    bytes = bytes.slice();
    bytes.push(0x80); // Append Ƈ' byte (plus zero padding)
    while (((bytes.length % 64) - 56) != 0) bytes.push(0); // More zero padding
    let words: number[] = bytesToWords(bytes);
    words.push(0);
    words.push(bitLength);
    // process each chunk of 16 bytes
    for (j = 0; j < words.length;) {
        let w: number[] = words.slice(j, j += 16);
        // expanded the message into 64 words to calculate with
        for (let i = 16; i < 64; i++) {
            const w15: number = w[i - 15]!;
            const s0: number = (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3));
            const w2: number = w[i - 2]!;
            const s1: number = (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10));
            w.push(w[i - 16]! + s0 + w[i - 7]! + s1) | 0;
        }
        // this is the working hash, added to the original hash after hashing
        let wHash: [ number, number, number, number, number, number, number, number ] = hash.slice() as [ number, number, number, number, number, number, number, number ];
        for (i = 0; i < 64; i++) {
            // naming changed to be more like wikipedia, beacuase it was better than the other link
            let a: number = wHash[0]!, b: number = wHash[1]!, c: number = wHash[2]!, e: number = wHash[4]!;
            const S0: number = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22));
            const S1: number = (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25));
            const ch: number = ((e & wHash[5]!) ^ ((~e) & wHash[6]!));
            const maj: number = ((a & b) ^ (a & c) ^ (b & c));
            let temp1 = wHash[7]! + S1 + ch + k[i]! + w[i]!;
            // shift hash right and add temp1 + temp2 to the front
            // also add temp1 to e
            wHash = [ (temp1 + (S0 + maj)) | 0, wHash[0]!, wHash[1]!, wHash[2]!, (wHash[3]! + temp1), wHash[4]!, wHash[5]!, wHash[6]! ];
        }
        // add working hash back to original hash
        for (i = 0; i < 8; i++)
            hash[i] = (hash[i]! + wHash[i]!) | 0;
    }
    return wordsToBytes(hash);
}