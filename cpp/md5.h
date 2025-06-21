#ifndef _MD5_
#define _MD5_

// adapted mostly from pseudo-code algorithm at https://en.wikipedia.org/wiki/MD5
// with some slight help from chat-gpt, because I forgot about the little endian parts
// note: this only works on ascii text (which is the default in c++), and wouldnt working on anything like a wstring, or buffer of some kind
// from my tests this took roughly 0.025 milliseconds on average even on strings with a length of 500 characters

#include <string>// for std::string
#include <vector>// for std::vector<T>
#include <cmath>// for std::pow

const unsigned long long int maxWord = std::pow(2, 32);
std::vector<unsigned int> md5Raw(const unsigned char* rawBytes, const unsigned int& rawSize);
std::vector<unsigned int> md5Vector(const std::vector<unsigned char>& vec);
std::string md5Str(std::string str);

#endif