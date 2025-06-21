// https://www.youtube.com/watch?v=dCvB-mhkT0w
// ECC key of 384 bits is equivilant to the security of a 7680 bit RSA key
// a 384 bit ECC key is considered top secret level security by the us government
// A dot A -> B
// A dot B -> C
// D = -C
// A dot E -> D
// F = -E
// A dot G -> F
// ...
// iterate this process N times
// maximum value is the size of the key


// https://www.youtube.com/watch?v=F3zzNa42-tQ
// Calculating
//     y^2=x^3+ax+b
//     
//     A dot A -> B:
//         S = (3(A.x)^2+a)/(2A.y)
//         B.x = S^2-2A.x
//         B.y = 3SA.x-S^3-A.y
//     A dot B -> C:
//         S = (B.y-A.y)/(B.x-A.x)
//         C.x = S^2-A.x-B.x
//         C.y = SA.x-SC.x-A.y
// public values:
//     p: modulus value, or the domain of the curve
//     a,b: the curve parameters such that y^2 = x^3 + ax + b
//     G: the generator point such that nG = P
//     n: ord(G)
//     h: cofactor
// method:
//     alice creates private key a such that 1 <= a <= n-1
//     alice compute public key A such that A = aG
//     bob creates private key b such that 1 <= b <= n-1
//     bob compute public key B such that B = bG
//     alice sends bob her public key A
//     bob sends alice his public key B
//     alice and bob compute P = aB or bA
//     this results in alice and bob having the same point because abG = baG
import { FF } from "./384FF";
export type number384 = FF.number384;
export type point = [ number384, number384 ];
export function pointDouble(A: point, a: number384): point {
    // https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Point_doubling
    let S: number384 = FF.modularDiv(FF.add(FF.mult(FF.three, FF.mult(A[0]!, A[0]!)), a), FF.mult(A[1]!, FF.two));// s = (3a.x^2)/(2a.y)
    const x: number384 = FF.mult(S, S);
    FF.subEqual(x, FF.mult(A[0]!, FF.two));// x = S^2 - 2A.x
    const y = FF.mult(S, FF.sub(A[0]!, x));
    FF.subEqual(y, A[1]);// y = s(a.x - x) - a.y
    return [ FF.truncate384(x), FF.truncate384(y) ];
}
export function pointAdd(A: point, B: point): point {
    // https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Point_addition
    const S: number384 = FF.modularDiv(FF.sub(B[1]!, A[1]!), FF.sub(B[0]!, A[0]!));// s = (b.y-a.y)/(b.x-a.x)
    const x: number384 = FF.mult(S, S);
    FF.subEqual(x, A[0]!);
    FF.subEqual(x, B[0]!);// x = S^2 - A.x - B.x
    FF.subEqual(A[0]!, x);
    const y = FF.mult(S, A[0]!);
    FF.subEqual(y, A[1]);
    return [ FF.truncate384(x), FF.truncate384(y) ];// y = s(a.x - x) - a.y
}
export function multPoint(s: number384, P: point, a: number384, debug?: boolean): point {
    // https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Double-and-add
    if (FF.isZero(s)) throw new Error("multiply by 0");
    s = [ ...s ];
    let res: point|undefined = undefined;
    let temp: point = P;
    let i: number = 0;
    while (!FF.isZero(s)) {
        if (debug) console.log((i++).toString().padStart(3, " "), pointToHex(temp));
        if ((s[11] & 1) === 1) res = ((res == undefined) ? [ [ ...temp[0] ], [ ...temp[1] ] ] : pointAdd(res, temp));
        FF.rightShiftEqual(s, 1);
        temp = pointDouble(temp, a);
    }
    return res!;
}
import { base16ToBytes, bytesToWords } from "./numberHandling";
export function pointFromHex(str: string): point {
    if (str.length != 194) return [ [ ...FF.zero ], [ ...FF.zero ] ];
    return [ bytesToWords(base16ToBytes(str.substring(2, 98))) as number384, bytesToWords(base16ToBytes(str.substring(98))) as number384 ];
}
export function pointToHex(p: point): string {
    return "04" + (FF.toBase16(p[0]!) + FF.toBase16(p[1]!));
}

// from, secp384r1, my reference being https://neuromancer.sk/std/secg/secp384r1#
const a: number384 = bytesToWords(base16ToBytes("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC")) as number384;// can also be calculated as p - 3
// const b: number384 = bytesToWords(base16ToBytes("B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF")) as number384;
// G = (0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7, 0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f)
const G: point = pointFromHex("04AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB73617DE4A96262C6F5D9E98BF9292DC29F8F41DBD289A147CE9DA3113B5F0B8C00A60B1CE1D7E819D7A431D7C90EA0E5F");

// const keyPairs: [ number384, point ][] = [];
export function getPublic(privateStr: string, knownValue?: string, debug?: boolean): string {
    const privateKey: number384 = bytesToWords(base16ToBytes(privateStr)) as number384;
    for (let i = privateKey.length; i < 12; i++) privateKey.unshift(0);
    const startTime: number = (new Date()).getTime();
    const publicKey: point = multPoint(privateKey, G, a, debug);
    const endTime: number = ((new Date()).getTime() - startTime) / 1000;
    const publicStr: string = pointToHex(publicKey);

    /* console.log("private:", privateStr);
    console.log(" public:", publicStr);
    console.log("took " + endTime + "s");
    if (knownValue) {
        const matches: boolean = (publicStr === knownValue);
        console.log("correct?:", matches);
    }
    console.log();
    keyPairs.push([ privateKey, publicKey ]);*/
    return publicStr;
}
import { generateBase16Num } from "./Random";
export function getKeyPair(): [ string, string ] {
    const privateStr: string = generateBase16Num(48);
    const publicStr: string = getPublic(privateStr);
    return [ privateStr, publicStr ];
}
/*
getPublic("0000000000000000000000000000000051897B64E85C3F714BBA707E867914295A1377A7463A9DAE8EA6A8B914246319", "04687767250027023EA16A100A5013B11204D23C297FA7CA3089178B1F135C3044BFF9D12DD1DEF8AFBC8107B41B3B246F837B9FA9E3235E5284BC537A536E82226676F81D2E4C8C5159E643914802B00DB33C3DF15FD7E4E514295A1DF1088451");
getPublic("EEBB53AA624A244B5C845547C4320F121FF3AF21C26899E62F2E5D76A454816153EC66FC2A2C2BBDF37A020D545F8CF0", "04D9836A82760F45D06A9FDA48BB12E1D9A48122DCA082E43769009041B709CA8E381E8FFDDAB2CBE690E6012E702AA1D470F85DEF97AD3CCFA1F24BE8E39A4E9F7A842D49EEAD042BEBBAD2DB418D84D6DE475CB05FCA91209F20F665837FE46D");
getPublic("18E72E1FEC79E4FA8DFDB6AB71DF62F53CBF89719731049E711C1F44E89D0215069E520B150EAD804D9067799050DCB4", "0457E5C9DBC63879C995142FDA853C5BC28EF63C65CC0A721A1EF33A9A5E94B3E183000BC1BA5459DB4F76A42863836A9881CE3C06804736DDD47F15D62F9BE301C9097597957B7DB75A83E89F319CC5C20501F8A49B440A398434CF7EC582709D");
getPublic("2DE5DFEC9B51E4F7E1FFD5D7F311C0A0FCFE2C81E811A47A4B349618C8F2F1B0F59FA17BFA1ED6A34AF3760B4D42EF61", "0424A34BD70A56F5065D18DC28FC93B0CFD80B746C4EA6F66AEFD1CE71BD850885420D0420EE2504A3DB1A04D659504A1D4615D647395578D5081AED9DD4588D9DE2494123A4E91DFD891A41995FC7D1538825197E06D072B0EC810F43384F316A");
getPublic("6F2D24918E5701476FCF829D408B8FAF49FD9053125CFF01F8332C1C7659B34210763C64678516AB6CD38ADF7F31FE26", "048F9DDA54813ADEF962CFEAA8383D46F762E69D5A3AAACC5B2B8B25E6AEE3A2AC7C786908CF72C8A3E4BC280B5561D225C87C1D3BF4B4B24B724D1D21A22EB5E9D2F73297EB1F4C57553E51D1C7C6B5B64694AF78AEBE9635E2F0498B40F1DA91");
getPublic("1B19C2BAC56F31419F9E8A9CD964780F9DC33DD937D235937418EF505015D127B8CB20C27E9AD3A4FC823063E3D1DD88", "04609AC5B5CE2E994E64DF6FD1B32C0F6D73EE9D66BAA5A2C36CAF65E61255986C01AF71F315FECE284B28760583EAF40CBCE7A3D799240F296C0F734EF1566BD3EBFE93E1FA3E81E175E224D6272934FFA7FD0C5CA82B411D3E42235D309C5B45");
getPublic("B89619D9AFA5CA9F029B9085B90D07B01A95F0E2D7038C1E920AA9E8275B543F32364D33CEAC58D2A5241AC1E9F88EC8", "044BEE33CE2C9C00DE059E00D1E84FAF6CA38455891C83C23A2C2508CCC18AF586B48B4DFEEC5E81BDA514D67EC338CC6580E7C4CB51F4C08F415B3DEC02F5E5CB03C34A57E5636072BF7BD4B389124FB3BA1CF98A9CB9612640580B04EF8E4713");
getPublic("AF7717738E02958B14160CA44277E0147F7512FB3B6FA467B89C1CAAC745C638F7E5655F6BBA228643D3A4F583BC91A2", "0434DCF910DD69D5FCB1801C13FCF8586A97F87D5D3F72C90125107B634A5070EB3C4EEF6486238AEDE4B31F8952C6C2A8B0BDF018053D47BF0F4F1CCE0B71920D3F4FA0A6F8CFA5888650B512C75AD822B9188FE0CA5076167BC35DD89AD6ECAD");
getPublic("820288643FF080E65461050F5233F9B41BF12925451EE10D82F6525969EDA13FA45A93CDD99CCE81CE17E5DA42FDB956", "0449933D3A1A6E4E0B0C6DBE2D96D444C81EF1AEDE308B63E008A756D73FE22C3DB5C6795BC14E8D3A08BEF2CA3F622842B466D92A7804605E094D682CE26A00821E125F4193B4368877D2A6217F5A256CCD80E5699BE229769781E451E9C62EEC");
getKeyPair();
getKeyPair();
getKeyPair();
getKeyPair();
for (let i = 0; i < keyPairs.length; i++) {
    for (let j = i; j < keyPairs.length; j++) {
        const iJ: point = multPoint(keyPairs[i]![0], keyPairs[j]![1], a);
        const jI: point = multPoint(keyPairs[j]![0], keyPairs[i]![1], a);
        for (let k = 0; k < 2; k++)
            for (let l = 0; l < 12; l++)
                if (iJ[k]![l]! != jI[k]![l]!)
                    console.log("\nERROR\n");
        console.log("shared key " + i + "-" + j + ":", pointToHex(iJ));
    }
}
for (let i = 0; i < keyPairs.length; i++) {
    for (let j = i; j < keyPairs.length; j++) {
        for (let k = j; k < keyPairs.length; k++) {
            const ijK: point = multPoint(keyPairs[i]![0], multPoint(keyPairs[j]![0], keyPairs[k]![1], a), a);
            const jkI: point = multPoint(keyPairs[j]![0], multPoint(keyPairs[k]![0], keyPairs[i]![1], a), a);
            const kiJ: point = multPoint(keyPairs[k]![0], multPoint(keyPairs[i]![0], keyPairs[j]![1], a), a);
            for (let k = 0; k < 2; k++)
                for (let l = 0; l < 12; l++)
                    if ((ijK[k]![l]! != jkI[k]![l]!) || (jkI[k]![l]! != kiJ[k]![l]!) || (kiJ[k]![l]! != ijK[k]![l]!))
                        console.log("\nERROR\n");
            console.log("shared key " + i + "-" + j + "-" + k + ":", pointToHex(ijK));
        }
    }
} // */