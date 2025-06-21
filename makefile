LIB_BUILD = ar rcs
O_BUILD = g++ -O3 -march=native -funroll-loops -flto -I ./cpp -o

./cpp/FF.o: ./cpp/FF.cpp
	$(O_BUILD) ./cpp/FF.o -c ./cpp/FF.cpp
./cpp/myTime.o: ./cpp/myTime.cpp
	$(O_BUILD) ./cpp/myTime.o -c ./cpp/myTime.cpp
./cpp/md5.o: ./cpp/md5.cpp
	$(O_BUILD) ./cpp/md5.o -c ./cpp/md5.cpp
./cpp/sha256.o: ./cpp/sha256.cpp
	$(O_BUILD) ./cpp/sha256.o -c ./cpp/sha256.cpp
./cpp/sha512.o: ./cpp/sha512.cpp
	$(O_BUILD) ./cpp/sha512.o -c ./cpp/sha512.cpp
./cpp/Random.o: ./cpp/Random.cpp
	$(O_BUILD) ./cpp/Random.o -c ./cpp/Random.cpp
./cpp/ECC.o: ./cpp/ECC.cpp
	$(O_BUILD) ./cpp/ECC.o -c ./cpp/ECC.cpp
./cpp/AesPcbcCts.o: ./cpp/AesPcbcCts.cpp
	$(O_BUILD) ./cpp/AesPcbcCts.o -c ./cpp/AesPcbcCts.cpp

./cpp/md5.a: ./cpp/md5.o
	$(LIB_BUILD) ./cpp/md5.a ./cpp/md5.o
./cpp/sha256.a: ./cpp/sha256.o
	$(LIB_BUILD) ./cpp/sha256.a ./cpp/sha256.o
./cpp/sha512.a: ./cpp/sha512.o
	$(LIB_BUILD) ./cpp/sha512.a ./cpp/sha512.o
./cpp/Random.a: ./cpp/sha256.o ./cpp/myTime.o ./cpp/Random.o
	$(LIB_BUILD) ./cpp/Random.a ./cpp/sha256.o ./cpp/myTime.o ./cpp/Random.o
./cpp/ECC.a: ./cpp/FF.o ./cpp/ECC.o
	$(LIB_BUILD) ./cpp/ECC.a ./cpp/FF.o ./cpp/ECC.o
./cpp/AesPcbcCts.a: ./cpp/FF.o ./cpp/AesPcbcCts.o
	$(LIB_BUILD) ./cpp/AesPcbcCts.a ./cpp/FF.o ./cpp/AesPcbcCts.o

./cpp/md5Test.exe: ./cpp/md5.h ./cpp/md5Test.cpp ./cpp/md5.a
	$(O_BUILD) ./cpp/md5Test.exe ./cpp/md5Test.cpp ./cpp/md5.a
./cpp/sha256Test.exe: ./cpp/sha256.h ./cpp/sha256Test.cpp ./cpp/sha256.a
	$(O_BUILD) ./cpp/sha256Test.exe ./cpp/sha256Test.cpp ./cpp/sha256.a
./cpp/sha512Test.exe: ./cpp/sha512.h ./cpp/sha512Test.cpp ./cpp/sha512.a
	$(O_BUILD) ./cpp/sha512Test.exe ./cpp/sha512Test.cpp ./cpp/sha512.a
./cpp/RandomTest.exe: ./cpp/BigInt.h ./cpp/Random.h ./cpp/RandomTest.cpp ./cpp/Random.a
	$(O_BUILD) ./cpp/RandomTest.exe ./cpp/RandomTest.cpp ./cpp/Random.a
./cpp/ECCTest.exe: ./cpp/BigInt.h ./cpp/FF.h ./cpp/ECCTest.cpp ./cpp/ECC.a ./cpp/Random.a
	$(O_BUILD) ./cpp/ECCTest.exe ./cpp/ECCTest.cpp ./cpp/ECC.a ./cpp/Random.a
./cpp/AESTest.exe: ./cpp/BigInt.h ./cpp/FF.h ./cpp/AESTest.cpp ./cpp/AesPcbcCts.a
	$(O_BUILD) ./cpp/AESTest.exe ./cpp/AESTest.cpp ./cpp/AesPcbcCts.a

all: ./cpp/md5Test.exe ./cpp/sha256Test.exe ./cpp/sha512Test.exe ./cpp/RandomTest.exe ./cpp/ECCTest.exe ./cpp/AESTest.exe
	

run-md5Test: ./cpp/md5Test.exe
	./cpp/md5Test.exe
run-sha256Test: ./cpp/sha256Test.exe
	./cpp/sha256Test.exe
run-sha512Test: ./cpp/sha512Test.exe
	./cpp/sha512Test.exe
run-RandomTest: ./cpp/RandomTest.exe
	./cpp/RandomTest.exe
run-ECCTest: ./cpp/ECCTest.exe
	./cpp/ECCTest.exe
run-AESTest: ./cpp/AESTest.exe
	./cpp/AESTest.exe

clean:
	del cpp\FF.o
	del cpp\myTime.o
	del cpp\md5.o
	del cpp\sha256.o
	del cpp\sha512.o
	del cpp\Random.o
	del cpp\ECC.o
	del cpp\AesPcbcCts.o
	del cpp\md5.a
	del cpp\sha256.a
	del cpp\sha512.a
	del cpp\Random.a
	del cpp\ECC.a
	del cpp\AesPcbcCts.a
	del cpp\md5Test.exe
	del cpp\sha256Test.exe
	del cpp\sha512Test.exe
	del cpp\RandomTest.exe
	del cpp\ECCTest.exe
	del cpp\AESTest.exe

# -O3 -march=native -funroll-loops -flto
#     sha512 514 -> 141 or 3.65x faster
#     sha256 595 -> 231 or 2.58x faster
#     md5 231 -> 93     or 2.48x faster
#     ecc 7400 -> 1117  or 6.62x faster
# code optimizations
#     sha256 231 -> 223 or x faster
#     ecc 1117 -> 465 or 2.48x faster