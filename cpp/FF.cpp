#include "./FF.h"

FF384::FF384() {
    for (unsigned int i = 0; i < 12; i++) value[i] = 0;
}
FF384::FF384(const std::initializer_list<const unsigned int>& il) {
    if (il.size() > 12) std::runtime_error("Initializer list must have <= 12 elements.");
    const unsigned int size = il.size();
    const unsigned int* ilp = il.begin();
    for (unsigned int i = 0; i < size; i++) value[i + 12 - size] = *(ilp + i);
    for (unsigned int i = 0; i < 12 - size; i++) value[i] = 0;
}
void FF384::operator=(const FF384& copy) {
    value = copy.value;
}
void FF384::operator=(FF384&& move) {
    value = move.value;
}
void FF384::operator=(const BigInt<12>& copy) {
    value = copy;
}
FF384 FF384::operator>>(const unsigned int& i) const {
    return FF384(value >> i);
}
void FF384::operator>>=(const unsigned int& i) {
    value >>= i;
}
FF384 FF384::operator<<(const unsigned int& i) const {
    return FF384(value << i);
}
void FF384::operator<<=(const unsigned int& i) {
    value <<= i;
}
FF384 FF384::operator+(const FF384& rhs) const {
    BigInt<13> output(value);
    output += BigInt<13>(rhs.value);
    return (output % p384_13).truncate<12>();
}
void FF384::operator+=(const FF384& rhs) {
    BigInt<13> output(value);
    output += BigInt<13>(rhs.value);
    value = (output % p384_13).truncate<12>();
}
FF384 FF384::operator-(const FF384& rhs) const {
    if (rhs.value.compare(value) == 1)
        return p384_12 - (rhs.value - value);
    else
        return value - rhs.value;
}
FF384 FF384::operator-() const {
    return p384_12 - value;
}
void FF384::operator-=(const FF384& rhs) {
    if (rhs.value.compare(value) == 1)
        value = p384_12 - (rhs.value - value);
    else
        value -= rhs.value;
}
FF384 FF384::operator*(const FF384& rhs) const {
    BigInt<24> output;
    BigInt<24> x = value;
    if (x.isZero()) return value;
    const unsigned int yDegree = rhs.degree();
    for (size_t i = 0; i <= yDegree; i++) {
        if (rhs.getBit(i)) output += x;
        x <<= 1;
    }
    return (output % p384_24).truncate<12>();
}
QuoRem384 FF384::intDiv(const FF384& rhs) const {
    // BigInt<12> divisor = rhs.value;
    FF384 quotient;
    if (rhs.value.isZero()) throw std::runtime_error("div by 0");
    int degDivisor = rhs.value.degree();
    FF384 remainder = value;
    int diff = max(remainder.value.degree() - degDivisor - 1, 0);
    while (remainder.compare(rhs.value) != -1) { // remainder >= divisor
        /* std::cout << " 1 << " << diff << " = " << (one_12 << diff).toHex() << '\n';
        std::cout << "rem " << remainder.toHex() << '\n';
        std::cout << "quotient " << quotient.toHex() << "\n\n";*/
        quotient += (one_12 << diff);
        remainder -= (rhs.value << diff);
        diff = max(remainder.value.degree() - degDivisor - 1, 0);
    }
    return { quotient, remainder };
}
FF384 FF384::multInv() const { // find multiplicative inverse of this in mod p
    // version of extended euclidean
    FF384 x = value;
    FF384 y = p384_12;
    FF384 s1;// = zero_12
    FF384 s2 = one_12;
    while (!y.isZero()) {
        QuoRem384 qr = x.intDiv(y);
        FF384 s0 = s2 - (qr.quotient * s1);
        // cycle variables
        x = y;
        y = qr.remainder;
        s2 = s1;
        s1 = s0;
    }
    return s2;
}
FF384 FF384::operator/(const FF384& rhs) const {
    if (rhs.value.isZero()) throw std::runtime_error("Div by 0 error.");
    return FF384(value) * rhs.multInv();
}
void FF384::operator/=(const FF384& rhs) {
    if (rhs.value.isZero()) throw std::runtime_error("Div by 0 error.");
    this->operator=(this->operator*(rhs.multInv()));
}
bool FF384::isZero() const {
    return value.isZero();
}
bool FF384::isOdd() const {
    return value[11] & 1;
}
bool FF384::getBit(unsigned int bit) const {
    if (bit > 383) throw std::runtime_error("Bit index out of bounds error.");
    bit = 383 - bit;
    return (value[bit / 32] >> (31 - (bit % 32))) & 1;
}
int FF384::compare(const FF384& rhs) const {
    return value.compare(rhs.value);
}
int FF384::degree() const {
    return value.degree();
}
std::string FF384::toHex() const {
    return value.toHex();
}
FF384 FF384::fromHex(const std::string &str) {
    return FF384(BigInt<12>::fromHex(str));
}
std::string FF384::toBinary() const {
    return value.toBinary();
}


void RFF8::operator=(const RFF8& copy) {
    value = copy.value;
}
void RFF8::operator=(RFF8&& move) {
    value = move.value;
}
void RFF8::operator=(const unsigned int& copy) {
    value = copy;
}
RFF8 RFF8::operator>>(const unsigned int& i) const {
    return RFF8(value >> i);
}
void RFF8::operator>>=(const unsigned int& i) {
    value >>= i;
}
RFF8 RFF8::operator<<(const unsigned int& i) const {
    return RFF8(value << i);
}
void RFF8::operator<<=(const unsigned int& i) {
    value <<= i;
}
RFF8 RFF8::leftRotate(const unsigned char& i) const {
    return ((value >> (8 - i)) | (value << i)) & ((1 << 8) - 1);
}
RFF8 RFF8::operator+(const RFF8& rhs) const {
    return value ^ rhs.value;
}
void RFF8::operator+=(const RFF8& rhs) {
    value ^= rhs.value;
}
RFF8 RFF8::operator-(const RFF8& rhs) const {
    return value ^ rhs.value;
}
void RFF8::operator-=(const RFF8& rhs) {
    value ^= rhs.value;
}
#include <iostream>
RFF8 RFF8::operator*(const RFF8& rhs) const {
    unsigned int output = 0;
    unsigned int a = value;
    unsigned int b = rhs.value;
    for (unsigned int i = 0; (i < 8) && (b != 0); i++) {
        if (b & 1) output ^= a;
        if (a & 0x80) a = ((a << 1) ^ 0x1b) & 0xFF;// AES irreducible polynomial(0x11b) mod 0x100
        else a <<= 1;
        b >>= 1;
    }
    return output & 0xFF;
}
QuoRem8 RFF8::intDiv(const RFF8& rhs) const {
    if (degree() < rhs.degree()) return { 0u, value };
    RFF8 quotient = 0;
    RFF8 remainder = value;
    int degDivisor = rhs.degree();
    while (remainder.degree() >= degDivisor) {
        int shift = remainder.degree() - degDivisor;
        quotient += 1 << shift;
        remainder += rhs.value << shift;
    }
    return { quotient, remainder };
}
RFF8 RFF8::multInv() const { // find multiplicative inverse of this in mod p
    // version of extended euclidean
    RFF8 x = value;
    RFF8 y = 0x11b;
    RFF8 s1 = 0;
    RFF8 s2 = 1;
    while (y.value != 0) {
        QuoRem8 qr = x.intDiv(y);
        RFF8 tmp = qr.quotient * s1;
        RFF8 s0 = s2 + tmp;
        // cycle variables
        x = y;
        y = qr.remainder;
        s2 = s1;
        s1 = s0;
    }
    return (unsigned char)s2;
}
RFF8 RFF8::operator/(const RFF8& rhs) const {
    if (rhs.value == 0) throw std::runtime_error("Div by 0 error.");
    return RFF8(value) * rhs.multInv();
}
void RFF8::operator/=(const RFF8& rhs) {
    if (rhs.value == 0) throw std::runtime_error("Div by 0 error.");
    value = value * rhs.multInv().value;
}
bool RFF8::isOdd() const {
    return value & 1;
}
bool RFF8::getBit(unsigned int bit) const {
    if (bit > 7) throw std::runtime_error("Bit index out of bounds error.");
    return (value >> bit) & 1;
}
int RFF8::compare(const RFF8& rhs) const {
    return (value > rhs.value) ? 1 : ((value < rhs.value) ? -1 : 0);
}
int RFF8::degree() const {
    // console.log("degree(" + poly + ")");
    for (unsigned char i = 8; i != 255; i--)
        if ((value & (1u << i)) != 0)
            return i;
    return -1;
}
std::string RFF8::toHex() const {
    std::string result = "";
    unsigned char char1 = value >> 4;
    unsigned char char2 = value & 0xf;
    result += ((char1 < 10) ? ('0' + char1):('A' + (char1 - 10)));
    result += ((char2 < 10) ? ('0' + char2):('A' + (char2 - 10)));
    return result;
}
RFF8 RFF8::fromHex(const std::string &str) {
    if (str.size() != 2) std::runtime_error("String must have a length of exactly 2.");
    RFF8 output;
    char char1 = str[0];
    if (char1 >= '0' && char1 <= '9') output.value = (char1 - '0') << 4;
    else if (char1 >= 'A' && char1 <= 'Z') output.value = (char1 - 'A' + 10) << 4;
    else output.value = (char1 - 'a' + 10) << 4;
    char char2 = str[1];
    if (char2 >= '0' && char2 <= '9') output.value |= (char2 - '0');
    else if (char2 >= 'A' && char2 <= 'Z') output.value |= (char2 - 'A' + 10);
    else output.value |= (char2 - 'a' + 10);
    return output;
}
std::string RFF8::toBinary() const {
    std::string result = "";
        for (int j = 7; j >= 0; j--)
            result += ((value >> j) & 1) ? '1' : '0';
    return result;
}