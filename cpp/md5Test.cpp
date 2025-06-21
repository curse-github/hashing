#include "md5.h"

#include <fstream>
std::string readFile(std::ifstream &file) {
    // from https://stackoverflow.com/questions/2602013/read-whole-ascii-file-into-c-stdstring
    file.seekg(0, std::ios::end);
    size_t size = file.tellg();
    std::string buffer(size, ' ');
    file.seekg(0);
    file.read(&buffer[0], size);
    return buffer;
}
// b4 5c ff e0
// ff 5c b4 e0
// B4 E0 FF 5C
std::string tests[] = {
    /* Test  #1 */"string"                                       , "b45cffe084dd3d20d928bee85e7b0f21",
    /* Test  #2 */""                                             , "d41d8cd98f00b204e9800998ecf8427e",
    /* Test  #3 */"password"                                     , "5f4dcc3b5aa765d61d8327deb882cf99",
    /* Test  #4 */"1234"                                         , "81dc9bdb52d04dc20036dbd8313ed055",
    /* Test  #5 */"password1234"                                 , "bdc87b9c894da5168059e00ebffb9077",
    /* Test  #6 */"0123456789"                                   , "781e5e245d69b566979b86e28d23f2c7",
    /* Test  #7 */"abcdefghijklmnopqrstuvwxyz"                   , "c3fcd3d76192e4007dfb496cca67e13b",
    /* Test  #8 */"username"                                     , "14c4b06b824ec593239362517f538b29",
    /* Test  #9 */"email"                                        , "0c83f57c786a0b4a39efab23731c7ebc",
    /* Test #10 */"The quick brown fox jumps over the lazy dog"  , "9e107d9d372bb6826bd81d3542a419d6",
    /* Test #11 */"The quick brown fox jumps over the lazy dog." , "e4d909c290d0fb1ca068ffaddf22cbd0",
    /* Test #12 */"thisisaverylongstringtotestthealgorithm"      , "7d0581ecfaf11d27c2705b9d60aa8ed2",
    /* Test #13 */"thisIsAnotherVeryLongStringToTestTheAlgorithm", "e429f9c3db2dfbb7acc68acb83745c6b",
    /* Test #14 */std::string(100,'a')                           , "36a92cc94a9e0fa21f625f8bfb007adf",
    /* Test #15 */std::string(500, 'b')                          , "8024cdcf93b5f41fa5699800fac49be6",
    /* Test #16 */std::string(1000, 'c')                         , "46a128cdf4c7d26f1465dfac42771ed3",
    /* Test #17 */std::string(1500, 'd')                         , "0fe43958acf8c5bf027850f1bbccfcad",
    /* Test #18 */std::string(2000, 'e')                         , "16b6aade8a6870fd967c3f578a2d727b",
    /* Test #19 */std::string(2500, 'f')                         , "7e8976c29f96acc99736ff096a85f197",
    /* Test #20 */std::string(3000, 'g')                         , "35ee977dfb40c4382762065143dbdde5",
    /* Test #21 */std::string(3500, 'h')                         , "d14717e7cffbcd490c1e15fd6da0be0b",
    /* Test #22 */std::string(4000, 'i')                         , "dc271dc1e927f81ce55f79d3c45b4cb7",
    /* Test #23 */std::string(10000, 'a')                        , "0d0c9c4db6953fee9e03f528cafd7d3e",
    /* Test #24 */std::string(10960, 'a')                        , "d651178b8ea9ecf9663648a7fbc9f1a6"
};

#include <iostream>// for std::cout
#include <cctype>
#include <algorithm>
bool ichar_equals(char a, char b) {
    return std::tolower(static_cast<unsigned char>(a)) == std::tolower(static_cast<unsigned char>(b));
}
unsigned int successfullTests = 0;
void HashCorrectnessTest() {
    size_t num = (sizeof(tests)/sizeof(std::string))>>1;// half the size of the tests array
    for (size_t i = 0; i < num; i++) {
        std::string hash = md5Str(tests[i * 2]);
        bool successfull = std::equal(hash.begin(), hash.end(), tests[i * 2 + 1].begin(), tests[i * 2 + 1].end(), ichar_equals);
        if (successfull) {
            successfullTests++;
            std::cout << "Test #" << (i + 1) << " was sucessfull.\n";
        } else {
            std::cout << "Test #" << (i + 1) << " failed:(\n";
            size_t len = tests[i * 2].size();
            std::cout << "    md5(\"";
            if (len > 10)
                std::cout << tests[i * 2].substr(0, 5) << "\" + " << (len - 10) << " more characters + \"" << tests[i * 2].substr(len - 5, len);
            else
                std::cout << tests[i * 2];
            std::cout << "\") != \"" << hash << "\"\n";
        }
    }
    std::cout << '\n' << num << " total tests.\n";
    std::cout << successfullTests << " successfull tests.\n";
    std::cout << ((double)successfullTests / num * 100) << "% successfull rate.\n";
}
void HashFileChecksumTest(const std::string &path) {
    // Create a text string, which is used to output the text file
    std::ifstream file(path);
    std::string fileContents = readFile(file);
    file.close();
    std::string Hash = md5Str(fileContents);
    std::cout << "md5(File(\"" << path << "\")) = \"" << Hash << "\"\n";
}
#include <chrono>
void HashAvgTimeTest(const int &strLen, const int &numTests) {
    std::string str(strLen, 'x');
    std::chrono::high_resolution_clock::time_point startTime = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < numTests; i++) md5Str(str);
    double duration = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::high_resolution_clock::now() - startTime).count();
    std::cout << numTests << " Hashes took " << duration << "ms total with strings of length " << strLen << ".\n";
    std::cout << "    average time of " << (duration / numTests) << "ms.\n";
}
int main(int argc, const char **argv) {
    HashCorrectnessTest();
    std::cout << '\n';
    HashFileChecksumTest("./cpp/md5.cpp");
    HashFileChecksumTest("./cpp/md5.a");
    HashFileChecksumTest("./cpp/md5Test.cpp");
    HashFileChecksumTest("./cpp/md5Test.exe");
    HashFileChecksumTest("./c++Md5.bat");
    std::cout << '\n';
    HashAvgTimeTest(500, 100000);
    return 0;
}