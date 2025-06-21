import { leftRotate, stringToBytes, bytesToBase16, bytesToWords, wordsToBytes } from "./numberHandling";
// adapted partially from algorithm I found here https://stackoverflow.com/questions/59777670/how-can-i-hash-a-string-with-sha256, which was taken from https://geraintluff.github.io/sha256/
// and the wikipedia article on SHA-1 https://en.wikipedia.org/wiki/SHA-1
// by Curse
export function sha0(str: string): string {
    return bytesToBase16(sha0Bytes(stringToBytes(str)));
}
// actual hash algorithms
export function sha0Bytes(bytes: number[]): number[] {
    var i: number, j: number;
    var bitLength: number = bytes.length * 8;
    bytes = bytes.slice();
    bytes.push(0x80);
    while (((bytes.length % 64) - 56) != 0) bytes.push(0);
    var words = bytesToWords(bytes);
    words.push(0);
    words.push(bitLength);
    let hash: number[] = [ 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0 ];
    for (j = 0; j < words.length;) {
        var w: number[] = words.slice(j, j += 16);
        for (let i = 16; i < 80; i++)
            w[i] = w[i - 3]! ^ w[i - 8]! ^ w[i - 14]! ^ w[i - 16]!;
        let wHash: number[] = hash.slice();
        for (i = 0; i < 80; i++) {
            let f = 0;
            let k = 0;
            const b: number = wHash[1]!, c: number = wHash[2]!, d: number = wHash[3]!;
            if (i < 20) {
                f = (b & c) | ((~b) & d);
                k = 0x5A827999;
            } else if (i < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            } else if (i < 60) {
                f = (b & c) ^ (b & d) ^ (c & d);
                k = 0x8F1BBCDC;
            } else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }
            wHash = [ leftRotate(wHash[0]!, 5) + f + wHash[4]! + k + w[i]!, wHash[0]!, leftRotate(b, 30), c, d ];
        }
        for (i = 0; i < 5; i++)
            hash[i] = (hash[i]! + wHash[i]!) | 0;
    }
    return wordsToBytes(hash);
}