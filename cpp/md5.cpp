#include "md5.h"

#include <iostream>
std::vector<unsigned int> md5Raw(const unsigned char* rawBytes, const unsigned int& rawSize) {
    // create S list used for leftRotate during the runningHash
    unsigned int S[64] = {
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    };
    // create the K list used in runningHashing
    unsigned int K[64];
    for (size_t i = 0; i < 64; i++)
        K[i] = (((unsigned long long int) (std::abs(std::sin(i + 1)) * maxWord)) << 32) >> 32;

    unsigned int newStrLen = (rawSize + 1u) + (120u - ((rawSize + 1u) % 64u)) % 64u;
    // translate the ascii into unsigned integers using bit magic
    std::vector<unsigned long long int> chunks((newStrLen >> 2u) + 2u, 0u);// length of newStrLen/8
    // combine the bits of each character end to end into unsigned ints
    // extra login equivilent to pad string with a 1 bit and then 0 bits until (bit length === 448 (mod 512))
    for(unsigned int i = 0u; i < rawSize; i++)
        chunks[i >> 2] |= ((unsigned int)rawBytes[i]) << ((i % 4u) << 3u);
    chunks[rawSize >> 2] |= 0x80u << ((rawSize % 4u) << 3u);
    // push the original length of the string to the end of the chunks
    chunks[(newStrLen >> 2u)] = rawSize << 3u;
    // loop through the "chunks" array, to do actual iterative runningHashing algorithm
    std::vector<unsigned int> runningHash = { 0x67452301u, 0xefcdab89u, 0x98badcfeu, 0x10325476u };// initialize values in the running runningHash
    for (size_t j = 0; j < chunks.size(); j += 16) {
        // slice of chunks array from j to j+16
        unsigned int chunksSlice[16];
        for (size_t i = 0; i < 16; i++) chunksSlice[i] = chunks[j+i];
        // save hash to add back to itself after hashing
        unsigned int hash[4];
        for (size_t i = 0; i < 4; i++) hash[i] = runningHash[i];
        // inner hashing loop
        for (size_t i = 0; i < 64; i++) {
            unsigned int B = runningHash[1];
            unsigned int C = runningHash[2];
            unsigned int D = runningHash[3];
            
            unsigned int F = runningHash[0] + K[i];
            unsigned int G = 0;
            if (i < 16) {
                F += ((B & C) | ((~B) & D)) + chunksSlice[i];
            } else if (i < 32) {
                F += ((D & B) | ((~D) & C)) + chunksSlice[(i * 5 + 1) % 16];
            } else if (i < 48) {
                F += (B ^ C ^ D) + chunksSlice[(i * 3 + 5) % 16];
            } else {
                F += (C ^ (B | (~D))) + chunksSlice[(i * 7) % 16];
            }
            runningHash[0] = runningHash[3];
            runningHash[3] = runningHash[2];
            runningHash[2] = runningHash[1];
            runningHash[1] += ((F << S[i]) | (F >> (32 - S[i])));// leftRotate(temp, S[i])
        }
        // add old hash to the running hash
        for (size_t i = 0u; i < 4u; i++) runningHash[i] += hash[i];
    }
    for (unsigned int i = 0u; i < 4u; i++) {
        runningHash[i] = (runningHash[i] << 24) | (((runningHash[i] >> 8) & 0xff) << 16) | (((runningHash[i] >> 16) & 0xff) << 8) | (runningHash[i] >> 24);
    }
    return runningHash;
}
std::vector<unsigned int> md5Vector(const std::vector<unsigned char>& vec) {
    return md5Raw(&vec[0], vec.size());
}
#include "NumHelpers.h"
std::string md5Str(std::string str) {
    return wordsToBase16(md5Raw((unsigned char*)&str[0], str.size()));
}