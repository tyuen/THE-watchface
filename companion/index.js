import {settingsStorage as store} from "settings";
import {peerSocket} from "messaging";
import {me} from "companion";

store.onchange = sendAll;

peerSocket.onmessage = e => {
  if(e.data && e.data.getAll) sendAll();
};

if(me.launchReasons.settingChanged) sendAll();

function sendAll(e) {
  if(peerSocket.readyState === peerSocket.OPEN) {
    peerSocket.send({
      theme: trim(store.getItem("theme") || "blue"),
      hideRings: (store.getItem("hideRings") === "true"),
      unboldStats: (store.getItem("unboldStats") === "true"),
      firstStat: store.getItem("firstStat") ? JSON.parse(store.getItem("firstStat")).values[0].value : 6
    });
  }
}

function trim(s) {
  return (s.charAt && s.charAt(0) === '"') ? s.substr(1, s.length - 2) : s;  
}
