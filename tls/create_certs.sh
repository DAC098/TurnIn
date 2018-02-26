#!/usr/bin/env bash

openssl genrsa -out local/svr.key 2048

openssl req -new -key local/svr.key -out local/svr.csr -config local/config.txt

openssl x509 -req -in local/svr.csr -extfile local/config.txt -extensions req_ext -CA ca/root.crt -CAkey ca/root.key -CAcreateserial -out local/svr.crt -days 9999 -sha256
