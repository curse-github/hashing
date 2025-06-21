#ifndef _FF_
#define _FF_

#include "./BigInt.h"
#include <cstdint>

static BigInt<12> zero_12;
static BigInt<12> one_12 = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 };
static BigInt<12> two_12 = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2 };
static BigInt<12> three_12 = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3 };
static BigInt<12> p384_12 = { UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX ^ 1, UINT32_MAX, 0, 0, UINT32_MAX };
static BigInt<13> p384_13 = p384_12;
static BigInt<24> p384_24 = p384_12;
struct QuoRem384;
class FF384 {
    private:
    BigInt<12> value;
    public:
    FF384();
    FF384(const std::initializer_list<const unsigned int>& il);
    FF384(const BigInt<12>& copy) : value(copy) { }
    FF384(const FF384& copy) : value(copy.value) { }
    FF384(FF384&& move) : value(move.value) { }
    void operator=(const FF384& copy);
    void operator=(FF384&& move);
    void operator=(const BigInt<12>& copy);
    FF384 operator>>(const unsigned int& i) const;
    void operator>>=(const unsigned int& i);
    FF384 operator<<(const unsigned int& i) const;
    void operator<<=(const unsigned int& i);
    FF384 operator+(const FF384& rhs) const;
    void operator+=(const FF384& rhs);
    FF384 operator-(const FF384& rhs) const;
    FF384 operator-() const;
    void operator-=(const FF384& rhs);
    FF384 operator*(const FF384& rhs) const;
    QuoRem384 intDiv(const FF384& rhs) const;
    FF384 multInv() const;
    FF384 operator/(const FF384& rhs) const;
    void operator/=(const FF384& rhs);
    bool isZero() const;
    bool isOdd() const;
    bool getBit(unsigned int bit) const;
    int compare(const FF384& rhs) const;
    int degree() const;
    std::string toHex() const;
    static FF384 fromHex(const std::string &str);
    std::string toBinary() const;
};
struct QuoRem384 {
    FF384 quotient;
    FF384 remainder;
    QuoRem384(const FF384& q, const FF384& r) : quotient(q), remainder(r) {};
};

struct QuoRem8;
class RFF8 {
    public:
    unsigned int value;
    RFF8() : value(0) { };
    RFF8(const unsigned int& copy) : value(copy) { }
    RFF8(const RFF8& copy) : value(copy.value) { }
    RFF8(RFF8&& move) : value(move.value) { }
    void operator=(const RFF8& copy);
    void operator=(RFF8&& move);
    void operator=(const unsigned int& copy);
    RFF8 operator>>(const unsigned int& i) const;
    void operator>>=(const unsigned int& i);
    RFF8 operator<<(const unsigned int& i) const;
    void operator<<=(const unsigned int& i);
    RFF8 leftRotate(const unsigned char& i) const;
    RFF8 operator+(const RFF8& rhs) const;
    void operator+=(const RFF8& rhs);
    RFF8 operator-(const RFF8& rhs) const;
    RFF8 operator-() const;
    void operator-=(const RFF8& rhs);
    RFF8 operator*(const RFF8& rhs) const;
    explicit operator unsigned char() { return (unsigned char)(value & 0xFF); }
    explicit operator unsigned int() { return value; }
    QuoRem8 intDiv(const RFF8& rhs) const;
    RFF8 multInv() const;
    RFF8 operator/(const RFF8& rhs) const;
    void operator/=(const RFF8& rhs);
    bool isZero() const;
    bool isOdd() const;
    bool getBit(unsigned int bit) const;
    int compare(const RFF8& rhs) const;
    int degree() const;
    std::string toHex() const;
    static RFF8 fromHex(const std::string &str);
    std::string toBinary() const;
};
struct QuoRem8 {
    RFF8 quotient;
    RFF8 remainder;
    QuoRem8(const RFF8& q, const RFF8& r) : quotient(q), remainder(r) {};
};

#endif