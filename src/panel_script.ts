import { initAvpMachine } from "./api_connection.js";
import { createClient, initPanel, handlingData, handling1, noConnectionPanel, initPanel2 } from "./panel_utils.js";
import {PANEL_CONFIG } from "./utils/types.js";
import { CONFIGURATION } from "./configurator.js";

const main = async ()=>{
  const {panel_details,ppkm_collection}=CONFIGURATION;
  //LOADING PPSET_COLLECTION
  const PPSET_COLLECTION = ppkm_collection;
  const client = await createClient({host:panel_details.ip,port:panel_details.port});

  await initPanel(client);

  let panelConfigCollection : PANEL_CONFIG[]=[];
  for(const entry  of PPSET_COLLECTION){
    panelConfigCollection.push(await initAvpMachine(entry.avpIp,entry))
  }
  
  let selectedPanelConfig = panelConfigCollection.find(el=>el.avp_info.vSocket != null);
  await initPanel2(client);

  if(selectedPanelConfig == null){
    await noConnectionPanel(client);
    throw new Error(`Error: No valid AVP machine available!`)
  }
  //set first panel and set it selected
  //handling 1 
  handling1(client,panelConfigCollection);
  //handling data
  handlingData(client,panelConfigCollection);
}

main();