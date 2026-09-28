import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, Animated,
  Easing, Vibration, Image
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVE_KEY = "dalma_adventure_v1";
const VERSION = 1;

const WORLDS = [
  { id:"genesis", name:"GENESIS", subtitle:"Origin Gate", symbol:"✦", threshold:0, accent:"#D8B866",
    lore:"Stone, roots and warm origin light. The first civilization grows around DALMA's signal.",
    buildings:["Origin Gate","Sunwell","Root Archive","Crown Hall","Genesis Beacon"] },
  { id:"astral", name:"ASTRAL WILDS", subtitle:"Sky becomes terrain", symbol:"◈", threshold:18, accent:"#A9C8FF",
    lore:"Floating land, altered gravity and luminous vegetation.",
    buildings:["Sky Bridge","Star Garden","Cloud Forge","Observatory","Gravity Spire"] },
  { id:"abyss", name:"ABYSSAL OCEAN", subtitle:"Cities below pressure", symbol:"≈", threshold:38, accent:"#79D7D4",
    lore:"Mineral coral towers, deep currents and pressure-born treasures.",
    buildings:["Tide Vault","Coral Citadel","Pressure Loom","Deep Archive","Abyss Crown"] },
  { id:"volcanic", name:"VOLCANIC CROWN", subtitle:"Kingdom of heat", symbol:"△", threshold:62, accent:"#FF9E67",
    lore:"Basalt, obsidian and living lava turn risk into power.",
    buildings:["Basalt Gate","Obsidian Forge","Lava Lift","Ash Temple","Crown Caldera"] },
  { id:"neon", name:"NEON NEXUS", subtitle:"Living digital city", symbol:"⌁", threshold:90, accent:"#E6A8FF",
    lore:"Energy routes, holographic districts and a city that rewrites itself.",
    buildings:["Pulse Plaza","Data Garden","Photon Rail","Signal Tower","Nexus Core"] },
  { id:"shadow", name:"SHADOW DIMENSION", subtitle:"Absence as matter", symbol:"◐", threshold:125, accent:"#B9B9C8",
    lore:"Impossible geometry, phases and hidden paths reward precision.",
    buildings:["Null Gate","Veil Market","Echo Hall","Phase Library","Shadow Throne"] },
  { id:"origin", name:"ORIGIN CORE", subtitle:"The source beneath worlds", symbol:"◎", threshold:165, accent:"#F6E6A4",
    lore:"Primordial geometry. The final rule is not discovered; it is built.",
    buildings:["Core Gate","First Engine","Memory Well","Genesis Array","Origin Heart"] }
];

const TILE_TYPES = ["COIN","COIN","ENERGY","SHIELD","BUILD","CHEST","RAID","CARD","EVENT","COIN","ATTACK","KEY"];
const TILE_ICONS = { COIN:"◉", ENERGY:"⚡", SHIELD:"⬟", BUILD:"⌂", CHEST:"◆", RAID:"⚔", CARD:"◈", EVENT:"?", ATTACK:"✹", KEY:"⌕" };

const CARD_POOL = [
  {id:"aurora",name:"Aurora Runner",set:"ASTRAL SIGNAL",rarity:"EPIC",bonus:"+6% coin rewards",symbol:"✦",value:6},
  {id:"sky",name:"Sky Warden",set:"ASTRAL SIGNAL",rarity:"RARE",bonus:"+1 shield capacity",symbol:"◈",value:1},
  {id:"tide",name:"Tide Keeper",set:"DEEP PRESSURE",rarity:"LEGENDARY",bonus:"+8% chest rewards",symbol:"≈",value:8},
  {id:"reef",name:"Reef Architect",set:"DEEP PRESSURE",rarity:"RARE",bonus:"-5% build cost",symbol:"◇",value:5},
  {id:"forge",name:"Obsidian Smith",set:"VOLCANIC RISE",rarity:"EPIC",bonus:"+10% raid loot",symbol:"△",value:10},
  {id:"ember",name:"Ember Scout",set:"VOLCANIC RISE",rarity:"RARE",bonus:"+1 energy cap",symbol:"◆",value:1},
  {id:"pulse",name:"Pulse Runner",set:"NEON NEXUS",rarity:"EPIC",bonus:"+1 move on roll 7+",symbol:"⌁",value:1},
  {id:"signal",name:"Signal Keeper",set:"NEON NEXUS",rarity:"LEGENDARY",bonus:"+12% event rewards",symbol:"◉",value:12},
  {id:"veil",name:"Veil Walker",set:"SHADOW VEIL",rarity:"EPIC",bonus:"+10% shield protection",symbol:"◐",value:10},
  {id:"echo",name:"Echo Archivist",set:"SHADOW VEIL",rarity:"RARE",bonus:"+2% XP gain",symbol:"◎",value:2},
  {id:"core",name:"Origin Sentinel",set:"ORIGIN CORE",rarity:"LEGENDARY",bonus:"+15% core rewards",symbol:"✧",value:15},
  {id:"first",name:"First Spark",set:"ORIGIN CORE",rarity:"MYTHIC",bonus:"+1 key on rare chests",symbol:"✺",value:1},
  {id:"bali",name:"DALMA • BALI",set:"GENESIS",rarity:"SACRED",bonus:"+5% all rewards",symbol:"♥",value:5},
  {id:"gate",name:"Gate Keeper",set:"GENESIS",rarity:"RARE",bonus:"+5% build speed",symbol:"✦",value:5},
  {id:"root",name:"Root Memory",set:"GENESIS",rarity:"EPIC",bonus:"+4% XP gain",symbol:"❖",value:4},
  {id:"crown",name:"Crown Architect",set:"GENESIS",rarity:"LEGENDARY",bonus:"+7% build rewards",symbol:"♢",value:7},
  {id:"deepstar",name:"Deep Star",set:"DEEP PRESSURE",rarity:"EPIC",bonus:"+1 chest key chance",symbol:"✹",value:1},
  {id:"night",name:"Night Signal",set:"SHADOW VEIL",rarity:"LEGENDARY",bonus:"+6% raid success",symbol:"☾",value:6}
];

const BUILD_NAMES = [
  ["Origin Gate","Sunwell","Root Archive","Crown Hall","Genesis Beacon"],
  ["Sky Bridge","Star Garden","Cloud Forge","Observatory","Gravity Spire"],
  ["Tide Vault","Coral Citadel","Pressure Loom","Deep Archive","Abyss Crown"],
  ["Basalt Gate","Obsidian Forge","Lava Lift","Ash Temple","Crown Caldera"],
  ["Pulse Plaza","Data Garden","Photon Rail","Signal Tower","Nexus Core"],
  ["Null Gate","Veil Market","Echo Hall","Phase Library","Shadow Throne"],
  ["Core Gate","First Engine","Memory Well","Genesis Array","Origin Heart"]
];

const DEFAULT = {
  version:VERSION, energy:10, energyCap:10, coins:1200, shields:2, keys:3, stars:4,
  xp:22, level:1, pos:0, world:0, spins:0, raids:0, attacks:0, chests:1,
  lastSeen:Date.now(), streak:1,
  buildings:Array(7).fill(null).map(()=>Array(5).fill(0)),
  cards:[], claimedMissions:[], missionProgress:{roll:0,build:0,raid:0,card:0,world:0},
  inboxClaimed:false, eventDay:new Date().toISOString().slice(0,10)
};

function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function money(n){return Math.round(n).toLocaleString();}
function pct(n){return Math.round(n) + "%";}
function shuffleCopy(arr){return [...arr].sort(()=>Math.random()-.5);}
function cardById(id){return CARD_POOL.find(c=>c.id===id);}
function activeWorld(g){return WORLDS[g.world] || WORLDS[0];}
function totalBuildings(g){return g.buildings.reduce((s,w)=>s+w.reduce((a,b)=>a+b,0),0);}
function ownedCards(g){return g.cards.map(cardById).filter(Boolean);}
function hasCard(g,id){return g.cards.includes(id);}
function rewardMultiplier(g){
  let m=1;
  const cards=ownedCards(g);
  if(hasCard(g,"bali"))m+=.05;
  m+=cards.filter(c=>c.bonus.includes("coin")||c.bonus.includes("all rewards")).reduce((s,c)=>s+c.value/100,0);
  return m;
}
function buildDiscount(g){
  const cards=ownedCards(g);
  return hasCard(g,"reef") ? .05 : 0;
}
function energyCap(g){
  return g.energyCap + (hasCard(g,"ember") ? 1 : 0);
}
function loadState(raw){
  try{
    const g=JSON.parse(raw);
    const merged={...DEFAULT,...g};
    merged.buildings=DEFAULT.buildings.map((row,i)=>Array.isArray(g.buildings?.[i])?g.buildings[i].slice(0,5).concat(Array(Math.max(0,5-g.buildings[i].length)).fill(0)):row.slice());
    const elapsed=Math.max(0,Date.now()-(g.lastSeen||Date.now()));
    const recovery=Math.min(energyCap(merged)-merged.energy,Math.floor(elapsed/(10*60*1000)));
    if(recovery>0){merged.energy+=recovery;}
    merged.lastSeen=Date.now();
    const day=new Date().toISOString().slice(0,10);
    if(merged.eventDay!==day){merged.eventDay=day;merged.inboxClaimed=false;}
    return merged;
  }catch(e){return {...DEFAULT,lastSeen:Date.now()};}
}

function Stat({icon,value,label}){return <View style={styles.stat}><Text style={styles.statIcon}>{icon}</Text><View style={{flex:1}}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View></View>}
function Button({children,onPress,secondary=false,disabled=false,tiny=false}){return <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[secondary?styles.secondary:styles.primary,tiny&&styles.tinyButton,disabled&&styles.disabled,pressed&&styles.pressed]}><Text style={secondary?styles.secondaryText:styles.primaryText}>{children}</Text></Pressable>}
function SectionTitle({title,sub,right}){return <View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>{title}</Text>{sub?<Text style={styles.sectionSub}>{sub}</Text>:null}</View>{right}</View>}
function Tile({type,active}){return <View style={[styles.tile,active&&styles.tileActive]}><Text style={[styles.tileIcon,active&&styles.tileIconActive]}>{TILE_ICONS[type]}</Text><Text style={styles.tileText}>{type}</Text></View>}
function BuildingCard({worldIndex,index,level,onBuild,cost,canBuild}) {
  const w=WORLDS[worldIndex];
  const name=BUILD_NAMES[worldIndex][index];
  const progress=(level/5)*100;
  return <View style={styles.building}>
    <View style={[styles.buildingArt,{borderColor:w.accent+"66"}]}>
      <View style={[styles.block,{backgroundColor:w.accent+"22",height:28+level*5,width:30+level*5}]}/>
      <View style={[styles.blockSmall,{backgroundColor:w.accent+"44",height:16+level*3,width:15+level*4}]}/>
      <Text style={[styles.buildingLevel,{color:w.accent}]}>{level}/5</Text>
    </View>
    <View style={styles.buildingBody}>
      <Text style={styles.buildingName}>{name}</Text>
      <Text style={styles.buildingMeta}>{level===5?"MASTERED":"BUILD LEVEL "+(level+1)}</Text>
      <View style={styles.miniTrack}><View style={[styles.miniFill,{width:progress+"%",backgroundColor:w.accent}]}/></View>
      {level<5?<Button tiny secondary={!canBuild} disabled={!canBuild} onPress={onBuild}>{money(cost)} ◉</Button>:<Text style={[styles.mastered,{color:w.accent}]}>MASTERED</Text>}
    </View>
  </View>
}
function CardItem({card,owned,onAdd}) {
  return <View style={[styles.collectionCard,owned&&styles.collectionOwned]}>
    <View style={styles.cardSymbol}><Text style={styles.cardSymbolText}>{card.symbol}</Text></View>
    <View style={{flex:1}}>
      <View style={styles.cardNameRow}><Text style={styles.cardName}>{card.name}</Text><Text style={styles.rarity}>{card.rarity}</Text></View>
      <Text style={styles.cardSet}>{card.set}</Text>
      <Text style={styles.cardBonus}>{card.bonus}</Text>
    </View>
    {!owned&&<Button tiny secondary onPress={onAdd}>REVEAL</Button>}
    {owned&&<Text style={styles.ownedText}>OWNED</Text>}
  </View>
}

export default function App(){
  const [tab,setTab]=useState("BOARD");
  const [g,setG]=useState(DEFAULT);
  const [ready,setReady]=useState(false);
  const [notice,setNotice]=useState("Genesis is waiting for DALMA.");
  const [choice,setChoice]=useState(null);
  const [rolling,setRolling]=useState(false);
  const [dice,setDice]=useState([2,5]);
  const [buildWorld,setBuildWorld]=useState(0);
  const [target,setTarget]=useState(null);
  const rollAnim=useRef(new Animated.Value(0)).current;
  const pulse=useRef(new Animated.Value(0)).current;
  const progressAnim=useRef(new Animated.Value(0)).current;
  const heroFloat=useRef(new Animated.Value(0)).current;

  useEffect(()=>{
    AsyncStorage.getItem(SAVE_KEY).then(v=>setG(v?loadState(v):{...DEFAULT,lastSeen:Date.now()})).catch(()=>{}).finally(()=>setReady(true));
  },[]);
  useEffect(()=>{
    if(ready)AsyncStorage.setItem(SAVE_KEY,JSON.stringify({...g,lastSeen:Date.now()})).catch(()=>{});
  },[g,ready]);
  useEffect(()=>{
    const p=Animated.loop(Animated.sequence([
      Animated.timing(pulse,{toValue:1,duration:900,easing:Easing.inOut(Easing.quad),useNativeDriver:true}),
      Animated.timing(pulse,{toValue:0,duration:900,easing:Easing.inOut(Easing.quad),useNativeDriver:true})
    ]));
    const h=Animated.loop(Animated.sequence([
      Animated.timing(heroFloat,{toValue:1,duration:1800,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(heroFloat,{toValue:0,duration:1800,easing:Easing.inOut(Easing.sin),useNativeDriver:true})
    ]));
    p.start();h.start();return()=>{p.stop();h.stop();};
  },[]);

  const world=activeWorld(g);
  const total=totalBuildings(g);
  const xpNeeded=80+g.level*25;
  const xpPct=clamp((g.xp/xpNeeded)*100,0,100);
  const nextWorld=WORLDS[Math.min(WORLDS.length-1,g.world+1)];
  const canAdvance=g.stars>=nextWorld.threshold;
  const currentRow=g.buildings[g.world];
  const buildIndex=useMemo(()=>currentRow.findIndex(v=>v<5),[currentRow]);
  const buildCost=useMemo(()=>{
    const lvl=buildIndex<0?5:currentRow[buildIndex];
    const base=(world.threshold+1)*160+(g.level*55)+(lvl*180);
    return Math.max(240,Math.round(base*(1-buildDiscount(g))));
  },[buildIndex,currentRow,g.level,world.threshold,g]);
  const activeCards=ownedCards(g);
  const missionList=[
    {id:"roll",title:"Momentum",desc:"Complete 8 rolls",goal:8,reward:"+2 energy • +300 coins",progress:g.missionProgress.roll},
    {id:"build",title:"Architect",desc:"Build 3 levels",goal:3,reward:"+700 coins • +2 stars",progress:g.missionProgress.build},
    {id:"raid",title:"Vault Runner",desc:"Finish 2 raids",goal:2,reward:"+1 key • +600 coins",progress:g.missionProgress.raid},
    {id:"card",title:"Archivist",desc:"Reveal 2 cards",goal:2,reward:"+400 coins • +1 shield",progress:g.missionProgress.card},
    {id:"world",title:"Worldwalker",desc:"Unlock a new world",goal:1,reward:"+1200 coins • +2 energy",progress:g.missionProgress.world}
  ];

  function mutateReward(kind,amount){
    setG(o=>{
      let n={...o};
      if(kind==="coins")n.coins+=Math.round(amount*rewardMultiplier(o));
      if(kind==="energy")n.energy=clamp(n.energy+amount,0,energyCap(n));
      if(kind==="shields")n.shields+=amount;
      if(kind==="keys")n.keys+=amount;
      if(kind==="stars")n.stars+=amount;
      return n;
    });
  }
  function addMission(key,amount=1){
    setG(o=>{
      const p={...o.missionProgress,[key]:clamp((o.missionProgress[key]||0)+amount,0,99)};
      return {...o,missionProgress:p};
    });
  }
  function levelCheck(){
    setG(o=>{
      if(o.xp<80+o.level*25)return o;
      return {...o,level:o.level+1,xp:o.xp-(80+o.level*25),energy:Math.min(energyCap(o),o.energy+2),coins:o.coins+500};
    });
  }
  function land(next,rolled){
    const type=TILE_TYPES[next%TILE_TYPES.length];
    const bonus=Math.round(rolled*8*rewardMultiplier(g));
    setG(o=>{
      let n={...o,pos:next,spins:o.spins+1,xp:o.xp+rolled*2};
      const mult=rewardMultiplier(o);
      if(type==="COIN")n.coins+=Math.round((170+bonus)*mult);
      if(type==="ENERGY")n.energy=clamp(n.energy+2,0,energyCap(n));
      if(type==="SHIELD")n.shields+=1;
      if(type==="CHEST"){n.chests+=1;n.coins+=Math.round(260*mult);n.keys+=1;}
      if(type==="CARD"){}
      return n;
    });
    addMission("roll");
    if(type==="BUILD")setChoice({type:"BUILD",label:"BUILD SITE"});
    else if(type==="RAID")setChoice({type:"RAID",label:"RAID WINDOW"});
    else if(type==="ATTACK")setChoice({type:"ATTACK",label:"ATTACK WINDOW"});
    else if(type==="EVENT")setChoice({type:"EVENT",label:"RISK EVENT"});
    else if(type==="CHEST")setChoice({type:"CHEST",label:"RELIC CHEST"});
    else if(type==="CARD")setChoice({type:"CARD",label:"CARD FRAGMENT"});
    else setChoice(null);
    setNotice(type==="COIN"?"Route reward secured.":type+" node reached.");
    Vibration.vibrate(type==="COIN"?25:[35,45,35]);
  }
  function roll(){
    if(rolling)return;
    if(g.energy<=0){setTab("MISSIONS");setNotice("Energy is empty. Complete a mission or recover offline.");return;}
    const a=1+Math.floor(Math.random()*6),b=1+Math.floor(Math.random()*6);
    let steps=a+b;
    if(steps>=7&&hasCard(g,"pulse"))steps+=1;
    const next=(g.pos+steps)%TILE_TYPES.length;
    setDice([a,b]);setChoice(null);setRolling(true);rollAnim.setValue(0);progressAnim.setValue(g.pos/TILE_TYPES.length);
    Animated.parallel([
      Animated.timing(rollAnim,{toValue:1,duration:880,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
      Animated.timing(progressAnim,{toValue:next/TILE_TYPES.length,duration:980,easing:Easing.inOut(Easing.cubic),useNativeDriver:false})
    ]).start(()=>{
      setG(o=>({...o,energy:Math.max(0,o.energy-1)}));
      land(next,a+b);
      setRolling(false);
    });
  }
  function doBuild(worldIndex,index){
    const level=g.buildings[worldIndex][index];
    if(level>=5)return;
    const w=WORLDS[worldIndex];
    const cost=Math.round(((w.threshold+1)*160+(g.level*55)+(level*180))*(1-buildDiscount(g)));
    if(g.coins<cost){setNotice("Not enough coins for this build.");return;}
    setG(o=>{
      const b=o.buildings.map(row=>row.slice());
      b[worldIndex][index]+=1;
      const nextLevel=b[worldIndex][index];
      return {...o,coins:o.coins-cost,buildings:b,stars:o.stars+(nextLevel===1?1:0),xp:o.xp+18};
    });
    addMission("build");
    setNotice(w.name+" • "+BUILD_NAMES[worldIndex][index]+" upgraded to "+(level+1)+"/5.");
    Vibration.vibrate([35,55,80]);
    levelCheck();
  }
  function doRaid(useShield){
    const vault=target||{name:"Rival Vault",coins:900+g.level*180,shield:Math.random()<.48};
    if(useShield&&g.shields<=0){setNotice("No shields available.");return;}
    const success=vault.shield ? useShield : Math.random()<.78;
    const loot=success?Math.round(vault.coins*(1+ownedCards(g).filter(c=>c.bonus.includes("raid")).reduce((s,c)=>s+c.value/100,0))):Math.round(vault.coins*.18);
    setG(o=>({...o,coins:o.coins+loot,raids:o.raids+1,shields:useShield?Math.max(0,o.shields-1):o.shields,xp:o.xp+(success?24:8)}));
    addMission("raid");
    setTarget(null);setChoice(null);
    setNotice(success?"Raid complete • "+money(loot)+" coins extracted.":"Raid defended • "+money(loot)+" coins recovered.");
    Vibration.vibrate(success?[50,70,120]:[120,40,40]);
    levelCheck();
  }
  function doAttack(){
    const damage=1+Math.floor(Math.random()*3);
    const loot=240+damage*140+g.level*35;
    setG(o=>({...o,coins:o.coins+loot,attacks:o.attacks+1,xp:o.xp+14}));
    setChoice(null);setNotice("Attack landed • "+money(loot)+" coins recovered.");
    Vibration.vibrate([30,30,90]);
    levelCheck();
  }
  function resolveEvent(risk){
    const mult=rewardMultiplier(g);
    const success=risk?Math.random()<.62:true;
    const coins=Math.round((risk?(success?620:40):220)*mult);
    setG(o=>({...o,coins:o.coins+coins,xp:o.xp+(success?(risk?22:8):4),keys:o.keys+(success&&risk?1:0)}));
    setChoice(null);setNotice(risk?(success?"Risk event paid off • rare key recovered.":"Risk event failed • small salvage recovered."):"Safe route completed.");
    Vibration.vibrate(risk?[45,60,100]:30);levelCheck();
  }
  function openChest(){
    if(g.chests<=0||g.keys<=0){setNotice("You need a chest and a key.");return;}
    const pool=shuffleCopy(CARD_POOL.filter(c=>!hasCard(g,c.id)));
    const rare=pool.length?pool[Math.floor(Math.random()*Math.min(pool.length,6))]:null;
    if(rare){
      setG(o=>({...o,chests:o.chests-1,keys:o.keys-1,coins:o.coins+480,cards:[...o.cards,rare.id],xp:o.xp+28}));
      addMission("card");
      setChoice(null);setNotice("Chest opened • "+rare.name+" • "+rare.rarity+".");Vibration.vibrate([30,60,100]);
    }else{
      setG(o=>({...o,chests:o.chests-1,keys:o.keys-1,coins:o.coins+1200,xp:o.xp+18}));
      setChoice(null);setNotice("Duplicate vault cleared • +1200 coins.");Vibration.vibrate([30,60,80]);
    }
  }
  function revealCard(){
    const missing=CARD_POOL.filter(c=>!hasCard(g,c.id));
    if(!missing.length){setNotice("Collection complete.");return;}
    const card=shuffleCopy(missing)[0];
    setG(o=>({...o,cards:[...o.cards,card.id],coins:o.coins+260,xp:o.xp+20}));
    addMission("card");setChoice(null);setNotice("Card revealed • "+card.name+".");Vibration.vibrate([35,55,80]);levelCheck();
  }
  function unlockWorld(){
    const next=g.world+1;
    if(next>=WORLDS.length)return;
    if(g.stars<WORLDS[next].threshold){setNotice("Need "+WORLDS[next].threshold+" stars to unlock "+WORLDS[next].name+".");return;}
    setG(o=>({...o,world:next,pos:0,coins:o.coins+1200,energy:Math.min(energyCap(o),o.energy+2),xp:o.xp+30}));
    addMission("world");setTab("WORLD");setNotice(WORLDS[next].name+" unlocked.");Vibration.vibrate([50,70,120]);levelCheck();
  }
  function claimMission(m){
    if(g.claimedMissions.includes(m.id)||m.progress<m.goal)return;
    let n={...g,claimedMissions:[...g.claimedMissions,m.id]};
    if(m.id==="roll"){n.energy=clamp(n.energy+2,0,energyCap(n));n.coins+=300;}
    if(m.id==="build"){n.coins+=700;n.stars+=2;}
    if(m.id==="raid"){n.keys+=1;n.coins+=600;}
    if(m.id==="card"){n.coins+=400;n.shields+=1;}
    if(m.id==="world"){n.coins+=1200;n.energy=clamp(n.energy+2,0,energyCap(n));}
    setG(n);setNotice("Mission claimed • "+m.title+".");Vibration.vibrate([30,60,100]);
  }
  function claimDaily(){
    if(g.inboxClaimed){setNotice("Daily reward already claimed today.");return;}
    setG(o=>({...o,inboxClaimed:true,energy:clamp(o.energy+3,0,energyCap(o)),coins:o.coins+420,keys:o.keys+1,streak:o.streak+1}));
    setNotice("Daily expedition claimed • +3 energy • +420 coins • +1 key.");
    Vibration.vibrate([30,50,80]);
  }
  function reset(){
    setG({...DEFAULT,lastSeen:Date.now()});setTab("BOARD");setChoice(null);setNotice("A new expedition begins.");
  }

  const starDots=Array.from({length:24});
  return <SafeAreaView style={styles.root}>
    <StatusBar style="light"/>
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.top}>
        <View><Text style={styles.wordmark}>DALMA</Text><Text style={styles.kicker}>ADVENTURE • GENESIS</Text></View>
        <View style={styles.profile}><Text style={styles.profileText}>{g.level}</Text></View>
      </View>

      {tab==="BOARD"&&<Animated.View style={{transform:[{translateY:rollAnim.interpolate({inputRange:[0,1],outputRange:[0,-3]})},{scale:rollAnim.interpolate({inputRange:[0,.45,1],outputRange:[1,1.018,1]})}]}}>
        <View style={[styles.hero,{borderColor:world.accent+"77"}]}>
          <View style={styles.stars}>{starDots.map((_,i)=><View key={i} style={[styles.star,{left:(i*37)%98+"%",top:(i*53)%82+"%",opacity:.25+(i%4)*.12}]}/>)}</View>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow,{color:world.accent}]}>{world.symbol} WORLD {String(g.world+1).padStart(2,"0")} • {world.name}</Text>
            <Text style={styles.heroTitle}>{world.subtitle.toUpperCase()}</Text>
            <Text style={styles.heroSub}>One DNA. Infinite civilizations.</Text>
            <View style={styles.pillRow}><View style={styles.pill}><Text style={styles.pillText}>{world.lore}</Text></View></View>
          </View>
          <Animated.View style={[styles.orb,{borderColor:world.accent+"88",transform:[{scale:pulse.interpolate({inputRange:[0,1],outputRange:[1,1.08]})}]}]}><View style={[styles.orbCore,{backgroundColor:world.accent}]}/></Animated.View>
          <Animated.View style={{transform:[{translateY:heroFloat.interpolate({inputRange:[0,1],outputRange:[0,-7]})}]}}>
            <View style={styles.dalmaHero}><Image source={require("./assets/dalma-hero.webp")} style={styles.dalmaImage} resizeMode="contain"/><View style={styles.heroBadge}><Text style={styles.heroBadgeText}>DALMA • CANONICAL</Text></View></View>
          </Animated.View>
        </View>

        <View style={styles.statsRow}>
          <Stat icon="⚡" value={g.energy+"/"+energyCap(g)} label="ENERGY"/>
          <Stat icon="◉" value={money(g.coins)} label="COINS"/>
          <Stat icon="⬟" value={g.shields} label="SHIELDS"/>
          <Stat icon="★" value={g.stars} label="STARS"/>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}><View><Text style={styles.smallCaps}>DALMA LEVEL {g.level}</Text><Text style={styles.progressTitle}>Genesis Resonance</Text></View><Text style={[styles.progressValue,{color:world.accent}]}>{pct(xpPct)}</Text></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill,{width:xpPct+"%",backgroundColor:world.accent}]}/></View>
          <Text style={styles.progressHint}>{money(xpNeeded-g.xp)} XP to next level • total buildings {total}</Text>
        </View>

        <SectionTitle title="GENESIS ROUTE" sub="Every roll changes the expedition." right={<View style={styles.counter}><Text style={[styles.counterText,{color:world.accent}]}>{g.pos+1}/{TILE_TYPES.length}</Text></View>}/>
        <View style={styles.boardCard}>
          <View style={styles.diceRow}>
            <View style={styles.die}><Text style={styles.dieFace}>{["⚀","⚁","⚂","⚃","⚄","⚅"][dice[0]-1]}</Text></View>
            <Text style={styles.plus}>+</Text>
            <View style={styles.die}><Text style={styles.dieFace}>{["⚀","⚁","⚂","⚃","⚄","⚅"][dice[1]-1]}</Text></View>
            <View style={styles.diceMeta}><Text style={styles.diceLabel}>NEXT MOVE</Text><Text style={styles.diceValue}>{dice[0]+dice[1]} STEPS</Text></View>
          </View>
          <View style={styles.routeRail}><View style={styles.routeTrack}>{TILE_TYPES.map((_,i)=><View key={i} style={[styles.routeDot,i===g.pos&&styles.routeDotActive,{backgroundColor:i===g.pos?world.accent:"#555A63"}]}/>)}</View><Animated.View style={[styles.routeMarker,{left:progressAnim.interpolate({inputRange:[0,1],outputRange:["1%","99%"]}),backgroundColor:world.accent}]}><View style={styles.routeMarkerCore}/></Animated.View></View>
          <View style={styles.boardGrid}>{TILE_TYPES.map((t,i)=><Tile key={i} type={t} active={i===g.pos}/>)}</View>
          <Animated.View style={{transform:[{scale:pulse.interpolate({inputRange:[0,1],outputRange:[1,1.02]})}]}}>
            <Button onPress={roll} disabled={rolling||g.energy<=0}>{rolling?"DALMA MOVING…":g.energy>0?"ROLL DALMA":"RECHARGE AT MISSIONS"}</Button>
          </Animated.View>
        </View>

        <Text style={styles.notice}>{notice}</Text>

        {choice&&<View style={[styles.choice,{borderColor:world.accent+"77"}]}>
          <Text style={[styles.choiceEyebrow,{color:world.accent}]}>LANDED • {choice.label}</Text>
          {choice.type==="BUILD"&&<><Text style={styles.choiceTitle}>A building site is ready.</Text><Text style={styles.choiceSub}>Turn coins into visible world progress.</Text><Button onPress={()=>{setTab("BUILD");setChoice(null);setBuildWorld(g.world);}}>OPEN BUILDING DISTRICT</Button></>}
          {choice.type==="RAID"&&<><Text style={styles.choiceTitle}>A rival vault is exposed.</Text><Text style={styles.choiceSub}>Read the defense before committing your shield.</Text><Button onPress={()=>{setTab("RAID");setChoice(null);}}>OPEN RAID MAP</Button></>}
          {choice.type==="ATTACK"&&<><Text style={styles.choiceTitle}>A vulnerable structure is visible.</Text><Text style={styles.choiceSub}>Quick strike, guaranteed smaller reward.</Text><Button onPress={doAttack}>ATTACK NOW</Button></>}
          {choice.type==="EVENT"&&<><Text style={styles.choiceTitle}>Risk or secure the route.</Text><Text style={styles.choiceSub}>Higher variance can return keys and extra coins.</Text><View style={styles.choiceRow}><Button secondary onPress={()=>resolveEvent(false)}>SECURE</Button><Button onPress={()=>resolveEvent(true)}>RISK</Button></View></>}
          {choice.type==="CHEST"&&<><Text style={styles.choiceTitle}>Relic chest discovered.</Text><Text style={styles.choiceSub}>Keys turn discovery into collection progress.</Text><Button onPress={openChest}>OPEN CHEST • {g.keys} KEYS</Button></>}
          {choice.type==="CARD"&&<><Text style={styles.choiceTitle}>A card fragment is resonating.</Text><Text style={styles.choiceSub}>Reveal a real collection item and permanent bonus.</Text><Button onPress={revealCard}>REVEAL CARD</Button></>}
        </View>}

        <View style={styles.daily}>
          <View><Text style={styles.dailyEyebrow}>DAILY EXPEDITION</Text><Text style={styles.dailyTitle}>Return to Genesis</Text><Text style={styles.dailySub}>{g.streak} day streak • +3 energy • +420 coins • +1 key</Text></View>
          <Button tiny secondary={g.inboxClaimed} disabled={g.inboxClaimed} onPress={claimDaily}>{g.inboxClaimed?"CLAIMED":"CLAIM"}</Button>
        </View>
      </Animated.View>}

      {tab==="WORLD"&&<View>
        <SectionTitle title="UNIVERSE MAP" sub="Seven civilizations. Each world changes the rules."/>
        {WORLDS.map((w,i)=>{
          const unlocked=g.stars>=w.threshold;
          const current=g.world===i;
          return <Pressable key={w.id} onPress={()=>unlocked?setG(o=>({...o,world:i,pos:0})):setNotice("Need "+w.threshold+" stars to enter "+w.name+".")} style={[styles.worldRow,current&&styles.worldRowCurrent,!unlocked&&styles.worldLocked]}>
            <View style={[styles.worldSymbol,{borderColor:w.accent+"66",backgroundColor:w.accent+"11"}]}><Text style={[styles.worldSymbolText,{color:w.accent}]}>{w.symbol}</Text></View>
            <View style={{flex:1}}><Text style={styles.worldName}>{w.name}</Text><Text style={styles.worldSub}>{w.subtitle}</Text><Text style={styles.worldLore}>{w.lore}</Text></View>
            <Text style={[styles.worldState,{color:w.accent}]}>{unlocked?(current?"ACTIVE":"OPEN"):"★ "+w.threshold}</Text>
          </Pressable>;
        })}
        <View style={styles.unlockCard}>
          <Text style={styles.eyebrow}>NEXT GATE</Text>
          <Text style={styles.choiceTitle}>{nextWorld.name}</Text>
          <Text style={styles.choiceSub}>{g.stars}/{nextWorld.threshold} stars • {canAdvance?"Ready to unlock":"Keep building and completing missions."}</Text>
          <Button onPress={unlockWorld} disabled={!canAdvance||g.world>=WORLDS.length-1}>{g.world>=WORLDS.length-1?"ORIGIN CORE MASTERED":canAdvance?"UNLOCK WORLD":"LOCKED"}</Button>
        </View>
      </View>}

      {tab==="BUILD"&&<View>
        <SectionTitle title="BUILD DISTRICT" sub="Construction changes the civilization, not just a number." right={<View style={styles.counter}><Text style={styles.counterText}>{money(g.coins)} ◉</Text></View>}/>
        <View style={styles.worldTabs}>{WORLDS.slice(0,g.world+1).map((w,i)=><Pressable key={w.id} onPress={()=>setBuildWorld(i)} style={[styles.worldTab,buildWorld===i&&{borderColor:w.accent,backgroundColor:w.accent+"11"}]}><Text style={[styles.worldTabText,buildWorld===i&&{color:w.accent}]}>{w.symbol}</Text></Pressable>)}</View>
        <View style={[styles.civilization,{borderColor:WORLDS[buildWorld].accent+"66"}]}>
          <Text style={[styles.eyebrow,{color:WORLDS[buildWorld].accent}]}>{WORLDS[buildWorld].name}</Text>
          <Text style={styles.civTitle}>{WORLDS[buildWorld].subtitle}</Text>
          <Text style={styles.civLore}>{WORLDS[buildWorld].lore}</Text>
        </View>
        {WORLDS[buildWorld].buildings.map((_,i)=>{
          const level=g.buildings[buildWorld][i];
          const cost=Math.round(((WORLDS[buildWorld].threshold+1)*160+(g.level*55)+(level*180))*(1-buildDiscount(g)));
          return <BuildingCard key={i} worldIndex={buildWorld} index={i} level={level} cost={cost} canBuild={g.coins>=cost} onBuild={()=>doBuild(buildWorld,i)}/>;
        })}
      </View>}

      {tab==="RAID"&&<View>
        <SectionTitle title="RAID MAP" sub="Choose pressure, defenses and loot."/>
        <View style={styles.raidHero}><Text style={styles.eyebrow}>LIVE VAULT BOARD</Text><Text style={styles.choiceTitle}>Three rival vaults are exposed.</Text><Text style={styles.choiceSub}>Shield use converts risk into a stronger extraction.</Text></View>
        {[0,1,2].map(i=>{
          const data={name:["Moon Vault","Crown Mine","Signal Bank"][i],coins:900+g.level*180+i*260,shield:i%2===0};
          return <View key={i} style={styles.vaultRow}><View style={styles.vaultIcon}><Text style={styles.vaultIconText}>{["◐","△","⌁"][i]}</Text></View><View style={{flex:1}}><Text style={styles.worldName}>{data.name}</Text><Text style={styles.worldSub}>{data.shield?"HARD DEFENSE":"OPEN DEFENSE"} • "+money(data.coins)+" coins</Text></View><Button tiny secondary={!data.shield} onPress={()=>{setTarget(data);doRaid(false)}}>RAID</Button>{data.shield?<Button tiny onPress={()=>{setTarget(data);doRaid(true)}} disabled={g.shields<=0}>{g.shields>0?"SHIELD RAID":"NO SHIELD"}</Button>:null}</View>;
        })}
        <View style={styles.infoCard}><Text style={styles.eyebrow}>RAID HISTORY</Text><Text style={styles.bigNumber}>{g.raids}</Text><Text style={styles.worldSub}>completed raids • local persistent progression</Text></View>
      </View>}

      {tab==="COLLECTION"&&<View>
        <SectionTitle title="DALMA COLLECTION" sub={activeCards.length+"/"+CARD_POOL.length+" discoveries • permanent bonuses"}/>
        <View style={styles.collectionHero}><View><Text style={styles.eyebrow}>CANONICAL IDENTITY</Text><Text style={styles.choiceTitle}>The universe changes. DALMA does not.</Text><Text style={styles.choiceSub}>Cards are world mythology, not replacement character skins.</Text></View><Text style={styles.collectionCount}>{activeCards.length}</Text></View>
        {CARD_POOL.map(card=><CardItem key={card.id} card={card} owned={hasCard(g,card.id)} onAdd={revealCard}/>)}
      </View>}

      {tab==="MISSIONS"&&<View>
        <SectionTitle title="MISSION CONTROL" sub="Persistent goals, daily recovery and account progression."/>
        <View style={styles.missionPanel}><Text style={styles.eyebrow}>RECOVERY</Text><Text style={styles.choiceTitle}>{g.energy}/{energyCap(g)} ENERGY</Text><Text style={styles.choiceSub}>While offline, energy recovers at one point per ten minutes, capped by your current capacity.</Text><Button onPress={()=>{setG(o=>({...o,energy:clamp(o.energy+3,0,energyCap(o)),coins:o.coins+250}));setNotice("Recovery mission complete.");}}>COMPLETE RECOVERY • +3 ENERGY • +250</Button></View>
        {missionList.map(m=>{const done=m.progress>=m.goal;const claimed=g.claimedMissions.includes(m.id);return <View key={m.id} style={[styles.missionRow,claimed&&styles.missionClaimed]}><View style={{flex:1}}><Text style={styles.worldName}>{m.title}</Text><Text style={styles.worldSub}>{m.desc}</Text><View style={styles.miniTrack}><View style={[styles.miniFill,{width:Math.min(100,(m.progress/m.goal)*100)+"%"}]}/></View><Text style={styles.missionMeta}>{Math.min(m.progress,m.goal)}/{m.goal} • {m.reward}</Text></View><Button tiny disabled={!done||claimed} secondary={!done||claimed} onPress={()=>claimMission(m)}>{claimed?"CLAIMED":done?"CLAIM":"IN PROGRESS"}</Button></View>;})}
        <View style={styles.accountRow}><Stat icon="⚔" value={g.attacks} label="ATTACKS"/><Stat icon="⚔" value={g.raids} label="RAIDS"/><Stat icon="◆" value={g.chests} label="CHESTS"/><Stat icon="⌕" value={g.keys} label="KEYS"/></View>
        <Pressable onPress={reset}><Text style={styles.reset}>RESET LOCAL EXPEDITION</Text></Pressable>
      </View>}

      <View style={styles.nav}>
        {[["BOARD","⌁"],["WORLD","◈"],["BUILD","⌂"],["RAID","⚔"],["COLLECTION","◆"],["MISSIONS","⚑"]].map(x=><Pressable key={x[0]} onPress={()=>setTab(x[0])} style={[styles.navItem,tab===x[0]&&styles.navItemActive]}><Text style={styles.navIcon}>{x[1]}</Text><Text style={[styles.navText,tab===x[0]&&styles.navTextActive]}>{x[0]}</Text></Pressable>)}
      </View>
      <Text style={styles.footer}>DALMA ADVENTURE • OFFLINE-FIRST • CONTENT-DRIVEN CORE</Text>
    </ScrollView>
  </SafeAreaView>;
}

const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:"#07080B"},
 page:{padding:15,paddingBottom:34},
 top:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:14},
 wordmark:{fontSize:34,fontWeight:"900",letterSpacing:7,color:"#FFF"},
 kicker:{fontSize:9,letterSpacing:2,color:"#BFA45D",marginTop:2,fontWeight:"800"},
 profile:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:"#BFA45D",backgroundColor:"#161209",justifyContent:"center",alignItems:"center"},
 profileText:{fontSize:16,fontWeight:"900",color:"#E1C66F"},
 hero:{height:258,borderRadius:23,borderWidth:1,backgroundColor:"#101116",overflow:"hidden",position:"relative",marginBottom:12},
 stars:{...StyleSheet.absoluteFillObject},
 star:{position:"absolute",width:2,height:2,borderRadius:1,backgroundColor:"#E4D28C"},
 heroCopy:{position:"absolute",left:17,bottom:16,right:76,zIndex:3},
 eyebrow:{fontSize:8,letterSpacing:1.8,color:"#D8B866",fontWeight:"900"},
 heroTitle:{fontSize:29,fontWeight:"900",letterSpacing:1.5,color:"#FFF",marginTop:4,maxWidth:280},
 heroSub:{fontSize:12,color:"#D8D9DD",marginTop:4},
 pillRow:{marginTop:9,maxWidth:265},
 pill:{backgroundColor:"rgba(8,9,12,.72)",borderWidth:1,borderColor:"#30333A",paddingHorizontal:8,paddingVertical:6,borderRadius:8},
 pillText:{fontSize:8,color:"#9297A0",lineHeight:12},
 orb:{position:"absolute",right:24,top:26,width:82,height:82,borderRadius:41,borderWidth:1,justifyContent:"center",alignItems:"center",opacity:.72},
 orbCore:{width:34,height:34,borderRadius:17,opacity:.68},
 dalmaHero:{position:"absolute",right:2,bottom:-8,width:150,height:178,alignItems:"center",justifyContent:"flex-end",zIndex:4},
 dalmaImage:{width:150,height:172},
 heroBadge:{position:"absolute",right:7,bottom:7,paddingHorizontal:7,paddingVertical:4,borderRadius:7,borderWidth:1,borderColor:"#55451E",backgroundColor:"rgba(7,8,11,.88)"},
 heroBadgeText:{fontSize:7,color:"#D8B866",fontWeight:"900",letterSpacing:1},
 statsRow:{flexDirection:"row",marginBottom:12},
 stat:{flex:1,backgroundColor:"#101217",borderWidth:1,borderColor:"#24262D",padding:9,borderRadius:12,flexDirection:"row",alignItems:"center",marginRight:6,minHeight:56},
 statIcon:{fontSize:16,color:"#D8B866",marginRight:5},
 statValue:{fontSize:12,fontWeight:"900",color:"#FFF"},
 statLabel:{fontSize:7,color:"#747A83",letterSpacing:.8,marginTop:1},
 progressCard:{backgroundColor:"#101217",borderWidth:1,borderColor:"#24262D",borderRadius:15,padding:13,marginBottom:14},
 progressHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
 smallCaps:{fontSize:7,letterSpacing:1.4,color:"#737981"},
 progressTitle:{fontSize:14,fontWeight:"900",color:"#EFEFEF",marginTop:3},
 progressValue:{fontSize:19,fontWeight:"900"},
 progressTrack:{height:7,backgroundColor:"#1D2025",borderRadius:4,overflow:"hidden",marginTop:9},
 progressFill:{height:7,borderRadius:4},
 progressHint:{fontSize:8,color:"#666C74",marginTop:7},
 sectionHead:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:9},
 sectionTitle:{fontSize:14,fontWeight:"900",letterSpacing:2,color:"#EFEFEF"},
 sectionSub:{fontSize:9,color:"#676D76",marginTop:2},
 counter:{borderWidth:1,borderColor:"#494021",paddingHorizontal:9,paddingVertical:5,borderRadius:8},
 counterText:{fontSize:8,fontWeight:"900"},
 boardCard:{backgroundColor:"#101217",borderWidth:1,borderColor:"#24262D",borderRadius:16,padding:12},
 diceRow:{flexDirection:"row",justifyContent:"center",alignItems:"center",marginBottom:10},
 die:{width:43,height:43,borderRadius:12,borderWidth:1,borderColor:"#4A3D20",backgroundColor:"#171A20",justifyContent:"center",alignItems:"center"},
 dieFace:{fontSize:25,color:"#F1D67D"},
 plus:{fontSize:17,color:"#666A73",fontWeight:"800",marginHorizontal:6},
 diceMeta:{marginLeft:10},
 diceLabel:{fontSize:7,color:"#6C727B",letterSpacing:1.2,fontWeight:"900"},
 diceValue:{fontSize:12,color:"#FFF",fontWeight:"900",marginTop:2},
 routeRail:{height:18,position:"relative",justifyContent:"center",marginBottom:9},
 routeTrack:{position:"absolute",left:3,right:3,top:8,height:2,backgroundColor:"#2B2F35",flexDirection:"row",justifyContent:"space-between"},
 routeDot:{width:6,height:6,borderRadius:3,marginTop:-2},
 routeDotActive:{transform:[{scale:1.6}]},
 routeMarker:{position:"absolute",top:0,width:16,height:16,borderRadius:8,marginLeft:-8,justifyContent:"center",alignItems:"center"},
 routeMarkerCore:{width:5,height:5,borderRadius:3,backgroundColor:"#0B0C0E"},
 boardGrid:{flexDirection:"row",flexWrap:"wrap",marginBottom:2},
 tile:{width:"23.6%",aspectRatio:1,backgroundColor:"#15181D",borderWidth:1,borderColor:"#292D34",borderRadius:11,justifyContent:"center",alignItems:"center",marginRight:"1.4%",marginBottom:7},
 tileActive:{borderColor:"#D8B866",backgroundColor:"#1B170C"},
 tileIcon:{fontSize:18,color:"#BDA25D"},
 tileIconActive:{color:"#F0D681"},
 tileText:{fontSize:7,color:"#C3C6CB",fontWeight:"900",marginTop:4,letterSpacing:.4},
 primary:{marginTop:9,backgroundColor:"#D8B866",borderRadius:12,padding:14,alignItems:"center"},
 primaryText:{color:"#0B0C0E",fontWeight:"900",fontSize:13,letterSpacing:1.1},
 secondary:{marginTop:9,backgroundColor:"#17191E",borderWidth:1,borderColor:"#373A41",borderRadius:11,padding:12,alignItems:"center"},
 secondaryText:{color:"#E6E7E9",fontWeight:"900",fontSize:9,letterSpacing:1},
 tinyButton:{paddingVertical:10,paddingHorizontal:10,marginTop:4,minWidth:74},
 disabled:{opacity:.43},
 pressed:{opacity:.75,transform:[{scale:.98}]},
 notice:{textAlign:"center",fontSize:9,color:"#878C95",marginVertical:9,minHeight:13},
 choice:{backgroundColor:"#15120B",borderWidth:1,padding:13,borderRadius:14,marginBottom:10},
 choiceEyebrow:{fontSize:8,letterSpacing:1.5,fontWeight:"900"},
 choiceTitle:{fontSize:17,color:"#FFF",fontWeight:"900",marginTop:4},
 choiceSub:{fontSize:9,color:"#818790",marginTop:4,lineHeight:14},
 choiceRow:{flexDirection:"row"},
 daily:{backgroundColor:"#111218",borderWidth:1,borderColor:"#292C32",borderRadius:14,padding:12,marginTop:6,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
 dailyEyebrow:{fontSize:7,color:"#D8B866",fontWeight:"900",letterSpacing:1.2},
 dailyTitle:{fontSize:13,color:"#FFF",fontWeight:"900",marginTop:3},
 dailySub:{fontSize:8,color:"#737982",marginTop:4,maxWidth:245,lineHeight:12},
 worldRow:{flexDirection:"row",alignItems:"center",backgroundColor:"#101217",borderWidth:1,borderColor:"#24262D",borderRadius:14,padding:11,marginBottom:8},
 worldRowCurrent:{borderColor:"#5D4A21",backgroundColor:"#15120C"},
 worldLocked:{opacity:.53},
 worldSymbol:{width:48,height:48,borderRadius:13,borderWidth:1,justifyContent:"center",alignItems:"center",marginRight:10},
 worldSymbolText:{fontSize:22},
 worldName:{fontSize:12,fontWeight:"900",color:"#EFEFEF",letterSpacing:.5},
 worldSub:{fontSize:9,color:"#777D86",marginTop:3},
 worldLore:{fontSize:8,color:"#616771",marginTop:5,lineHeight:12},
 worldState:{fontSize:7,fontWeight:"900",letterSpacing:1.2,marginLeft:8},
 unlockCard:{backgroundColor:"#131109",borderWidth:1,borderColor:"#4D4021",borderRadius:15,padding:13,marginTop:3},
 worldTabs:{flexDirection:"row",marginBottom:10},
 worldTab:{width:42,height:42,borderRadius:11,borderWidth:1,borderColor:"#2B2E35",backgroundColor:"#101217",justifyContent:"center",alignItems:"center",marginRight:7},
 worldTabText:{fontSize:19,color:"#777C84"},
 civilization:{backgroundColor:"#111218",borderWidth:1,borderRadius:15,padding:13,marginBottom:10},
 civTitle:{fontSize:19,color:"#FFF",fontWeight:"900",marginTop:3},
 civLore:{fontSize:9,color:"#747A83",lineHeight:14,marginTop:5},
 building:{flexDirection:"row",backgroundColor:"#101217",borderWidth:1,borderColor:"#24262D",borderRadius:15,padding:10,marginBottom:8},
 buildingArt:{width:82,height:86,borderWidth:1,borderRadius:13,backgroundColor:"#15181D",justifyContent:"center",alignItems:"center",position:"relative",overflow:"hidden"},
 block:{borderRadius:8,position:"absolute",bottom:12,right:17},
 blockSmall:{borderRadius:5,position:"absolute",bottom:20,left:16},
 buildingLevel:{position:"absolute",bottom:6,right:7,fontSize:8,fontWeight:"900"},
 buildingBody:{flex:1,paddingLeft:10},
 buildingName:{fontSize:12,color:"#EFEFEF",fontWeight:"900"},
 buildingMeta:{fontSize:8,color:"#737981",letterSpacing:.8,marginTop:3},
 miniTrack:{height:5,backgroundColor:"#1D2025",borderRadius:3,overflow:"hidden",marginTop:7},
 miniFill:{height:5,borderRadius:3},
 mastered:{fontSize:8,fontWeight:"900",letterSpacing:1.3,marginTop:10},
 raidHero:{backgroundColor:"#15120D",borderWidth:1,borderColor:"#5A4720",borderRadius:15,padding:14,marginBottom:10},
 vaultRow:{flexDirection:"row",alignItems:"center",backgroundColor:"#101217",borderWidth:1,borderColor:"#24262D",borderRadius:14,padding:10,marginBottom:8},
 vaultIcon:{width:45,height:45,borderRadius:12,backgroundColor:"#171A20",justifyContent:"center",alignItems:"center",marginRight:9},
 vaultIconText:{fontSize:21,color:"#D8B866"},
 infoCard:{backgroundColor:"#101217",borderWidth:1,borderColor:"#24262D",borderRadius:14,padding:13,marginTop:5},
 bigNumber:{fontSize:34,fontWeight:"900",color:"#FFF",marginTop:4},
 collectionHero:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:"#15120C",borderWidth:1,borderColor:"#56451F",borderRadius:15,padding:13,marginBottom:10},
 collectionCount:{fontSize:34,fontWeight:"900",color:"#D8B866"},
 collectionCard:{flexDirection:"row",alignItems:"center",backgroundColor:"#101217",borderWidth:1,borderColor:"#24262D",borderRadius:14,padding:9,marginBottom:7},
 collectionOwned:{borderColor:"#4C4024"},
 cardSymbol:{width:50,height:58,borderRadius:11,backgroundColor:"#171A20",borderWidth:1,borderColor:"#3B3527",justifyContent:"center",alignItems:"center",marginRight:9},
 cardSymbolText:{fontSize:22,color:"#D8B866"},
 cardNameRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
 cardName:{fontSize:11,fontWeight:"900",color:"#EFEFEF",flexShrink:1},
 rarity:{fontSize:7,color:"#D8B866",fontWeight:"900",letterSpacing:.8,marginLeft:4},
 cardSet:{fontSize:7,color:"#70757E",letterSpacing:1,marginTop:3},
 cardBonus:{fontSize:8,color:"#969BA2",marginTop:4},
 ownedText:{fontSize:7,color:"#D8B866",fontWeight:"900",letterSpacing:1,marginLeft:5},
 collectionCountText:{fontSize:9,color:"#777C84"},
 missionPanel:{backgroundColor:"#15120C",borderWidth:1,borderColor:"#53421F",borderRadius:15,padding:13,marginBottom:10},
 missionRow:{flexDirection:"row",alignItems:"center",backgroundColor:"#101217",borderWidth:1,borderColor:"#24262D",borderRadius:14,padding:11,marginBottom:8},
 missionClaimed:{opacity:.55},
 missionMeta:{fontSize:8,color:"#737981",marginTop:5},
 accountRow:{flexDirection:"row",marginTop:4},
 reset:{fontSize:8,color:"#555B64",letterSpacing:1.4,fontWeight:"900",textAlign:"center",marginTop:18,marginBottom:4},
 nav:{flexDirection:"row",justifyContent:"space-between",borderTopWidth:1,borderTopColor:"#24262D",marginTop:17,paddingTop:11},
 navItem:{alignItems:"center",paddingHorizontal:2},
 navItemActive:{opacity:1},
 navIcon:{fontSize:15,color:"#777C84"},
 navText:{fontSize:6.5,color:"#626872",letterSpacing:.6,fontWeight:"900",marginTop:2},
 navTextActive:{color:"#D8B866"},
 footer:{textAlign:"center",fontSize:6.5,color:"#3B3F46",marginTop:10,letterSpacing:.8}
});