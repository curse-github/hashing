#include "sha512.h"

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
    /* Test  #1 */"string"                                       , "2757cb3cafc39af451abb2697be79b4ab61d63d74d85b0418629de8c26811b529f3f3780d0150063ff55a2beee74c4ec102a2a2731a1f1f7f10d473ad18a6a87",
    /* Test  #2 */""                                             , "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
    /* Test  #3 */"password"                                     , "b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86",
    /* Test  #4 */"1234"                                         , "d404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db",
    /* Test  #5 */"password1234"                                 , "8c7c9d16278ac60a19776f204f3109b1c2fc782ff8b671f42426a85cf72b1021887dd9e4febe420dcd215ba499ff12e230daf67afffde8bf84befe867a8822c4",
    /* Test  #6 */"0123456789"                                   , "bb96c2fc40d2d54617d6f276febe571f623a8dadf0b734855299b0e107fda32cf6b69f2da32b36445d73690b93cbd0f7bfc20e0f7f28553d2a4428f23b716e90",
    /* Test  #7 */"abcdefghijklmnopqrstuvwxyz"                   , "4dbff86cc2ca1bae1e16468a05cb9881c97f1753bce3619034898faa1aabe429955a1bf8ec483d7421fe3c1646613a59ed5441fb0f321389f77f48a879c7b1f1",
    /* Test  #8 */"username"                                     , "05ee170f46fd6040a23ebd883d63ef3b2aff55e3d6e01eccbc401088d7de0c153251c27e517ea4ad9bed62980366d1a47ceb312a659e77debda650d870094562",
    /* Test  #9 */"email"                                        , "c94565ebe258c1fd483e58c918b12c3962a2fe06fc16ef8f6cf9946524de244e45f1f1ddf7d6f2e2f1a4d5a1022fecf825077f2504a7e6c15f837c06aed345f5",
    /* Test #10 */"The quick brown fox jumps over the lazy dog"  , "07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6",
    /* Test #11 */"The quick brown fox jumps over the lazy dog." , "91ea1245f20d46ae9a037a989f54f1f790f0a47607eeb8a14d12890cea77a1bbc6c7ed9cf205e67b7f2b8fd4c7dfd3a7a8617e45f3c463d481c7e586c39ac1ed",
    /* Test #12 */"thisisaverylongstringtotestthealgorithm"      , "a428ae69b2bc77beb8ead462773384239c4622020907894d0fc19f0d920f326fc44ac5e14beacaaf65523d9367a5a37e7851e541077397c0705872f6392f8b65",
    /* Test #13 */"thisIsAnotherVeryLongStringToTestTheAlgorithm", "3b63fb2317103e207766ff478c3e8b7c8153c335def01243cbac34aef0f705206f1fd2d08fbd3313b75c4c6721e1933e44f2069da8aaf5e2049e9c5082b727da",
    /* Test #14 */std::string(100,'a')                           , "70ff99fd241905992cc3fff2f6e3f562c8719d689bfe0e53cbc75e53286d82d8767aed0959b8c63aadf55b5730babee75ea082e88414700d7507b988c44c47bc",
    /* Test #15 */std::string(500, 'b')                          , "bfc6fc8457ea8848bd50322f0a99444817c0e407276ed4184d569f39f54f918ad1729465fb3c69a7578e7ffe24443e90ec49edefe296ce07e0e20ced5cc7a012",
    /* Test #16 */std::string(1000, 'c')                         , "69158716dd51b848f95e3b23f6d35d5198688763067d14ffdfcb57132623843da267d8dfba63c4757623bb02ee4dbe47595cc871cfae81768617911aef81d179",
    /* Test #17 */std::string(1500, 'd')                         , "a014ca4748702d21c1c4a9d31a0804cb6d89f95f991e2cbb3302d2c5c227e622fb9d12a0e61a1efabb909f0b5200fcc716aa98bcdcede852fca22eb57a63f687",
    /* Test #18 */std::string(2000, 'e')                         , "4f5ac9f075713307cef653afea62f54300b68cb1efbe57df16d4aed02f19089eb04a347dbf859df6504bb3b2cba9a2d4b8eaa843298da5c37cec7b0af50cb6b2",
    /* Test #19 */std::string(2500, 'f')                         , "55895dc018664a2a392ad2621402a869b4317e7ec1d3505bad23902bcf651c02a2e08c12142cf98b451b9ae797c9d4f739560198fcf2c166cb1124830cee19f0",
    /* Test #20 */std::string(3000, 'g')                         , "5084c15cd6f92390cf05bcf79bd6c389a16c33d771035a0671e80645928b30b3fc2ff724960b82a9e1b0fa720c473156016a53996e91b45fb2168633082f9276",
    /* Test #21 */std::string(3500, 'h')                         , "6ca25b32ba8c6861ebad629887bb889e1f6c7f0598503054e434f6a1353433b49da8d881fe2f683af162ffca00a8d64e31ce2264243a406fdfc6a663e8e5e6c9",
    /* Test #22 */std::string(4000, 'i')                         , "8ca168a0a4dd88d63387ec666aec2f558a5bd936be6498b808993caeb92683752f9ceae80fbbde016bb338058bf3480103621c95d3eea4990ec5e913e4098d4f",
    /* Test #23 */std::string(10000, 'a')                        , "0593036f4f479d2eb8078ca26b1d59321a86bdfcb04cb40043694f1eb0301b8acd20b936db3c916ebcc1b609400ffcf3fa8d569d7e39293855668645094baf0e",
    /* Test #24 */std::string(10960, 'a')                        , "ad18c64c8a789d7ab3c2ef877ff0bbe1d594ef2ac947a69208944c33f1a7ad0acc0adc42ea468fc8194565f061c975f685fca3da44be2e57b142e0ea7555d6cc"
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
        std::string hash = sha512Str(tests[i * 2],i==0);
        bool successfull = std::equal(hash.begin(), hash.end(), tests[i * 2 + 1].begin(), tests[i * 2 + 1].end(), ichar_equals);
        if (successfull) {
            successfullTests++;
            std::cout << "Test #" << (i + 1) << " was sucessfull.\n";
        } else {
            std::cout << "Test #" << (i + 1) << " failed :(\n";
            size_t len = tests[i * 2].size();
            std::cout << "    sha512(\"";
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
    std::string hash = sha512Str(fileContents,false);
    std::cout << "sha512(File(\"" << path << "\")) = \"" << hash << "\"\n";
}
#include <chrono>
void hashAvgTimeTest(const int &strLen, const int &numTests) {
    std::string str(strLen, 'x');
    std::chrono::high_resolution_clock::time_point startTime = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < numTests; i++) sha512Str(str,false);
    double duration = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::high_resolution_clock::now() - startTime).count();
    std::cout << numTests << " hashes took " << duration << "ms total with string of length " << strLen << ".\n";
    std::cout << "    average time of " << (duration / numTests) << "ms.\n";
}
int main(int argc, const char **argv) {
    hashCorrectnessTest();
    std::cout << '\n';
    hashFileChecksumTest("./cpp/sha512.cpp");
    hashFileChecksumTest("./cpp/sha512.a");
    hashFileChecksumTest("./cpp/sha512Test.cpp");
    hashFileChecksumTest("./cpp/sha512Test.exe");
    hashFileChecksumTest("./c++Sha512.bat");
    std::cout << '\n';
    hashAvgTimeTest(500, 100000);
    return 0;
}