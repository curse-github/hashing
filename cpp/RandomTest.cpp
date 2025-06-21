#include <iostream>// for std::cout
#include "./Random.h"
int main(int argc, const char **argv) {
    for (unsigned int i = 0; i < 15u; i++)
        std::cout << generateBigInt<17>().toHex() << '\n';
    return 0;
}