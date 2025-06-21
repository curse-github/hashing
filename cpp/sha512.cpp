#include "sha512.h"

const unsigned long long int maxWord = 1ULL<<32;
std::vector<unsigned int> sha512Raw(const unsigned char* rawBytes, const unsigned int& rawSize, bool debug) {
    // create hash and k lists, used in the hashing
    bool isComposite[421];
    for (size_t i = 0; i < 421; i++) isComposite[i] = false;
    size_t primeCounter = 0;
    /*unsigned long long int runningHash[8];// initialized with square roots of primes
    unsigned long long int k[80];// cube roots of primes
    for (size_t candidate = 2; primeCounter < 80; candidate++) {
        if (!isComposite[candidate]) {
            if (primeCounter<8) runningHash[primeCounter] = ((unsigned long long int) (std::pow(candidate, 1.0 / 2.0) * maxWord));
            k[primeCounter] = ((unsigned long long int) (std::pow(candidate, 1.0 / 3.0)*  maxWord));
            primeCounter++;
            for (size_t i = 0; i < 421; i+=candidate) isComposite[i] = true;
        }
    }*/
    unsigned long long int runningHash[8] = {
        0x6a09e667f3bcc908, 0xbb67ae8584caa73b, 0x3c6ef372fe94f82b, 0xa54ff53a5f1d36f1,
        0x510e527fade682d1, 0x9b05688c2b3e6c1f, 0x1f83d9abfb41bd6b, 0x5be0cd19137e2179
    };
    if (debug) {
        for (size_t candidate = 2; primeCounter < 8; candidate++) {
            if (!isComposite[candidate]) {
                std::cout << "prime #" << primeCounter << '\n';
                std::cout << "    prime     : " << candidate << '\n';
                std::cout << "    actual    : 0x" << std::hex << runningHash[primeCounter] << '\n';
                long double sqrt = std::pow(candidate, 1.0L / 2.0L);
                sqrt -= std::floor(sqrt);
                unsigned long long int test = sqrt * std::pow(2.0L, 63.0L) * 2.0L;
                std::cout << "    calculated: 0x" << std::hex << test << std::dec << std::resetiosflags << '\n';
                std::cout << "    actual    : " << runningHash[primeCounter] << '\n';
                std::cout << "    calculated: " << test << '\n';
                std::cout << "    diff      : " << runningHash[primeCounter] - test << '\n';
                primeCounter++;
                for (size_t i = 0; i < 421; i+=candidate) isComposite[i] = true;
            }
        }
    }
    unsigned long long int k[80] = {
        0x428a2f98d728ae22, 0x7137449123ef65cd, 0xb5c0fbcfec4d3b2f, 0xe9b5dba58189dbbc, 0x3956c25bf348b538,
        0x59f111f1b605d019, 0x923f82a4af194f9b, 0xab1c5ed5da6d8118, 0xd807aa98a3030242, 0x12835b0145706fbe,
        0x243185be4ee4b28c, 0x550c7dc3d5ffb4e2, 0x72be5d74f27b896f, 0x80deb1fe3b1696b1, 0x9bdc06a725c71235,
        0xc19bf174cf692694, 0xe49b69c19ef14ad2, 0xefbe4786384f25e3, 0x0fc19dc68b8cd5b5, 0x240ca1cc77ac9c65,
        0x2de92c6f592b0275, 0x4a7484aa6ea6e483, 0x5cb0a9dcbd41fbd4, 0x76f988da831153b5, 0x983e5152ee66dfab,
        0xa831c66d2db43210, 0xb00327c898fb213f, 0xbf597fc7beef0ee4, 0xc6e00bf33da88fc2, 0xd5a79147930aa725,
        0x06ca6351e003826f, 0x142929670a0e6e70, 0x27b70a8546d22ffc, 0x2e1b21385c26c926, 0x4d2c6dfc5ac42aed,
        0x53380d139d95b3df, 0x650a73548baf63de, 0x766a0abb3c77b2a8, 0x81c2c92e47edaee6, 0x92722c851482353b,
        0xa2bfe8a14cf10364, 0xa81a664bbc423001, 0xc24b8b70d0f89791, 0xc76c51a30654be30, 0xd192e819d6ef5218,
        0xd69906245565a910, 0xf40e35855771202a, 0x106aa07032bbd1b8, 0x19a4c116b8d2d0c8, 0x1e376c085141ab53,
        0x2748774cdf8eeb99, 0x34b0bcb5e19b48a8, 0x391c0cb3c5c95a63, 0x4ed8aa4ae3418acb, 0x5b9cca4f7763e373,
        0x682e6ff3d6b2b8a3, 0x748f82ee5defb2fc, 0x78a5636f43172f60, 0x84c87814a1f0ab72, 0x8cc702081a6439ec,
        0x90befffa23631e28, 0xa4506cebde82bde9, 0xbef9a3f7b2c67915, 0xc67178f2e372532b, 0xca273eceea26619c,
        0xd186b8c721c0c207, 0xeada7dd6cde0eb1e, 0xf57d4f7fee6ed178, 0x06f067aa72176fba, 0x0a637dc5a2c898a6,
        0x113f9804bef90dae, 0x1b710b35131c471b, 0x28db77f523047d84, 0x32caab7b40c72493, 0x3c9ebe0a15c9bebc,
        0x431d67c49c100d4c, 0x4cc5d4becb3e42b6, 0x597f299cfc657e2a, 0x5fcb6fab3ad6faec, 0x6c44198c4a475817
    };
    unsigned int newStrLen = (rawSize + 1u) + (240u - ((rawSize + 1u) % 128u)) % 128u;
    // translate the ascii into unsigned integers using bit magic
    std::vector<unsigned long long int> chunks((newStrLen >> 3u) + 2u, 0ull);// length of newStrLen/8
    // combine the bits of each character end to end into unsigned ints
    // extra login equivilent to pad string with a 1 bit and then 0 bits until (bit length === 896 (mod 1024))
    for(unsigned int i = 0u; i < rawSize; i++)
        chunks[i >> 3u] |= ((unsigned long long int)rawBytes[i]) << ((7ull - (i % 8)) << 3ull);
    chunks[rawSize >> 3u] |= 0x80ull << ((7ull - (rawSize % 8ull)) << 3ull);
    // push the original length of the string to the end of the chunks
    chunks[(newStrLen >> 3u) + 1u] = rawSize << 3ull;
    // loop through the "chunks" array, to do actual iterative hashing algorithm
    for (size_t j = 0; j < chunks.size(); j += 16) {
        // slice of chunks array from j to j+16
        unsigned long long int chunksSlice[80];
        for (size_t i = 0; i < 16; i++) chunksSlice[i] = chunks[j+i];
        // create continued sections of the chunks data
        for (size_t i = 16; i < 80; i++) {
            unsigned long long int c2 = chunksSlice[i - 2];
            unsigned long long int c15 = chunksSlice[i - 15];
            unsigned long long int s0 = (((c15 >> 1) | (c15 << 63)) ^ ((c15 >> 8) | (c15 << (64-8))) ^ (c15 >> 7));// rightRotate(w15,1)^rightRotate(w15,8)^(w15>>7)
            unsigned long long int s1 = (((c2 >> 19) | (c2 << (64-19))) ^ ((c2 >> 61) | (c2 << 3)) ^ (c2 >> 6));// rightRotate(w2,19)^rightRotate(w2,61)^(w2>>6)
            chunksSlice[i] = chunksSlice[i - 16] + s0 + chunksSlice[i - 7] + s1;
        }
        // save hash to add back to itself after hashing
        unsigned long long int hash[8];
        for (size_t i = 0; i < 8; i++) hash[i] = runningHash[i];
        // inner hashing loop
        for (size_t i = 0; i < 80; i++) {
            unsigned long long int h0 = runningHash[0];
            unsigned long long int h1 = runningHash[1];
            unsigned long long int h2 = runningHash[2];
            unsigned long long int h4 = runningHash[4];
            unsigned long long int S1 = (((h4 >> 14) | (h4 << (64-14))) ^ ((h4 >> 18) | (h4 << (64-18))) ^ ((h4 >> 41) | (h4 << (64-41))));// rightRotate(h4,14)^rightRotate(h4,18)^rightRotate(h4,41)
            unsigned long long int ch = ((h4 & runningHash[5]) ^ ((~h4) & runningHash[6]));
            unsigned long long int temp1 = runningHash[7] + S1 + ch + k[i] + chunksSlice[i];
            unsigned long long int S0 = (((h0 >> 28) | (h0 << (64-28))) ^ ((h0 >> 34) | (h0 << (64-34))) ^ ((h0 >> 39) | (h0 << (64-39))));// rightRotate(h0,28)^rightRotate(h0,34)^rightRotate(h0,39)
            unsigned long long int maj = ((h0 & h1) ^ (h0 & h2) ^ (h1 & h2));
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
    for (size_t i = 0; i < 8; i++) runningHash[i] = (runningHash[i] << 32) | (runningHash[i] >> 32);
    return std::vector<unsigned int>((unsigned int*)&runningHash[0], ((unsigned int*)&runningHash[0]) + 16);
}
std::vector<unsigned int> sha512Vector(const std::vector<unsigned char>& vec, bool debug) {
    return sha512Raw(&vec[0], vec.size(), debug);
}
#include "NumHelpers.h"
std::string sha512Str(std::string str, bool debug) {
    return wordsToBase16(sha512Raw((unsigned char*)&str[0], str.size(), debug));
}