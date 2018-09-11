import clock from "clock";
import document from "document";
import * as health from "user-activity";
import {HeartRateSensor} from "heart-rate";
import {display} from "display";
import {vibration} from "haptics";
import {peerSocket} from "messaging";
import {units} from "user-settings";
import * as fs from "fs";
import {battery} from "power";

const WEEKS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const THEMES = {
  red:    ["F93535", "CC4848", "AB4545"],
  orange: ["FF970F", "DD7F23", "B3671D"],
  yellow: ["FFFF00", "E4DB4A", "C6BC1E"],
  green:  ["14C610", "119E0E", "0D730B"],
  blue:   ["6fa8e9", "5682b4", "32547a"],
  purple: ["E86FE9", "B455B5", "79327A"],
  navy: ["5555ff", "4444ff", "4444ff"],
  grey: ["888888", "666666", "444444"],
  white: ["FFFFFF", "FFFFFF", "FFFFFF"]
};

var lastUpdatedRings = 0;
var lastUpdatedHeart = 0;
var showRings = true;
var unboldStats = false;
var firstStat = 6;  //6=blank
var curStat = 6;
var heartSensor;

var myDate = $("mydate");
var myWeek = $("myweek");
var myHours = $("hours");
var myMins = $("minutes");
var mySecs = $("seconds");
var myStats = $("mystats");
var myBatt = $("batt");

function $(s) {
  return document.getElementById(s);
}

function onTick() {
  let now = new Date();
  myDate.text = now.getDate();
  myWeek.text = WEEKS[now.getDay()];

  let hours = now.getHours() % 12;
  let mins = now.getMinutes();
  let secs = now.getSeconds();
  myHours.groupTransform.rotate.angle = (hours + mins/60)*30;
  myMins.groupTransform.rotate.angle = mins*6;
  mySecs.groupTransform.rotate.angle = secs*6;

  myBatt.x2 = Math.round(battery.chargeLevel*7/25) - 14;

  if(showRings || curStat !== 6) {
    let nowTime = now.getTime();
    
    if(showRings) {
      if(nowTime - lastUpdatedRings > 30000) {
        lastUpdatedRings = nowTime;
        let today = health.today.adjusted;
        let goal = health.goals;
        updateHealth("today_tl", "cal", goal, today);
        updateHealth("today_tr", "step", goal, today);
        updateHealth("today_br", "dist", goal, today);
        updateHealth("today_bl", "climb", goal, today);
      }
    }

    if(curStat !== 6) {
      if(curStat !== 1) {
        updateStat();
      } else {
        if(nowTime - lastUpdatedHeart > 1600) {
          lastUpdatedHeart = nowTime;
          updateHeart();
        }
      }
    }
  }
}

clock.granularity = "seconds";
clock.ontick = onTick;

onTick();

$("main").onclick = () => {
  curStat = (curStat + 1) % 7;
  if(curStat === 1) {
    updateHeart();
  } else {
    updateStat();
  }
};

function updateHealth(id, holder, goal, today) {
  let angle = 0;
  if(holder === "cal") {
    angle = (today.calories || 0)*360/(goal.calories || 400);
  } else if(holder === "step") {
    angle = (today.steps || 0)*360/(goal.steps || 10000);
  } else if(holder === "dist") {
    angle = (today.distance || 0)*360/(goal.distance || 7200);
  } else if(holder === "climb") {
    angle = (today.elevationGain || 0)*360/(goal.elevationGain || 20);
  } else if(holder === "active") {
    angle = (today.activeMinutes || 0)*360/(goal.activeMinutes || 30);
  }
  $(id).sweepAngle = Math.min(360, Math.round(angle));
}

function updateStat() {
  let today = health.today.adjusted;
  switch(curStat) {
    case 0: myStats.text = today.steps; break;
    case 1: break;  //heart
    case 2: myStats.text = (units.distance === "metric") ? round(today.distance/1000) + " km" : round(today.distance/1609.34) + " mi"; break;
    case 3: myStats.text = today.elevationGain + " f"; break;
    case 4: myStats.text = today.calories + " cal"; break;
    case 5:
      let t = today.activeMinutes;
      myStats.text = Math.floor(t/60) + "' " + pad(t % 60) + '"'; break;
    default: myStats.text = "";
  }
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

function round(n) {
  n = n.toFixed(2);
  if(n.substr(-2) === "00") return n.substr(0, n.length - 3);
  if(n.substr(-1) === "0") return n.substr(0, n.length - 1);
  return n;
}

var delayHeart;

function updateHeart() {
  let h = heartSensor;
  if(!h) {
    heartSensor = h = new HeartRateSensor();
    h.onreading = () => {
      h.stop();
      clearTimeout(delayHeart);
      myStats.text = h.heartRate;
    };
    h.onerror = () => {
      h.stop();
      clearTimeout(delayHeart);
      myStats.text = "--";
    };
  }
  if(!h.activated) {
    delayHeart = setTimeout(() => {
      myStats.text = "--";
    }, 500);
    h.start();
  }
}

peerSocket.onmessage = e => {
  e = e.data;
  if(e) {
    applySettings(e);
    display.poke();
    vibration.start("bump");
    fs.writeFileSync("settings.txt", e, "json");
  }
};

function applySettings(o) {
  if(o.theme) {
    let colors = THEMES[o.theme] || [];
    for(let i = 0; i < colors.length; i++) {
      let nodes = document.getElementsByClassName("color" + (i + 1));
      let node, j = 0;
      while(node = nodes[j++]) node.style.fill = "#" + colors[i];
    }
  }
  if("hideRings" in o) {
    showRings = !o.hideRings;
    let nodes = document.getElementsByClassName("rings");
    let node, j = 0;
    while(node = nodes[j++]) node.style.display = showRings ? "inline" : "none";
  }
  if("unboldStats" in o) {
    unboldStats = o.unboldStats;
    myStats.style.fontFamily = unboldStats ? "System-Regular" : "System-Bold";
  }
  if("firstStat" in o) curStat = firstStat = o.firstStat;
  myStats.text = "";
  lastUpdatedRings = 0;
  lastUpdatedHeart = 0;
}

function getSettings() {
  let f;
  try { f = fs.readFileSync("settings.txt", "json"); } catch(e) {}
  if(f) {
    applySettings(f);
  } else {
    peerSocket.onopen = () => { peerSocket.send({getAll: 1}) };
  }
}
getSettings();
