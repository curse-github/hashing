#include "./sha256.h"

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
std::string tests[] = {
    /* Test  #1 */"string"                                       , "473287f8298dba7163a897908958f7c0eae733e25d2e027992ea2edc9bed2fa8",
    /* Test  #2 */""                                             , "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    /* Test  #3 */"password"                                     , "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    /* Test  #4 */"1234"                                         , "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    /* Test  #5 */"password1234"                                 , "b9c950640e1b3740e98acb93e669c65766f6670dd1609ba91ff41052ba48c6f3",
    /* Test  #6 */"0123456789"                                   , "84d89877f0d4041efb6bf91a16f0248f2fd573e6af05c19f96bedb9f882f7882",
    /* Test  #7 */"abcdefghijklmnopqrstuvwxyz"                   , "71c480df93d6ae2f1efad1447c66c9525e316218cf51fc8d9ed832f2daf18b73",
    /* Test  #8 */"username"                                     , "16f78a7d6317f102bbd95fc9a4f3ff2e3249287690b8bdad6b7810f82b34ace3",
    /* Test  #9 */"email"                                        , "82244417f956ac7c599f191593f7e441a4fafa20a4158fd52e154f1dc4c8ed92",
    /* Test #10 */"The quick brown fox jumps over the lazy dog"  , "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
    /* Test #11 */"The quick brown fox jumps over the lazy dog." , "ef537f25c895bfa782526529a9b63d97aa631564d5d789c2b765448c8635fb6c",
    /* Test #12 */"thisisaverylongstringtotestthealgorithm"      , "6f28ec8584e0a2789e5e88afc76a71c63ceb0dbdde5e0bca81ef680fe1caf8dc",
    /* Test #13 */"thisIsAnotherVeryLongStringToTestTheAlgorithm", "4aa15966bc913a6b876375bf3dc55e6789eec20b7033c7078401f500d38992f3",
    /* Test #14 */std::string(100,'a')                           , "2816597888e4a0d3a36b82b83316ab32680eb8f00f8cd3b904d681246d285a0e",
    /* Test #15 */std::string(500, 'b')                          , "ba44b93823e5c24e99d64a916b3e53a97613d4c438c0c2896cadc2dd8195c14a",
    /* Test #16 */std::string(1000, 'c')                         , "efeea944a76157a88d281091b6a79608653bc1f14a11d0357431c197701b6155",
    /* Test #17 */std::string(1500, 'd')                         , "380bb55c93b5ba9d4d83358222bd97b4aa695fa3f4c21b5b5abe66b082d0ab2c",
    /* Test #18 */std::string(2000, 'e')                         , "cdd7c1aa4541dc6e00f0082a42d7d480baede61b25d93f5655fd9492c48f69bf",
    /* Test #19 */std::string(2500, 'f')                         , "a3bb14db8094ba12e09dd3b8d6cc882a33fdc33f6f756da6c30ca0fce7354fe2",
    /* Test #20 */std::string(3000, 'g')                         , "33415156cdd86452c9c99b5e66976991bedc987d7c427255904e27178c47da8f",
    /* Test #21 */std::string(3500, 'h')                         , "4035343b3ad40980b17335bfdab0cdc3bf5b74c3cd6e433cbd7d828b68ba6511",
    /* Test #22 */std::string(4000, 'i')                         , "59ddc97376c2238cbf91017e2225fc255ecf1cde19d56e7fa3678dc812469d62",
    /* Test #23 */std::string(10000, 'a')                        , "27dd1f61b867b6a0f6e9d8a41c43231de52107e53ae424de8f847b821db4b711",
    /* Test #24 */std::string(10960, 'a')                        , "fa77c483fdc2738517f8dcb31c9ea13ea934ae54a85260dfd40234a6ba1f77c9"
};

#include <iostream>// for std::cout
#include <cctype>
#include <algorithm>
bool ichar_equals(char a, char b) {
    return std::tolower(static_cast<unsigned char>(a)) == std::tolower(static_cast<unsigned char>(b));
}
unsigned int successfullTests = 0;
void hashCorrectnessTest() {
    size_t num = (sizeof(tests)/sizeof(std::string))>>1;// half the size of the tests array
    for (size_t i = 0; i < num; i++) {
        std::string hash = sha256Str(tests[i * 2]);
        bool successfull = std::equal(hash.begin(), hash.end(), tests[i * 2 + 1].begin(), tests[i * 2 + 1].end(), ichar_equals);
        if (successfull) {
            successfullTests++;
            std::cout << "Test #" << (i + 1) << " was sucessfull.\n";
        } else {
            std::cout << "Test #" << (i + 1) << " failed :(\n";
            size_t len = tests[i * 2].size();
            std::cout << "    sha256(\"";
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
void hashFileChecksumTest(const std::string &path) {
    // Create a text string, which is used to output the text file
    std::ifstream file(path);
    std::string fileContents = readFile(file);
    file.close();
    std::string hash = sha256Str(fileContents);
    std::cout << "sha256(File(\"" << path << "\")) = \"" << hash << "\"\n";
}
#include <chrono>
void hashAvgTimeTest(const int &strLen, const int &numTests) {
    std::string str(strLen, 'x');
    std::chrono::high_resolution_clock::time_point startTime = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < numTests; i++) sha256Str(str);
    double duration = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::high_resolution_clock::now() - startTime).count();
    std::cout << numTests << " hashes took " << duration << "ms total with string of length " << strLen << ".\n";
    std::cout << "    average time of " << (duration / numTests) << "ms.\n";
}
int main(int argc, const char **argv) {
    hashCorrectnessTest();
    std::cout << '\n';
    hashFileChecksumTest("./cpp/sha256.cpp");
    hashFileChecksumTest("./cpp/sha256.a");
    hashFileChecksumTest("./cpp/sha256Test.cpp");
    hashFileChecksumTest("./cpp/sha256Test.exe");
    hashFileChecksumTest("./c++Sha256.bat");
    std::cout << '\n';
    hashAvgTimeTest(500, 100000);
    return 0;
}