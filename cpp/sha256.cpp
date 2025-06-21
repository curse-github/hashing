#include "sha256.h"
std::vector<unsigned int> sha256Raw(const unsigned char* rawBytes, const unsigned int& rawSize) {
    // create hash and k lists, used in the hashing
    bool isComposite[313];
    for (size_t i = 0; i < 313; i++) isComposite[i] = false;
    size_t primeCounter = 0;
    std::vector<unsigned int> runningHash(8, 0);// initialized with square roots of primes
    unsigned int k[64];// cube roots of primes
    for (size_t candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            if (primeCounter<8) runningHash[primeCounter] = (((unsigned long long int) (std::pow(candidate, 1.0 / 2.0) * maxWord)) << 32) >> 32;
            k[primeCounter] = (((unsigned long long int) (std::pow(candidate, 1.0 / 3.0) * maxWord)) << 32) >> 32;
            primeCounter++;
            for (size_t i = 0; i < 313; i+=candidate) isComposite[i] = true;
        }
    }
    unsigned int newStrLen = (rawSize + 1u) + (120u - ((rawSize + 1u) % 64u)) % 64u;
    // translate the ascii into unsigned integers using bit magic
    std::vector<unsigned long long int> chunks((newStrLen >> 2u) + 2u, 0u);// length of newStrLen/8
    // combine the bits of each character end to end into unsigned ints
    // extra login equivilent to pad string with a 1 bit and then 0 bits until (bit length === 448 (mod 512))
    for(unsigned int i = 0u; i < rawSize; i++)
        chunks[i >> 2u] |= ((unsigned int)rawBytes[i]) << ((3u - (i % 4u)) << 3u);
    chunks[rawSize >> 2u] |= 0x80u << ((3u - (rawSize % 4u)) << 3u);
    // push the original length of the string to the end of the chunks
    chunks[(newStrLen >> 2u) + 1u] = rawSize << 3u;
    // loop through the "chunks" array, to do actual iterative hashing algorithm
    for (size_t j = 0; j < chunks.size(); j += 16) {
        // slice of chunks array from j to j+16
        unsigned int chunksSlice[64];
        for (size_t i = 0; i < 16; i++) chunksSlice[i] = chunks[j+i];
        // create continued sections of the chunks data
        for (size_t i = 16; i < 64; i++) {
            unsigned int c2 = chunksSlice[i - 2];
            unsigned int c15 = chunksSlice[i - 15];
            unsigned int s0 = (((c15 >> 7) | (c15 << 25)) ^ ((c15 >> 18) | (c15 << 14)) ^ (c15 >> 3));// rightRotate(w15,7)^rightRotate(w15,18)^(w15>>3)
            unsigned int s1 = (((c2 >> 17) | (c2 << 15)) ^ ((c2 >> 19) | (c2 << 13)) ^ (c2 >> 10));// rightRotate(w2,17)^rightRotate(w2,19)^(w2>>10)
            chunksSlice[i] = chunksSlice[i - 16] + s0 + chunksSlice[i - 7] + s1;
        }
        // save hash to add back to itself after hashing
        unsigned int hash[8];
        for (size_t i = 0; i < 8; i++) hash[i] = runningHash[i];
        // inner hashing loop
        for (size_t i = 0; i < 64; i++) {
            unsigned int h0 = runningHash[0];
            unsigned int h1 = runningHash[1];
            unsigned int h2 = runningHash[2];
            unsigned int h4 = runningHash[4];
            unsigned int S1 = (((h4 >> 6) | (h4 << 26)) ^ ((h4 >> 11) | (h4 << 21)) ^ ((h4 >> 25) | (h4 << 7)));// rightRotate(h4,6)^rightRotate(h4,11)^rightRotate(h4,25)
            unsigned int ch = ((h4 & runningHash[5]) ^ ((~h4) & runningHash[6]));
            unsigned int temp1 = runningHash[7] + S1 + ch + k[i] + chunksSlice[i];
            unsigned int S0 = (((h0 >> 2) | (h0 << 30)) ^ ((h0 >> 13) | (h0 << 19)) ^ ((h0 >> 22) | (h0 << 10)));// rightRotate(h0,2)^rightRotate(h0,13)^rightRotate(h0,22)
            unsigned int maj = ((h0 & h1) ^ (h0 & h2) ^ (h1 & h2));
            //unsigned int temp2 = S0 + maj;
            // cycle values
            for (size_t k = 8; k!=0; k--)
                runningHash[k] = runningHash[k - 1];
            runningHash[0] = temp1 + S0 + maj;// + temp2
            runningHash[4] += temp1;
        }
        // add old hash to the running hash
        for (size_t i = 0; i < 8; i++) runningHash[i] += hash[i];
    }
    return runningHash;
}
std::vector<unsigned int> sha256Vector(const std::vector<unsigned char>& vec) {
    return sha256Raw(&vec[0], vec.size());
}
#include "NumHelpers.h"
std::string sha256Str(std::string str) {
    return wordsToBase16(sha256Raw((unsigned char*)&str[0], str.size()));
}