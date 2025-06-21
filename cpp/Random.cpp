#include "Random.h"

BigInt<8> seed = BigInt<8>::fromHex("A5C0858A3EE08261ACB7F0B4626DEF031A90F9E2E65412F27CE8BC6D5D756500");
BigInt<8> generateNum() {
    const long long int timeLong = myTime();
    std::vector<unsigned char> dVec(4,0);
    for (unsigned int i = 0; i < 4; i++) dVec[i] = (timeLong >> (24 - (8 * i))) & 0xff;
    std::vector<unsigned int> tmp = sha256Vector(dVec);
    std::vector<unsigned char> seedBytes(32, 0);
    for (unsigned int i = 0; i < 8; i++) {
        seed[i] ^= tmp[i];
        for (int j = 3; j >= 0; j--)
            seedBytes[i*4 + 3 - j] = (seed[i] >> (j * 8)) & 0xff;
    }
    const std::vector<unsigned int> x = sha256Vector(seedBytes);
    std::vector<unsigned char> tmpBytes(32, 0);
    for (unsigned int i = 0; i < 8; i++) {
        tmp[i] ^= x[i];
        for (int k = 3; k >= 0; k--)
            tmpBytes[i*4 + 3 - k] = (tmp[i] >> (k * 8)) & 0xff;
    }
    const std::vector<unsigned int> seedVec = sha256Vector(tmpBytes);
    for (unsigned int i = 0; i < 8; i++) seed[i] = seedVec[i];
    return BigInt<8>(&x[0], 8);
}