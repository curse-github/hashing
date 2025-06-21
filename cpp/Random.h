#ifndef _RANDOM_
#define _RANDOM_

#include "BigInt.h"
#include "sha256.h"
#include "myTime.h"

BigInt<8> generateNum();
template<unsigned int N>
BigInt<N> generateBigInt() {
    BigInt<N> output;
    for (unsigned int j = 0; j < N; j += 8) {
        BigInt<8> x = generateNum();
        for (unsigned int i = 0; i < 8; i++)
            if ((j + i) < N)
                output[j + i] = x[i];
    }
    return output;
}

#endif