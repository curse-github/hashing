#ifndef _BIGINT_
#define _BIGINT_

#include <initializer_list>
#include <stdexcept>
#include <cmath>
#include <cstdint>
inline constexpr int max(const int& a, const int& b) {
    return b ^ ((a ^ b) & ((a > b)*UINT32_MAX));
}
inline constexpr unsigned int max(const unsigned int& a, const unsigned int& b) {
    return b ^ ((a ^ b) & ((a > b)*UINT32_MAX));
}
inline constexpr int min(const int& a, const int& b) {
    return b ^ ((a ^ b) & ((a < b)*UINT32_MAX));
}
inline constexpr unsigned int min(const unsigned int& a, const unsigned int& b) {
    return b ^ ((a ^ b) & ((a < b)*UINT32_MAX));
}
template<unsigned int N>
class BigInt {
    private:
    unsigned int values[N];
    public:
    constexpr BigInt() {
        for (unsigned int i = 0; i < N; i++) values[i] = 0;
    }
    BigInt(const BigInt<N>& copy) {
        for (unsigned int i = 0; i < N; i++)
            values[i] = copy[i];
    }
    template<unsigned int M>
    BigInt(const BigInt<M>& copy) {
        if (M > N) std::runtime_error("M must not be larger than N");
        for (unsigned int i = 0; i < N; i++) values[i] = 0;
        for (unsigned int i = 1; i <= M; i++)
            values[N - i] = copy[M - i];
    }
    BigInt(BigInt<N>&& move) {
        for (unsigned int i = 0; i < N; i++)
            values[i] = move[i];
    }
    constexpr BigInt(const std::initializer_list<const unsigned int>& il) {
        const unsigned int size = il.size();
        if (size > N) std::runtime_error("Initializer list must have <= N elements.");
        const unsigned int* ilp = il.begin();
        for (unsigned int i = 0; i < size; i++) values[i + N - size] = ilp[i];
        for (unsigned int i = 0; i < N - size; i++) values[i] = 0;
    }
    constexpr BigInt(const unsigned int* copy, const unsigned int& size) {
        if (size > N) std::runtime_error("Initializer list must have <= N elements.");
        for (unsigned int i = 0; i < size; i++) values[i + N - size] = copy[i];
        for (unsigned int i = 0; i < N - size; i++) values[i] = 0;
    }
    const void operator=(const BigInt<N>& copy) {
        for (unsigned int i = 0; i < N; i++)
            values[i] = copy[i];
    }
    template<unsigned int M>
    constexpr const void operator=(const BigInt<M>& copy) {
        if (M > N) std::runtime_error("M must not be larger than N");
        for (unsigned int i = 0; i < N; i++) values[i] = 0;
        for (unsigned int i = 1; i <= M; i++)
            values[N - i] = copy[M - i];
    }
    inline constexpr const unsigned int operator[](const unsigned int& i) const {
        return values[i];
    }
    inline constexpr unsigned int& operator[](const unsigned int& i) {
        return values[i];
    }
    inline constexpr BigInt<N> operator<<(const unsigned int& k) const {
        BigInt<N> output(*this);
        output <<= k;
        return output;
    }
    void operator<<=(const unsigned int& k) {
        const int wordShifts = k / 32;
        for (unsigned int i = 0; i < N; i++) values[i] = values[i + wordShifts];
        for (unsigned int i = max((int)N - wordShifts, 0); i < N; i++) values[i] = 0;
        const unsigned int bitShifts = k % 32;
        for (unsigned int j = 0; j < bitShifts; j++) {
            // do a single left shift b times
            bool overflow = false;
            for (int i = (N - 1); i >= 0; i--) {
                const bool lastOverflow = overflow;
                overflow = (values[i] & 0b10000000000000000000000000000000u);// will it overflow when left shifted
                values[i] <<= 1;
                values[i] |= lastOverflow;
            }
        }
    }
    inline constexpr BigInt<N> operator>>(const unsigned int& k) const {
        BigInt<N> output(*this);
        output >>= k;
        return output;
    }
    void operator>>=(const unsigned int& k) {
        const unsigned int wordShifts = k / 32;
        for (unsigned int i = 0; i < wordShifts; i++) values[N - 1 - i] = values[N - 1 - i - wordShifts];
        for (unsigned int i = 0; i < wordShifts; i++) values[i] = 0;
        const unsigned int bitShifts = k % 32;
        for (unsigned int j = 0; j < bitShifts; j++) {
            // do a single right shift b times
            bool carry = false;
            for (unsigned int i = 0; i < N; i++) {
                const bool didCarry = carry;
                carry = (values[i] & 1) == 1;// if will it underflow when right shifted
                values[i] >>= 1;
                values[i] |= didCarry << 31;
            }
        }
    }
    inline constexpr BigInt<N> operator^(BigInt<N> rhs) const {
        rhs ^= *this;
        return rhs;
    }
    constexpr BigInt<N> operator^=(const BigInt<N>& rhs) const {
        for (unsigned int i = 0; i < N; i++) {
            values[i] ^= rhs[i];
        }
    }
    inline constexpr BigInt<N> operator+(const BigInt<N>& rhs) const {
        BigInt<N> output(*this);
        output += rhs;
        return output;
    }
    constexpr void operator+=(const BigInt<N>& rhs) {
        bool overflow = false;
        for (int i = (N - 1); i >= 0; i--) {
            const bool didOverflow = overflow;
            overflow = false;
            if (values[i] > (UINT32_MAX - rhs[i])) overflow = true;
            if (rhs[i] > (UINT32_MAX - values[i])) overflow = true;
            values[i] += rhs[i];
            if (didOverflow) {
                if (values[i] == UINT32_MAX) overflow = true;
                values[i] += 1;
            }
        }
    }
    inline constexpr BigInt<N> operator-(const BigInt<N>& rhs) const {
        BigInt<N> output(*this);
        output -= rhs;
        return output;
    }
    constexpr void operator-=(const BigInt<N>& rhs) {
        bool underflow = false;
        for (int i = (N - 1); i >= 0; i--) {
            const bool didUnderflow = underflow;
            underflow = rhs[i] > values[i];
            values[i] -= rhs[i];
            if (didUnderflow) {
                underflow = underflow || (values[i] == 0);
                values[i] -= 1;
            }
        }
    }
    inline constexpr BigInt<N> operator%(const BigInt<N>& p) const {
        BigInt<N> output(*this);
        output %= p;
        return output;
    }
    void operator%=(const BigInt<N>& p) {
        while (compare(p) != -1) {
            unsigned int shift = max(degree() - p.degree() - 1, 0);
            operator-=(p << shift);
        }
    }
    constexpr int degree() const {
        for (int i = 0; i < N; i++)
            for (int j = 31; j >= 0; j--)
                if ((values[i] >> j) & 1)
                    return (((N - i - 1) * 32) + j);
        return 0;
    }
    inline constexpr bool isZero() const {
        for (unsigned int i = 0; i < N; i++)
            if (values[i] != 0)
                return false;
        return true;
    }
    inline constexpr int compare(const BigInt<N>& rhs) const {
        for (int i = 0; i < N; i++) {
            if (values[i] > rhs[i]) return 1;
            if (values[i] < rhs[i]) return -1;
        }
        return 0;
    }
    template<unsigned int M>
    inline constexpr int compare(const BigInt<M>& rhs) const {
        constexpr unsigned int maxSize = (N > M) ? N : M;
        for (unsigned int i = 0; i < maxSize; ++i) {
            unsigned int lhsWord = (i < (maxSize - N)) ? 0 : values[i - (maxSize - N)];
            unsigned int rhsWord = (i < (maxSize - M)) ? 0 : rhs[i - (maxSize - M)];
            if (lhsWord > rhsWord) return 1;
            if (lhsWord < rhsWord) return -1;
        }
        return 0;
    }
    template<unsigned int M>
    inline constexpr BigInt<M> truncate() const {
        if (M > N) std::runtime_error("M must not be greater N");
        BigInt<M> output;
        for (int i = 1; i <= M; i++) {
            output[M - i] = values[N - i];
        }
        return output;
    }
    std::string toHex() const {
        std::string result = "";
        for (unsigned int i = 0; i < N; i++) {
            for (int j = 3; j + 1; j--) {
                unsigned char num = (values[i] >> (j * 8)) & 0xff;
                unsigned char char1 = num >> 4;
                unsigned char char2 = num & 0xf;
                result += ((char1 < 10) ? ('0' + char1):('A' + (char1 - 10)));
                result += ((char2 < 10) ? ('0' + char2):('A' + (char2 - 10)));
            }
        }
        return result;
    }
    static BigInt<N> fromHex(const std::string& str) {
        if (str.size() != (N * 8)) std::runtime_error("String must have a length of exactly 96.");
        BigInt<N> output;
        unsigned int k = 0;
        for (unsigned int i = 0; i < N; i++) {
            for (int j = 3; j + 1; j--) {
                char char1 = str[k];
                if (char1 >= '0' && char1 <= '9') output.values[i] |= (char1 - '0') << 4 << (j * 8);
                else if (char1 >= 'A' && char1 <= 'Z') output.values[i] |= (char1 - 'A' + 10) << 4 << (j * 8);
                else output.values[i] |= (char1 - 'a' + 10) << 4 << (j * 8);
                char char2 = str[k + 1];
                if (char2 >= '0' && char2 <= '9') output.values[i] |= (char2 - '0') << (j * 8);
                else if (char2 >= 'A' && char2 <= 'Z') output.values[i] |= (char2 - 'A' + 10) << (j * 8);
                else output.values[i] |= (char2 - 'a' + 10) << (j * 8);
                k += 2;
            }
        }
        return output;
    }
    std::string toBinary() const {
        std::string result = "";
        for (unsigned int i = 0; i < N; i++)
            for (int j = 31; j >= 0; j--)
                result += ((values[i] >> j) & 1) ? '1' : '0';
        return result;
    }
};

#endif