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
  if(peerSocket.readyState === peerSocket.OPEN) {
    sendAllNow();
  } else {
    let done = false;
    peerSocket.onopen = () => {
      if(!done) sendAllNow();
      done = true;
    };
  }
  let i18n = getLocale();
  if(i18n) outbox.enqueue("days.txt", encode(i18n));
}

function sendAllNow() {
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

function getLocale() {
  try {
    new Date().toLocaleDateString("i");
  } catch(e) {
    let lang = locale.language.replace("_", "-");
    let days = [];
    for(let i = 0; i < 7; i++) days.push(new Date(2000, 0, i + 2).toLocaleDateString(lang, {weekday: "short"}).toUpperCase().replace(".", ""));
    return {days};
  }
}
