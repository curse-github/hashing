#ifndef _AES_
#define _AES_

#include "FF.h"
#include <vector>
#include <initializer_list>

// extern unsigned char B[255];
extern unsigned char Sb[255];
extern unsigned char RSb[255];
void createS_Box();
struct expandedkey {
    unsigned char key[240];
    expandedkey(unsigned int bytes[60]) {
        for (size_t i = 0; i < 240; i++)
            key[i] = (bytes[i >> 2] >> ((3 - (i % 4)) * 8)) & 0xFF;
    }
    expandedkey(const expandedkey& copy) {
        for (unsigned char i = 0; i < 240; i++)
            key[i] = copy.key[i];
    }
    unsigned char& operator[](const unsigned int& i) {
        if (i >= 240) throw std::runtime_error("index out of bounds.");
        return key[i];
    }
    unsigned char operator[](const unsigned int& i) const {
        if (i >= 240) throw std::runtime_error("index out of bounds.");
        return key[i];
    }
};
expandedkey expandKey(const std::string& K);
struct block {
    unsigned char key[16];
    block() {
        for (unsigned int i = 0; i < 16; i++) key[i] = 0;
    }
    block(const std::initializer_list<const unsigned char>& il) {
        if (il.size() != 16) throw std::runtime_error("initializer_list must have a length of 16.");
        const unsigned char* begin = il.begin();
        for (unsigned char i = 0; i < 16; i++)
            key[i] = *(begin + i);
    }
    block(const unsigned char* copy, const unsigned int& size) {
        for (unsigned int i = 0; i < size; i++) key[i] = copy[i];
        for (unsigned int i = size; i < 16; i++) key[i] = 0;
    }
    block(unsigned char copy[16]) {
        for (size_t i = 0; i < 240; i++)
            key[i] = copy[16];
    }
    block(const expandedkey& copy) {
        for (unsigned char i = 0; i < 16; i++)
            key[i] = copy.key[i];
    }
    void operator=(const std::initializer_list<const unsigned char>& il) {
        if (il.size() != 16) throw std::runtime_error("initializer_list must have a length of 16.");
        const unsigned char* begin = il.begin();
        for (unsigned char i = 0; i < 16; i++)
            key[i] = *(begin + i);
    }
    void operator=(unsigned char copy[16]) {
        for (size_t i = 0; i < 240; i++)
            key[i] = copy[16];
    }
    void operator=(const expandedkey& copy) {
        for (unsigned char i = 0; i < 16; i++)
            key[i] = copy.key[i];
    }
    unsigned char& operator[](const unsigned int& i) {
        if (i >= 16) throw std::runtime_error("index out of bounds.");
        return key[i];
    }
    unsigned char operator[](const unsigned int& i) const {
        if (i >= 16) throw std::runtime_error("index out of bounds.");
        return key[i];
    }
};
block AESencryptBlock(block message, const expandedkey& W);
block AESdecryptBlock(block message, const expandedkey& W);
std::vector<unsigned char> encryptAesPcbcCts(std::vector<unsigned char> message, const block& IV, const expandedkey& W);
std::vector<unsigned char> decryptAesPcbcCts(const std::vector<unsigned char>& cypher, const block& IV, const expandedkey& W);

#endif