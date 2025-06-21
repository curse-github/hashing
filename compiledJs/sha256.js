// #region ./sha256
// #region ./numberHandling
// general library for handling, converting, and generating numbers in other bases
// by Curse
function leftRotate(value, amount) {
    return (value >>> (32 - amount)) | (value << amount);
}
function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
}
function padStartToMod(str, mod, char) {
    return char.repeat((mod - (str.length % mod)) % mod) + str;
}
function padEndToMod(str, mod, char) {
    return str + char.repeat((mod - (str.length % mod)) % mod);
}
// base 16(hex) functions
const base16Chars = "0123456789ABCDEF";
function base16ToBytes(str) {
    // convert lowercase to uppercase, if any
    str = str.toUpperCase();
    // convert to a multiple of 8 binary bits
    let binary = "";
    for (let i = 0; i < str.length; i++) {
        const index = base16Chars.indexOf(str[i]);
        if (index == -1)
            throw new Error("Invalid character in base16 string.");
        binary += index.toString(2).padStart(4, "0");
    }
    binary = padStartToMod(binary, 8, "0");
    // convert each chunk of 8 bits to a byte in the array
    let bytes = [];
    for (let i = 0; i < binary.length; i += 8)
        bytes.push(parseInt(binary.substring(i, i + 8), 2));
    return bytes;
}
function bytesToBase16(bytes) {
    let base16 = "";
    // convert each chunk of 8 bits to two base16 characters
    for (let i = 0; i < bytes.length; i++)
        base16 += (bytes[i] & 0xFF).toString(16).padStart(2, "0");
    // if the length is now zero, return a single 0
    if (base16.length == 0)
        return "0";
    return base16.toUpperCase();
}
// base 32 functions
const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32ToBytes(str) {
    // remove "=" from the end of the string
    str = str.replace(/=+$/, "");
    if (str.length == 0)
        throw new Error("Base32 string contained only '='.");
    // convert to a multiple of 8 binary bits
    let binary = "";
    for (let i = 0; i < str.length; i++) {
        const index = base32Chars.indexOf(str[i]);
        if (index == -1)
            throw new Error("Invalid character in base32 string.");
        binary += index.toString(2).padStart(5, "0");
    }
    binary = padEndToMod(binary, 8, "0");
    // convert each chunk of 8 bits to a byte in the array
    let bytes = [];
    for (let i = 0; i < binary.length; i += 8)
        bytes.push(parseInt(binary.substring(i, i + 8), 2));
    if ((str.length % 8 == 1) || (str.length % 8 == 2) || (str.length % 8 == 3) || (str.length % 8 == 4) || (str.length % 8 == 5) || (str.length % 8 == 6) || (str.length % 8 == 7))
        bytes.pop();
    return bytes;
}
function bytesToBase32(bytes) {
    // convert to a multiple of 5 binary bits
    let binary = "";
    for (let i = 0; i < bytes.length; i++)
        binary += (bytes[i] & 0xFF).toString(2).padStart(8, "0");
    binary = padEndToMod(binary, 5, "0");
    // convert each chunk of 5 bits to a base32 character
    let base32 = "";
    for (let i = 0; i < binary.length; i += 5)
        base32 += base32Chars[parseInt(binary.substring(i, i + 5), 2)];
    // if the length is now zero, return a single A(0) padded with "="
    const base32Len = base32.length;
    if (base32Len == 0)
        return "A===";
    // pad with "=" to the nearest multiple of 4
    return padEndToMod(base32, 8, "=");
}
// base 64 functions
const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function base64ToBytes(str) {
    // remove "=" from the end of the string
    str = str.replace(/=+$/, "");
    if (str.length == 0)
        throw new Error("Base64 string contained only '='.");
    // convert to a multiple of 8 binary bits
    let binary = "";
    for (let i = 0; i < str.length; i++) {
        const index = base64Chars.indexOf(str[i]);
        if (index == -1)
            throw new Error("Invalid character in base64 string.");
        binary += index.toString(2).padStart(6, "0");
    }
    binary = padEndToMod(binary, 8, "0");
    // convert each chunk of 8 bits to a byte in the array
    let bytes = [];
    for (let i = 0; i < binary.length; i += 8)
        bytes.push(parseInt(binary.substring(i, i + 8), 2));
    if ((str.length % 4 == 2) || (str.length % 4 == 3))
        bytes.pop();
    return bytes;
}
function bytesToBase64(bytes) {
    // convert to a multiple of 6 binary bits
    let binary = "";
    for (let i = 0; i < bytes.length; i++)
        binary += bytes[i].toString(2).padStart(8, "0");
    binary = padEndToMod(binary, 6, "0");
    // convert each chunk of 6 bits to a base64 character
    let base64 = "";
    for (let i = 0; i < binary.length;)
        base64 += base64Chars[parseInt(binary.substring(i, i += 6), 2)];
    // if the length is now zero, return a single A(0) padded with "="
    const base64Len = base64.length;
    if (base64Len == 0)
        return "A===";
    // pad with "=" to the nearest multiple of 4
    return padEndToMod(base64, 4, "=");
}
// string functions
function stringToBytes(str) {
    // convert each char to a byte in the array
    const bytes = [];
    for (let i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i));
    return bytes;
}
function bytesToString(bytes) {
    // convert each char to a byte in the array
    let str = "";
    for (let i = 0; i < bytes.length; i++)
        str += String.fromCharCode((bytes[i] & 0xFF));
    return str;
}
// 32 bit word functions
function bytesToWords(bytes) {
    let words = [];
    for (let i = 0; i < bytes.length; i++)
        words[i >> 2] = (words[i >> 2] || 0) | (bytes[i] << ((3 - (i % 4)) * 8));
    return words.map((word) => (word >>> 0));
}
function wordsToBytes(words) {
    let bytes = [];
    for (let i = 0; i < words.length * 4; i++)
        bytes.push((words[i >> 2] >> ((3 - (i % 4)) * 8)) & 0xFF);
    return bytes;
}
// #endregion ./numberHandling

// adapted from algorithm I found here https://stackoverflow.com/questions/59777670/how-can-i-hash-a-string-with-sha256, which was taken from https://geraintluff.github.io/sha256/
// and from pseudo-code at https://en.wikipedia.org/wiki/SHA-2
// by Curse
function sha256(str) {
    return bytesToBase16(sha256Bytes(stringToBytes(str)));
}
let h = [];
let k = [];
const maxWord = Math.pow(2, 32);
let primeCounter = 0;
let isComposite = {};
for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
        for (let i = 0; i < 313; i += candidate)
            isComposite[i] = true;
        h[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
}
function sha256Bytes(bytes) {
    let i, j; // Used as a counter across the whole file
    let bitLength = bytes.length * 8;
    let hash = h.slice(0, 8);
    bytes = bytes.slice();
    bytes.push(0x80); // Append Ƈ' byte (plus zero padding)
    while (((bytes.length % 64) - 56) != 0)
        bytes.push(0); // More zero padding
    let words = bytesToWords(bytes);
    words.push(0);
    words.push(bitLength);
    // process each chunk of 16 bytes
    for (j = 0; j < words.length;) {
        let w = words.slice(j, j += 16);
        // expanded the message into 64 words to calculate with
        for (let i = 16; i < 64; i++) {
            const w15 = w[i - 15];
            const s0 = (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3));
            const w2 = w[i - 2];
            const s1 = (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10));
            w.push(w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }
        // this is the working hash, added to the original hash after hashing
        let wHash = hash.slice();
        for (i = 0; i < 64; i++) {
            // naming changed to be more like wikipedia, beacuase it was better than the other link
            let a = wHash[0], b = wHash[1], c = wHash[2], e = wHash[4];
            const S0 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22));
            const S1 = (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25));
            const ch = ((e & wHash[5]) ^ ((~e) & wHash[6]));
            const maj = ((a & b) ^ (a & c) ^ (b & c));
            let temp1 = wHash[7] + S1 + ch + k[i] + w[i];
            // shift hash right and add temp1 + temp2 to the front
            // also add temp1 to e
            wHash = [(temp1 + (S0 + maj)) | 0, wHash[0], wHash[1], wHash[2], (wHash[3] + temp1), wHash[4], wHash[5], wHash[6]];
        }
        // add working hash back to original hash
        for (i = 0; i < 8; i++)
            hash[i] = (hash[i] + wHash[i]) | 0;
    }
    return wordsToBytes(hash);
}
// #endregion ./sha256
