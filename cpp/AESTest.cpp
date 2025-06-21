#include <iostream>
#include "AesPcbcCts.h"

void printoutCharInBase16(const unsigned& chr) {
    const unsigned char char1 = chr >> 4;
    const unsigned char char2 = chr & 0xF;
    std::cout << (char)((char1 >= 10) ? ('a' + (char1 - 10)) : ('0' + char1));
    std::cout << (char)((char2 >= 10) ? ('a' + (char2 - 10)) : ('0' + char2));
}
void printoutChars(const unsigned char* chars, const unsigned int& num) {
    for (unsigned char i = 0; i < num; i++) {
        printoutCharInBase16(chars[i]);
        if (i != (num - 1)) std::cout << ' ';
    }
    std::cout << '\n';
}
bool match(const std::vector<unsigned char>& a, const std::vector<unsigned char>& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); i++) if (a[i] != b[i]) return false;
    return true;
}
bool match(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); i++) if (a[i] != b[i]) return false;
    return true;
}
bool match(const unsigned char* a, const unsigned char* b, const unsigned int& size) {
    for (size_t i = 0; i < size; i++) if (a[i] != b[i]) return false;
    return true;
}
std::vector<unsigned char> strToBytes(const std::string& str) {
    const unsigned char* start = (const unsigned char*)&str[0];
    return std::vector<unsigned char>(start, start + str.size());
}
std::string bytesToStr(const std::vector<unsigned char>& vec) {
    const unsigned char* start = (const unsigned char*)&vec[0];
    return std::string(start, start + vec.size());
}



void blockTest(const expandedkey& expK) {
    block plaintext = { 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55 };
    std::cout << "plaintext1:\n";
    printoutChars(&plaintext[0], 16);
    block cyphertext = AESencryptBlock(plaintext, expK);
    std::cout << "cyphertext1:\n";
    printoutChars(&cyphertext[0], 16);
    block decrypted = AESdecryptBlock(cyphertext, expK);
    std::cout << "decrypted1:\n";
    printoutChars(&decrypted[0], 16);
    std::cout << "correct:\n";
    std::cout << (match(&plaintext[0], &decrypted[0], 16) ? "true" : "false") << '\n';
}
void vectorTest(const expandedkey& expK) {
    const std::vector<unsigned char> plaintext = { 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55 };// string of 20 7s
    std::cout << "plaintext2:\n";
    printoutChars(&plaintext[0], plaintext.size());
    block IV = { 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48 };// string of 16 0s
    std::cout << "IV1:\n";
    printoutChars(&IV[0], 16);
    const std::vector<unsigned char> cyphertext = encryptAesPcbcCts(plaintext, IV, expK);
    std::cout << "cyphertext2:\n";
    printoutChars(&cyphertext[0], cyphertext.size());
    const std::vector<unsigned char> decrypted = decryptAesPcbcCts(cyphertext, IV, expK);
    std::cout << "decrypted2:\n";
    printoutChars(&decrypted[0], decrypted.size());
    std::cout << "correct:\n";
    std::cout << (match(plaintext, decrypted) ? "true" : "false") << '\n';
}
void strTest(const expandedkey& expK) {
    const std::string plaintext = "abcdefghijklmnopqrstuvwxyz";
    std::cout << "plaintext3:\n";
    std::cout << plaintext << '\n';
    std::string IvStr = "bbbbbbbbbbbbbbbb";
    std::cout << "IV2:\n";
    std::cout << IvStr << '\n';
    block IV((unsigned char*)&IvStr[0], 16);
    const std::vector<unsigned char> cyphertext = encryptAesPcbcCts(strToBytes(plaintext), IV, expK);
    std::cout << "cyphertext3:\n";
    printoutChars(&cyphertext[0], cyphertext.size());
    const std::string decrypted = bytesToStr(decryptAesPcbcCts(cyphertext, IV, expK));
    std::cout << "decrypted3:\n";
    std::cout << decrypted << '\n';
    std::cout << "correct:\n";
    std::cout << (match(plaintext, decrypted) ? "true" : "false") << '\n';
}

int main(int argc, const char** argv) {
    createS_Box();
    std::cout << "S-Box:\n";
    for (unsigned int i = 0; i < 16; i++) {
        std::cout << "    ";
        for (unsigned char j = 0; j < 16; j++) {
            std::cout << RFF8(Sb[i*16 + j]).toHex();
            if (j != 15) std::cout << ' ';
        }
        std::cout << "\n";
    }
    std::cout << "(S^-1)-Box:\n";
    for (unsigned int i = 0; i < 16; i++) {
        std::cout << "    ";
        for (unsigned char j = 0; j < 16; j++) {
            std::cout << RFF8(RSb[i*16 + j]).toHex();
            if (j != 15) std::cout << ' ';
        }
        std::cout << "\n";
    }
    const expandedkey expK = expandKey("aaaaaaaaaaaaaaaa");
    std::cout << "expanded-key:\n";
    for (unsigned int i = 0; i < 8; i++) {
        std::cout << "    ";
        for (unsigned char j = 0; j < 30; j++) {
            const unsigned char tmp = expK[i*30 + j];
            const unsigned char char1 = tmp >> 4;
            const unsigned char char2 = tmp & 0xF;
            std::cout << (char)((char1 >= 10) ? ('a' + (char1 - 10)) : ('0' + char1));
            std::cout << (char)((char2 >= 10) ? ('a' + (char2 - 10)) : ('0' + char2));
            if (j != 29) std::cout << ' ';
        }
        std::cout << "\n";
    }
    blockTest(expK);
    std::cout << '\n';
    vectorTest(expK);
    std::cout << '\n';
    strTest(expK);
    return 0;
}