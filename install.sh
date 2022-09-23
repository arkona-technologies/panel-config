#!/bin/bash
MACHINE=$1
if [ "$MACHINE" == "" ]; then printf "You need to specify the ip address of a blade to download its vapi package: \e[1;34m'./install.sh <ip-address>'\e[0m\n" && exit; fi

curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get install nodejs -y
npm i -g n && n latest && printf "Updated npm\n"
npm i -g typescript ts-node && printf "Installed typescript globally\n"
npm i http://"$MACHINE"/vapi.tar.gz http://"$MACHINE"/vscript.tar.gz && npm i && printf "Installed local dependencies\n"
npm i