# Rest-Server-Passport
Exercise with Assignment 3 on using Passport as part of the course [Server-side Development with NodeJS](https://www.coursera.org/learn/server-side-development/home/welcome)

## Commands to Generate Self-Signed Certificate
```
openssl genrsa 1024 > private.key
openssl req -new -key private.key -out cert.csr
openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem
```