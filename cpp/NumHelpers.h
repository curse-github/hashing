#include <vector>
#include <string>

std::string wordsToBase16(const std::vector<unsigned int>& words) {
    std::string result;
    for (unsigned int i = 0; i < words.size(); i++) {
        for (int j = 3; j >= 0; j--) {
            unsigned char num = (words[i] >> (j * 8)) & 0xff;
            unsigned char char1 = num >> 4;
            unsigned char char2 = num & 0xf;
            result += ((char1 < 10) ? ('0' + char1):('A' + (char1 - 10)));
            result += ((char2 < 10) ? ('0' + char2):('A' + (char2 - 10)));
        }
    }
    return result;
}
std::string wordsToBase16(const std::vector<unsigned long long int>& words) {
    std::string result;
    for (unsigned int i = 0; i < words.size(); i++) {
        for (int j = 7; j >= 0; j--) {
            unsigned char num = (words[i] >> (j * 8)) & 0xff;
            unsigned char char1 = num >> 4;
            unsigned char char2 = num & 0xf;
            result += ((char1 < 10) ? ('0' + char1):('A' + (char1 - 10)));
            result += ((char2 < 10) ? ('0' + char2):('A' + (char2 - 10)));
        }
    }
    return result;
}