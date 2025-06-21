// general library for handling, converting, and generating numbers in other bases
// by Curse
export function leftRotate(value: number, amount: number): number {
    return (value >>> (32 - amount)) | (value << amount);
}
export function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
}

function padStartToMod(str: string, mod: number, char: string): string {
    return char.repeat((mod - (str.length % mod)) % mod) + str;
}
function padEndToMod(str: string, mod: number, char: string): string {
    return str + char.repeat((mod - (str.length % mod)) % mod);
}
// base 16(hex) functions
const base16Chars: string = "0123456789ABCDEF";
export function base16ToBytes(str: string): number[] {
    // convert lowercase to uppercase, if any
    str = str.toUpperCase();
    // convert to a multiple of 8 binary bits
    let binary: string = "";
    for (let i: number = 0; i < str.length; i++) {
        const index: number = base16Chars.indexOf(str[i]!);
        if (index == -1) throw new Error("Invalid character in base16 string.");
        binary += index.toString(2).padStart(4, "0");
    }
    binary = padStartToMod(binary, 8, "0");
    // convert each chunk of 8 bits to a byte in the array
    let bytes: number[] = [];
    for (let i: number = 0; i < binary.length; i += 8)
        bytes.push(parseInt(binary.substring(i, i + 8), 2));
    return bytes;
}
export function bytesToBase16(bytes: number[]): string {
    let base16: string = "";
    // convert each chunk of 8 bits to two base16 characters
    for (let i = 0; i < bytes.length; i++)
        base16 += (bytes[i]! & 0xFF).toString(16).padStart(2, "0");
    // if the length is now zero, return a single 0
    if (base16.length == 0) return "0";
    return base16.toUpperCase();
}
// base 32 functions
const base32Chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function base32ToBytes(str: string): number[] {
    // remove "=" from the end of the string
    str = str.replace(/=+$/, "");
    if (str.length == 0) throw new Error("Base32 string contained only '='.");
    // convert to a multiple of 8 binary bits
    let binary: string = "";
    for (let i: number = 0; i < str.length; i++) {
        const index: number = base32Chars.indexOf(str[i]!);
        if (index == -1) throw new Error("Invalid character in base32 string.");
        binary += index.toString(2).padStart(5, "0");
    }
    binary = padEndToMod(binary, 8, "0");
    // convert each chunk of 8 bits to a byte in the array
    let bytes: number[] = [];
    for (let i: number = 0; i < binary.length; i += 8)
        bytes.push(parseInt(binary.substring(i, i + 8), 2));
    if ((str.length % 8 == 1) || (str.length % 8 == 2) || (str.length % 8 == 3) || (str.length % 8 == 4) || (str.length % 8 == 5) || (str.length % 8 == 6) || (str.length % 8 == 7)) bytes.pop();
    return bytes;
}
export function bytesToBase32(bytes: number[]): string {
    // convert to a multiple of 5 binary bits
    let binary: string = "";
    for (let i = 0; i < bytes.length; i++)
        binary += (bytes[i]! & 0xFF).toString(2).padStart(8, "0");
    binary = padEndToMod(binary, 5, "0");
    // convert each chunk of 5 bits to a base32 character
    let base32: string = "";
    for (let i = 0; i < binary.length; i += 5)
        base32 += base32Chars[parseInt(binary.substring(i, i + 5), 2)];
    // if the length is now zero, return a single A(0) padded with "="
    const base32Len: number = base32.length;
    if (base32Len == 0) return "A===";
    // pad with "=" to the nearest multiple of 4
    return padEndToMod(base32, 8, "=");
}
// base 64 functions
const base64Chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
export function base64ToBytes(str: string): number[] {
    // remove "=" from the end of the string
    str = str.replace(/=+$/, "");
    if (str.length == 0) throw new Error("Base64 string contained only '='.");
    // convert to a multiple of 8 binary bits
    let binary: string = "";
    for (let i: number = 0; i < str.length; i++) {
        const index: number = base64Chars.indexOf(str[i]!);
        if (index == -1) throw new Error("Invalid character in base64 string.");
        binary += index.toString(2).padStart(6, "0");
    }
    binary = padEndToMod(binary, 8, "0");
    // convert each chunk of 8 bits to a byte in the array
    let bytes: number[] = [];
    for (let i: number = 0; i < binary.length; i += 8)
        bytes.push(parseInt(binary.substring(i, i + 8), 2));
    if ((str.length % 4 == 2) || (str.length % 4 == 3)) bytes.pop();
    return bytes;
}
export function bytesToBase64(bytes: number[]): string {
    // convert to a multiple of 6 binary bits
    let binary: string = "";
    for (let i = 0; i < bytes.length; i++)
        binary += bytes[i]!.toString(2).padStart(8, "0");
    binary = padEndToMod(binary, 6, "0");
    // convert each chunk of 6 bits to a base64 character
    let base64: string = "";
    for (let i = 0; i < binary.length;)
        base64 += base64Chars[parseInt(binary.substring(i, i += 6), 2)];
    // if the length is now zero, return a single A(0) padded with "="
    const base64Len: number = base64.length;
    if (base64Len == 0) return "A===";
    // pad with "=" to the nearest multiple of 4
    return padEndToMod(base64, 4, "=");
}
// string functions
export function stringToBytes(str: string): number[] {
    // convert each char to a byte in the array
    const bytes: number[] = [];
    for (let i: number = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i));
    return bytes;
}
export function bytesToString(bytes: number[]): string {
    // convert each char to a byte in the array
    let str: string = "";
    for (let i = 0; i < bytes.length; i++)
        str += String.fromCharCode((bytes[i]! & 0xFF));
    return str;
}
// 32 bit word functions
export function bytesToWords(bytes: number[]): number[] {
    let words: number[] = [];
    for (let i = 0; i < bytes.length; i++)
        words[i >> 2] = (words[i >> 2] || 0) | (bytes[i]! << ((3 - (i % 4)) * 8));
    return words.map((word: number) => (word >>> 0));
}
export function wordsToBytes(words: number[]): number[] {
    let bytes: number[] = [];
    for (let i: number = 0; i < words.length * 4; i++)
        bytes.push((words[i >> 2]! >> ((3 - (i % 4)) * 8)) & 0xFF);
    return bytes;
}