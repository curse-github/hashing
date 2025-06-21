// adapted from a javascript algorithm I found here https://stackoverflow.com/questions/59777670/how-can-i-hash-a-string-with-sha256, which was taken from https://geraintluff.github.io/sha256/
// note: this only works on ascii text (which is the default in c++), and wouldnt working on anything like a wstring, or buffer of some kind
// from my tests this took roughly 0.03 milliseconds on average even on strings with a length of 500 characters
#ifndef _SHA256_
#define _SHA256_

#include <string>// for std::string
#include <vector>// for std::vector<T>
#include <cmath>// for std::pow
const unsigned long long int maxWord = std::pow(2,32);
std::vector<unsigned int> sha256Raw(const unsigned char* rawBytes, const unsigned int& rawSize);
std::vector<unsigned int> sha256Vector(const std::vector<unsigned char>& vec);
std::string sha256Str(std::string str);

#endif