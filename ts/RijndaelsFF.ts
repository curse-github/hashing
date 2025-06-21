// https://en.wikipedia.org/wiki/Finite_field_arithmetic#Rijndael's_(AES)_finite_field
// also help from ChatGPT
// function using Rijndaels Finite Field or GF(2^8) or GF(2)[x]/(x^8 + x^4 + x^3 + x + 1) where x^8 + x^4 + x^3 + x + 1 = 0b100011011 or 0x11b
export function RijndaelsDegree(poly: number): number {
    for (let i = 8; i >= 0; i--) {
        if ((poly & (1 << i)) !== 0) {
            return i;
        }
    }
    return -1;
}
export function RijndaelsMultiplication(a: number, b: number): number {
    let result = 0;
    for (let i = 0; (i < 8) && (b > 0); i++) {
        if ((b & 1) !== 0) result ^= a;
        if (a & 0x80) a = ((a << 1) ^ 0x1b) & 0xFF;// AES irreducible polynomial(0x11b) mod 0x100
        else a = a << 1;
        b = (b >> 1);
    }
    return result & 0xFF;
}
export function RijndaelsDivision(dividend: number, divisor: number): [ number, number ] {
    if (RijndaelsDegree(dividend) < RijndaelsDegree(divisor)) return [ 0, dividend ];
    let quotient = 0;
    let remainder = dividend;
    const degDivisor = RijndaelsDegree(divisor);
    while (RijndaelsDegree(remainder) >= degDivisor) {
        const shift = RijndaelsDegree(remainder) - degDivisor;
        quotient ^= 1 << shift;
        remainder ^= divisor << shift;
    }
    return [ quotient, remainder ];
}
// for 0 < a < p : there exists s and t such that as + pt = 1
// if equation is mod p then (as + pt) % p = as % p = 1 % p = 1 => there exists s such that as % p = 1
// as + pt = 1
// p   = q_1*a   + r_1 where q_1 and r_1 are integers and 0 <= r_1 < a
// a   = q_2*r_1 + r_2 where q_2 and r_2 are integers and 0 <= r_2 < r_1
// r_1 = q_3*r_2 + r_3 where q_3 and r_3 are integers and 0 <= r_3 < r_2
// r_2 = q_4*r_3 + r_4 where q_4 and r_4 are integers and 0 <= r_4 < r_3
// ...
// r_(n-2) = q_n*r_(n-1) + 0 because r_x is strictly decreasing due to the condition of r(n) < r_(n-1)

export function RijndaelsExtendedEuclidean(a: number): number { // find inverse of a in GF(2^8) mod 0x11b
    let x: number = a;
    let y: number = 0x11b;
    let s1: number = 0;
    let s2: number = 1;
    while (y !== 0) {
        let [ q, r ]: [ number, number ] = RijndaelsDivision(x, y);
        let s0: number = s2 ^ RijndaelsMultiplication(q, s1);
        // cycle variables
        x = y;
        y = r;
        s2 = s1;
        s1 = s0;
    }
    return s2;
}