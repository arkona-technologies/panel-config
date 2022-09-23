import {Socket} from "net";
import { Duration, pause } from "vscript";
import { connectionCheck, getSelectedMixer, parseVideoEssence } from "./api_connection.js";
import { COLOR_CODE, FORMAT_ENTRY, FORMAT_NAME, KEY_ALIAS, PANEL_CONFIG, ESSENCE_TYPES, PROGRAM_PREVIEW_KEYER_MIXER_SET, VIDEO_MIXER_ENTRY, BUTTON_STATUS, COLOR_MODE, VIDEO_ESSENCE, SCALE_TYPE_ENTRY, SCALE_TYPE, SET_KEYER_MODE } from "./utils/types.js";

//SECTION CONSTANTS
const MINUS_TIME_VALUE =-1;
const INIT_KEY_COLOR = "white";
const PROGRAM_KEY_COLOR = "red";
const PRESET_KEY_COLOR = "white";
const USER_KEY_COLOR = "white";
const FTB_KEY_COLOR = USER_KEY_COLOR;
const SHIFT_KEY_COLOR = USER_KEY_COLOR;
const AUTO_KEY_COLOR = USER_KEY_COLOR;
const CUT_KEY_COLOR = USER_KEY_COLOR;
const VIDEO_MIXER_KEY_COLOR = "white";
const MAXIMUM_PROGRAM_PREVIEW_BUS_LENGHT = 12;
const AUTO_SWITCH_TIME = new Duration(1,"s");
const INSTANT_SWITCH_TIME = new Duration(0,"s");
const PART_ITERATIONS = 10;
const PART_SWITCH_TIME = new Duration (0.1,"s");
const PART_ITERATION_VALUE = 0.1;

const FTB_SWITCH_TIME = AUTO_SWITCH_TIME;
const BLINKING_WHITE_COLOR = "white";
const MAIN_DISPLAY_KEY_CODE = "69";
const MACHINE_CHANGER_KEY_COLOR = "purple";
const MACHINE_CHANGER_FORWARD_KEY_CODE = "58";
const MACHINE_CHANGER_BACKWARD_KEY_CODE ="57";
const KEYER_FILL_COLOR = "blue";
const KEYER_SIGNAL_COLOR = "green";
const KEYER_CODE_OFFSET = 24;
const LIVE_VIEW_CHANGER_CODE_OFFSET = 37;
const LIVE_VIEW_CHANGER_MAX_BUTTONS = 6;
const LIVE_VIEW_CHANGER_KEY_COLOR = "white";
const VIDEO_MIXER_BOTTOM_ROW_OFFSET = 63;
const VIDEO_MIXER_TOP_ROW_OFFSET = 55;
const DONT_RESET_CODES = [57,58,37,38,39,40,41,42];

const KEY_COLLECTION : KEY_ALIAS[] = [
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset1",code:"1",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset2",code:"2",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset3",code:"3",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset4",code:"4",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset5",code:"5",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset6",code:"6",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset7",code:"7",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset8",code:"8",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset9",code:"9",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset10",code:"10",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset11",code:"11",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Preset12",code:"12",type:"B4",group:"preset"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program1",code:"13",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program2",code:"14",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program3",code:"15",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program4",code:"16",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program5",code:"17",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program6",code:"18",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program7",code:"19",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program8",code:"20",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program9",code:"21",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program10",code:"22",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program11",code:"23",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Program12",code:"24",type:"B4",group:"program"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer1",code:"25",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer2",code:"26",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer3",code:"27",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer4",code:"28",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer5",code:"29",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer6",code:"30",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer7",code:"31",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer8",code:"32",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer9",code:"33",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer10",code:"34",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer11",code:"35",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Keyer12",code:"36",type:"B4",group:"keyer_source"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"LiveView0",code:"37",type:"B4",group:"live_view_changer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"LiveView1",code:"38",type:"B4",group:"live_view_changer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"LiveView2",code:"39",type:"B4",group:"live_view_changer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"LiveView3",code:"40",type:"B4",group:"live_view_changer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"LiveView4",code:"41",type:"B4",group:"live_view_changer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"LiveView5",code:"42",type:"B4",group:"live_view_changer"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"43",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"44",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"45",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"46",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"47",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"48",type:"",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"TbarDisplay",code:"49",type:"D",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"TBar",code:"50",type:"Tbar",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"CUT",code:"51",type:"B4",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"AUTO",code:"52",type:"B4",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"FTB",code:"53",type:"B4",group:"stay_blinking"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"SHIFT",code:"54",type:"B4",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"U1",code:"55",type:"B4",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"U2",code:"56",type:"B4",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"ChangeLast",code:"57",type:"B4",group:"machine_changer"},//KEY1
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"ChangeNext",code:"58",type:"B4",group:"machine_changer"},//KEY2
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Mixer4",code:"59",type:"B4",group:"mixer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Mixer5",code:"60",type:"B4",group:"mixer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Mixer6",code:"61",type:"B4",group:"mixer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Mixer7",code:"62",type:"B4",group:"mixer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Mixer0",code:"63",type:"B4",group:"mixer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Mixer1",code:"64",type:"B4",group:"mixer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Mixer2",code:"65",type:"B4",group:"mixer"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Mixer3",code:"66",type:"B4",group:"mixer"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"67",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"68",type:"",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Display",code:"69",type:"D",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"70",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"71",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"72",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"73",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"74",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"75",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"76",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"77",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"78",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"79",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"80",type:"",group:"none"},
  // {time:MINUS_TIME_VALUE,isPressed:false,alias:"",code:"81",type:"",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"Rocker",code:"82",type:"",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"PositionLR",code:"83",type:"J",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"PositionUD",code:"84",type:"J",group:"none"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"EncA",code:"85",type:"Enc",group:"encoder"},
  {time:MINUS_TIME_VALUE,isPressed:false,alias:"EncB",code:"86",type:"Enc",group:"encoder"},
]


export async  function createClient(connectionInfo:{host:string,port:number}){
  const{host,port} = connectionInfo;
  const client = new Socket({});
  client.connect({port,host}, async () => {
    console.log({action:"connecting to server",port,host})
    client.write(`ping\n`);
  });
  return client;
}

//SECTION INIT PANEL
function chiffreInserter(c:Socket,wordArray:string[],begin:number){
  for(let i = begin;i<(wordArray.length + begin);i++){
    let ch = wordArray[i-begin];
    setHwcDisplayInitText(c,`${i}`,{text:(ch==null)?"":ch},true)
  }
}

// btnArray = [0] just makes a pause
async function buttonLightUp(c:Socket,opts:{btnArray?:number[],begin:number,end:number,mode:BUTTON_STATUS,offsetTime:number,colorMode?:COLOR_MODE}){
  const { begin,end,mode,offsetTime,colorMode} = opts;
  if(opts.btnArray == null){
    for(let i = begin;i<end;i++){
      setHwcColor(c,`${i}`,INIT_KEY_COLOR)
      setHwcStatus(c,`${i}`,mode,true)
      if(colorMode === "Red"){
        setHwcStatus(c,`${i}`,"BlinkingRed",true)
      }
      
      await pause(new Duration(offsetTime,"ms"))
    }
  }
  if(opts.btnArray != null){
    for(let i of opts.btnArray){
      if(i===0){
        await pause(new Duration(offsetTime,"ms"))
        continue;
      }
      setHwcColor(c,`${i}`,INIT_KEY_COLOR)
      setHwcStatus(c,`${i}`,mode,true)
      if(colorMode === "Red"){
        setHwcStatus(c,`${i}`,"BlinkingRed",true)
      }
      await pause(new Duration(offsetTime,"ms"))
    }
  }
}

//SECTION Only panels utils
export async function initPanel(c:Socket){
  //RESETTING PANEL
  resetPanel(c);
  //DISPLAYS
  const PANEL_WORD:string[] =[ "=>","P","A","N","E","L" ];
  chiffreInserter(c,PANEL_WORD,37);
  const INITIALIZING_WORD:string[]=[ "IN","IT","IA","LI","ZI","NG"];
  chiffreInserter(c,INITIALIZING_WORD,57);
  const BY_ARKONA_WORD :string[] = ["B","Y","", "A", "R", "K", "O","N","A"];
  chiffreInserter(c,BY_ARKONA_WORD,25);
  const BLADERUNNER_WORD:string[] = ["B","L","A","D","E","R","U","N","N","E","R"];
  chiffreInserter(c,BLADERUNNER_WORD,13);
  //BUTTONS
  await buttonConcatenationLightUp(c,"On");
  await buttonConcatenationLightUp(c,"Off");
}

export async function initPanel2(c:Socket){
  //RESETTING PANEL
  resetPanel(c);
  //DISPLAYS
  const CONNECTING_WORD:string[] =[ "CO","NN","EC","TI","NG" ];
  chiffreInserter(c,CONNECTING_WORD,37);
  const AVP_WORD:string[]=["A","V","P"];
  chiffreInserter(c,AVP_WORD,57);
  const RETRIEVING_CONFIG_WORD :string[] = ["RE","TR","IE", "VI", "NG", "", "CO","NF","IG","UR","AT","ION"];
  chiffreInserter(c,RETRIEVING_CONFIG_WORD,25);
  const LOADING_LAYOUT_WORD:string[] = ["L","O","A","D","","L","A","Y","O","U","T"];
  chiffreInserter(c,LOADING_LAYOUT_WORD,13);
  //BUTTONS
  await buttonConcatenationLightUp(c,"On");
  await buttonConcatenationLightUp(c,"Off");
}

export async function noConnectionPanel(c:Socket){
  //RESETTING PANEL
  resetPanel(c);
  //DISPLAYS
  // const CONNECTING_WORD:string[] =[ "CO","NN","EC","TI","NG" ];
  // chiffreInserter(c,CONNECTING_WORD,37);
  // const AVP_WORD:string[]=["A","V","P"];
  // chiffreInserter(c,AVP_WORD,57);
  const RETRIEVING_CONFIG_WORD :string[] = ["NO","","C", "O", "N", "N", "E","C","T","I","O","N"];
  chiffreInserter(c,RETRIEVING_CONFIG_WORD,25);
  const LOADING_LAYOUT_WORD:string[] = ["RE","ST","ART","","S","C","R","I","P","T",""];
  chiffreInserter(c,LOADING_LAYOUT_WORD,13);
  //BUTTONS
  setFullPanelButtons(c,"BlinkingRed");
}

// export async function buttonConcatenationLightUp(c:Socket,btnStatus:BUTTON_STATUS,colorMode?:COLOR_MODE){
export async function buttonConcatenationLightUp(c:Socket,btnStatus:BUTTON_STATUS){
  //NOTE maybe color mode ???
  // FIRST WAVE
  buttonLightUp(c,{begin:37,end:43,mode:btnStatus,offsetTime:100});
  buttonLightUp(c,{begin:25,end:31,mode:btnStatus,offsetTime:100});
  buttonLightUp(c,{begin:13,end:19,mode:btnStatus,offsetTime:100});
  await buttonLightUp(c,{begin:1,end:7,mode:btnStatus,offsetTime:100});
  
  //SECOND WAVE
  buttonLightUp(c,{begin:31,end:32,mode:btnStatus,offsetTime:100});
  buttonLightUp(c,{begin:19,end:20,mode:btnStatus,offsetTime:100});
  await buttonLightUp(c,{begin:7,end:8,mode:btnStatus,offsetTime:100});
  
  //Third Wave
  buttonLightUp(c,{btnArray:[82,85,0,86,83],begin:-1,end:-1,mode:btnStatus,offsetTime:100});
  buttonLightUp(c,{begin:32,end:37,mode:btnStatus,offsetTime:100});
  buttonLightUp(c,{begin:20,end:25,mode:btnStatus,offsetTime:100});
  await buttonLightUp(c,{begin:8,end:13,mode:btnStatus,offsetTime:100});
  
  //Fourth Wave
  await buttonLightUp(c,{begin:57,end:59,mode:btnStatus,offsetTime:100});
  
  //Fifth Wave
  buttonLightUp(c,{btnArray:[59],begin:-1,end:-1,mode:btnStatus,offsetTime:100});
  await buttonLightUp(c,{btnArray:[63],begin:-1,end:-1,mode:btnStatus,offsetTime:100});
  
  //SIXTH WAVE
  buttonLightUp(c,{begin:60,end:63,mode:btnStatus,offsetTime:100});
  buttonLightUp(c,{begin:64,end:67,mode:btnStatus,offsetTime:100});
  buttonLightUp(c,{btnArray:[55,0,56],begin:-1,end:-1,mode:btnStatus,offsetTime:100});
  buttonLightUp(c,{btnArray:[53,0,54],begin:-1,end:-1,mode:btnStatus,offsetTime:100});
  await buttonLightUp(c,{btnArray:[51,0,52],begin:-1,end:-1,mode:btnStatus,offsetTime:100});
}

//only for text display
export function machineChangerButtonDisplays(c:Socket){
  setHwcColor(c,MACHINE_CHANGER_FORWARD_KEY_CODE,MACHINE_CHANGER_KEY_COLOR);
  setHwcColor(c,MACHINE_CHANGER_BACKWARD_KEY_CODE,MACHINE_CHANGER_KEY_COLOR);
  setHwcStatus(c,MACHINE_CHANGER_FORWARD_KEY_CODE,"Dimmed");
  setHwcStatus(c,MACHINE_CHANGER_BACKWARD_KEY_CODE,"Dimmed");
  setHwcDisplayInitText(c,MACHINE_CHANGER_BACKWARD_KEY_CODE,{text:"<="})
  setHwcDisplayInitText(c,MACHINE_CHANGER_FORWARD_KEY_CODE,{text:"=>"})
}

export function liveViewButtonDisplays(c:Socket){
  for(let i = 0;i<LIVE_VIEW_CHANGER_MAX_BUTTONS;i++){
    const KEY_CODE =`${LIVE_VIEW_CHANGER_CODE_OFFSET+i}`;
    setHwcColor(c,KEY_CODE,LIVE_VIEW_CHANGER_KEY_COLOR);
    setHwcStatus(c,KEY_CODE,"Dimmed");
    setHwcDisplayTitleLabel(c,KEY_CODE,{title:`Live view`,label:`Mixer #${i}`,isLabel:true})
  }
}

export async function infusingAvp(c:Socket,panelConfig:PANEL_CONFIG){
  resetSpecificButtons(c);

  const {avp_info,mixerCollection,ppSet} = panelConfig;
  //display all mixers first
  setVideoMixerKeys(c,mixerCollection)
  //display with avp_connection ipaddress
  // setHwcDisplayInitText(c,"69",{text:avp_info.ip});
  setMainDisplayPanel(c,{title:"Connecting",label:avp_info.ip,isLabel:false})
  //setActionKeys
  setActionKeys(c);
  //programm & preview bus
  setProgramPreviewBus(c,ppSet)
  const VIDEO_MIXER_0_KEY = KEY_COLLECTION.find(el=>el.alias==="Mixer0")
  if(VIDEO_MIXER_0_KEY == null) return;
  setSelectedVideoMixer(c,VIDEO_MIXER_0_KEY,panelConfig,MINUS_TIME_VALUE);

}

export async function setMainDisplayPanel(c:Socket,opts:{title:string,label:string,isLabel:boolean}){
  //display is code 69
  const DISPLAY_KEY_CODE = `${MAIN_DISPLAY_KEY_CODE}`;
  const {title,label,isLabel} = opts;
  setHwcDisplayTitleLabel(c,DISPLAY_KEY_CODE,{title,isLabel,label})
}

export function setVideoMixerKeys(c:Socket,mixerCollection:VIDEO_MIXER_ENTRY[]){
  const BOTTOM_ROW = mixerCollection.filter(el=>el.index>=0 && el.index<4);
  const TOP_ROW = mixerCollection.filter(el=>el.index>3 && el.index<9);
  
  for(let {index,name} of TOP_ROW){
    let keyCode = `${VIDEO_MIXER_TOP_ROW_OFFSET+index}`
    setHwcDisplayInitText(c,keyCode,{text:name})
    setHwcStatus(c,keyCode,"Dimmed");
    setHwcColor(c,keyCode,VIDEO_MIXER_KEY_COLOR);  
  }

  for(let {index,name} of BOTTOM_ROW){
    let keyCode = `${VIDEO_MIXER_BOTTOM_ROW_OFFSET+index}`
    setHwcDisplayInitText(c,keyCode,{text:name})
    setHwcStatus(c,keyCode,"Dimmed");
    setHwcColor(c,keyCode,VIDEO_MIXER_KEY_COLOR);  
  }
}

export function setActionKeys(c:Socket){
  //u1
  setHwcDisplayInitText(c,`${55}`,{text:"Keyer1"})
  setHwcStatus(c,`${55}`,"Dimmed");
  setHwcColor(c,`${55}`,USER_KEY_COLOR);
  //u2
  setHwcDisplayInitText(c,`${56}`,{text:"Keyer2"})
  setHwcStatus(c,`${56}`,"Dimmed");
  setHwcColor(c,`${56}`,USER_KEY_COLOR);
  //FTB
  setHwcStatus(c,`${53}`,"Dimmed");
  setHwcColor(c,`${53}`,FTB_KEY_COLOR);
  //SHIFT
  setHwcStatus(c,`${54}`,"Dimmed");
  setHwcColor(c,`${54}`,SHIFT_KEY_COLOR);
  //CUT
  setHwcStatus(c,`${51}`,"Dimmed");
  setHwcColor(c,`${51}`,CUT_KEY_COLOR);
  //AUTO
  setHwcStatus(c,`${52}`,"Dimmed");
  setHwcColor(c,`${52}`,AUTO_KEY_COLOR);
}

//reset whole panel
export function resetPanel(c:Socket){
  for(let i = 0; i<87;i++){
    resetHwc(c,`${i}`);
  }
}

export function resetSpecificButtons(c:Socket){
  for(let i = 0;i<87;i++){
    const FOUND_NO_RESET = DONT_RESET_CODES.find(el=> el === i);
    // console.log({FOUND_NO_RESET});
    if(FOUND_NO_RESET == null)
    resetHwc(c,`${i}`);
  }
}

export function setFullPanelButtons(c:Socket,btnStatus:BUTTON_STATUS){
  for(let i = 0; i<87;i++)
  setHwcStatus(c,`${i}`,btnStatus,true);
}

//reset hardware component
export function resetHwc(c:Socket,keyCode:string){
  let key = findKey(keyCode);
  if(key == null) return;
  const { code } = key;
  c.write(`HWC#${code}=${0}\n`)
  c.write(`HWCt#${code}=\n`)
  c.write(`HWCc#${code}=\n`)
}

export async function getKeyerSourceButton(panelConfig:PANEL_CONFIG,type:SET_KEYER_MODE){
  if(type==="empty") return null;
  const {ppSet} =panelConfig
  const {keyerCollection} = ppSet;
  let lumaKeyer = getSelectedMixer(panelConfig);
  
  if(lumaKeyer == null || lumaKeyer.mixer == null || lumaKeyer.mode !== "LUMA_KEYER") return null;
  let keyerSourceEssence = (type =="fill")?await lumaKeyer.mixer.v_src1.command.read():await lumaKeyer.mixer.luma_keyer.v_src.command.read()
  let parsedEssence = parseVideoEssence(keyerSourceEssence)
  if(parsedEssence == null) return null;
  // console.log({parsedEssence});

  const RESULT_KEYER_ENTRY = keyerCollection.find(el=>el.videoEssence.index === parsedEssence?.index && el.videoEssence.type === parsedEssence?.type)
  if(RESULT_KEYER_ENTRY == null) return null;
  // console.log({ RESULT_KEYER_ENTRY})
  const SEARCHED_KEY = findKey(`${RESULT_KEYER_ENTRY.pos.row+KEYER_CODE_OFFSET}`)
  return SEARCHED_KEY;
}

export async function setKeyerSourceButtonPress(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG){
  const {ppSet} = panelConfig;
  //check which mixer is selected if not luma then return
  let videoMixer = getSelectedMixer(panelConfig);
  if(videoMixer == null || videoMixer.mode !== "LUMA_KEYER") return //console.log("dUUUUUUDe")
  const KEY_GROUP = getKeyGroup(key,ppSet);


  // MIXER1 MIXER2 MIXER3 === these are the luma keyers get them out of panelConfig
  const LUMA_KEYER = getSelectedMixer(panelConfig)
  if(LUMA_KEYER == null) return;
  //sending this shit source 
  const {isPressed}=key;
  if(isPressed){
    // console.log({keyerCollection});
    //fill or signal
    const KEYER_MODE = (getLumaKeyButtonIsPressed(LUMA_KEYER.index))?"signal":"fill"
    const SRC = (KEYER_MODE==="fill")?LUMA_KEYER.mixer?.v_src1:LUMA_KEYER.mixer?.luma_keyer.v_src;
    if(SRC == null) return;
    const KEYER_SOURCE = getKeyerSource(key,panelConfig);
    await SRC.command.write(KEYER_SOURCE) 
  }

  sendMultiStatus(c,KEY_GROUP,"Dimmed");
  setHwcStatus(c,key.code,"On");
}


function getKeyerSource(key:KEY_ALIAS,panelConfig:PANEL_CONFIG){
  const { keyerCollection} = panelConfig.ppSet
  const {code}= key;
  const POSITIONING_KEYER_OFFSET = 24;
  const SEARCHING_KEYER_BUTTON = parseInt(code)-POSITIONING_KEYER_OFFSET
  const RESULT = keyerCollection.find(el=>el.pos.row === SEARCHING_KEYER_BUTTON)?.videoEssence;
  return (RESULT == null)? null:getVideoEssence(RESULT,panelConfig);
}


function getLumaKeyButtonIsPressed(index:number){
  const MIXER_BUTTON_OFFSET =63;
  const RESULT = KEY_COLLECTION.find(el=>el.code === `${index+MIXER_BUTTON_OFFSET}`);
  if(RESULT == null) return false;
  return RESULT.isPressed;
}


export async function setLiveViewChangerButtonPress(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG){
  const {mixerCollection} = panelConfig;
  const LIVE_VIEW_INDEX_STRING = key.alias.match(/(\d+)/);
  if(LIVE_VIEW_INDEX_STRING == null || LIVE_VIEW_INDEX_STRING[0] == null) return;
  const LIVE_VIEW_NUM = parseInt(LIVE_VIEW_INDEX_STRING[0])
  
  const VIDEO_MIXER = mixerCollection[LIVE_VIEW_NUM];
  if(VIDEO_MIXER == null || VIDEO_MIXER.mixer==null) return;
  changeLiveView(VIDEO_MIXER.mixer.output,panelConfig);

  const KEY_GROUP = getKeyGroup(key);
  sendMultiStatus(c,KEY_GROUP,"Dimmed");
  setHwcStatus(c,key.code,"On");
}

export function setKeyerBusSource(c:Socket,ppSet:PROGRAM_PREVIEW_KEYER_MIXER_SET,type:SET_KEYER_MODE){
  const USING_KEYER_COLOR = (type === "fill")?KEYER_FILL_COLOR:KEYER_SIGNAL_COLOR;
  const {keyerCollection} = ppSet;
  // for(let i = 0;i<12;i++){
  //   const KEY_CODE = i + 25;
  //   resetHwc(c,`${KEY_CODE}`);
  // }
  // if(type==="empty") return;
  

  if(type==="empty"){
    for(let i = 0;i<12;i++){
      const KEY_CODE = i + 25;
      resetHwc(c,`${KEY_CODE}`);
    }
    return;
  }

  for(let entry of keyerCollection){
    // if(entry == null) continue;
    const {isBlank,pos,name,videoEssence}= entry;
    if(isBlank || pos.row>12) continue;
    setHwcStatus(c,`${pos.row+KEYER_CODE_OFFSET}`,"Dimmed");
    setHwcColor(c,`${pos.row+KEYER_CODE_OFFSET}`,USING_KEYER_COLOR);
    //set only for signal the text
    if(type==="signal"){
      setHwcDisplayInitText(c,`${pos.row+KEYER_CODE_OFFSET}`,{text:name})
      //if name is empty
      if(name ===""){
        setHwcDisplayTitleLabel(c,`${pos.row+KEYER_CODE_OFFSET}`,{title:essenceTypeStringConverter(videoEssence.type),isLabel:false,label:`#${videoEssence.index}`});
      }
    }
  } 

}

//set program preview bus
export function setProgramPreviewBus(c:Socket,ppSet:PROGRAM_PREVIEW_KEYER_MIXER_SET){
  const {sourceCollection: collection}=ppSet;
  // const {busType,sourceCollection: collection}=ppSet;

  for(let i=0;i<12;i++){
    resetHwc(c,`${i}`);
    resetHwc(c,`${i+12}`);
  } 
  for(let entry of collection){
    if(entry == null) continue;
    const {isBlank,name,videoEssence,pos}= entry;
    if(isBlank || pos.row>12) continue;
    //shiftRow is only for double row reserved
    if(pos.shiftRow===false || pos.shiftRow == null){
      setHwcStatus(c,`${pos.row}`,"Dimmed");
      setHwcColor(c,`${pos.row}`,PRESET_KEY_COLOR);
      
      setHwcStatus(c,`${pos.row+12}`,"Dimmed");
      setHwcColor(c,`${pos.row+12}`,PROGRAM_KEY_COLOR);
      setHwcDisplayInitText(c,`${pos.row+12}`,{text:name})
      //if name is empty
      if(name ===""){
        setHwcDisplayTitleLabel(c,`${pos.row+12}`,{title:essenceTypeStringConverter(videoEssence.type),isLabel:false,label:`#${videoEssence.index}`});
      }
    }
  }
}

export async function setProgramBusSource(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG,btnMode?:BUTTON_STATUS){
  const{ppSet} = panelConfig;
  const { code }= key
  let parsedRow = parseInt(code);
  parsedRow = parsedRow - MAXIMUM_PROGRAM_PREVIEW_BUS_LENGHT;
  const FOUND_ENTRY = ppSet.sourceCollection.find(el=>el.pos.row === parsedRow);
  if(FOUND_ENTRY == null) return;
  let videoMixer = getSelectedMixer(panelConfig);
  if(videoMixer == null)return console.log(`Error: Could not find selected video mixer at index = ${panelConfig.selectedMixer}!(setProgramBusSource)`);
 
  if(videoMixer.mode ==="LUMA_KEYER"){
     const OG_VIDEO_MIXER= getLumaKeyVideoMixer(videoMixer,panelConfig)
     if(OG_VIDEO_MIXER == null) return console.log(`Error: Could not find og video_mixer from luma_keyer!`);
     videoMixer = OG_VIDEO_MIXER;
  }
 
  const { mixer} = videoMixer;

  const PROGRAM_SRC = (await mixer?.mixer.anc_input.read() === 0 )?mixer?.v_src0:mixer?.v_src1;
  await PROGRAM_SRC?.command.write(getVideoEssence(FOUND_ENTRY.videoEssence,panelConfig))

  //sets the button on | dimmed
  const KEY_GROUP = getKeyGroup(key,ppSet);
  sendMultiStatus(c,KEY_GROUP,"Dimmed","red");
  setHwcColor(c,code,"red")
  setHwcStatus(c,code,(btnMode == null)?"On":btnMode);
}

export function getVideoEssence(input:{type:ESSENCE_TYPES,index:number},config:PANEL_CONFIG){
  const {type,index} = input;
  const { videoEssenceCollection } = config;
  let result = videoEssenceCollection.find(el=>el.type===type && el.index === index);
  return (result == null)?null:result.essence;
}

export async function setPresetBusSource(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG,btnMode?:BUTTON_STATUS){
  const {ppSet} = panelConfig;
  const {code} = key;
  let parsedRow = parseInt(code);
  const FOUND_ENTRY = ppSet.sourceCollection.find(el=>el.pos.row === parsedRow);
  if(FOUND_ENTRY == null) return;
  let videoMixer =getSelectedMixer(panelConfig);
  if(videoMixer == null) return console.log(`Error: Could not find selected video mixer at index = ${panelConfig.selectedMixer}!(setPresetBusSource)`)
  if(videoMixer.mode === "LUMA_KEYER"){
    const OG_VIDEO_MIXER = getLumaKeyVideoMixer(videoMixer,panelConfig);
    if(OG_VIDEO_MIXER == null) return console.log(`Error: Could not find og video_mixer from luma_keyer!`);
    videoMixer =OG_VIDEO_MIXER;
  }
  
  const { mixer} = videoMixer;
  const PROGRAM_SRC = (await mixer?.mixer.anc_input.read() === 0 )?mixer?.v_src1:mixer?.v_src0;
  await PROGRAM_SRC?.command.write(getVideoEssence(FOUND_ENTRY.videoEssence,panelConfig))
  //sets the button on | dimmed
  const KEY_GROUP = getKeyGroup(key,ppSet);
  sendMultiStatus(c,KEY_GROUP,"Dimmed");
  setHwcStatus(c,code,(btnMode==null)?"On":btnMode);
}

export async function changeLiveView(essence:VIDEO_ESSENCE,config:PANEL_CONFIG){
  await config.liveView?.v_src.command.write(essence);
}

export async function setMachineChangerPress(c:Socket,key:KEY_ALIAS,panelConfigCollection:PANEL_CONFIG[]){
  // console.log({key});
  const {code} = key;
  let panelConfig:PANEL_CONFIG|null = changeSelectedPanelConfigIndex((code === "58")?"forward":"backward",panelConfigCollection);
  if(panelConfig == null) return;
  infusingAvp(c,panelConfig)
  setHwcStatus(c,`${code}`,"On")
}

function changeSelectedPanelConfigIndex(type:"forward"|"backward",panelConfigCollection:PANEL_CONFIG[]){
  const MAX_NUM = panelConfigCollection.length;
  const PREVIOUS_CONFIG_INDEX = panelConfigCollection.findIndex(el=>el.avp_info.isSelected);
  //set the isSelected property to false
  let newIndex = (type === "forward") ? (PREVIOUS_CONFIG_INDEX+1)%MAX_NUM
  :((PREVIOUS_CONFIG_INDEX - 1) % MAX_NUM);
  if(newIndex === -1) newIndex = MAX_NUM -1;

  const PREVIOUS_CONFIG = panelConfigCollection[PREVIOUS_CONFIG_INDEX];
  if(PREVIOUS_CONFIG == null) return null;
  PREVIOUS_CONFIG.avp_info.isSelected = false;

  const NEW_CONFIG = panelConfigCollection[newIndex];
  if(NEW_CONFIG == null) return null;

  NEW_CONFIG.avp_info.isSelected=true;
  return NEW_CONFIG;
}

export function getSelectedPanelConfig(panelConfigCollection:PANEL_CONFIG[]){
  //if only one panel config is available then choose it directly to selected
  if(panelConfigCollection.length === 1){
    const SINGLE_CONFIG = panelConfigCollection[0];
    if(SINGLE_CONFIG == null) return null;
    SINGLE_CONFIG.avp_info.isSelected=true;
    return SINGLE_CONFIG;
  }
  //if many configs exist then choose the one which is selected 
  if(panelConfigCollection.length>0){
    const FOUND_CONFIG = panelConfigCollection.find(el=>el.avp_info.isSelected);
    if(FOUND_CONFIG == null) {
      //if no config is selected then set the first valid config to be selected
      for ( let config of panelConfigCollection){
        if (config == null) continue;
        config.avp_info.isSelected= true;
        return config;
      }
    }
    if(FOUND_CONFIG !=null) return FOUND_CONFIG;
  }
  return null;
}

//sets the auto and ftb value to false
function setVideoMixerAFDefault(videoMixer:VIDEO_MIXER_ENTRY){
  videoMixer.autoIsLocked = false;
  videoMixer.autoInterrupt = false;
  videoMixer.ftbIsLocked = false;
}

function setClipGainOff(c:Socket,panelConfig:PANEL_CONFIG){
  let videoMixer = getSelectedMixer(panelConfig);
  if(videoMixer == null || videoMixer.mixer == null ) return;
  if(videoMixer.mode !== "LUMA_KEYER"){
    resetHwc(c,`${85}`);
    resetHwc(c,`${86}`);
  }
}

export async function setSelectedVideoMixer(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG,time:number,keyerMode?:SET_KEYER_MODE){
  if(time===0) console.log({time})
  let {ppSet} = panelConfig;
  //set faderDirection0 to null
  panelConfig.faderDirection0 = null;
  const {alias,code} = key;
  let rMatch = alias.match(/^Mixer(\d+)/);
  if(rMatch == null || rMatch[1] == null) return;
  const MIXER_NUM = parseInt(rMatch[1]);
  panelConfig.selectedMixer=MIXER_NUM;
  
  //to show on live view directly
  let videoMixer = getSelectedMixer(panelConfig);
  if(videoMixer == null || videoMixer.mixer == null) return;
  //set default autoIsLocked etc
  setVideoMixerAFDefault(videoMixer);
  //set clip & gain 
  setClipGainOff(c,panelConfig);

  //if mode === LUMA KEYER then show keer row
  setKeyerBusSource(c,ppSet,(keyerMode !=null &&videoMixer.mode==="LUMA_KEYER")?keyerMode:"empty");
  if(videoMixer.mode === "LUMA_KEYER"){
    //set clip & gain values
    setHwcDisplayTitleLabel(c,"85",{title:"CLIP",label:`${await videoMixer.mixer.luma_keyer.clip.read()*100}%`,isLabel:true});
    setHwcDisplayTitleLabel(c,"86",{title:"GAIN",label:`${await videoMixer.mixer.luma_keyer.gain.read()*100}%`,isLabel:true});
    
    //get FILL SRC
    let selectedKeyerButton = await getKeyerSourceButton(panelConfig,(keyerMode != null)?keyerMode:"empty")
    if(selectedKeyerButton != null)
    setKeyerSourceButtonPress(c,selectedKeyerButton,panelConfig);
    
    const KEY_GROUP = getKeyGroup(key);
    sendMultiStatus(c,KEY_GROUP,"Dimmed");
    setHwcStatus(c,code,"On");
    //set tbar display value
    // await setTbarDisplayValue(c,panelConfig);

  }
  //buttons lighting
  //for ftb button
  setHwcStatus(c,"53",(videoMixer.ftbMode==="ON"?"BlinkingWhiteQuick":"Dimmed"));
  await findProgramPresetButton(c,panelConfig,"program");
  await findProgramPresetButton(c,panelConfig,"preset");
  // end to set the lightup from button
  //sets the button on | dimmed
  const KEY_GROUP = getKeyGroup(key);
  sendMultiStatus(c,KEY_GROUP,"Dimmed");
  setHwcStatus(c,code,"On");
  //set tbar display value
  await setTbarDisplayValue(c,panelConfig);
}

export function getLumaKeyVideoMixer(lumaKeyer:VIDEO_MIXER_ENTRY,panelConfig:PANEL_CONFIG){
  const { index,mode} = lumaKeyer;
  if(mode !=="LUMA_KEYER") return null;
  const FOUND_MIXER = panelConfig.mixerCollection.find(el=>el.lumaKeyerIdCollection.indexOf(index)>=0)
  // return (FOUND_MIXER == null)?null:FOUND_MIXER;
  if(FOUND_MIXER == null) return null;
  return FOUND_MIXER;
}

export function getLumaKeyerCollectionVideoMixer(lumaKeyer:VIDEO_MIXER_ENTRY,panelConfig:PANEL_CONFIG){
  const VIDEO_MIXER = getLumaKeyVideoMixer(lumaKeyer,panelConfig);
  if(VIDEO_MIXER == null) return [];

  const {mixerCollection} = panelConfig;
  const LUMA_KEYER_COLLECTION = mixerCollection.filter(el=>VIDEO_MIXER.lumaKeyerIdCollection.indexOf(el.index)>=0);
  //with VIDEO MIXER
  return [VIDEO_MIXER,...LUMA_KEYER_COLLECTION];
  // //Without videoMixer
  // return LUMA_KEYER_COLLECTION;
}


export async function switchProgramPresetButton(c:Socket,value:number,panelConfig:PANEL_CONFIG){
  const {ppSet}=panelConfig;
  const VIDEO_MIXER = getSelectedMixer(panelConfig);

  if(VIDEO_MIXER == null || VIDEO_MIXER.mixer == null) return;

  const ANC_INPUT = await VIDEO_MIXER.mixer.mixer.anc_input.read();
  const SRC0 = VIDEO_MIXER.mixer.v_src0;
  const SRC1 = VIDEO_MIXER.mixer.v_src1;
  
  const PARSED_SRC0_ESSENCE = parseVideoEssence(await SRC0.command.read());
  const PARSED_SRC1_ESSENCE = parseVideoEssence(await SRC1.command.read());
  
  const {sourceCollection: collection}=ppSet;
  const SRC0_BUTTON_ENTRY = collection.find(el=>!el.isBlank && el.videoEssence.index === PARSED_SRC0_ESSENCE?.index && el.videoEssence.type === PARSED_SRC0_ESSENCE.type)

  const SRC1_BUTTON_ENTRY = collection.find(el=>!el.isBlank && el.videoEssence.index === PARSED_SRC1_ESSENCE?.index && el.videoEssence.type === PARSED_SRC1_ESSENCE.type)

  if(SRC1_BUTTON_ENTRY == null || SRC0_BUTTON_ENTRY == null) return;


  if(value === 0 || value === 1){
    const SEARCHING_PROGRAM_KEY_CODE = (value === 0)?SRC0_BUTTON_ENTRY.pos.row+MAXIMUM_PROGRAM_PREVIEW_BUS_LENGHT:SRC1_BUTTON_ENTRY.pos.row+MAXIMUM_PROGRAM_PREVIEW_BUS_LENGHT;
    const SEARCHING_PRESET_KEY_CODE = (value === 0) ?SRC1_BUTTON_ENTRY.pos.row:SRC0_BUTTON_ENTRY.pos.row;
  
    const PROGRAM_KEY_ENTRY = KEY_COLLECTION.find(el=>el.code === `${SEARCHING_PROGRAM_KEY_CODE}`);
    const PRESET_KEY_ENTRY = KEY_COLLECTION.find(el=>el.code === `${SEARCHING_PRESET_KEY_CODE}`);
  
    if(PROGRAM_KEY_ENTRY == null || PRESET_KEY_ENTRY == null) return;
    //PROGRAMM
    const PROGRAM_KEY_GROUP = getKeyGroup(PROGRAM_KEY_ENTRY,ppSet);
    sendMultiStatus(c,PROGRAM_KEY_GROUP,"Dimmed","red");
    // setHwcColor(c,PROGRAM_KEY_ENTRY.code,"red")
    setHwcStatus(c,PROGRAM_KEY_ENTRY.code,"On");
  
    //PRESET
    const PRESET_KEY_GROUP = getKeyGroup(PRESET_KEY_ENTRY,ppSet);
    sendMultiStatus(c,PRESET_KEY_GROUP,"Dimmed");
    // setHwcColor(c,PRESET_KEY_ENTRY.code,"red")
    setHwcStatus(c,PRESET_KEY_ENTRY.code,"On");  
    return;
  }

  const SEARCHING_PROGRAM_KEY_CODE = (ANC_INPUT === 0)?SRC0_BUTTON_ENTRY.pos.row+MAXIMUM_PROGRAM_PREVIEW_BUS_LENGHT:SRC1_BUTTON_ENTRY.pos.row+MAXIMUM_PROGRAM_PREVIEW_BUS_LENGHT;
  const SEARCHING_PRESET_KEY_CODE = (ANC_INPUT === 0) ?SRC1_BUTTON_ENTRY.pos.row:SRC0_BUTTON_ENTRY.pos.row;

  const PROGRAM_KEY_ENTRY = KEY_COLLECTION.find(el=>el.code === `${SEARCHING_PROGRAM_KEY_CODE}`);
  const PRESET_KEY_ENTRY = KEY_COLLECTION.find(el=>el.code === `${SEARCHING_PRESET_KEY_CODE}`);

  if(PROGRAM_KEY_ENTRY == null || PRESET_KEY_ENTRY == null) return;
  //PROGRAMM
  const PROGRAM_KEY_GROUP = getKeyGroup(PROGRAM_KEY_ENTRY,ppSet);
  sendMultiStatus(c,PROGRAM_KEY_GROUP,"Dimmed","red");
  // setHwcColor(c,PROGRAM_KEY_ENTRY.code,"red")
  setHwcStatus(c,PROGRAM_KEY_ENTRY.code,"BlinkingRedQuick");

  //PRESET
  const PRESET_KEY_GROUP = getKeyGroup(PRESET_KEY_ENTRY,ppSet);
  sendMultiStatus(c,PRESET_KEY_GROUP,"Dimmed");
  // setHwcColor(c,PRESET_KEY_ENTRY.code,"red")
  setHwcStatus(c,PRESET_KEY_ENTRY.code,"BlinkingRedQuick");
}

export async function findProgramPresetButton(c:Socket,panelConfig:PANEL_CONFIG,type:"program" | "preset",btnMode?:BUTTON_STATUS){
  const{ppSet} = panelConfig;
  let videoMixer = getSelectedMixer(panelConfig);
  if(videoMixer == null || videoMixer.mixer == null) return;
  //if VIDEO_MIXER === "LUMA_KEYER THEN SEARCH FOR THE"
  if(videoMixer.mode === "LUMA_KEYER"){
    let newMixer = getLumaKeyVideoMixer(videoMixer,panelConfig);
    videoMixer = (newMixer == null )?videoMixer:newMixer;
    if(videoMixer == null || videoMixer.mixer == null) return;
  }
  
  const ANC_INPUT = await videoMixer.mixer.mixer.anc_input.read();
  const ESSENCE = (type==="program")?(
    ((ANC_INPUT===0)?videoMixer.mixer.v_src0:videoMixer.mixer.v_src1)
  ):((ANC_INPUT===0)?videoMixer.mixer.v_src1:videoMixer.mixer.v_src0)
  
  const PARSED_ESSENCE = parseVideoEssence(await ESSENCE.command.read());
  const {sourceCollection: collection}=ppSet;
  
  const BUTTON_SET_ENTRY = collection.find(el=>!el.isBlank && el.videoEssence.index === PARSED_ESSENCE?.index && el.videoEssence.type === PARSED_ESSENCE.type)
  
  if(BUTTON_SET_ENTRY == null) return;
  const SEARCHING_KEY_CODE = BUTTON_SET_ENTRY.pos.row+((type==="program")?MAXIMUM_PROGRAM_PREVIEW_BUS_LENGHT:0);
  const KEY_ENTRY = KEY_COLLECTION.find(el=>el.code === `${SEARCHING_KEY_CODE}`);
  
  if(KEY_ENTRY == null) return;

  (type==="program")?
  setProgramBusSource(c,KEY_ENTRY,panelConfig,btnMode)
  :setPresetBusSource(c,KEY_ENTRY,panelConfig,btnMode)
}

export async function setBlinkingButtonPress(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG){
  const { alias,code } = key;
  // console.log({action:"setBlinkingButtonPress",alias})
  switch(alias){
    case "FTB":
      let blinkingStatus = await ftbButtonPress(c,panelConfig);

      //determine if blinking or not 
      const KEY_GROUP = getKeyGroup(key);
      sendMultiStatus(c,KEY_GROUP,"Dimmed");
      // console.log({blinkingStatus})
      setHwcStatus(c,code,(blinkingStatus?"BlinkingWhiteQuick":"Dimmed"));



      break;
    default:
      console.log(`Error: ${alias} ${code} is not implemented yet for setBlinkingButtonPress!`)
  }
  // //here the button handler with switch

  // const KEY_GROUP = getKeyGroup(key);
  // sendMultiStatus(c,KEY_GROUP,"Dimmed");
  // setHwcStatus(c,code,"BlinkingWhiteQuick");

}


export async function setButtonPress(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG){
  const { alias,code } = key;

  const KEY_GROUP = getKeyGroup(key);
  // console.log({action:"setButtonPress",alias})
  switch(alias){
    case "CUT":
      await cutButtonPress(c,panelConfig);
      sendMultiStatus(c,KEY_GROUP,"Dimmed");
      setHwcStatus(c,code,"On");
      break;
    case "AUTO":
      setHwcStatus(c,code,"On");
      await autoButtonPress(c,panelConfig)
      // setHwcStatus(c,code,"Dimmed");
      // sendMultiStatus(c,KEY_GROUP,"Dimmed");
      break;
    case "SHIFT":
      break;
    case "U1":
      break;
    case "U2":
      break;
    default:
      console.log(`Error: ${alias} ${code} is not implemented yet for setButtonPress!`)
  }
}

export async function setEncoderButtonPress(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG){
  const {code} = key;
  let lumaKeyer = getSelectedMixer(panelConfig);
  if(lumaKeyer == null || lumaKeyer.mixer == null || lumaKeyer.mode !== "LUMA_KEYER") return;
  const ENC_TYPE = (code==="85")?"CLIP":"GAIN";
  const CURRENT_ENCODER =(code === "85")?lumaKeyer.mixer.luma_keyer.clip:lumaKeyer.mixer.luma_keyer.gain;
  const CURRENT_VALUE = await CURRENT_ENCODER.read();
  const NEW_VALUE = (CURRENT_VALUE === 0 )?1:0;
  console.log({ENC_TYPE,NEW_VALUE,CURRENT_VALUE});
  (ENC_TYPE==="CLIP")?
  lumaKeyer.mixer.luma_keyer.raw.write_unchecked({kw:"clip"},NEW_VALUE)
  :
  lumaKeyer.mixer.luma_keyer.raw.write_unchecked({kw:"gain"},NEW_VALUE)
  setHwcDisplayTitleLabel(c,code,{title:`${ENC_TYPE}`,label:`${NEW_VALUE *100}%`,isLabel:true})
  setHwcStatus(c,code,"On");
}

async function cutButtonPress(c:Socket,panelConfig:PANEL_CONFIG){
  const VIDEO_MIXER = getSelectedMixer(panelConfig);
  if(VIDEO_MIXER == null || VIDEO_MIXER.mixer == null) return;

  //set this to true to get out of auto transition
  VIDEO_MIXER.autoInterrupt=true;
  if(VIDEO_MIXER.mode==="LUMA_KEYER"){

    const CURRENT = await VIDEO_MIXER.mixer.luma_keyer.opacity.current.read();
    await VIDEO_MIXER.mixer.luma_keyer.opacity.transition.write({target:(CURRENT === 1)?0:1,time:new Duration(0,"s")});

    return;
    //TODO
    // return console.log(` cutButtonPress ${VIDEO_MIXER.mode} :DONE ???`)
  }
  //TODO if cut is pressed during fading then look up which is the programm inside anc and switch this then
  // if(await VIDEO_MIXER.mixer.mode.read() !== "MIXER")
  if(await VIDEO_MIXER.mixer.mode.read()==="MIXER_INDEPENDENT")
  await VIDEO_MIXER.mixer.mode.write("MIXER");
  //directly set v_src0 as 100%
  await VIDEO_MIXER.mixer.mixer.fader0.transition.write({target:0,time:INSTANT_SWITCH_TIME});
  const src_0 = await VIDEO_MIXER.mixer.v_src0.command.read();
  const src_1 = await VIDEO_MIXER.mixer.v_src1.command.read();
  await VIDEO_MIXER.mixer.v_src1.command.write(src_0);
  await VIDEO_MIXER.mixer.v_src0.command.write(src_1);

  await findProgramPresetButton(c,panelConfig,"program");
  await findProgramPresetButton(c,panelConfig,"preset");
}

async function autoButtonPress(c:Socket,panelConfig:PANEL_CONFIG){
  const VIDEO_MIXER = getSelectedMixer(panelConfig);
  if(VIDEO_MIXER == null || VIDEO_MIXER.mixer == null) return;
  
  //FOR LUMA KEYER
  if(VIDEO_MIXER.mode==="LUMA_KEYER"){
    
    
    let faderValue = await VIDEO_MIXER.mixer.luma_keyer.opacity.current.read();
    const DOWN_COUNT = (faderValue === 1?true:false)
    console.log({faderValue,DOWN_COUNT})
    

    if(!VIDEO_MIXER.autoIsLocked){
      for (let i = 0;i<PART_ITERATIONS;i++){
        // console.log({i,interrupt:VIDEO_MIXER.autoInterrupt})
        if(i === 0 ){
          VIDEO_MIXER.autoIsLocked = true;
          setHwcStatus(c,`${52}`,"On"); 
        }
        if(VIDEO_MIXER.autoInterrupt){
          // console.log({action:"interrupt auto"})
          VIDEO_MIXER.autoIsLocked = false;
          VIDEO_MIXER.autoInterrupt = false;
          break;
        }
        faderValue = (DOWN_COUNT)?faderValue-PART_ITERATION_VALUE:faderValue+PART_ITERATION_VALUE;
        faderValue = (faderValue>1)?1:(faderValue<0)?0:parseFloat((faderValue).toFixed(2));
        VIDEO_MIXER.mixer.luma_keyer.opacity.transition.write({ target: faderValue, time: PART_SWITCH_TIME});
        
        if(faderValue === 0 || faderValue === 1){
          VIDEO_MIXER.autoIsLocked = false;
          VIDEO_MIXER.autoInterrupt = false;
          // await pause(PART_SWITCH_TIME);      
          break;
        }
        await pause(PART_SWITCH_TIME);
      }
    }

    if(VIDEO_MIXER.autoIsLocked){
      VIDEO_MIXER.autoInterrupt = true;
    }

    return;

  }
  //FOR MIXING
  if(await VIDEO_MIXER.mixer.mode.read() === "MIXER_INDEPENDENT")
  await VIDEO_MIXER.mixer.mode.write("MIXER");


  let faderValue = await VIDEO_MIXER.mixer.mixer.fader0.current.read();
  const UP_COUNT = (await VIDEO_MIXER.mixer.mixer.anc_input.read() === 0?true:false)
  if(!VIDEO_MIXER.autoIsLocked){
    for (let i = 0;i<10;i++){
      // console.log({i,interrupt:VIDEO_MIXER.autoInterrupt})
      if(i === 0 ){
        VIDEO_MIXER.autoIsLocked = true;
        setHwcStatus(c,`${52}`,"On");
        await findProgramPresetButton(c,panelConfig,"program","BlinkingQuick");
        await findProgramPresetButton(c,panelConfig,"preset","BlinkingRedQuick");  
      }
      if(VIDEO_MIXER.autoInterrupt){
        // console.log({action:"interrupt auto"})
        VIDEO_MIXER.autoIsLocked = false;
        VIDEO_MIXER.autoInterrupt = false;
        break;
      }
      faderValue = (UP_COUNT)?faderValue+PART_ITERATION_VALUE:faderValue-PART_ITERATION_VALUE;
      faderValue = (faderValue>1)?1:(faderValue<0)?0:parseFloat((faderValue).toFixed(2));
      VIDEO_MIXER.mixer.mixer.fader0.transition.write({ target: faderValue, time: PART_SWITCH_TIME});
      if(faderValue === 0 || faderValue === 1){
        VIDEO_MIXER.autoIsLocked = false;
        VIDEO_MIXER.autoInterrupt = false;
        await pause(PART_SWITCH_TIME);      
        await findProgramPresetButton(c,panelConfig,"program");
        await findProgramPresetButton(c,panelConfig,"preset");
        break;
      }
      await pause(PART_SWITCH_TIME);
    }
  }

  if(VIDEO_MIXER.autoIsLocked){
    VIDEO_MIXER.autoInterrupt = true;
  }

}

export async function setTbarDisplayValue(c:Socket,panelConfig:PANEL_CONFIG){
  const SELECTED_MIXER = await getSelectedMixer(panelConfig);
  if(SELECTED_MIXER == null) return;
  const TBAR_VALUE = (SELECTED_MIXER.mode==="LUMA_KEYER")
  ?await SELECTED_MIXER.mixer?.luma_keyer.opacity.current.read()
  :await SELECTED_MIXER.mixer?.mixer.fader0.current.read();
  // const TBAR_VALUE = await getSelectedMixer(panelConfig)?.mixer?.mixer.fader0.current.read()
  if(TBAR_VALUE == null) return;
  setTbarDisplay(c,TBAR_VALUE);
}

export function setTbarDisplay(c:Socket,value:number){
  const TBAR_DISPLAY_KEY_CODE = "49";
  const PERCENT_VALUE = Math.trunc(value * 100);
  // console.log({PERCENT_VALUE})
  setHwcDisplayInitText(c,TBAR_DISPLAY_KEY_CODE,{text:`${PERCENT_VALUE} %`});
  // setHwcDisplayTbarText(c,TBAR_DISPLAY_KEY_CODE,{value:PERCENT_VALUE});
}

export async function setEncValue(c:Socket,data:{keyNum:string,value:string,type:string,time:number},panelConfig:PANEL_CONFIG){
  setClipGainEncoder(c,data,panelConfig);
}

export async function setClipGainEncoder(c:Socket,data:{keyNum:string,value:string,type:string,time:number},panelConfig:PANEL_CONFIG){
  const {keyNum,value} = data;
  //just only to encs are existing so just differ between 85 & 86
  const ENC_TYPE = (keyNum==="85")?"CLIP":"GAIN";
  let lumaKeyer = getSelectedMixer(panelConfig);
  if(lumaKeyer == null || lumaKeyer.mixer == null || lumaKeyer.mode !== "LUMA_KEYER") return;
  const CURRENT = (ENC_TYPE ==="CLIP")?lumaKeyer.mixer.luma_keyer.clip:lumaKeyer.mixer.luma_keyer.gain;
  const CURRENT_VALUE = await CURRENT.read();
  let tValue = parseFloat((((CURRENT_VALUE*100)+parseInt(value))/100).toFixed(2));
  tValue = (tValue>1)?1:(tValue<0)?0:tValue;
  (ENC_TYPE === "CLIP")?
  lumaKeyer.mixer.luma_keyer.raw.write_unchecked({kw:"clip"},tValue)
  :
  lumaKeyer.mixer.luma_keyer.raw.write_unchecked({kw:"gain"},tValue)
  setHwcDisplayTitleLabel(c,keyNum,{title:`${ENC_TYPE}`,label:`${(tValue *100).toFixed(0)}%`,isLabel:true})
}


export async function setFaderValue(c:Socket,data:{keyNum:string,value:string,type:string,time:number},panelConfig:PANEL_CONFIG){
  const {keyNum,value}=data;

  let foundKey = KEY_COLLECTION.find(el=>el.code === keyNum);
  if(foundKey == null) return;

  const VIDEO_MIXER = getSelectedMixer(panelConfig);
  if(VIDEO_MIXER == null || VIDEO_MIXER.mixer == null) return;

  //dont set the faderValue if ftb is active
  if(await VIDEO_MIXER.mixer.mode.read() === "MIXER_INDEPENDENT" && VIDEO_MIXER.ftbMode==="ON") return;

  if(await VIDEO_MIXER.mixer.mode.read() === "MIXER_INDEPENDENT")
  await VIDEO_MIXER.mixer.mode.write("MIXER");

  let transition_value= Math.trunc(parseInt(`${value}`)/10)/100;
  if(panelConfig.faderDirection0 == null){
    const CURRENT= (VIDEO_MIXER.mode === "LUMA_KEYER")?await VIDEO_MIXER.mixer.luma_keyer.opacity.current.read()
    :await VIDEO_MIXER.mixer.mixer.fader0.current.read();
    //inverting ?
    const OFFSET =0.1;
    const INVERT_STATUS = (((transition_value+OFFSET)>CURRENT) && ((transition_value-OFFSET) < CURRENT) )?false:true;
    panelConfig.faderDirection0 = (INVERT_STATUS)?"UP":"DOWN";
  }
  let new_val = (panelConfig.faderDirection0 === "UP")?1-transition_value:transition_value;
  const FADER_TRANSITION_TIME = new Duration(0,"s");
  const FADER_TRANSITION_VALUE = {target:new_val,time:FADER_TRANSITION_TIME};
  const FADER_TRANSITION = 
  (VIDEO_MIXER.mode==="LUMA_KEYER")?VIDEO_MIXER.mixer.luma_keyer.opacity.transition
  :VIDEO_MIXER.mixer.mixer.fader0.transition;
  await FADER_TRANSITION.write(FADER_TRANSITION_VALUE);
  //set value for tbar display
  setTbarDisplay(c,new_val)

  // //TODO here this is not qorking why ??????
  // const ANC_VALUE = (await VIDEO_MIXER.mixer.mixer.anc_input.read() === 0)?1:0;
  // await VIDEO_MIXER.mixer.mixer.fader0.transition.write({ target: ANC_VALUE, time: AUTO_SWITCH_TIME});
  // //TODO maybe here blinking both sources then switch ? 
  await switchProgramPresetButton(c,new_val,panelConfig);
}

async function ftbButtonPress(c:Socket,panelConfig:PANEL_CONFIG){
  const VIDEO_MIXER = getSelectedMixer(panelConfig);
  if(VIDEO_MIXER == null || VIDEO_MIXER.mixer == null) return;

  if(VIDEO_MIXER.mode==="LUMA_KEYER"){
    //TODO
    return console.log(`Error: ftbButtonPress ${VIDEO_MIXER.mode} what should it do ???`)
  }

  //switch to mixer independent
  if(await VIDEO_MIXER.mixer.mode.read() === "MIXER")
  await VIDEO_MIXER.mixer.mode.write("MIXER_INDEPENDENT");

  const FADER = (await VIDEO_MIXER.mixer.mixer.anc_input.read()===0)?VIDEO_MIXER.mixer.mixer.fader0:VIDEO_MIXER.mixer.mixer.fader1;
  const SECOND_FADER = (await VIDEO_MIXER.mixer.mixer.anc_input.read()===1)?VIDEO_MIXER.mixer.mixer.fader0:VIDEO_MIXER.mixer.mixer.fader1;

  if(VIDEO_MIXER.ftbMode==="OFF"){
    //goes to on -> 0
    FADER.transition.write({target:0,time:FTB_SWITCH_TIME});
    await SECOND_FADER.transition.write({target:0,time:FTB_SWITCH_TIME});
  }

  if(VIDEO_MIXER.ftbMode==="ON"){
    //goes to off ->1 for ancinpout
    await FADER.transition.write({target:1,time:FTB_SWITCH_TIME});
  }

  const FADER_CURRENT = FADER.current;
  await pause(FTB_SWITCH_TIME)
  let faderValue = await FADER_CURRENT.read();

  if(faderValue === 0){
    VIDEO_MIXER.ftbMode="ON";
    await findProgramPresetButton(c,panelConfig,"program","BlinkingWhiteQuick");
  }
  
  if(faderValue === 1){
    VIDEO_MIXER.ftbMode="OFF";
    await findProgramPresetButton(c,panelConfig,"program");
  }

  return (faderValue>0)?false:true;
}

function essenceTypeStringConverter(type:ESSENCE_TYPES){
  switch(type){
    case "color_correction":
      return "Color correction";
    case "rtp_receiver":
      return "RTP session";
    case "video_mixer":
      return "Video mixer";
    case "video_signal_generator":
      return "Signal generator";
    case "delay_player":
      return "Delay player"
    default: return type;
  }
}

//SECTION SET HWC STATUS
export function setHwcStatus(c:Socket,keyCode:string,mode:BUTTON_STATUS,initStatus?:boolean,_value?:string){
  let key = (initStatus)?findKey(keyCode):findKeyAlias(keyCode);
  if(key == null) return;
  const {code} = key;
  let value = (mode ==="Off")?"0"
  :(mode==="On")?"4"
  :(mode==="Dimmed")?"5"
  :(mode==="Blinking" || mode === "BlinkingWhite")?"1028"//
  :(mode=== "BlinkingQuick" || mode ==="BlinkingWhiteQuick")?"516"
  :(mode==="BlinkingRed")?"1026"
  :(mode==="BlinkingRedQuick")?"514"
  :"";

  if(mode ==="BlinkingWhite" || mode ==="BlinkingWhiteQuick"){
    //sets color to white
    setHwcColor(c,code,BLINKING_WHITE_COLOR)
  }

  //only for debugging
  value = (_value == null)?value:_value;
  if(value==="") return console.log(`Error: HWC status mode ${mode} is not implemented!`);  
  c.write(`HWC#${code}=${value}\n`)
}

//SECTION SET HWC COLOR
export const COLOR_CODE_COLLECTION:COLOR_CODE[]=[
  {name:"white",colorCode:"130"},
  {name:"warmwhite",colorCode:"131"},
  {name:"red",colorCode:"132"},
  {name:"rose",colorCode:"133"},
  {name:"pink",colorCode:"134"},
  {name:"purple",colorCode:"135"},
  {name:"amber",colorCode:"136"},
  {name:"yellow",colorCode:"137"},
  {name:"darkblue",colorCode:"138"},
  {name:"blue",colorCode:"139"},
  {name:"ice",colorCode:"140"},
  {name:"cyan",colorCode:"141"},
  {name:"sping",colorCode:"142"},
  {name:"green",colorCode:"143"},
  {name:"mint",colorCode:"144"},
]

export function getColorCode(color:string){
  let r = COLOR_CODE_COLLECTION.find(el=>el.name===color);
  return (r==null)?{name:"white",colorCode:"130"}:r;
}

export function setHwcColor(c:Socket,keyCode:string,color:string,initStatus?:boolean){
  let key = (initStatus)?findKey(keyCode):findKeyAlias(keyCode);
  if(key == null) return;
  const {code} = key;
  const {colorCode} = getColorCode(color);
  c.write(`HWCc#${code}=${colorCode}\n`)
}

//SECTION SET HWC DISPLAY
export const FORMAT_ENTRY_COLLECTION: FORMAT_ENTRY[] =[
  {name:"Integer",value:0},
  {name:"Float32",value:1},
  {name:"Percent",value:2},
  {name:"dB",value:3},
  {name:"Frames",value:4},
  {name:"1/X",value:5},
  {name:"Kelvin",value:6},
  {name:"Hidden",value:7},
  {name:"Float33",value:8},
  {name:"Float22",value:9},
  {name:"Text1",value:10},//TITLE & VALUE
  {name:"Text2",value:11},//LABEL1 & LABEL2
] 

const SCALE_TYPE_COLLECTION: SCALE_TYPE_ENTRY[] = [
  {name:"STRENGTH_BAR",value:1},
  {name:"CENTERED_MARKER",value:2},
  {name:"CENTERED_BAR",value:3},
]

export function setHwcDisplay(c:Socket,keyCode:string,opts?:{
  value?:number,
  format?:FORMAT_NAME,
  fine?:string
  title?:string,
  isLabel?:boolean,
  label1?:string,
  label2?:string,
  value2?:string,
  valuesPair?:string,
  scale?:SCALE_TYPE,
  scaleRangeLow?:string,
  scaleRangeHigh?:string,
  scaleLimitLow?:string,
  scaleLimitHigh?:string,
  img?:string,
  font?:string,
  fontSize?:string,
  advancedSettings?:string,
  },
  initStatus?:boolean
){
  let key = (initStatus)?findKey(keyCode):findKeyAlias(keyCode);
  if(key == null) return;
  const {code} = key;
  const FORMAT_VALUE = (FORMAT_ENTRY_COLLECTION.find(el=>el.name===opts?.format)==null)?0:FORMAT_ENTRY_COLLECTION.find(el=>el.name===opts?.format)?.value;
  const SCALE_TYPE_VALUE = (SCALE_TYPE_COLLECTION.find(el=>el.name===opts?.scale)==null)?0:SCALE_TYPE_COLLECTION.find(el=>el.name===opts?.scale)?.value;
  c.write(`HWCt#${code}=${opts?.value==null?"":opts.value}|${FORMAT_VALUE}|${opts?.fine==null?"":opts.fine}|${opts?.title==null?"":opts.title}|${(opts?.isLabel==true)?0:1}|${opts?.label1==null?"":opts.label1}|${opts?.label2==null?"":opts?.label2}|${opts?.value2==null ? "":opts.value2}|${opts?.valuesPair==null?"":opts.valuesPair}|${opts?.scale==null?"":SCALE_TYPE_VALUE},|${opts?.scaleRangeLow==null?"":opts.scaleRangeLow}|${opts?.scaleRangeHigh==null?"":opts.scaleRangeHigh}|${opts?.scaleLimitLow==null?"":opts.scaleLimitLow}|${opts?.scaleLimitHigh==null?"":opts.scaleLimitHigh}|${opts?.img==null?"":opts.img}|${opts?.font==null?"":opts.font}|${opts?.fontSize==null?"":opts.fontSize}|${opts?.advancedSettings==null?"":opts.advancedSettings}\n`);
}

export function setHwcDisplayTbarText(c:Socket,keyCode:string,opts:{value:number}){
  const{value} = opts;
  setHwcDisplay(c,keyCode,{scale:"CENTERED_BAR",value:value})
  // setHwcDisplay(c,keyCode,{scale:"STRENGTH_BAR",scaleRangeHigh:"100",scaleRangeLow:"0",scaleLimitHigh:"100",scaleLimitLow:"0",value:value})
}

export function setHwcDisplayInitText(c:Socket,keyCode:string,opts:{text:string},initStatus?:boolean){
  const { text} = opts;
  setHwcDisplay(c,keyCode,{format:"Integer",label1:text},initStatus);
}

export function setHwcDisplayTitleLabel(c:Socket,keyCode:string,opts:{title:string,isLabel:boolean,label:string},initStatus?:boolean){
  const { title,isLabel,label} = opts;
  setHwcDisplay(c,keyCode,{format:"Integer",isLabel:isLabel,title,label1:label},initStatus);
}

export function setHwcDisplayLabel1Label2(c:Socket,keyCode:string,opts:{label1:string,label2:string},initStatus?:boolean){
  const { label1,label2 } = opts;
  setHwcDisplay(c,keyCode,{format:"Integer",label1,label2},initStatus);
}

//SECTION KEY Interpretation
export function findKey(keyCode:string){
  const FOUND_KEY = KEY_COLLECTION.find(el=>el.alias===keyCode || el.code === keyCode)
  if(FOUND_KEY == null) return null;
  return FOUND_KEY;
}

export function findKeyAlias(keyCode:string){
  const FOUND_KEY = KEY_COLLECTION.find(el=>el.alias===keyCode || el.code === keyCode)
  if(FOUND_KEY == null || FOUND_KEY.alias==="") return null;
  return FOUND_KEY;
}

//SECTION KEY Collection
export function getKeyGroup(key:KEY_ALIAS,ppSet?:PROGRAM_PREVIEW_KEYER_MIXER_SET){
  const {code,group} = key;
  if(group === "none") return [];
  let result = KEY_COLLECTION.filter(el=>el.group === group && el.code !== code);
  if(ppSet == null) return result;
  const {sourceCollection: collection} = ppSet;
  let blankedKeys = collection.filter(el=>el.isBlank).flatMap(el=>el.pos.row);
  if(group==="program") blankedKeys = blankedKeys.map(el=>el+MAXIMUM_PROGRAM_PREVIEW_BUS_LENGHT);
  result = result.filter(el=>!blankedKeys.includes(parseInt(el.code)))
  return result;
  // return (group === "none")?[]:KEY_COLLECTION.filter(el=>el.group === group && el.code !== code);
}

export async  function sendMultiStatus(c:Socket,keyCollection:KEY_ALIAS[],mode:BUTTON_STATUS,color?:string){
  await Promise.all(
    keyCollection.map(key=>{
      if(color != null) setHwcColor(c,key.code,color)
      setHwcStatus(c,key.code,mode);
    })
  )
}

export function isPressedKeys(keyCodes:string[]){
  //see if all are pressed
  const FOUND_KEYS = KEY_COLLECTION.filter(el=>keyCodes.indexOf(el.alias)>=0 || keyCodes.indexOf(el.code)>=0)
  const RESULT = FOUND_KEYS.filter(el=>el.isPressed === false)
  if(RESULT.length === 0)return true;
  for(const NOT_PRESSED of RESULT){
    console.log({NOT_PRESSED})
  }
  return false;
}

// //TODO 
// declare type BGND_LUMA_KEY_NAME = "BGND" | "LUMA1" | "LUMA2" | "LUMA3"
// declare type BGND_LUMA_KEY = {
//   name:BGND_LUMA_KEY_NAME;
//   time:number;
// }
// // multipresskey evaluator
// var BGND_LUMA_KEYS : BGND_LUMA_KEY [] = [
//   {
//     name:"BGND",
//     time:-1,
//   },
//   {
//     name:"LUMA1",
//     time:-1,
//   },
//   {
//     name:"LUMA2",
//     time:-1,
//   },
//   {
//     name:"LUMA3",
//     time:-1,
//   }
// ]



// export async function multiPressKeyInformant(pressedKey:BGND_LUMA_KEY_NAME,time:number){
//   switch(pressedKey){
//     case "BGND":
//       if(BGND_LUMA_KEYS[0]== null) return;
//       BGND_LUMA_KEYS[0].time = time;
//       break;
//     case "LUMA1":
//       if(BGND_LUMA_KEYS[1]== null) return;
//       BGND_LUMA_KEYS[1].time = time;
//       break;
//     case "LUMA2":
//       if(BGND_LUMA_KEYS[2]== null) return;
//       BGND_LUMA_KEYS[2].time = time;
//       break;
//     case "LUMA3":
//       if(BGND_LUMA_KEYS[3]== null) return;
//       BGND_LUMA_KEYS[3].time = time;
//       break;
//   }
// }

// export async function multiPressKeyEvaluator(pressedKey:BGND_LUMA_KEY_NAME){
//   let pressedTogether:BGND_LUMA_KEY_NAME[] = [];
//   let instanceKey = BGND_LUMA_KEYS.find((key)=>key.name===pressedKey)
//   if(instanceKey == null) return;
//   await Promise.all(
//     BGND_LUMA_KEYS.map((key)=>{
//       const {name,time} = key;
//       //push inside
//       if(instanceKey == null) return;
//       if((instanceKey.time + 80 > time && instanceKey.time - 80 < time) || instanceKey.time === time){
//         pressedTogether.push(name);
//       }
//     })
//   )
//   console.log({action:"do further shit right here ...",pressedTogether});
// }


/////////////////////////
//SECTION HANDLING DATA//
/////////////////////////
export function initHardcodedButtons(c:Socket){
  //handling1
  machineChangerButtonDisplays(c);//this handler is inside handling1
  //hndlingdata
  liveViewButtonDisplays(c);//this handler is inside handlingdata
}
export async function handling1(c:Socket,panelConfigCollection:PANEL_CONFIG[]){
  
  //set the first panel config as default 
  if(panelConfigCollection.length === 0) throw new Error("Error: No connected avp machine available!")
  let selectedPanelConfig = getSelectedPanelConfig(panelConfigCollection);
  if(selectedPanelConfig == null) throw new Error(`Error: No valid  available avp machine!`)
  //init hardcoded buttons
  initHardcodedButtons(c);

  infusingAvp(c,selectedPanelConfig);

  c.on("data",async (data:Buffer) => {
    const TIME = new Date().getTime();
    let obj = data.toString("utf8").match(/^HWC\#(\d+)(.*)/)
    if(obj != null){
      const keyNum = obj[1];
      let suffix = obj[2];
      if(suffix != null){
        let s = suffix.match(/^(.|=)(.*)/);
        if(s !=null){
          let chiffre = s[1];
          let rest = s[2];
          if(rest != null){
            if(chiffre === "."){
              let b4 = rest.match(/^(\d+)=(.*)/);
              if(b4 != null){
                const edge = b4[1];
                const value = b4[2];
                //done this shit here
                if (keyNum!= null &&  edge != null && value != null)
                  switchB4ComponentHandling1(c,{keyNum,value,edge,time:TIME},panelConfigCollection);
              }
            }
          }
        }
      }
    }
  })
}

export function switchB4ComponentHandling1(c:Socket,data:{keyNum:string,value:string,edge:string,time:number},panelConfigCollection:PANEL_CONFIG[]){
  const {keyNum,value,time} = data;
  
  let foundKey = KEY_COLLECTION.find(el=>el.code === keyNum);
  if(foundKey == null) return;
  const {group} = foundKey;
  if(value === "Down"){
    if(group === "machine_changer"){
      setMachineChangerPress(c,foundKey,panelConfigCollection);
    }
    foundKey.isPressed=true;
    foundKey.time=time;
  }
  
  //differfrom groups 
  //preset program mixer
  if(value === "Up"){
    if(foundKey.group === "machine_changer")
    setHwcStatus(c,keyNum,"Dimmed")
    foundKey.isPressed=true;
  }
}

export async function handlingData(c:Socket,panelConfigCollection:PANEL_CONFIG[]){
  if(panelConfigCollection.length === 0) throw new Error("Error: No connected avp machine available!")
  c.on("data",async (data:Buffer)=>{    
    const TIME = new Date().getTime();
    const SELECTED_PANEL_CONFIG = getSelectedPanelConfig(panelConfigCollection);
    if(SELECTED_PANEL_CONFIG == null) {
      //show that config is empty
      console.log(`Error: SELECTED_PANEL_CONFIG is empty!`)
      setMainDisplayPanel(c,{title:"Warning!",label:"Empty config",isLabel:true})
      return;
    }
    const CONNECTION_STATUS = connectionCheck(SELECTED_PANEL_CONFIG)
    if(!CONNECTION_STATUS){
      console.log(`Error: Connection status is ${CONNECTION_STATUS}!`);
      setMainDisplayPanel(c,{title:"Not connected",label:SELECTED_PANEL_CONFIG.avp_info.ip,isLabel:true})
      return;
    }
    setMainDisplayPanel(c,{title:"Connected",label:SELECTED_PANEL_CONFIG.avp_info.ip,isLabel:true})

    let obj = data.toString("utf8").match(/^HWC\#(\d+)(.*)/)
    if(obj != null){
      
      const keyNum = obj[1];
      let suffix = obj[2];
      if(suffix != null){
        let s = suffix.match(/^(.|=)(.*)/);
        if(s !=null){
          let chiffre = s[1];
          let rest = s[2];
          if(rest != null){
            if(chiffre === "="){
              let r = rest.match(/^(Abs|Speed|Enc):((\d+)|(-\d+))/);
              if(r != null){
                const type = r[1]
                const value = r[2];
                if(keyNum != null && type !=null && value != null)
                 await switchHwcComponent(c,{keyNum,value,type,time: TIME},SELECTED_PANEL_CONFIG);
              }
            }
            if(chiffre === "."){
              let b4 = rest.match(/^(\d+)=(.*)/);
              if(b4 != null){
                const edge = b4[1];
                const value = b4[2];
                //done this shit here
                if (keyNum!= null &&  edge != null && value != null)
                 await switchB4Component(c,{keyNum,value,edge,time: TIME},SELECTED_PANEL_CONFIG);
              }
            }
          }
        }
      }
    }
  })
}

export function switchB4Component(c:Socket,data:{keyNum:string,value:string,edge:string,time:number},panelConfig:PANEL_CONFIG){
  const {keyNum,value,time} = data;
  const{ppSet} = panelConfig;
  // console.log({edge,value,keyNum});


  let foundKey = KEY_COLLECTION.find(el=>el.code === keyNum);
  if(foundKey == null) return;
  if(value === "Down"){
    let skipBlank = checkIsBlank(foundKey,ppSet)
    if(skipBlank) return;
    keyGroupHandlerDown(c,foundKey,panelConfig,time);
    //set is pressed
    foundKey.isPressed=true;
    foundKey.time = time;
  }
  
  //differfrom groups 
  //preset program mixer
  if(value === "Up"){
    // if(foundKey.group === "none")setHwcStatus(c,keyNum,"Dimmed")
    keyGroupHandlerUp(c,foundKey,panelConfig,time);
    foundKey.isPressed=false;
  }
}

export async function keyGroupHandlerUp(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG,time:number){
  const {group,code,alias} = key;
  switch(group){
    case "mixer":
      await setSelectedVideoMixer(c,key,panelConfig,time,"fill");
      break;
    case "none":
    case "encoder":
      setHwcStatus(c,code,"Dimmed")
      break;
    case "keyer_source":
    case "program":
    case "preset":
    case "stay_blinking":
    case "machine_changer":
    case "live_view_changer":
      break;
    default:
      console.log(`Error: {group:${group}, code:${code}, alias:${alias}} is not implemented keyGroupHandler!`)
  } 
}

export async function keyGroupHandlerDown(c:Socket,key:KEY_ALIAS,panelConfig:PANEL_CONFIG,time:number){
  const {group,code,alias} = key;
  switch(group){
    case "program":
      await setProgramBusSource(c,key,panelConfig);
      break;
    case "preset":
      await setPresetBusSource(c,key,panelConfig);
      break;
    case "mixer":
      await setSelectedVideoMixer(c,key,panelConfig,time,"signal");
      break;
    case "stay_blinking":
      await setBlinkingButtonPress(c,key,panelConfig)
      break;
    case "machine_changer":
      //Done in extra handler handling1
      break;
    case "keyer_source":
      await setKeyerSourceButtonPress(c,key,panelConfig);
      break;
    case "live_view_changer":
      await setLiveViewChangerButtonPress(c,key,panelConfig);
      break;
    case "encoder":
      await setEncoderButtonPress(c,key,panelConfig);
      break;
    case "none":
      await setButtonPress(c,key,panelConfig)
      break;
    default:
      console.log(`Error: {group:${group}, code:${code}, alias:${alias}} is not implemented keyGroupHandler!`)
  } 
}

export async function switchHwcComponent(c:Socket,data:{keyNum:string,value:string,type:string,time:number},panelConfig:PANEL_CONFIG){
  const {type} = data;
  switch(type){
    case "Abs":
      await setFaderValue(c,data,panelConfig);
      break;
    case "Enc":
      await setEncValue(c,data,panelConfig)
      break;
      default:
        console.log(`Error: ${type} is not known!(switchHwcComponent)`)
        // console.log({keyNum,type,value});
  }
}

/////////////////////////////////
//SECTION CONSTANT PPS SETS   //
/////////////////////////////////
export function checkIsBlank(foundKey:KEY_ALIAS,ppSet:PROGRAM_PREVIEW_KEYER_MIXER_SET){
  const{code,group} = foundKey;
  if(!(group === "preset" || group === "program")) return false;
  const {sourceCollection: collection} = ppSet;
  let foundEntry = collection.find(el=>`${el.pos.row+(group==="program"?12:0)}` === code);
  if(foundEntry == null) return true;
  return foundEntry.isBlank;
}