#include <iostream>
#include "./ECC.h"
#include "./Random.h"

struct keyPair {
    FF384 q;
    ECpoint384 Q;
    keyPair(const FF384& _q, const ECpoint384& _Q) : q(_q), Q(_Q) {}
};
std::vector<keyPair> keyPairs;
std::string getPublic(std::string q, std::string Q) {
    FF384 q_parsed = FF384::fromHex(q);
    std::cout << "private: " << q_parsed.toHex() << '\n';
    long long int startTime = myTime();
    ECpoint384 Q_generated = G_384 * q_parsed;
    long long int timeElapsed = myTime() - startTime;
    std::cout << " public: " << Q_generated.toHex() << '\n';
    std::cout << "took " << timeElapsed << "ms.\n";
    if (Q.size() > 0) {
        bool correct = Q_generated.toHex() == Q;
        std::cout << "correct?: " << (correct ? "true" : "false") << "\n\n";
    }
    keyPairs.push_back({ q_parsed, Q_generated });
    return Q_generated.toHex();
}
std::string getPrivateKey() {
    return generateBigInt<12>().toHex();
}

int main(int argc, char** argv) {
    getPublic("0000000000000000000000000000000051897B64E85C3F714BBA707E867914295A1377A7463A9DAE8EA6A8B914246319", "04687767250027023EA16A100A5013B11204D23C297FA7CA3089178B1F135C3044BFF9D12DD1DEF8AFBC8107B41B3B246F837B9FA9E3235E5284BC537A536E82226676F81D2E4C8C5159E643914802B00DB33C3DF15FD7E4E514295A1DF1088451");
    getPublic("EEBB53AA624A244B5C845547C4320F121FF3AF21C26899E62F2E5D76A454816153EC66FC2A2C2BBDF37A020D545F8CF0", "04D9836A82760F45D06A9FDA48BB12E1D9A48122DCA082E43769009041B709CA8E381E8FFDDAB2CBE690E6012E702AA1D470F85DEF97AD3CCFA1F24BE8E39A4E9F7A842D49EEAD042BEBBAD2DB418D84D6DE475CB05FCA91209F20F665837FE46D");
    getPublic("18E72E1FEC79E4FA8DFDB6AB71DF62F53CBF89719731049E711C1F44E89D0215069E520B150EAD804D9067799050DCB4", "0457E5C9DBC63879C995142FDA853C5BC28EF63C65CC0A721A1EF33A9A5E94B3E183000BC1BA5459DB4F76A42863836A9881CE3C06804736DDD47F15D62F9BE301C9097597957B7DB75A83E89F319CC5C20501F8A49B440A398434CF7EC582709D");
    getPublic("2DE5DFEC9B51E4F7E1FFD5D7F311C0A0FCFE2C81E811A47A4B349618C8F2F1B0F59FA17BFA1ED6A34AF3760B4D42EF61", "0424A34BD70A56F5065D18DC28FC93B0CFD80B746C4EA6F66AEFD1CE71BD850885420D0420EE2504A3DB1A04D659504A1D4615D647395578D5081AED9DD4588D9DE2494123A4E91DFD891A41995FC7D1538825197E06D072B0EC810F43384F316A");
    getPublic("6F2D24918E5701476FCF829D408B8FAF49FD9053125CFF01F8332C1C7659B34210763C64678516AB6CD38ADF7F31FE26", "048F9DDA54813ADEF962CFEAA8383D46F762E69D5A3AAACC5B2B8B25E6AEE3A2AC7C786908CF72C8A3E4BC280B5561D225C87C1D3BF4B4B24B724D1D21A22EB5E9D2F73297EB1F4C57553E51D1C7C6B5B64694AF78AEBE9635E2F0498B40F1DA91");
    getPublic("1B19C2BAC56F31419F9E8A9CD964780F9DC33DD937D235937418EF505015D127B8CB20C27E9AD3A4FC823063E3D1DD88", "04609AC5B5CE2E994E64DF6FD1B32C0F6D73EE9D66BAA5A2C36CAF65E61255986C01AF71F315FECE284B28760583EAF40CBCE7A3D799240F296C0F734EF1566BD3EBFE93E1FA3E81E175E224D6272934FFA7FD0C5CA82B411D3E42235D309C5B45");
    getPublic("B89619D9AFA5CA9F029B9085B90D07B01A95F0E2D7038C1E920AA9E8275B543F32364D33CEAC58D2A5241AC1E9F88EC8", "044BEE33CE2C9C00DE059E00D1E84FAF6CA38455891C83C23A2C2508CCC18AF586B48B4DFEEC5E81BDA514D67EC338CC6580E7C4CB51F4C08F415B3DEC02F5E5CB03C34A57E5636072BF7BD4B389124FB3BA1CF98A9CB9612640580B04EF8E4713");
    getPublic("AF7717738E02958B14160CA44277E0147F7512FB3B6FA467B89C1CAAC745C638F7E5655F6BBA228643D3A4F583BC91A2", "0434DCF910DD69D5FCB1801C13FCF8586A97F87D5D3F72C90125107B634A5070EB3C4EEF6486238AEDE4B31F8952C6C2A8B0BDF018053D47BF0F4F1CCE0B71920D3F4FA0A6F8CFA5888650B512C75AD822B9188FE0CA5076167BC35DD89AD6ECAD");
    getPublic("820288643FF080E65461050F5233F9B41BF12925451EE10D82F6525969EDA13FA45A93CDD99CCE81CE17E5DA42FDB956", "0449933D3A1A6E4E0B0C6DBE2D96D444C81EF1AEDE308B63E008A756D73FE22C3DB5C6795BC14E8D3A08BEF2CA3F622842B466D92A7804605E094D682CE26A00821E125F4193B4368877D2A6217F5A256CCD80E5699BE229769781E451E9C62EEC");
    getPublic(getPrivateKey(), "");
    getPublic(getPrivateKey(), "");
    getPublic(getPrivateKey(), "");
    getPublic(getPrivateKey(), "");
    const unsigned int size = keyPairs.size();
    for (unsigned int i = 0; i < size; i++) {
        for (unsigned int j = i; j < size; j++) {
                const ECpoint384 iJ = keyPairs[i].q * keyPairs[j].Q;
                const ECpoint384 jI = keyPairs[j].q * keyPairs[i].Q;
                if (iJ != jI) std::cout << "\nERROR\n\n";
                std::cout << "shared key " << i << '-' << j << ": " << iJ.toHex() << '\n';
        }
    }
    for (unsigned int i = 0; i < size; i++) {
        for (unsigned int j = i; j < size; j++) {
            for (unsigned int k = j; k < size; k++) {
                const ECpoint384 ijK = keyPairs[i].q * (keyPairs[j].q * keyPairs[k].Q);
                const ECpoint384 jkI = keyPairs[j].q * (keyPairs[k].q * keyPairs[i].Q);
                const ECpoint384 kiJ = keyPairs[k].q * (keyPairs[i].q * keyPairs[j].Q);
                if ((ijK != jkI) || (jkI != kiJ) || (kiJ != ijK)) std::cout << "\nERROR\n\n";
                std::cout << "shared key " << i << '-' << j << '-' << k << ": " << ijK.toHex() << '\n';
            }
        }
    }
    return 0;
}