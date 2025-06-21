import { bytesToWords, wordsToBytes, stringToBytes, bytesToString } from "./numberHandling";
import { RijndaelsExtendedEuclidean, RijndaelsMultiplication } from "./RijndaelsFF";
export namespace AES {
    function leftRotate(value: number, bitSize: number, amount: number): number {
        if (bitSize === 32) return ((value >>> (bitSize - amount)) | (value << amount)) >>> 0;
        else if (bitSize < 32) return ((value >>> (bitSize - amount)) | (value << amount)) & ((1 << bitSize) - 1);
        return 0;
    }
    // #region S-Box
    function createS_Box(): [ number[], number[] ] {
        // https://en.wikipedia.org/wiki/Rijndael_S-box
        let Sb: number[] = [ 0x63 ];
        let RSb: number[] = [ 0x63 ];
        // have to define i=0 manually because it has no inverse
        Sb[0] = 0x63;
        RSb[0x63] = 0;
        for (let i = 1; i < 256; i++) {
            const b: number = RijndaelsExtendedEuclidean(i);
            Sb[i] = b ^ leftRotate(b, 8, 1) ^ leftRotate(b, 8, 2) ^ leftRotate(b, 8, 3) ^ leftRotate(b, 8, 4) ^ 0x63;
            RSb[Sb[i]!] = i;
        }
        /*
        console.log("S-Box:");
        for (let i = 0; i < 256;) console.log("    " + Sb.slice(i, i += 16).map((byte: number) => byte.toString(16).toUpperCase().padStart(2, "0")).join(" "));
        console.log("(S^-1)-Box:");
        for (let i = 0; i < 256;) console.log("    " + RSb.slice(i, i += 16).map((byte: number) => byte.toString(16).toUpperCase().padStart(2, "0")).join(" "));
        */
        return [ Sb, RSb ];
    }
    let [ S, RS ]: [ number[], number[] ] = createS_Box();
    function SubByte(byte: number): number {
        if (S == undefined) throw new Error("S-Box has not been initialized.");
        else return S[byte]!;
    }
    function UnSubByte(byte: number): number {
        if (RS == undefined) throw new Error("Reverse-S-Box has not been initialized.");
        else return RS[byte]!;
    }
    function SubWord(num: number): number {
        return bytesToWords(wordsToBytes([ num ]).map(SubByte))[0]!;
    }
    // #endregion  S-Box

    export function expandKey(K: number[]): number[] {
        if ((K.length !== 16) && (K.length !== 24) && (K.length !== 32)) throw new Error("key length is not valid.");
        // https://en.wikipedia.org/wiki/AES_key_schedule
        // generate constants used in key schedule
        const rc: number[] = [ 1 ];
        const rcon: number[] = [ 1 << 24 ];
        for (let i: number = 1; i < 14; i++) {
            if (rc[i - 1]! < 0x80)
                rc[i] = rc[i - 1]! << 1;
            else
                rc[i] = ((rc[i - 1]! << 1) ^ 0x1B) & 0xFF;
            rcon[i] = (rc[i]! << 24) >>> 0;
        }
        let Ww: number[] = bytesToWords(K);// 32 bit words of the "expanded key" length of 4R
        // console.log("Wb = ", K);
        // console.log("Ww = ", Ww);
        const N: number = Ww.length;// number of 32 bit words in key size, 4, 6, or 8 for AES128, 196, and 256 respectively
        for (let i = N; i < 60; i++) { // for (let i = 0; i < (4 * R); i++) {
            if ((i % N) === 0) Ww[i] = Ww[i - N]! ^ SubWord(leftRotate(Ww[i - 1]!, 32, 8)) ^ rcon[Math.floor(i / N) - 1]!;// leftRotate(Ww[i - 1]!, 32, 8) === RotWord(Ww[i - 1]!)
            else if ((N > 6) && ((i % N) === 4)) Ww[i] = Ww[i - N]! ^ SubWord(Ww[i - 1]!);
            else Ww[i] = Ww[i - N]! ^ Ww[i - 1]!;
        }
        /*
        console.log("out = [ " + Ww.map((num: number) => "" + (num >>> 0)).join(", ") + " ]");
        const tmp = wordsToBytes(Ww.map((word: number) => (word >>> 0)));
        console.log("expanded-key:");
        for (let i = 0; i < 240;)
            console.log("    " + tmp.slice(i, i += 30).map((num: number) => num.toString(16).padStart(2, "0")).join(" "));
        */
        return wordsToBytes(Ww.map((word: number) => (word >>> 0)));
    }

    export enum Type {
        ECB = 1, // Electronic codebook
        CTR = 2, // Counter
        GCM = 3, // Galois/counter Mode, https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Galois/counter_(GCM)
        CBC = 4, // Cipher block chaining
        PCBC = 5, // Propagating cipher block chaining
        CBC_CTS = 6, // Cipher block chaining, Ciphertext stealing
        PCBC_CTS = 7, // Cipher block chaining, Ciphertext stealing
        CBC_RBT = 8, // Cipher block chaining, Residual block termination
        CFB = 9, // Cipher feedback
        OFB = 10 // Output feedback
    }
    export function TypeToString(AEStype: Type): string {
        switch (AEStype) {
            case AES.Type.ECB:
                return "ECB";
            case AES.Type.CTR:
                return "CTR";
            case AES.Type.GCM:
                return "GCM";
            case AES.Type.CBC:
                return "CBC";
            case AES.Type.PCBC:
                return "PCBC";
            case AES.Type.CBC_CTS:
                return "CBC-CTS";
            case AES.Type.PCBC_CTS:
                return "PCBC-CTS";
            case AES.Type.CBC_RBT:
                return "CBC-RBT";
            case AES.Type.CFB:
                return "CFB";
            case AES.Type.OFB:
                return "OFB";
            default:
                return "";
        }
    }
    export enum Padding {
        NoPadding = 1,
        PKCS7 = 2, // PKCS#7 padding
        DES = 3
    }
    export function PaddingToString(AEStype: Padding): string {
        switch (AEStype) {
            case AES.Padding.NoPadding:
                return "NoPadding";
            case AES.Padding.PKCS7:
                return "PKCS#7";
            case AES.Padding.DES:
                return "DES";
            default:
                return "";
        }
    }
    export function encryptBytes(messageBytes: number[], W: number[], options: { type: Type, Padding?: Padding, IV?: string }): number[] {
        if (options.type == undefined) throw new Error("type option is missing.");
        if (options.type === Type.ECB) {
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            if (options.Padding === Padding.NoPadding) {
                const paddingNeeded: number = (16 - (messageBytes.length % 16)) % 16;
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            } else if (options.Padding === Padding.PKCS7) {
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(paddingNeeded);
            } else if (options.Padding === Padding.DES) {
                messageBytes.push(1);
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            }
            let output: number[] = [];
            for (let i = 0; i < messageBytes.length;)
                output.push(...encryptBlock(messageBytes.slice(i, i += 16) as number16, W));
            return output;
        } else if (options.type === Type.CTR) {
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let CTR: number16 = stringToBytes(options.IV!) as number16;
            let CTRhash: number[] = [];
            const numNeeded: number = Math.ceil(messageBytes.length / 16);
            for (let i = 0; i < numNeeded; i++) {
                CTRhash.push(...encryptBlock(CTR, W));
                if (CTR[15] === 0xFF) {
                    CTR[15] = 0; CTR[14]++;
                } else CTR[15]++;// I most definitely wont use more that 256*256*16 bytes
            }
            return messageBytes.map((byte: number, j: number) => byte ^ CTRhash[j]!);
        } else if (options.type === Type.GCM) {
            return [];
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let CTR: number16 = stringToBytes(options.IV!) as number16;
            let CTRhash: number[] = [];
            const numNeeded: number = Math.ceil(messageBytes.length / 16) + 1;
            for (let i = 0; i < numNeeded; i++) {
                CTRhash.push(...encryptBlock(CTR, W));
                if (CTR[15] === 0xFF) {
                    CTR[15] = 0; CTR[14]++;
                } else CTR[15]++;// I most definitely wont use more that 256*256*16 bytes
            }
            const cipherText: number[] = messageBytes.map((byte: number, j: number) => byte ^ CTRhash[j + 16]!);
            let tag: number16 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
            const H: number16 = encryptBlock(tag, W);
            for (let i = 0; i < cipherText.length;) {
                const Cblock = cipherText.slice(i, i += 16);
                tag = tag.map((byte: number, j: number) => byte ^ Cblock[j]!) as number16;
            }
            const lenAlenC: number16 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ].concat(wordsToBytes([ cipherText.length * 8 ])) as number16;// bit length of cipherText as byte array
            tag = tag.map((byte: number, i: number) => byte ^ lenAlenC[i]!) as number16;
            tag = tag.map((byte: number, i: number) => byte ^ CTRhash[i]!) as number16;
            return cipherText.concat(tag);
        } else if (options.type === Type.CBC) {
            // pad data
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            if (options.Padding === Padding.NoPadding) {
                const paddingNeeded: number = (16 - (messageBytes.length % 16)) % 16;
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            } else if (options.Padding === Padding.PKCS7) {
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(paddingNeeded);
            } else if (options.Padding === Padding.DES) {
                messageBytes.push(1);
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            }
            // xor plaintext with previous block of ciphertext, with the first block using the IV
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let Vector: number16 = stringToBytes(options.IV!) as number16;
            let output: number[] = [];
            for (let i = 0; i < messageBytes.length;)
                output.push(...Vector = encryptBlock(messageBytes.slice(i, i += 16).map((byte: number, j: number) => byte ^ Vector[j]!) as number16, W));
            return output;
        } else if (options.type === Type.PCBC) {
            // pad data
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            if (options.Padding === Padding.NoPadding) {
                const paddingNeeded: number = (16 - (messageBytes.length % 16)) % 16;
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            } else if (options.Padding === Padding.PKCS7) {
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(paddingNeeded);
            } else if (options.Padding === Padding.DES) {
                messageBytes.push(1);
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            }
            // xor plaintext with previous block of ciphertext and previous block of plaintext, with the first block only being plaintext xor IV
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let Vector: number16 = stringToBytes(options.IV!) as number16;
            let output: number[] = [];
            for (let i = 0; i < messageBytes.length;) {
                const plainText = messageBytes.slice(i, i += 16);
                const cipherText = encryptBlock(plainText.map((byte: number, j: number) => byte ^ Vector[j]!) as number16, W);
                Vector = plainText.map((byte: number, j: number) => byte ^ cipherText[j]!) as number16;
                output.push(...cipherText);
            }
            return output;
        } else if (options.type === Type.CBC_CTS) {
            const paddingNeeded: number = 16 - messageBytes.length;
            for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            // hard to explain, best explained here https://en.wikipedia.org/wiki/Ciphertext_stealing#CBC_ciphertext_stealing_encryption_using_a_standard_CBC_interface
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let Vector: number16 = stringToBytes(options.IV!) as number16;
            let output: number[] = [];
            for (let i = 0; i < messageBytes.length;) {
                const plainText: number16 = messageBytes.slice(i, i += 16) as number16;
                if (plainText.length === 16)
                    output.push(...Vector = encryptBlock(plainText.map((byte: number, j: number) => byte ^ Vector[j]!) as number16, W));
                else {
                    // output = output.slice(0, output.length - 16).concat(encryptBlock(Vector.map((byte: number, j: number) => ((plainText[j] ?? 0) ^ byte)) as number16, W)).concat(plainText.map((_, j: number) => Vector[j]!));
                    output = output.slice(0, output.length - 16);
                    output.push(...encryptBlock(Vector.map((byte: number, j: number) => ((plainText[j] ?? 0) ^ byte)) as number16, W), ...plainText.map((_, j: number) => Vector[j]!));
                }
            }
            return output;
        } else if (options.type === Type.PCBC_CTS) {
            let paddingNeeded: number = 16 - messageBytes.length;
            for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            paddingNeeded = (16 - (messageBytes.length % 16)) % 16;
            // hard to explain, best explained here https://en.wikipedia.org/wiki/Ciphertext_stealing#CBC_ciphertext_stealing_encryption_using_a_standard_CBC_interface
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let Vector: number16 = stringToBytes(options.IV!) as number16;
            let output: number[] = [];
            let cipherText: number16 = Vector;
            for (let i = 0; i < messageBytes.length;) {
                const plainText: number16 = messageBytes.slice(i, i += 16) as number16;
                if (plainText.length === 16)
                    cipherText = encryptBlock(plainText.map((byte: number, j: number) => byte ^ Vector[j]!) as number16, W);
                else
                    cipherText = encryptBlock(cipherText.map((byte: number, j: number) => ((plainText[j] == undefined) ? byte : (plainText[j]! ^ Vector[j]!))) as number16, W);
                output.push(...cipherText);
                Vector = plainText.map((byte: number, j: number) => byte ^ cipherText[j]!) as number16;
            }
            // if the last chunk was not a full block, swap last two blocks and truncate
            if (paddingNeeded != 0) {
                const lastHash: number[] = output.slice(output.length - 16);
                const secondLastHash: number[] = output.slice(output.length - 32, output.length - 16);
                output = output.slice(0, output.length - 32).concat([ ...lastHash, ...secondLastHash.filter((_, i: number) => i < (16 - paddingNeeded)) ]);
            }
            return output;
        } else if (options.type === Type.CBC_RBT) {
            // xor plaintext with previous block of ciphertext, with the first block using the IV
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let Vector: number16 = stringToBytes(options.IV!) as number16;
            let output: number[] = [];
            for (let i = 0; i < messageBytes.length;) {
                const plainText = messageBytes.slice(i, i += 16);
                if (plainText.length === 16)
                    output.push(...Vector = encryptBlock(plainText.map((byte: number, j: number) => byte ^ Vector[j]!) as number16, W));
                else {
                    Vector = encryptBlock(Vector, W);
                    output.push(...plainText.map((byte: number, j: number) => byte ^ Vector[j]!));
                }
            }
            return output;
        } else if (options.type === Type.CFB) {
            // pad data
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            if (options.Padding === Padding.NoPadding) {
                const paddingNeeded: number = (16 - (messageBytes.length % 16)) % 16;
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            } else if (options.Padding === Padding.PKCS7) {
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(paddingNeeded);
            } else if (options.Padding === Padding.DES) {
                messageBytes.push(1);
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            }
            // xor plaintext with encrypt(previous ciphertext), with the first block using the encrypt(IV)
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let encryptedVector: number16 = encryptBlock(stringToBytes(options.IV!) as number16, W);
            let output: number[] = [];
            for (let i = 0; i < messageBytes.length;) {
                const cipherText: number16 = messageBytes.slice(i, i += 16).map((byte: number, j: number) => byte ^ encryptedVector[j]!) as number16;
                output.push(...cipherText);
                encryptedVector = encryptBlock(cipherText, W);
            }
            return output;
        } else if (options.type === Type.OFB) {
            // pad data
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            if (options.Padding === Padding.NoPadding) {
                const paddingNeeded: number = (16 - (messageBytes.length % 16)) % 16;
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            } else if (options.Padding === Padding.PKCS7) {
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(paddingNeeded);
            } else if (options.Padding === Padding.DES) {
                messageBytes.push(1);
                const paddingNeeded: number = 16 - (messageBytes.length % 16);
                for (let i = 0; i < paddingNeeded; i++) messageBytes.push(0);
            }
            // xor plaintext with incrementally incrypted IV's ie. encrypt(IV), encrypt(encrypt(IV)), encrypt(encrypt(encrypt(IV))), etc.
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let encryptedVector: number16 = encryptBlock(stringToBytes(options.IV!) as number16, W);
            let output: number[] = [];
            for (let i = 0; i < messageBytes.length;) {
                output.push(...messageBytes.slice(i, i += 16).map((byte: number, j: number) => byte ^ encryptedVector[j]!));
                encryptedVector = encryptBlock(encryptedVector, W);
            }
            return output;
        }
        return [];
    }
    export function encrypt(message: string, W: number[], options: { type: Type, Padding?: Padding, IV?: string }): number[] {
        return encryptBytes(stringToBytes(message), W, options);
    }
    export function decryptBytes(encryptedBytes: number[], W: number[], options: { type: Type, Padding?: Padding, IV?: string }): number[] {
        if (options.type == undefined) throw new Error("type option is missing.");
        if (options.type === Type.ECB) {
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            let output: number[] = [];
            for (let i = 0; i < encryptedBytes.length;) {
                const state: number[] = encryptedBytes.slice(i, i += 16);
                output.push(...decryptBlock(state as number16, W));
            }
            if (options.Padding === Padding.NoPadding) { // remove trailing 0 bytes
                while ((output.length > 0) && (output[output.length - 1] === 0)) output.pop();
            } else if (options.Padding === Padding.PKCS7) { // remove number of bytes as the last byte
                const padByte: number = output[output.length - 1]!;
                for (let i = 0; i < Math.min(padByte, 16); i++) output.pop();
            } else if (options.Padding === Padding.DES) { // remove trailing 0 bytes and a 1 byte
                while (output[output.length - 1] === 0) output.pop();
                output.pop();
            }
            return output;
        } else if (options.type === Type.CTR) {
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV.length !== 16) throw new Error("IV length is not valid.");
            let CTR: number16 = stringToBytes(options.IV) as number16;
            let CTRhash: number[] = [];
            const numNeeded: number = Math.ceil(encryptedBytes.length / 16);
            for (let i = 0; i < numNeeded; i++) {
                CTRhash.push(...encryptBlock(CTR, W));
                if (CTR[15] === 0xFF) CTR[14]++;
                else CTR[15]++;// I most definitely wont use more that 256*256*16 bytes
            }
            return encryptedBytes.map((byte: number, j: number) => byte ^ CTRhash[j]!);
        } else if (options.type === Type.GCM) {
            return [];
        } else if (options.type === Type.CBC) {
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV.length !== 16) throw new Error("IV length is not valid.");
            let Vector: number16 = stringToBytes(options.IV) as number16;
            let output: number[] = [];
            for (let i = 0; i < encryptedBytes.length;) {
                const cipherText: number16 = encryptedBytes.slice(i, i += 16) as number16;
                output.push(...decryptBlock(cipherText, W).map((byte: number, j: number) => byte ^ Vector[j]!));
                Vector = cipherText;
            }
            if (options.Padding === Padding.NoPadding) { // remove trailing 0 bytes
                while ((output.length > 0) && (output[output.length - 1] === 0)) output.pop();
            } else if (options.Padding === Padding.PKCS7) { // remove number of bytes as the last byte
                const padByte: number = output[output.length - 1]!;
                for (let i = 0; i < Math.min(padByte, 16); i++) output.pop();
            } else if (options.Padding === Padding.DES) { // remove trailing 0 bytes and a 1 byte
                while (output[output.length - 1] === 0) output.pop();
                output.pop();
            }
            return output;
        } else if (options.type === Type.PCBC) {
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV.length !== 16) throw new Error("IV length is not valid.");
            let Vector: number16 = stringToBytes(options.IV) as number16;
            let output: number[] = [];
            for (let i = 0; i < encryptedBytes.length;) {
                const cipherText: number16 = encryptedBytes.slice(i, i += 16) as number16;
                const plainText = decryptBlock(cipherText, W).map((byte: number, j: number) => byte ^ Vector[j]!) as number16;
                Vector = plainText.map((byte: number, j: number) => byte ^ cipherText[j]!) as number16;
                output.push(...plainText);
            }
            if (options.Padding === Padding.NoPadding) { // remove trailing 0 bytes
                while ((output.length > 0) && (output[output.length - 1] === 0)) output.pop();
            } else if (options.Padding === Padding.PKCS7) { // remove number of bytes as the last byte
                const padByte: number = output[output.length - 1]!;
                for (let i = 0; i < Math.min(padByte, 16); i++) output.pop();
            } else if (options.Padding === Padding.DES) { // remove trailing 0 bytes and a 1 byte
                while (output[output.length - 1] === 0) output.pop();
                output.pop();
            }
            return output;
        } else if (options.type === Type.CBC_CTS) {
            // https://en.wikipedia.org/wiki/Ciphertext_stealing#CBC_ciphertext_stealing_decryption_using_a_standard_CBC_interface
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let OldVector: number16 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
            let Vector: number16 = stringToBytes(options.IV!) as number16;
            let output: number[] = [];
            for (let i = 0; i < encryptedBytes.length;) {
                const cipherText: number16 = encryptedBytes.slice(i, i += 16) as number16;
                if (cipherText.length < 16) { // if it is the last block
                    const beforeXor: number16 = output.slice(output.length - 16).map((byte: number, j: number) => byte ^ OldVector[j]!) as number16;
                    const input: number16 = beforeXor.map((byte: number, j: number) => ((cipherText[j] == undefined) ? byte : cipherText[j])) as number16;
                    output = output.slice(0, output.length - 16);
                    output.push(...decryptBlock(input, W).map((byte: number, j: number) => byte ^ OldVector[j]!), ...beforeXor.map((byte: number, j: number) => byte ^ input[j]!));
                } else {
                    // regular decryption step
                    [ OldVector, Vector ] = [ Vector, cipherText ];
                    output.push(...decryptBlock(Vector, W).map((byte: number, j: number) => byte ^ OldVector[j]!));
                }
            }
            while ((output.length > 0) && (output[output.length - 1] === 0)) output.pop();
            return output;
        } else if (options.type === Type.PCBC_CTS) {
            // https://en.wikipedia.org/wiki/Ciphertext_stealing#CBC_ciphertext_stealing_decryption_using_a_standard_CBC_interface, this but for PCBC
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let lastVector: number16 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
            let Vector: number16 = stringToBytes(options.IV!) as number16;
            let plainText: number16 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
            let output: number[] = [];
            for (let i = 0; i < encryptedBytes.length;) {
                let cipherText: number16 = encryptedBytes.slice(i, i += 16) as number16;
                if (cipherText.length === 16) {
                    // regular decryption step
                    plainText = decryptBlock(cipherText, W).map((byte: number, j: number) => byte ^ Vector[j]!) as number16;
                    lastVector = Vector;
                    Vector = plainText.map((byte: number, j: number) => byte ^ cipherText[j]!) as number16;
                    output.push(...plainText);
                } else {
                    let newCipherText: number16 = plainText.map((byte: number, j: number) => cipherText[j] ?? (byte ^ lastVector[j]!)) as number16;
                    const plainText1 = decryptBlock(newCipherText, W).map((byte: number, j: number) => byte ^ lastVector[j]!) as number16;
                    Vector = plainText1.map((byte: number, j: number) => byte ^ newCipherText[j]!) as number16;
                    const plainText2 = plainText.map((byte: number, j: number) => byte ^ lastVector[j]! ^ Vector[j]!) as number16;
                    output = output.slice(0, output.length - 16);
                    output.push(...plainText1, ...plainText2.slice(0, cipherText.length));
                }
            }
            while ((output.length > 0) && (output[output.length - 1] === 0)) output.pop();
            return output;
        } else if (options.type === Type.CBC_RBT) {
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV!.length !== 16) throw new Error("IV length is not valid.");
            let Vector: number16 = stringToBytes(options.IV!) as number16;
            let output: number[] = [];
            for (let i = 0; i < encryptedBytes.length;) {
                const cipherText: number16 = encryptedBytes.slice(i, i += 16) as number16;
                if (cipherText.length === 16) {
                    output.push(...decryptBlock(cipherText, W).map((byte: number, j: number) => byte ^ Vector[j]!));
                    Vector = cipherText;
                } else {
                    Vector = encryptBlock(Vector, W);
                    output.push(...cipherText.map((byte: number, j: number) => byte ^ Vector[j]!));
                }
            }
            return output;
        } else if (options.type === Type.CFB) {
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV.length !== 16) throw new Error("IV length is not valid.");
            let encryptedVector: number16 = encryptBlock(stringToBytes(options.IV) as number16, W);
            let output: number[] = [];
            for (let i = 0; i < encryptedBytes.length;) {
                const cipherText: number16 = encryptedBytes.slice(i, i += 16) as number16;
                output.push(...cipherText.map((byte: number, j: number) => byte ^ encryptedVector[j]!) as number16);
                encryptedVector = encryptBlock(cipherText, W);
            }
            if (options.Padding === Padding.NoPadding) { // remove trailing 0 bytes
                while ((output.length > 0) && (output[output.length - 1] === 0)) output.pop();
            } else if (options.Padding === Padding.PKCS7) { // remove number of bytes as the last byte
                const padByte: number = output[output.length - 1]!;
                for (let i = 0; i < Math.min(padByte, 16); i++) output.pop();
            } else if (options.Padding === Padding.DES) { // remove trailing 0 bytes and a 1 byte
                while (output[output.length - 1] === 0) output.pop();
                output.pop();
            }
            return output;
        } else if (options.type === Type.OFB) {
            if (options.Padding == undefined) throw new Error("Padding option is missing.");
            if (options.IV == undefined) throw new Error("IV option is missing.");
            if (options.IV.length !== 16) throw new Error("IV length is not valid.");
            let encryptedVector: number16 = encryptBlock(stringToBytes(options.IV) as number16, W);
            let output: number[] = [];
            for (let i = 0; i < encryptedBytes.length;) {
                output.push(...encryptedBytes.slice(i, i += 16).map((byte: number, j: number) => byte ^ encryptedVector[j]!) as number16);
                encryptedVector = encryptBlock(encryptedVector, W);
            }
            if (options.Padding === Padding.NoPadding) { // remove trailing 0 bytes
                while ((output.length > 0) && (output[output.length - 1] === 0)) output.pop();
            } else if (options.Padding === Padding.PKCS7) { // remove number of bytes as the last byte
                const padByte: number = output[output.length - 1]!;
                for (let i = 0; i < Math.min(padByte, 16); i++) output.pop();
            } else if (options.Padding === Padding.DES) { // remove trailing 0 bytes and a 1 byte
                while (output[output.length - 1] === 0) output.pop();
                output.pop();
            }
            return output;
        }
        return [];
    }
    export function decrypt(encryptedBytes: number[], W: number[], options: { type: Type, Padding?: Padding, IV?: string }): string {
        return bytesToString(decryptBytes(encryptedBytes, W, options));
    }
    // https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
    type number16 = [ number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number ];
    export function encryptBlock(message: number16, W: number[]): number16 {
        if (message.length != 16) throw new Error("block size must be exactly 128 bits.");
        let state: number[] = [ ...message ];
        // AddRoundKey step
        state = state.map((byte: number, i: number) => byte ^ W[i]!);
        // 13 round
        for (let i = 1; i < 14; i++) { // 13 rounds
            // SubBytes step
            state = state.map(SubByte);
            // ShiftRows step
            state = [
                state[0] !, state[5] !, state[10]!, state[15]!,
                state[4] !, state[9] !, state[14]!, state[3] !,
                state[8] !, state[13]!, state[2] !, state[7] !,
                state[12]!, state[1] !, state[6] !, state[11]!
            ];
            // MixColumns step
            for (let offset = 0; offset < 16; offset += 4) {
                const state0: number = state[0 + offset]!;
                const state1: number = state[1 + offset]!;
                const state2: number = state[2 + offset]!;
                const state3: number = state[3 + offset]!;
                state[0 + offset]! = RijndaelsMultiplication(2, state0) ^ RijndaelsMultiplication(3, state1) ^ state2 ^ state3;
                state[1 + offset]! = state0 ^ RijndaelsMultiplication(2, state1) ^ RijndaelsMultiplication(3, state2) ^ state3;
                state[2 + offset]! = state0 ^ state1 ^ RijndaelsMultiplication(2, state2) ^ RijndaelsMultiplication(3, state3);
                state[3 + offset]! = RijndaelsMultiplication(3, state0) ^ state1 ^ state2 ^ RijndaelsMultiplication(2, state3);
            }
            // AddRoundKey step
            state = state.map((byte: number, j: number) => byte ^ W[(i * 16) + j]!);
            // console.log("After round #" + i + ", state: [ " + state.map((byte: number) => byte.toString(16).padStart(2, "0")).join(", ") + " ]\n");
        }
        // last round
        // SubBytes step
        state = state.map(SubByte);
        // ShiftRows step
        state = [
            state[0] !, state[5] !, state[10]!, state[15]!,
            state[4] !, state[9] !, state[14]!, state[3] !,
            state[8] !, state[13]!, state[2] !, state[7] !,
            state[12]!, state[1] !, state[6] !, state[11]!
        ];
        // AddRoundKey step
        state = state.map((byte: number, i: number) => byte ^ W[224 + i]!);// 224 = 14*16
        return state as number16;
    }
    export function decryptBlock(encryptedState: number16, W: number[]): number[] {
        let state: number[] = [ ...encryptedState ];
        // SubRoundKey step
        state = state.map((byte: number, i: number) => byte ^ W[224 + i]!);// 224 = 14*16
        // UnShiftRows step
        state = [
            state[0] !, state[13]!, state[10]!, state[7] !,
            state[4] !, state[1] !, state[14]!, state[11]!,
            state[8] !, state[5] !, state[2] !, state[15]!,
            state[12]!, state[9] !, state[6] !, state[3] !
        ];
        // UnSubBytes step
        state = state.map(UnSubByte);
        for (let i = 13; i > 0; i--) {
            // SubRoundKey step
            state = state.map((byte: number, j: number) => byte ^ W[(i * 16) + j]!);
            // UnMixColumns step
            for (let offset = 0; offset < 16; offset += 4) {
                const state0: number = state[0 + offset]!;
                const state1: number = state[1 + offset]!;
                const state2: number = state[2 + offset]!;
                const state3: number = state[3 + offset]!;
                state[0 + offset]! = RijndaelsMultiplication(14, state0) ^ RijndaelsMultiplication(11, state1) ^ RijndaelsMultiplication(13, state2) ^ RijndaelsMultiplication(9, state3);
                state[1 + offset]! = RijndaelsMultiplication(9, state0) ^ RijndaelsMultiplication(14, state1) ^ RijndaelsMultiplication(11, state2) ^ RijndaelsMultiplication(13, state3);
                state[2 + offset]! = RijndaelsMultiplication(13, state0) ^ RijndaelsMultiplication(9, state1) ^ RijndaelsMultiplication(14, state2) ^ RijndaelsMultiplication(11, state3);
                state[3 + offset]! = RijndaelsMultiplication(11, state0) ^ RijndaelsMultiplication(13, state1) ^ RijndaelsMultiplication(9, state2) ^ RijndaelsMultiplication(14, state3);
            }
            // UnShiftRows step
            state = [
                state[0] !, state[13]!, state[10]!, state[7] !,
                state[4] !, state[1] !, state[14]!, state[11]!,
                state[8] !, state[5] !, state[2] !, state[15]!,
                state[12]!, state[9] !, state[6] !, state[3] !
            ];
            // UnSubBytes step
            state = state.map(UnSubByte);
        }
        // SubRoundKey step
        state = state.map((byte: number, i: number) => byte ^ W[i]!);
        return state;
    }
}
/*
// matches test from c++ code
type number16 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
const key: number[] = AES.expandKey(stringToBytes("aaaaaaaaaaaaaaaa"));
const plaintext1: number[] = [ 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55 ];
const cyphertext1: number[] = AES.encryptBlock(plaintext1 as number16, key);
const decrypted1: number[] = AES.decryptBlock(cyphertext1 as number16, key);
console.log("plaintext1:");
console.log(plaintext1.map((num: number) => num.toString(16).padStart(2, "0")).join(" "));
console.log("cyphertext1:");
console.log(cyphertext1.map((num: number) => num.toString(16).padStart(2, "0")).join(" "));
console.log("decrypted1:");
console.log(decrypted1.map((num: number) => num.toString(16).padStart(2, "0")).join(" "));
console.log("correct:");

console.log("\n");

const plaintext2: string = "77777777777777777777";
console.log("plaintext2:");
console.log(stringToBytes(plaintext2).map((num: number) => num.toString(16).padStart(2, "0")).join(" "));
const IV1: string = "0000000000000000";
console.log("IV:");
console.log(stringToBytes(IV1).map((num: number) => num.toString(16).padStart(2, "0")).join(" "));
const cyphertext2: number[] = AES.encrypt(plaintext2, key, { type: AES.Type.PCBC_CTS, IV: IV1 });
console.log("cyphertext2:");
console.log(cyphertext2.map((num: number) => num.toString(16).padStart(2, "0")).join(" "));
const decrypted2: string = AES.decrypt(cyphertext2 as number16, key, { type: AES.Type.PCBC_CTS, IV: IV1 });
console.log("decrypted2:");
console.log(stringToBytes(decrypted2).map((num: number) => num.toString(16).padStart(2, "0")).join(" "));

console.log("\n");

const plaintext3: string = "abcdefghijklmnopqrstuvwxyz";
console.log("plaintext2:");
console.log(plaintext3);
const IV2: string = "bbbbbbbbbbbbbbbb";
console.log("IV:");
console.log(IV2);
const cyphertext3: number[] = AES.encrypt(plaintext3, key, { type: AES.Type.PCBC_CTS, IV: IV2 });
console.log("cyphertext3:");
console.log(cyphertext3.map((num: number) => num.toString(16).padStart(2, "0")).join(" "));
const decrypted3: string = AES.decrypt(cyphertext3 as number16, key, { type: AES.Type.PCBC_CTS, IV: IV2 });
console.log("decrypted3:");
console.log(decrypted3);
/*
/*
// console.clear();
// output
let numTests16: number = 0;
let succesfullTests16: number = 0;
let numTests32: number = 0;
let succesfullTests32: number = 0;
let numTests64: number = 0;
let succesfullTests64: number = 0;
function encDecTest(msg: string, W: number[], options: { type: AES.Type, Padding?: AES.Padding, IV?: string }): void {
    let header: string = "AES-" + AES.TypeToString(options.type);
    if ((options.type !== AES.Type.CTR) && (options.type !== AES.Type.GCM) && (options.type !== AES.Type.CBC_CTS) && (options.type !== AES.Type.PCBC_CTS) && (options.type !== AES.Type.CBC_RBT)) header += ", Padding = " + AES.PaddingToString(options.Padding!);
    if (options.type !== AES.Type.ECB) header += ", IV = \"" + options.IV! + "\"";
    console.log(header);
    const encrypted: number[] = AES.encrypt(msg, W, options);
    const encrypted16: string = bytesToBase16(encrypted);
    const encrypted32: string = bytesToBase32(encrypted);
    const encrypted64: string = bytesToBase64(encrypted);
    const decrypted16: string = AES.decrypt(base16ToBytes(encrypted16), W, options);
    const decrypted32: string = AES.decrypt(base32ToBytes(encrypted32), W, options);
    const decrypted64: string = AES.decrypt(base64ToBytes(encrypted64), W, options);
    numTests16++;
    numTests32++;
    numTests64++;
    console.log("    encrypted: \"" + encrypted16 + "\"");
    console.log("    encrypted: \"" + encrypted32 + "\"");
    console.log("    encrypted: \"" + encrypted64 + "\"");
    if (msg === decrypted16) {
        console.log("    Test succeeded, decrypted matched original string.");
        succesfullTests16++;
    } else
        console.log("    Test failed.");
    if (msg === decrypted32) {
        console.log("    Test succeeded, decrypted matched original string.");
        succesfullTests32++;
    } else
        console.log("    Test failed.");
    if (msg === decrypted64) {
        console.log("    Test succeeded, decrypted matched original string.");
        succesfullTests64++;
    } else
        console.log("    Test failed.");
}
function fullTest(msg: string, randKey: string, IV: string): void {
    console.log("\nmessage: \"" + msg + "\"");
    console.log("key: \"" + randKey + "\"\n");
    const K: number[] = stringToBytes(randKey);
    const W: number[] = AES.expandKey(K);
    encDecTest(msg, W, { type: AES.Type.ECB, Padding: AES.Padding.NoPadding });
    encDecTest(msg, W, { type: AES.Type.ECB, Padding: AES.Padding.PKCS7 });
    encDecTest(msg, W, { type: AES.Type.ECB, Padding: AES.Padding.DES });
    encDecTest(msg, W, { type: AES.Type.CTR, IV });
    // encDecTest(msg, W, { type: AES.Type.GCM, IV });
    encDecTest(msg, W, { type: AES.Type.CBC, Padding: AES.Padding.NoPadding, IV });
    encDecTest(msg, W, { type: AES.Type.CBC, Padding: AES.Padding.PKCS7, IV });
    encDecTest(msg, W, { type: AES.Type.CBC, Padding: AES.Padding.DES, IV });
    encDecTest(msg, W, { type: AES.Type.PCBC, Padding: AES.Padding.NoPadding, IV });
    encDecTest(msg, W, { type: AES.Type.PCBC, Padding: AES.Padding.PKCS7, IV });
    encDecTest(msg, W, { type: AES.Type.PCBC, Padding: AES.Padding.DES, IV });
    encDecTest(msg, W, { type: AES.Type.CBC_CTS, IV });
    encDecTest(msg, W, { type: AES.Type.PCBC_CTS, IV });
    encDecTest(msg, W, { type: AES.Type.CBC_RBT, IV });
    encDecTest(msg, W, { type: AES.Type.CFB, Padding: AES.Padding.NoPadding, IV });
    encDecTest(msg, W, { type: AES.Type.CFB, Padding: AES.Padding.PKCS7, IV });
    encDecTest(msg, W, { type: AES.Type.CFB, Padding: AES.Padding.DES, IV });
    encDecTest(msg, W, { type: AES.Type.OFB, Padding: AES.Padding.NoPadding, IV });
    encDecTest(msg, W, { type: AES.Type.OFB, Padding: AES.Padding.PKCS7, IV });
    encDecTest(msg, W, { type: AES.Type.OFB, Padding: AES.Padding.DES, IV });
}
const strs: string[] = [
    "aaaaaaaaaaaaaaa", // less than a full block
    "bbbbbbbbbbbbbbbb", // exactly one block
    "ccccccccccccccccc", // just more than one block
    "test message, this is a much longer message which also does not align with the 128 bit boundary"
];
for (let i = 0; i < strs.length; i++) {
    fullTest(strs[i]!, generateBase64Num(32), generateBase64Num(16));
}

console.log();
console.log((succesfullTests16 + succesfullTests32 + succesfullTests64) + "/" + (numTests16 + numTests32 + numTests64) + " or " + (Math.round((succesfullTests16 + succesfullTests32 + succesfullTests64) / (numTests16 + numTests32 + numTests64) * 10000) / 100) + "% of tests succeeded.");
console.log(succesfullTests16 + "/" + numTests16 + " or " + (Math.round(succesfullTests16 / numTests16 * 10000) / 100) + "% of base-16 tests succeeded.");
console.log(succesfullTests32 + "/" + numTests32 + " or " + (Math.round(succesfullTests32 / numTests32 * 10000) / 100) + "% of base-32 tests succeeded.");
console.log(succesfullTests64 + "/" + numTests64 + " or " + (Math.round(succesfullTests64 / numTests64 * 10000) / 100) + "% of base-64 tests succeeded.");
// */