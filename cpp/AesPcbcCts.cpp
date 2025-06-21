#include "AesPcbcCts.h"
unsigned char B[255];
unsigned char Sb[255];
unsigned char RSb[255];
void createS_Box() {
    // https://en.wikipedia.org/wiki/Rijndael_S-box
    // have to define i=0 manually because it has no inverse
    // B[0] = 0;
    Sb[0] = 0x63;
    RSb[0x63] = 0;
    for (unsigned char i = 1; i; i++) {
        RFF8 b = RFF8((unsigned int)i).multInv();
        // B[i] = (unsigned char)b;
        Sb[i] = ((unsigned char)(b + b.leftRotate(1) + b.leftRotate(2) + b.leftRotate(3) + b.leftRotate(4))) ^ 0x63;
        RSb[Sb[i]] = i;
    }
}
unsigned int leftRotate(const unsigned int& value, const unsigned int& amount) {
    return (value >> (32 - amount)) | (value << amount);
}
unsigned char subByte(unsigned char byte) {
    return Sb[byte];
}
unsigned char unSubByte(unsigned char byte) {
    return RSb[byte];
}
unsigned int subWord(unsigned int word) {
    return (((unsigned int)Sb[(word >> 24) & 0xFF]) << 24u)
    | (((unsigned int)Sb[(word >> 16) & 0xFF]) << 16u)
    | (((unsigned int)Sb[(word >> 8) & 0xFF]) << 8u)
    | ((unsigned int)Sb[word & 0xFF]);
}
#include <iostream>
expandedkey expandKey(const std::string& K) {
    if ((K.size() != 16) && (K.size() != 24) && (K.size() != 32)) throw std::runtime_error("key length must be 16, 24, or 32.");
    unsigned char rc[14];
    unsigned int rcon[14];
    rc[0] = 1;
    rcon[0] = 1 << 24;
    for (unsigned char i = 1; i < 14; i++) {
        if (!(rc[i - 1] & 0x80)) rc[i] = rc[i - 1] << 1;
        else rc[i] = (rc[i - 1] << 1) ^ 0x1B;
        rcon[i] = ((unsigned int)rc[i]) << 24;
    }
    unsigned int out[60];
    const unsigned int N = K.size() >> 2;
    for (unsigned char i = 0; i < N; i++) out[i] = 0;
    for (unsigned char i = 0; i < K.size(); i++)
        out[i >> 2] |= *((unsigned char*)&K.at(i)) << ((3 - (i % 4)) * 8);
    for (unsigned int i = N; i < 60; i++) {
        if ((i % N) == 0) out[i] = out[i - N] ^ subWord(leftRotate(out[i - 1], 8)) ^ rcon[(i / N) - 1];
        else if ((N > 6) && ((i % N) == 4)) out[i] = out[i - N] ^ subWord(out[i - 1]);
        else out[i] = out[i - N] ^ out[i - 1];
    }
    std::cout << "out = [ ";
    for (unsigned char i = 0; i < 60; i++) {
        std::cout << out[i];
        if (i != 59) std::cout << ", ";
    }
    std::cout << "\n]\n";
    return expandedkey(out);
}
const RFF8 two = 2;
const RFF8 three = 3;
const RFF8 nine = 9;
const RFF8 eleven = 11;
const RFF8 thirteen = 13;
const RFF8 fourteen = 14;
block AESencryptBlock(block message, const expandedkey& W) {
    // AddRoundKey step
    for (unsigned char i = 0; i < 16; i++) message[i] ^= W[i];
    // 13 round
    for (unsigned char i = 1; i < 14; i++) { // 13 rounds
        // SubBytes step
        for (unsigned char i = 0; i < 16; i++) message[i] = subByte(message[i]);
        // ShiftRows step
        message = {
            message[0] , message[5] , message[10], message[15],
            message[4] , message[9] , message[14], message[3] ,
            message[8] , message[13], message[2] , message[7] ,
            message[12], message[1] , message[6] , message[11]
        };
        // MixColumns step
        for (unsigned char offset = 0; offset < 16; offset += 4) {
            const RFF8 state0 = message[0 + offset];
            const RFF8 state1 = message[1 + offset];
            const RFF8 state2 = message[2 + offset];
            const RFF8 state3 = message[3 + offset];
            message[0 + offset] = (two * state0).value ^ (three * state1).value ^ state2.value ^ state3.value;
            message[1 + offset] = state0.value ^ (two * state1).value ^ (three * state2).value ^ state3.value;
            message[2 + offset] = state0.value ^ state1.value ^ (two * state2).value ^ (three * state3).value;
            message[3 + offset] = (three * state0).value ^ state1.value ^ state2.value ^ (two * state3).value;
        }
        // AddRoundKey step
        for (unsigned char j = 0; j < 16; j++) message[j] ^= W[(i * 16) + j];
    }
    // last round
    // SubBytes step
    for (unsigned char i = 0; i < 16; i++) message[i] = subByte(message[i]);
    // ShiftRows step
    message = {
        message[0] , message[5] , message[10], message[15],
        message[4] , message[9] , message[14], message[3] ,
        message[8] , message[13], message[2] , message[7] ,
        message[12], message[1] , message[6] , message[11]
    };
    // AddRoundKey step
    for (unsigned char i = 0; i < 16; i++) message[i] ^= W[224 + i];
    return message;
}
block AESdecryptBlock(block message, const expandedkey& W) {
    // SubRoundKey step
    for (unsigned char i = 0; i < 16; i++) message[i] ^= W[224 + i];
    // UnShiftRows step
    message = {
        message[0] , message[13], message[10], message[7] ,
        message[4] , message[1] , message[14], message[11],
        message[8] , message[5] , message[2] , message[15],
        message[12], message[9] , message[6] , message[3] 
    };
    // UnSubBytes step
    for (unsigned char i = 0; i < 16; i++) message[i] = unSubByte(message[i]);
    for (unsigned char i = 13; i > 0; i--) {
        // SubRoundKey step
        for (unsigned char j = 0; j < 16; j++) message[j] ^= W[(i * 16) + j];
        // UnMixColumns step
        for (unsigned char offset = 0; offset < 16; offset += 4) {
            const RFF8 state0 = message[0 + offset];
            const RFF8 state1 = message[1 + offset];
            const RFF8 state2 = message[2 + offset];
            const RFF8 state3 = message[3 + offset];
            message[0 + offset] = (fourteen * state0).value ^ (eleven * state1).value ^ (thirteen * state2).value ^ (nine * state3).value;
            message[1 + offset] = (nine * state0).value ^ (fourteen * state1).value ^ (eleven * state2).value ^ (thirteen * state3).value;
            message[2 + offset] = (thirteen * state0).value ^ (nine * state1).value ^ (fourteen * state2).value ^ (eleven * state3).value;
            message[3 + offset] = (eleven * state0).value ^ (thirteen * state1).value ^ (nine * state2).value ^ (fourteen * state3).value;
        }
        // UnShiftRows step
        message = {
            message[0] , message[13], message[10], message[7] ,
            message[4] , message[1] , message[14], message[11],
            message[8] , message[5] , message[2] , message[15],
            message[12], message[9] , message[6] , message[3] 
        };
        // UnSubBytes step
        for (unsigned char i = 0; i < 16; i++) message[i] = unSubByte(message[i]);
    }
    // SubRoundKey step
    for (unsigned char i = 0; i < 16; i++) message[i] ^= W[i];
    return message;
}
std::vector<unsigned char> encryptAesPcbcCts(std::vector<unsigned char> message, const block& IV, const expandedkey& W) {
    while (message.size() < 16) message.push_back(0);
    unsigned int paddingNeeded = message.size() % 16;
    block Vector(IV);
    std::vector<unsigned char> output;
    block lastCipher;
    for (unsigned int i = 0; i < message.size(); i += 16) {
        const unsigned int len = min(16, message.size()-i);
        block plainText(&message[i], len);
        block tmp(plainText);
        for (unsigned int j = 0; j < len; j++) tmp[j] ^= Vector[j];
        for (unsigned int j = len; j < 16; j++) tmp[j] ^= lastCipher[j];
        lastCipher = AESencryptBlock(tmp, W);
        if (len == 16) for (unsigned int j = 0; j < 16; j++) Vector[j] = plainText[j] ^ lastCipher[j];
        for (unsigned int j = 0; j < 16; j++) output.push_back(lastCipher[j]);
    }
    if (paddingNeeded != 0) {
        block lastLastCipher(&output[output.size() - 32], 16);
        for (unsigned int i = 0; i < 32; i++) output.pop_back();
        for (unsigned int i = 0; i < 16; i++) output.push_back(lastCipher[i]);
        for (unsigned int i = 0; i < paddingNeeded; i++) output.push_back(lastLastCipher[i]);
    }
    return output;
}
std::vector<unsigned char> decryptAesPcbcCts(const std::vector<unsigned char>& cipher, const block& IV, const expandedkey& W) {
    block lastVector;
    block Vector(IV);
    block lastMessage;
    std::vector<unsigned char> output;
    for (unsigned int i = 0; i < cipher.size(); i += 16) {
        const unsigned int len = min(16, cipher.size()-i);
        block cipherText(&cipher[i], len);
        if (len == 16) {
            lastMessage = AESdecryptBlock(cipherText, W);
            for (unsigned int j = 0; j < 16; j++) {
                lastMessage[j] ^= Vector[j];
                lastVector[j] = Vector[j];
                Vector[j] = lastMessage[j] ^ cipherText[j];
                output.push_back(lastMessage[j]);
            }
        } else {
            for (unsigned int j = 0; j < 16; j++) output.pop_back();
            for (unsigned int j = len; j < 16; j++) cipherText[j] = lastMessage[j] ^ lastVector[j];
            block message = AESdecryptBlock(cipherText, W);
            for (unsigned int j = 0; j < 16; j++) {
                message[j] ^= lastVector[j];
                output.push_back(message[j]);
            }
            for (unsigned int j = 0; j < len; j++)
                output.push_back(lastMessage[j] ^ lastVector[j] ^ message[j] ^ cipherText[j]);
        }
    }
    return output;
}