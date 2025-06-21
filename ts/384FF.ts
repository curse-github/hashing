import { wordsToBytes, bytesToBase16, bytesToBase64 } from "./numberHandling";
export namespace FF {
    // types
    export type number384 = [ number, number, number, number, number, number, number, number, number, number, number, number ];
    export type number768 = [ number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number ];
    // constants
    export const MAX32: number = 0b11111111111111111111111111111111;
    export const zero: number384 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    export const one: number384 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ];
    export const two: number384 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2 ];
    export const three: number384 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3 ];
    export const four: number384 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4 ];
    export const eight: number384 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8 ];
    export const MAX384: number384 = [
        MAX32, MAX32,
        MAX32, MAX32,
        MAX32, MAX32,
        MAX32, MAX32,
        MAX32, MAX32,
        MAX32, MAX32
    ];
    // from, secp384r1, my reference being https://neuromancer.sk/std/secg/secp384r1#
    // p = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff
    export const p: number384 = [
        MAX32, MAX32,
        MAX32, MAX32,
        MAX32, MAX32,
        MAX32, 0b11111111111111111111111111111110,
        MAX32, 0b00000000000000000000000000000000,
        0b00000000000000000000000000000000, MAX32
    ];

    // operators
    export function degree(a: number[]): number {
        for (let i = 0; i < a.length; i++)
            for (let j = 31; j >= 0; j--)
                if ((a[i]! >>> j) & 1)
                    return ((a.length - i - 1) * 32) + j;
        return 0;
    }
    export function isZero(a: number[]): boolean {
        for (let i = 0; i < a.length; i++)
            if (a[i] != 0)
                return false;
        return true;
    }
    // 1 if a > b
    // -1 if a < b
    // 0 if a == b
    function compareInPlace(A: number[], B: number[]): -1 | 0 | 1 {
        for (let i = 0; i < A.length; i++) {
            if ((A[i] ?? 0) > (B[i] ?? 0)) return 1;
            if ((A[i] ?? 0) < (B[i] ?? 0)) return -1;
        }
        return 0;
    }
    export function compare(A: number[], B: number[]): -1 | 0 | 1 {
        if (A.length > B.length) {
            const y: number[] = [ ...B ];
            for (let i = 0; (A.length - y.length) > 0; i++) y.unshift(0);
            return compareInPlace(A, y);
        } else if (A.length > B.length) {
            const x: number[] = [ ...A ];
            for (let i = 0; (B.length - x.length) > 0; i++) x.unshift(0);
            return compareInPlace(x, B);
        } else return compareInPlace(A, B);
    }
    function rawLeftShift(A: number[], B: number): number[] {
        let output: number[] = [ ...A ];
        rawLeftShiftEqual(output, B);
        return output;
    }
    function rawLeftShiftEqual(A: number[], B: number) {
        const wordShifts: number = Math.floor(B / 32);
        for (let i = 0; i < wordShifts; i++) A.push(0b00000000000000000000000000000000);
        const bitShifts: number = B % 32;
        for (let j = 0; j < bitShifts; j++) {
            // do a single left shift b times
            let overflow: boolean = false;
            for (let i = A.length - 1; i >= 0; i--) {
                const lastOverflow: boolean = overflow;
                overflow = ((A[i]! & 0b10000000000000000000000000000000) != 0);// will it overflow when left shifted
                A[i]! <<= 1;
                if (lastOverflow) A[i]! += 0b00000000000000000000000000000001;
                A[i]! &= MAX32;
                A[i]! >>>= 0;
            }
            if (overflow) A.unshift(0b00000000000000000000000000000001);
        }
    }
    export function rightShift(a: number[], b: number): number[] {
        let output: number[] = [ ...a ];
        rightShiftEqual(output, b);
        return output;
    }
    export function rightShiftEqual(a: number[], b: number) {
        const wordShifts: number = Math.floor(b / 32);
        for (let i = 0; i < wordShifts; i++) a.pop();
        const bitShifts: number = b % 32;
        for (let j = 0; j < bitShifts; j++) {
            // do a single right shift b times
            let carry: boolean = false;
            for (let i = 0; i < a.length; i++) {
                const didCarry: boolean = carry;
                carry = (a[i]! & 1) === 1;// if will it underflow when right shifted
                a[i]! >>>= 1;
                if (didCarry) a[i]! |= 0b10000000000000000000000000000000;// after doing a right shift, it should never have a left most bit so you can safely just or instead of add
            }
        }
    }
    function rawAdd(A: number[], B: number[]): number[] {
        const output: number[] = [];
        const x: number[] = [ ...A ];
        const y: number[] = [ ...B ];
        if (x.length > y.length) for (let i = 0; (x.length - y.length) > 0; i++) y.unshift(0);
        if (y.length > x.length) for (let i = 0; (y.length - x.length) > 0; i++) x.unshift(0);
        let overflow: boolean = false;
        for (let i = x.length - 1; i >= 0; i--) {
            output[i] = x[i]! + y[i]! + (overflow ? 1 : 0);
            if (overflow = (output[i]! > MAX32)) output[i] = (output[i]! & MAX32) >>> 0;
        }
        if (overflow) output.unshift(0b00000000000000000000000000000001);
        return output;
    }
    function rawAddEqual(A: number[], B: number[]) {
        const y: number[] = [ ...B ];
        if (A.length > y.length) for (let i = 0; (A.length - y.length) > 0; i++) y.unshift(0);
        if (y.length > A.length) for (let i = 0; (y.length - A.length) > 0; i++) A.unshift(0);
        let overflow: boolean = false;
        for (let i = A.length - 1; i >= 0; i--) {
            A[i] = A[i]! + y[i]! + (overflow ? 1 : 0);
            if (overflow = (A[i]! > MAX32)) A[i] = (A[i]! & MAX32) >>> 0;
        }
        if (overflow) A.unshift(0b00000000000000000000000000000001);
    }
    export function rawSub(A: number[], B: number[]): number[] {
        let output: number[] = [];
        let x: number[] = [ ...A ];
        let y: number[] = [ ...B ];
        if (x.length > y.length) for (let i = 0; (x.length - y.length) > 0; i++) y.unshift(0);
        if (y.length > x.length) for (let i = 0; (y.length - x.length) > 0; i++) x.unshift(0);
        let subUnderflow: boolean = false;
        for (let i = x.length - 1; i >= 0; i--) {
            output[i] = x[i]! - y[i]! - (subUnderflow ? 1 : 0);
            // console.log("       " + x[i]! + " - " + y[i]! + " = " + ((output[i]! < 0) ? (MAX32 + output[i]! + 1) : output[i]!));
            if (subUnderflow = (output[i]! < 0)) output[i] = (MAX32 + output[i]! + 1) >>> 0;
        }
        if (subUnderflow) output.unshift(-1);
        while (output[0] === -1) rawAddEqual(output, p);
        return output;
    }
    function rawSubEqual(A: number[], B: number[]) {
        let y: number[] = [ ...B ];
        if (A.length > y.length) for (let i = 0; (A.length - y.length) > 0; i++) y.unshift(0);
        if (y.length > A.length) for (let i = 0; (y.length - A.length) > 0; i++) A.unshift(0);
        let subUnderflow: boolean = false;
        for (let i = A.length - 1; i >= 0; i--) {
            A[i] = A[i]! - y[i]! - (subUnderflow ? 1 : 0);
            if (subUnderflow = (A[i]! < 0)) A[i] = (MAX32 + A[i]! + 1) >>> 0;
        }
        if (subUnderflow) A.unshift(-1);
        while (A[0] === -1) rawAddEqual(A, p);
    }
    function modP(A: number[]): number384 {
        let output: number[] = [ ...A ];
        while (compare(output, p) !== -1) {
            const shift: number = Math.max(degree(output) - 384, 0);// 384 is the degree of p
            rawSubEqual(output, rawLeftShift(p, shift));
        }
        return truncate384(output);
    }
    function modPEqual(A: number[]) {
        while (compare(A, p) !== -1) {
            const shift: number = Math.max(degree(A) - 384, 0);// 384 is the degree of p
            rawSubEqual(A, rawLeftShift(p, shift));
        }
    }
    export function sub(A: number384, B: number384): number384 {
        return modP(rawSub(A, B));
    }
    export function subEqual(A: number384, B: number384) {
        rawSubEqual(A, B);
        modPEqual(A);
    }
    export function add(A: number384, B: number384): number384 {
        return modP(rawAdd(A, B));
    }
    export function addEqual(A: number384, B: number384) {
        rawAddEqual(A, B);
        modPEqual(A);
    }
    export function neg(a: number384): number384 { // find additive inverse of a in mod p
        return FF.sub(zero, a);
    }
    export function mult(a: number384, b: number384): number384 {
        let output: number[] = [ ];
        let x: number[] = [ ...a ];
        if (isZero(x)) return x as number384;
        let y: number[] = [ ...b ];
        while (!isZero(y)) {
            if (y[y.length - 1]! & 1)
                rawAddEqual(output, x);
            rawLeftShiftEqual(x, 1);
            rightShiftEqual(y, 1);
        }
        return modP(output);
    }
    export function integerDiv(dividend: number384, divisor: number384): [ number384, number384 ] {
        let quotient: number384 = [ ...zero ];
        if (isZero(divisor)) throw new Error("div by 0");
        let degDivisor: number = degree(divisor);
        let remainder: number384 = [ ...dividend ];
        let diff: number = Math.max(degree(remainder) - degDivisor - 1, 0);
        while (compare(remainder, divisor) !== -1) { // remainder >= divisor
            rawAddEqual(quotient, rawLeftShift(FF.one, diff) as number384);
            subEqual(remainder, rawLeftShift(divisor, diff) as number384);
            diff = Math.max(degree(remainder) - degDivisor - 1, 0);
        }
        return [ quotient, remainder ];
    }
    export function multInv(a: number384): number384 { // find multiplicative inverse of a in mod p
        // version of extended euclidean
        let x: number384 = [ ...a ];
        let y: number384 = [ ...p ];
        let s2: number384 = [ ...one ];
        let s1: number384 = [ ...zero ];
        while (!isZero(y)) {
            let [ q, r ]: [ number384, number384 ] = integerDiv(x, y);
            let s0: number384 = sub(s2, mult(q, s1));
            // cycle variables
            x = y;
            y = r;
            s2 = s1;
            s1 = s0;
        }
        return s2;
    }
    export function modularDiv(dividend: number384, divisor: number384): number384 {
        if (isZero(divisor)) throw new Error("div by 0");
        return mult(dividend, multInv(divisor));
    }
    export function truncate384(a: number[]): number384 {
        return a.slice(a.length - 12, a.length) as number384;
    }
    export function toBase64(a: number[]): string {
        return bytesToBase64(wordsToBytes(a));
    }
    export function toBase16(a: number[]): string {
        return bytesToBase16(wordsToBytes(a));
    }
}
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