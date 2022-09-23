#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# NODE_OPTIONS='--loader ts-node/esm' node "$DIR"/src/panel_script.ts

CONFIGPATH=$1
if [ "$CONFIGPATH" == "" ]; then printf "You need to specify the path to your config file\n" && exit ; fi
NODE_OPTIONS='--loader ts-node/esm' node "$DIR"/src/panel_script.ts "$CONFIGPATH"