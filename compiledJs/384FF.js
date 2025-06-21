// #region ./384FF
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

var FF;
(function (FF) {
    // constants
    FF.MAX32 = 0b11111111111111111111111111111111;
    FF.zero = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    FF.one = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
    FF.two = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2];
    FF.three = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3];
    FF.four = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4];
    FF.eight = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8];
    FF.MAX384 = [
        FF.MAX32, FF.MAX32,
        FF.MAX32, FF.MAX32,
        FF.MAX32, FF.MAX32,
        FF.MAX32, FF.MAX32,
        FF.MAX32, FF.MAX32,
        FF.MAX32, FF.MAX32
    ];
    // from, secp384r1, my reference being https://neuromancer.sk/std/secg/secp384r1#
    // p = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff
    FF.p = [
        FF.MAX32, FF.MAX32,
        FF.MAX32, FF.MAX32,
        FF.MAX32, FF.MAX32,
        FF.MAX32, 0b11111111111111111111111111111110,
        FF.MAX32, 0b00000000000000000000000000000000,
        0b00000000000000000000000000000000, FF.MAX32
    ];
    // operators
    function degree(a) {
        for (let i = 0; i < a.length; i++)
            for (let j = 31; j >= 0; j--)
                if ((a[i] >>> j) & 1)
                    return ((a.length - i - 1) * 32) + j;
        return 0;
    }
    FF.degree = degree;
    function isZero(a) {
        for (let i = 0; i < a.length; i++)
            if (a[i] != 0)
                return false;
        return true;
    }
    FF.isZero = isZero;
    // 1 if a > b
    // -1 if a < b
    // 0 if a == b
    function compareInPlace(A, B) {
        var _a, _b, _c, _d;
        for (let i = 0; i < A.length; i++) {
            if (((_a = A[i]) !== null && _a !== void 0 ? _a : 0) > ((_b = B[i]) !== null && _b !== void 0 ? _b : 0))
                return 1;
            if (((_c = A[i]) !== null && _c !== void 0 ? _c : 0) < ((_d = B[i]) !== null && _d !== void 0 ? _d : 0))
                return -1;
        }
        return 0;
    }
    function compare(A, B) {
        if (A.length > B.length) {
            const y = [...B];
            for (let i = 0; (A.length - y.length) > 0; i++)
                y.unshift(0);
            return compareInPlace(A, y);
        }
        else if (A.length > B.length) {
            const x = [...A];
            for (let i = 0; (B.length - x.length) > 0; i++)
                x.unshift(0);
            return compareInPlace(x, B);
        }
        else
            return compareInPlace(A, B);
    }
    FF.compare = compare;
    function rawLeftShift(A, B) {
        let output = [...A];
        rawLeftShiftEqual(output, B);
        return output;
    }
    function rawLeftShiftEqual(A, B) {
        const wordShifts = Math.floor(B / 32);
        for (let i = 0; i < wordShifts; i++)
            A.push(0b00000000000000000000000000000000);
        const bitShifts = B % 32;
        for (let j = 0; j < bitShifts; j++) {
            // do a single left shift b times
            let overflow = false;
            for (let i = A.length - 1; i >= 0; i--) {
                const lastOverflow = overflow;
                overflow = ((A[i] & 0b10000000000000000000000000000000) != 0); // will it overflow when left shifted
                A[i] <<= 1;
                if (lastOverflow)
                    A[i] += 0b00000000000000000000000000000001;
                A[i] &= FF.MAX32;
                A[i] >>>= 0;
            }
            if (overflow)
                A.unshift(0b00000000000000000000000000000001);
        }
    }
    function rightShift(a, b) {
        let output = [...a];
        rightShiftEqual(output, b);
        return output;
    }
    FF.rightShift = rightShift;
    function rightShiftEqual(a, b) {
        const wordShifts = Math.floor(b / 32);
        for (let i = 0; i < wordShifts; i++)
            a.pop();
        const bitShifts = b % 32;
        for (let j = 0; j < bitShifts; j++) {
            // do a single right shift b times
            let carry = false;
            for (let i = 0; i < a.length; i++) {
                const didCarry = carry;
                carry = (a[i] & 1) === 1; // if will it underflow when right shifted
                a[i] >>>= 1;
                if (didCarry)
                    a[i] |= 0b10000000000000000000000000000000; // after doing a right shift, it should never have a left most bit so you can safely just or instead of add
            }
        }
    }
    FF.rightShiftEqual = rightShiftEqual;
    function rawAdd(A, B) {
        const output = [];
        const x = [...A];
        const y = [...B];
        if (x.length > y.length)
            for (let i = 0; (x.length - y.length) > 0; i++)
                y.unshift(0);
        if (y.length > x.length)
            for (let i = 0; (y.length - x.length) > 0; i++)
                x.unshift(0);
        let overflow = false;
        for (let i = x.length - 1; i >= 0; i--) {
            output[i] = x[i] + y[i] + (overflow ? 1 : 0);
            if (overflow = (output[i] > FF.MAX32))
                output[i] = (output[i] & FF.MAX32) >>> 0;
        }
        if (overflow)
            output.unshift(0b00000000000000000000000000000001);
        return output;
    }
    function rawAddEqual(A, B) {
        const y = [...B];
        if (A.length > y.length)
            for (let i = 0; (A.length - y.length) > 0; i++)
                y.unshift(0);
        if (y.length > A.length)
            for (let i = 0; (y.length - A.length) > 0; i++)
                A.unshift(0);
        let overflow = false;
        for (let i = A.length - 1; i >= 0; i--) {
            A[i] = A[i] + y[i] + (overflow ? 1 : 0);
            if (overflow = (A[i] > FF.MAX32))
                A[i] = (A[i] & FF.MAX32) >>> 0;
        }
        if (overflow)
            A.unshift(0b00000000000000000000000000000001);
    }
    function rawSub(A, B) {
        let output = [];
        let x = [...A];
        let y = [...B];
        if (x.length > y.length)
            for (let i = 0; (x.length - y.length) > 0; i++)
                y.unshift(0);
        if (y.length > x.length)
            for (let i = 0; (y.length - x.length) > 0; i++)
                x.unshift(0);
        let subUnderflow = false;
        for (let i = x.length - 1; i >= 0; i--) {
            output[i] = x[i] - y[i] - (subUnderflow ? 1 : 0);
            // console.log("       " + x[i]! + " - " + y[i]! + " = " + ((output[i]! < 0) ? (MAX32 + output[i]! + 1) : output[i]!));
            if (subUnderflow = (output[i] < 0))
                output[i] = (FF.MAX32 + output[i] + 1) >>> 0;
        }
        if (subUnderflow)
            output.unshift(-1);
        while (output[0] === -1)
            rawAddEqual(output, FF.p);
        return output;
    }
    FF.rawSub = rawSub;
    function rawSubEqual(A, B) {
        let y = [...B];
        if (A.length > y.length)
            for (let i = 0; (A.length - y.length) > 0; i++)
                y.unshift(0);
        if (y.length > A.length)
            for (let i = 0; (y.length - A.length) > 0; i++)
                A.unshift(0);
        let subUnderflow = false;
        for (let i = A.length - 1; i >= 0; i--) {
            A[i] = A[i] - y[i] - (subUnderflow ? 1 : 0);
            if (subUnderflow = (A[i] < 0))
                A[i] = (FF.MAX32 + A[i] + 1) >>> 0;
        }
        if (subUnderflow)
            A.unshift(-1);
        while (A[0] === -1)
            rawAddEqual(A, FF.p);
    }
    function modP(A) {
        let output = [...A];
        while (compare(output, FF.p) !== -1) {
            const shift = Math.max(degree(output) - 384, 0); // 384 is the degree of p
            rawSubEqual(output, rawLeftShift(FF.p, shift));
        }
        return truncate384(output);
    }
    function modPEqual(A) {
        while (compare(A, FF.p) !== -1) {
            const shift = Math.max(degree(A) - 384, 0); // 384 is the degree of p
            rawSubEqual(A, rawLeftShift(FF.p, shift));
        }
    }
    function sub(A, B) {
        return modP(rawSub(A, B));
    }
    FF.sub = sub;
    function subEqual(A, B) {
        rawSubEqual(A, B);
        modPEqual(A);
    }
    FF.subEqual = subEqual;
    function add(A, B) {
        return modP(rawAdd(A, B));
    }
    FF.add = add;
    function addEqual(A, B) {
        rawAddEqual(A, B);
        modPEqual(A);
    }
    FF.addEqual = addEqual;
    function neg(a) {
        return FF.sub(FF.zero, a);
    }
    FF.neg = neg;
    function mult(a, b) {
        let output = [];
        let x = [...a];
        if (isZero(x))
            return x;
        let y = [...b];
        while (!isZero(y)) {
            if (y[y.length - 1] & 1)
                rawAddEqual(output, x);
            rawLeftShiftEqual(x, 1);
            rightShiftEqual(y, 1);
        }
        return modP(output);
    }
    FF.mult = mult;
    function integerDiv(dividend, divisor) {
        let quotient = [...FF.zero];
        if (isZero(divisor))
            throw new Error("div by 0");
        let degDivisor = degree(divisor);
        let remainder = [...dividend];
        let diff = Math.max(degree(remainder) - degDivisor - 1, 0);
        while (compare(remainder, divisor) !== -1) { // remainder >= divisor
            rawAddEqual(quotient, rawLeftShift(FF.one, diff));
            subEqual(remainder, rawLeftShift(divisor, diff));
            diff = Math.max(degree(remainder) - degDivisor - 1, 0);
        }
        return [quotient, remainder];
    }
    FF.integerDiv = integerDiv;
    function multInv(a) {
        // version of extended euclidean
        let x = [...a];
        let y = [...FF.p];
        let s2 = [...FF.one];
        let s1 = [...FF.zero];
        while (!isZero(y)) {
            let [q, r] = integerDiv(x, y);
            let s0 = sub(s2, mult(q, s1));
            // cycle variables
            x = y;
            y = r;
            s2 = s1;
            s1 = s0;
        }
        return s2;
    }
    FF.multInv = multInv;
    function modularDiv(dividend, divisor) {
        if (isZero(divisor))
            throw new Error("div by 0");
        return mult(dividend, multInv(divisor));
    }
    FF.modularDiv = modularDiv;
    function truncate384(a) {
        return a.slice(a.length - 12, a.length);
    }
    FF.truncate384 = truncate384;
    function toBase64(a) {
        return bytesToBase64(wordsToBytes(a));
    }
    FF.toBase64 = toBase64;
    function toBase16(a) {
        return bytesToBase16(wordsToBytes(a));
    }
    FF.toBase16 = toBase16;
})(FF || (FF = {}));
/*
console.log("0:");
FF.prnt(FF.zero);
console.log("1:");
FF.prnt(FF.one);
console.log("inf:");
FF.prnt(FF.inf);
console.log("  -------------------------------- -------------------------------- -------------------------------- -------------------------------- -------------------------------- --------------------------------");
console.log("0 + 0:");
FF.prnt(FF.add(FF.zero, FF.zero));
console.log("0 + 1:");
FF.prnt(FF.add(FF.zero, FF.one));
console.log("1 + 1:");
FF.prnt(FF.add(FF.one, FF.one));
console.log("inf + 1:");
FF.prnt(FF.add(FF.inf, FF.one));
console.log("MAX32 + 1:");
FF.prnt(FF.add([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, FF.MAX32 ], FF.one));
console.log("MAX32 + MAX32:");
FF.prnt(FF.add([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, FF.MAX32 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, FF.MAX32 ]));
console.log("  -------------------------------- -------------------------------- -------------------------------- -------------------------------- -------------------------------- --------------------------------");
console.log("0 - 0:");
FF.prnt(FF.sub(FF.zero, FF.zero));
console.log("0 - 1:");
FF.prnt(FF.sub(FF.zero, FF.one));
console.log("1 - 1:");
FF.prnt(FF.sub(FF.one, FF.one));
console.log("1<<32 - 1:");
FF.prnt(FF.sub([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 ], FF.one));
console.log("MAX32 - MAX32:");
FF.prnt(FF.sub([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, FF.MAX32 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, FF.MAX32 ]));
console.log("  -------------------------------- -------------------------------- -------------------------------- -------------------------------- -------------------------------- --------------------------------");
const neg3_1: FF.number384 = FF.sub(FF.zero, FF.three);
const neg3_2: FF.number384 = FF.sub(FF.p, FF.three);
const neg3_3: FF.number384 = FF.neg(FF.three);
console.log("0 - 3:");
FF.prnt(neg3_1);
console.log("p - 3:");
FF.prnt(neg3_2);
console.log("neg(3):");
FF.prnt(neg3_3);
console.log("  -------------------------------- -------------------------------- -------------------------------- -------------------------------- -------------------------------- --------------------------------");
console.log("(0 - 3) + 3:");
FF.prnt(FF.add(neg3_1, FF.three));
console.log("(p - 3) + 3:");
FF.prnt(FF.add(neg3_2, FF.three));
console.log("neg(3) + 3:");
FF.prnt(FF.add(neg3_3, FF.three));
console.log("  -------------------------------- -------------------------------- -------------------------------- -------------------------------- -------------------------------- --------------------------------");
FF.prnt([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ]);
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000000000000001 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000000000000010 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000000000000100 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000000000001000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000000000010000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000000000100000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000000001000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000000010000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000000100000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000001000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000010000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000000100000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000001000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000010000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000000100000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000001000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000010000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000000100000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000001000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000010000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000000100000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000001000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000010000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000000100000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000001000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000010000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00000100000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00001000000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00010000000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b00100000000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b01000000000000000000000000000000 ], 1));
console.log();
console.log("transition");
console.log();
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b10000000000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b000001, 0b00000000000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b000010, 0b00000000000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b000100, 0b00000000000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b001000, 0b00000000000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b010000, 0b00000000000000000000000000000000 ], 1));
FF.prnt(FF.leftShift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0b100000, 0b00000000000000000000000000000000 ], 1));
console.log("  -------------------------------- -------------------------------- -------------------------------- -------------------------------- -------------------------------- --------------------------------");
console.log(FF.degree([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]));
console.log(FF.degree([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ]));
console.log(FF.degree([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2 ]));
console.log(FF.degree([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4 ]));
console.log(FF.degree([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8 ]));
console.log(FF.degree([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16 ]));
for (let i = 1; i < 201; i++) {
    console.log(i, FF.toBase16(FF.modularDiv([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, i ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, i ])));
}
// */ 
// #endregion ./384FF
