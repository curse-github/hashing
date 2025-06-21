#ifndef _SHA512_
#define _SHA512_

// adapted from my own sha256 algorithm and the instructions for conversion found at https://en.wikipedia.org/wiki/SHA-2
// note: this only works on ascii text (which is the default in c++), and wouldnt working on anything like a wstring, or buffer of some kind

#include <string>// for std::string
#include <vector>// for std::vector<T>
#include <cmath>// for std::pow
#include <iostream>
#include <iomanip>

std::vector<unsigned int> sha512Raw(const unsigned char* rawBytes, const unsigned int& rawSize, bool debug = false);
std::vector<unsigned int> sha512Vector(const std::vector<unsigned char>& vec, bool debug = false);
std::string sha512Str(std::string str, bool debug = false);

#endif