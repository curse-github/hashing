#ifndef _ECC_
#define _ECC_

#include <initializer_list>
#include <string>
#include <vector>
#include "FF.h"
class ECpoint384 {
    public:
    FF384 x;
    FF384 y;
    ECpoint384() : x(), y(){ }
    ECpoint384(const ECpoint384& copy) : x(copy.x), y(copy.y) { }
    ECpoint384(ECpoint384&& move) : x(move.x), y(move.y) { }
    ECpoint384(const FF384& _x, const FF384& _y) : x(_x), y(_y) { }
    ECpoint384(const std::initializer_list<FF384>& il);
    void operator=(const ECpoint384& copy);
    void operator=(ECpoint384&& move);
    void operator=(const std::initializer_list<FF384>& il);
    ECpoint384 dbl() const;
    ECpoint384 operator+(const ECpoint384& rhs) const;
    ECpoint384 operator*(FF384 s) const;
    bool operator==(const ECpoint384& rhs) const;
    bool operator!=(const ECpoint384& rhs) const;
    std::string toHex() const;
    static ECpoint384 fromHex(const std::string &str);
};
extern FF384 a_384;
extern ECpoint384 G_384;
ECpoint384 operator*(const FF384& lhs, const ECpoint384& rhs);

#endif