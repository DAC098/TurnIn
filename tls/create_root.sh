#!/usr/bin/env bash

openssl genrsa -out ca/root.key 2048

openssl req -x509 -new -nodes -key ca/root.key -sha256 -days 9999 -out ca/root.crt -config ca/config.txt
