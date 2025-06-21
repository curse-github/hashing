import { base32ToBytes, wordsToBytes } from "./numberHandling";
import { hmac1 } from "./HMAC";
// implementation of HMAC-Based One Time Password(HOTP)
// and Time Based One Time Password(TOTP)
// by Curse
const oneTimeDuration: number = 30 * 1000;// 30 seconds
const totpWindow: number = 1;
const hotpCodeLength: 1|2|3|4|5|6|7|8|9 = 6;

// #region TOTP
// https://en.wikipedia.org/wiki/Time-based_one-time_password
export function checkTotp(key: string, value: string): boolean {
    if (value.length != hotpCodeLength) return false;
    const counter = getCounter();
    for (let i = -totpWindow; i <= totpWindow; i++)
        if (getHOTP(key, counter + i) == value)
            return true;
    return false;
}
function getCounter(): number {
    return Math.floor((new Date()).getTime() / oneTimeDuration);
}
export function getTOTP(key: string): string {
    return getHOTP(key, getCounter());
}
// #endregion TOTP

// #region HOTP
// https://en.wikipedia.org/wiki/HMAC-based_one-time_password#Definition
function getHOTP(key: string, counter: number): string {
    const hmacHash: number[] = hmac1(base32ToBytes(key), wordsToBytes([ counter ]));
    let offset = hmacHash[hmacHash.length - 1]! & 0xF; // Last nibble determines offset
    let binary: number = 0;
    for (let i: number = 0; i < 4; i++)
        binary |= (hmacHash[offset + i]! & ((i == 0) ? 0x7F : 0xFF)) << ((3 - i) * 8);
    return (binary % Math.pow(10, hotpCodeLength)).toString().padStart(hotpCodeLength, "0"); // Return a n-digit HOTP
}
// #endregion HOTP