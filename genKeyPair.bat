openssl ecparam -name secp384r1 -genkey -out private.pem
cls
openssl ec -in private.pem -text -noout
pause
powershell "del ./private.pem"