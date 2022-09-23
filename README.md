# README

## Introduction

This project is build to control at300 blades in avp mode with a Skaarhoj panel and do basic video mixing stuff.


## Dependencies

To compile and run the scripts you will need at least the following software versions: -typescript 4.7.4 -vscript & vapi from at300 with version at least 2.1.81

The used Skaarhoj panel is an airflyprov3 with specs as listed:
Operating system  0.14-pre1
Device type       controller-airflyprov3
System manager    v0.1.27 (2f0e1d67)
(default credentials for Skaarhoj panel login: admin pw:skaarhoj)


## Installation

1. Go into the "panel-config" directory and execute: `./install.sh <ip-address>`: 
  - The provided IP address should match your at300 machine
  - The script will write this machines IP address into the package.json file for the installation of vapi and vscript packages
  - The script installs:
    1. The latest versions of nodejs, npm
    2. typescript and n globally
    3. updates node to the latest lts version
    4. local node modules (configured in package.json)
    5. ajv to validate schema json
    6. ts-node to run the .ts files without the need to compile them first in .js files 

## Configuration

The configuration for your environment is defined in the "config.json" file. You can edit the file itself and will be warned on errors while you type if your editor supports json schemas (e.g. VS Code). You can also load another configuration by setting the relative path to the configuration file as an argument on executing either the .ts scripts or the all_in_one.sh.

> Note: When you load a config file that's not in the same directory as the provided one in `panelConfig/configurations/`, you have to change `$schema`-path in the config file to direct it to the `panelConfig/configurations/types/schema.json` file.

Examples:

1. Using the provided file in `panelConfig/configurations/config.json`:

   - Edit the config file (_not_ the `$schema` path)
   - Open a terminal in the `panelConfig` directory
   - Start the scripts by calling `./start_panel.sh`

2. Using a config file in your `$HOME/Documents` directory:
   - In the config file, edit `$schema` so that it points to `<path-from-$HOME/Documents-to>panelConfig/configurations/types/schema.json`.
   - Open a terminal in the `panelConfig` directory
   - Execute `./start_panel.sh $HOME/Documents/MyConfigFile.json`

> Note: You can use relative and absolute paths and you can also work with links in your file system


## How to setup config.json

Inside the config.json you have a two main objects the panel_details and ppkm_collection. The panel details is used to build up the connection to the desired skaarhoj panel with its ip and port number. 
The main part of the config.json is the ppkm_collection, which stands for program preview keyer mixer collection. It is an array which holds different at300 configs inside. This means you are able to control many different at300 blades with only one Skaarhoj panel. In one ppkm_collection entry you need to set the common properties:
  ppkm_collection_entry = {
  -avpIp
  -sourceCollection 
  -keyeCollection
  -mixerConfiguration
  }

The avpIp is the ip adress of the at300 which should be controlled. The sourceCollection & keyeCollection entries are just video essences from the at300 in a form to be seen on the panel. The following properties must be set for them
  sourceCollection | keyeCollection = {
    name:"";
    pos: { 
      row: number;  
      shiftRow:boolean;
      };
    videoEssence: {
      type:"delay_player"|"video_signal_generator"|"sdi"|"video_mixer"|"rtp_receiver";
      index:number
    }
  }
The sourceCollection is needed to map the program and preview bus buttons. The keyerCollection is needed for the keyer fill & signal bus row. If you let the property name:"" then it will automatically display the video essence information on the display.

The mixerConfiguration is needed to setup the needed mixer in the at300 blade. Following properties need to be set:
  mixerConfiguration = {
    name:string;
    index:number;
    mode: "MIXER" | "MIXER_INDEPENDENT" | "LUMA_KEYER" | "LUMA_KEYER_ADDITIVE";
    belongingIndex: null | number;
    cascadingIndex: null | number
  }
If you let the property name:"" it will automatically write `Mixer ${index}` inside the mixer display. You can choose between different modes, like listed before. The belongingIndex and cascadingIndex is normally set to null if you are using MIXER or MIXER_INDEPENDENT mode. 
But if you want to use the LUMA mode, then you have to specify the selected Luma mixer belongingIndex and cascadingIndex. The belongingIndex is need to properly show the right program and preview bus of the BGND mixer which is going to be used as the base level. The cascadingIndex is needed to cascade the different Luma keyer levels on each selcted LUMA_KEYER. e.g:

  "mixerConfigCollection": [
      {"name": "BGND","index":0 ,"mode": "MIXER","belongingIndex": null,"cascadingIndex": null},
      {"name": "LUMA 1","index":1 ,"mode": "LUMA_KEYER","belongingIndex": 0,"cascadingIndex": 0},
      {"name": "LUMA 2","index":2 ,"mode": "LUMA_KEYER","belongingIndex": 0,"cascadingIndex": 1},
      {"name": "LUMA 3","index":3 ,"mode": "LUMA_KEYER","belongingIndex": 0,"cascadingIndex": 2},
      {"name": "","index":4 ,"mode": "MIXER","belongingIndex": null,"cascadingIndex": null},
      {"name": "","index":5 ,"mode": "MIXER","belongingIndex": null,"cascadingIndex": null},
      {"name": "","index":6 ,"mode": "MIXER","belongingIndex": null,"cascadingIndex": null},
      {"name": "","index":7 ,"mode": "MIXER","belongingIndex": null,"cascadingIndex": null}
    ]
In this example you can see the first entry is used as the base layer BGND the belongingIndex and cascadingIndex is set to null. The next common 3 mixer configurations is set to LUMA_KEYER mode which all have the belongingIndex:0. This entry is needed to show the correct program and preview bus when the current LUMA_KEYER is selected. The cascadingIndex is set sequentally counting up from 0 to 2, to put the one LUMA_KEYER layer above the next, to get the final result of an mixer with 3 LUMA_KEYER levels on top of it. 
All the other mixer configurations are in default MIXER mode.


## Execution

Compile and run all scripts in the `panelConfig` directory with `./start_panel.sh <path-to-custom-config-json(optional)>`

## Contact

Feel free to contact Jalil Ariubi from arkona technologies GmbH for further suggestions bug reports or help to setup the config file. 
<j.ariubi@arkona-technologies.de>
