#include "./ECC.h"
ECpoint384::ECpoint384(const std::initializer_list<FF384>& il) {
    if (il.size() != 12) std::runtime_error("Initializer list must have exactly 2 elements.");
    x = *il.begin();
    y = *(il.begin() + 1);
}
void ECpoint384::operator=(const ECpoint384& copy) {
    x = copy.x;
    y = copy.y;
}
void ECpoint384::operator=(ECpoint384&& move) {
    x = move.x;
    y = move.y;
}
void ECpoint384::operator=(const std::initializer_list<FF384>& il) {
    if (il.size() != 12) std::runtime_error("Initializer list must have exactly 2 elements.");
    x = *il.begin();
    y = *(il.begin() + 1);
}
ECpoint384 ECpoint384::dbl() const {
    // https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Point_doubling
    FF384 S = ((FF384(three_12) * (x * x)) + a_384) / (FF384(two_12) * y);// s = (3a.x^2)/(2a.y)
    FF384 nx = S * S;
    nx -= FF384(two_12) * x;
    FF384 ny = S * (x - nx);
    ny -= y;// y = s(a.x - x) - a.y
    return { nx, ny };
}
ECpoint384 ECpoint384::operator+(const ECpoint384& rhs) const {
    // https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Point_addition
    FF384 S = (rhs.y - y) / (rhs.x - x);// s = (b.y-a.y)/(b.x-a.x)
    FF384 nx = S * S;
    nx -= x;
    nx -= rhs.x;// x = S^2 - A.x - B.x
    FF384 ny = S * (x - nx);
    ny -= y;// y = s(a.x - x) - a.y
    return { nx, ny };
}
ECpoint384 ECpoint384::operator*(FF384 s) const {
    // https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Double-and-add
    if (s.isZero()) throw std::runtime_error("multiply by 0");
    ECpoint384 res;
    bool hasSet = false;
    ECpoint384 temp = *this;
    const unsigned int sDegree = s.degree();
    for (unsigned int i = 0; i <= sDegree; i++) {
        if (s.getBit(i)) {
            if (!hasSet) { res = temp; hasSet = true; }
            else res = res + temp;
        }
        temp = temp.dbl();
    }
    return res;
}
bool ECpoint384::operator==(const ECpoint384& rhs) const {
    return (x.compare(rhs.x) == 0) && (y.compare(rhs.y) == 0);
}
bool ECpoint384::operator!=(const ECpoint384& rhs) const {
    return (x.compare(rhs.x) != 0) || (y.compare(rhs.y) != 0);
}
std::string ECpoint384::toHex() const {
    return "04" + x.toHex() + y.toHex();
}
ECpoint384 ECpoint384::fromHex(const std::string &str) {
    return { FF384::fromHex(str.substr(2, 96)), FF384::fromHex(str.substr(98, 96)) };
}
ECpoint384 operator*(const FF384& lhs, const ECpoint384& rhs) {
    return rhs * lhs;
}
FF384 a_384 = FF384::fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC");
ECpoint384 G_384 = ECpoint384::fromHex("04AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB73617DE4A96262C6F5D9E98BF9292DC29F8F41DBD289A147CE9DA3113B5F0B8C00A60B1CE1D7E819D7A431D7C90EA0E5F");