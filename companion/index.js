import {settingsStorage as store} from "settings";
import {peerSocket} from "messaging";
import {me} from "companion";
import {outbox} from "file-transfer";
import {encode} from "cbor";
import {locale} from "user-settings";

store.onchange = sendAll;

peerSocket.onmessage = e => {
  if(e.data && e.data.getAll) sendAll();
};

if(me.launchReasons.settingsChanged) sendAll();

function sendAll() {
  let obj = {
    theme: trim(store.getItem("theme") || "blue"),
    hideRings: (store.getItem("hideRings") === "true"),
    unboldStats: (store.getItem("unboldStats") === "true"),
    stats: ["none", "steps", "heart", "floors", "cals", "mins", "time"],
    firstStat: 0,
    days: getLocale()
  };
  if(store.getItem("stats")) {
    obj.stats = JSON.parse(store.getItem("stats")).values.map(n => n.value);
  }
  if(store.getItem("firstStat2")) {
    let value = JSON.parse(store.getItem("firstStat2")).values[0].value;
    for(let i = 0; i < obj.stats.length; i++) {
      if(value === obj.stats[i]) {
        obj.firstStat = i;
        break;
      }
    }
  }
  outbox.enqueue("settings2.txt", encode(obj));
}

function trim(s) {
  return (s.charAt && s.charAt(0) === '"') ? s.substr(1, s.length - 2) : s;  
}

function getLocale() {
  try {
    new Date().toLocaleDateString("i");
  } catch(e) {
    let lang = locale.language.replace("_", "-");
    let days = [];
    for(let i = 0; i < 7; i++) {
      days.push(new Date(2000, 0, i + 2).toLocaleDateString(lang, {weekday: "short"}).toUpperCase().replace(".", ""));
    }
    return days;
  }
}
