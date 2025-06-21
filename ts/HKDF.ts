import { hmac256 } from "./HMAC";
// implementation of HMAC-Based Key Derivation Function(HKDF)
// by Curse
// #region HKDF
// https://en.wikipedia.org/wiki/HKDF
// ikm = input key material
function hkdf_extract(salt: number[], ikm: number[]): number[] {
    if (salt.length == 0) {
        let newSalt: number[] = [];
        for (let i = 0; i < 64; i++)
            newSalt.push(0);
        return hmac256(newSalt, ikm);
    }
    return hmac256(salt, ikm);
}
// prk = pseudo-random key
function hkdf_expand(prk: number[], info: number[], length: number): number[] {
    let t: number[] = [];
    let okm: number[] = [];
    let i: number = 0;
    while (okm.length < length) {
        i++;
        t = hmac256(prk, t.concat(info).concat([ i ]));
        okm = okm.concat(t);
    }
    return okm.slice(0, length);
}
export function hkdf(salt: number[], ikm: number[], info: number[], length: number): number[] {
    return hkdf_expand(hkdf_extract(salt, ikm), info, length);
}
// #endregion HKDF