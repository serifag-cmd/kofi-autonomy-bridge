import React, {useMemo, useState} from 'react';
import {SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {StatusBar} from 'expo-status-bar';

const {width}=Dimensions.get('window');
const BOARD=[
  {type:'start',label:'DALMA'}, {type:'coins',value:80,label:'+80'}, {type:'build',value:1,label:'BUILD'},
  {type:'energy',value:2,label:'+2'}, {type:'coins',value:140,label:'+140'}, {type:'chest',label:'CHEST'},
  {type:'coins',value:220,label:'+220'}, {type:'build',value:1,label:'BUILD'}, {type:'energy',value:3,label:'+3'},
  {type:'raid',label:'RAID'}, {type:'coins',value:350,label:'+350'}, {type:'chest',label:'CHEST'}
];
const INITIAL={energy:8,coins:1250,level:1,position:0,buildings:[0,0,0],collection:1,streak:0};

function Tile({tile,active}){
  const glyph=tile.type==='coins'?'◉':tile.type==='build'?'⌂':tile.type==='energy'?'⚡':tile.type==='chest'?'◆':tile.type==='raid'?'⚔':'●';
  return <View style={[styles.tile,active&&styles.tileActive]}><Text style={styles.tileGlyph}>{glyph}</Text><Text style={styles.tileText}>{tile.label}</Text></View>;
}
function Stat({icon,value,label}){return <View style={styles.stat}><Text style={styles.statIcon}>{icon}</Text><View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View></View>}

export default function App(){
 const [g,setG]=useState(INITIAL);
 const [message,setMessage]=useState('Gira para avanzar por el mundo de DALMA.');
 const [tab,setTab]=useState('board');
 const canSpin=g.energy>0;
 const next=useMemo(()=>BOARD[(g.position+1)%BOARD.length],[g.position]);

 const spin=()=>{
  if(!canSpin){setMessage('Sin energía. Completa una misión para recuperar el giro.');return;}
  const steps=1+Math.floor(Math.random()*6);
  const pos=(g.position+steps)%BOARD.length;
  const tile=BOARD[pos];
  let coins=g.coins, energy=Math.max(0,g.energy-1), level=g.level, collection=g.collection;
  const buildings=[...g.buildings];
  if(tile.type==='coins') coins+=tile.value;
  if(tile.type==='energy') energy+=tile.value;
  if(tile.type==='build'){const i=buildings.findIndex(x=>x<3);if(i>=0){buildings[i]++;coins+=150*buildings[i];}}
  if(tile.type==='chest'){coins+=300+level*50;collection+=1;}
  if(tile.type==='raid'){coins+=500+level*75;}
  let msg=`DALMA avanzó ${steps} casillas.`;
  if(tile.type==='raid') msg='¡RAID DALMA! Has recuperado un tesoro rival.';
  else if(tile.type==='build') msg='Nueva mejora construida. Tu mundo crece.';
  else if(tile.type==='chest') msg='Cofre legendario abierto: monedas + colección.';
  if(pos===0){level++;energy+=2;msg='¡Vuelta completa! Nivel y energía aumentados.';}
  setG({...g,position:pos,coins,energy,level,collection,buildings,streak:g.streak+1});
  setMessage(msg);
 };
 const mission=()=>{setG({...g,energy:Math.min(12,g.energy+3),coins:g.coins+200});setMessage('Misión completada: +3 energía y +200 monedas.');};
 const reset=()=>{setG(INITIAL);setMessage('Partida reiniciada.');};

 return <SafeAreaView style={styles.root}>
  <StatusBar style="light"/>
  <ScrollView contentContainerStyle={styles.container}>
   <View style={styles.header}>
    <View><Text style={styles.brand}>DALMA</Text><Text style={styles.sub}>ADVENTURE // GENESIS WORLD</Text></View>
    <View style={styles.level}><Text style={styles.levelSmall}>LEVEL</Text><Text style={styles.levelBig}>{g.level}</Text></View>
   </View>

   <View style={styles.stats}>
    <Stat icon="⚡" value={g.energy} label="ENERGY"/>
    <Stat icon="◉" value={g.coins.toLocaleString()} label="COINS"/>
    <Stat icon="◆" value={g.collection} label="RELICS"/>
   </View>

   {tab==='board'&&<>
    <View style={styles.hero}>
      <View style={styles.heroGlow}/><Text style={styles.heroEyebrow}>THE FIRST CANINE LEGEND</Text>
      <Text style={styles.heroTitle}>DALMA</Text>
      <Text style={styles.heroCopy}>Un ADN. Un mundo. Infinitas aventuras.</Text>
      <View style={styles.heroMark}><Text style={styles.heroMarkText}>●</Text></View>
    </View>

    <View style={styles.card}>
     <View style={styles.rowBetween}><Text style={styles.cardTitle}>GENESIS BOARD</Text><Text style={styles.counter}>{g.position+1}/{BOARD.length}</Text></View>
     <View style={styles.board}>{BOARD.map((t,i)=><Tile key={i} tile={t} active={i===g.position}/>)}</View>
     <Text style={styles.message}>{message}</Text>
     <Pressable onPress={spin} style={[styles.spin,!canSpin&&styles.disabled]}>
       <Text style={styles.spinText}>{canSpin?'GIRAR':'SIN ENERGÍA'}</Text>
       <Text style={styles.spinSub}>{canSpin?`SIGUIENTE: ${next.label}`:'Completa una misión'}</Text>
     </Pressable>
    </View>

    <View style={styles.grid}>
      <View style={styles.smallCard}><Text style={styles.smallTitle}>WORLD</Text><Text style={styles.bigNum}>{g.buildings.reduce((a,b)=>a+b,0)}/9</Text><Text style={styles.smallCopy}>districts built</Text></View>
      <View style={styles.smallCard}><Text style={styles.smallTitle}>STREAK</Text><Text style={styles.bigNum}>{g.streak}</Text><Text style={styles.smallCopy}>moves</Text></View>
    </View>
   </>}

   {tab==='world'&&<View style={styles.card}>
    <Text style={styles.cardTitle}>DALMA WORLD</Text>
    <Text style={styles.message}>Construye los tres primeros distritos de Genesis Island. Cada mejora aumenta las recompensas.</Text>
    {['Genesis Gate','Golden Relic','Neon District'].map((n,i)=><View key={n} style={styles.buildRow}>
      <View><Text style={styles.buildName}>{n}</Text><Text style={styles.smallCopy}>Level {g.buildings[i]}/3</Text></View>
      <Pressable onPress={()=>{if(g.coins>=300&&g.buildings[i]<3){const b=[...g.buildings];b[i]++;setG({...g,coins:g.coins-300,buildings:b});setMessage(`${n} mejorado.`)}else setMessage(g.buildings[i]>=3?'Edificio al máximo.':'Necesitas 300 monedas.')}} style={styles.upgrade}><Text style={styles.upgradeText}>300 ◉</Text></Pressable>
    </View>)}
    <Pressable onPress={reset} style={styles.reset}><Text style={styles.resetText}>RESET LOCAL</Text></Pressable>
   </View>}

   {tab==='missions'&&<View style={styles.card}>
    <Text style={styles.cardTitle}>MISSIONS</Text>
    <View style={styles.mission}><Text style={styles.buildName}>First Expedition</Text><Text style={styles.smallCopy}>Recarga tu energía para continuar explorando.</Text><Text style={styles.reward}>+3 ⚡  +200 ◉</Text><Pressable onPress={mission} style={styles.missionButton}><Text style={styles.upgradeText}>CLAIM</Text></Pressable></View>
    <View style={styles.mission}><Text style={styles.buildName}>World Builder</Text><Text style={styles.smallCopy}>Build a district</Text><Text style={styles.reward}>+1 ◆</Text><Pressable onPress={()=>setMessage('Build a district on the World tab.')} style={styles.missionButton}><Text style={styles.upgradeText}>GO</Text></Pressable></View>
   </View>}

   <View style={styles.nav}>
    <Pressable onPress={()=>setTab('board')}><Text style={[styles.navText,tab==='board'&&styles.navActive]}>BOARD</Text></Pressable>
    <Pressable onPress={()=>setTab('world')}><Text style={[styles.navText,tab==='world'&&styles.navActive]}>WORLD</Text></Pressable>
    <Pressable onPress={()=>setTab('missions')}><Text style={[styles.navText,tab==='missions'&&styles.navActive]}>MISSIONS</Text></Pressable>
   </View>
   <Text style={styles.footer}>DALMA ADVENTURE v0.1 • OFFLINE CORE • ORIGINAL GAME SYSTEM</Text>
  </ScrollView>
 </SafeAreaView>
}

const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:'#070707'},
 container:{padding:16,paddingBottom:40},
 header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},
 brand:{fontSize:31,fontWeight:'900',letterSpacing:5,color:'#f6f0df'},
 sub:{fontSize:9,letterSpacing:2,color:'#b99b55',marginTop:2},
 level:{borderWidth:1,borderColor:'#6d5522',paddingHorizontal:12,paddingVertical:5,alignItems:'center'},
 levelSmall:{fontSize:8,color:'#b99b55',letterSpacing:2},
 levelBig:{fontSize:20,color:'#f6f0df',fontWeight:'800'},
 stats:{flexDirection:'row',gap:8,marginBottom:14},
 stat:{flex:1,backgroundColor:'#111',borderWidth:1,borderColor:'#252525',padding:10,flexDirection:'row',alignItems:'center',gap:8},
 statIcon:{fontSize:18,color:'#d8b566'},
 statValue:{fontSize:15,color:'#fff',fontWeight:'800'},
 statLabel:{fontSize:7,color:'#777',letterSpacing:1.2},
 hero:{height:250,borderRadius:18,overflow:'hidden',borderWidth:1,borderColor:'#5a461e',marginBottom:14,backgroundColor:'#111',justifyContent:'flex-end',padding:18},
 heroGlow:{position:'absolute',width:220,height:220,borderRadius:110,right:-45,top:-50,backgroundColor:'#2b210f',opacity:.9},
 heroEyebrow:{fontSize:8,letterSpacing:2,color:'#d7b86a'},
 heroTitle:{fontSize:40,color:'#fff',fontWeight:'900',letterSpacing:5,marginTop:4},
 heroCopy:{fontSize:12,color:'#eee',marginTop:1},
 heroMark:{position:'absolute',right:22,bottom:22,width:74,height:74,borderRadius:37,borderWidth:1,borderColor:'#6d5522',alignItems:'center',justifyContent:'center'},
 heroMarkText:{fontSize:46,color:'#c7a34f'},
 card:{backgroundColor:'#101010',borderWidth:1,borderColor:'#292929',borderRadius:18,padding:16,marginBottom:12},
 rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 cardTitle:{fontSize:14,fontWeight:'900',letterSpacing:2,color:'#f6f0df'},
 counter:{fontSize:10,color:'#a88a4d'},
 board:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:14},
 tile:{width:(width-64-24)/4,aspectRatio:1,backgroundColor:'#151515',borderWidth:1,borderColor:'#2b2b2b',borderRadius:12,alignItems:'center',justifyContent:'center'},
 tileActive:{borderColor:'#d3ae58',backgroundColor:'#1d180f',transform:[{scale:1.04}]},
 tileGlyph:{fontSize:24,color:'#d3ae58'},
 tileText:{fontSize:8,color:'#cfc7b3',fontWeight:'800',marginTop:5},
 message:{fontSize:12,color:'#aaa',lineHeight:18,marginTop:12},
 spin:{marginTop:14,backgroundColor:'#c7a34f',paddingVertical:14,borderRadius:14,alignItems:'center'},
 disabled:{opacity:.4},
 spinText:{fontSize:18,fontWeight:'900',letterSpacing:2,color:'#080808'},
 spinSub:{fontSize:9,color:'#31250d',marginTop:2},
 grid:{flexDirection:'row',gap:10,marginBottom:12},
 smallCard:{flex:1,backgroundColor:'#101010',borderRadius:16,borderWidth:1,borderColor:'#292929',padding:15},
 smallTitle:{fontSize:8,letterSpacing:2,color:'#9b8350'},
 bigNum:{fontSize:28,color:'#fff',fontWeight:'900',marginTop:4},
 smallCopy:{fontSize:10,color:'#777',marginTop:2},
 buildRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#252525'},
 buildName:{fontSize:14,color:'#f3eee3',fontWeight:'800'},
 upgrade:{paddingHorizontal:12,paddingVertical:9,borderRadius:10,backgroundColor:'#c7a34f'},
 upgradeText:{fontSize:9,fontWeight:'900',letterSpacing:1,color:'#080808'},
 reset:{marginTop:18,borderWidth:1,borderColor:'#333',padding:12,alignItems:'center',borderRadius:10},
 resetText:{fontSize:9,color:'#777',letterSpacing:2},
 mission:{padding:15,borderRadius:14,borderWidth:1,borderColor:'#2b2b2b',marginTop:12},
 reward:{fontSize:11,color:'#c7a34f',marginTop:8},
 missionButton:{marginTop:12,alignSelf:'flex-start',paddingHorizontal:14,paddingVertical:9,backgroundColor:'#c7a34f',borderRadius:9},
 nav:{flexDirection:'row',justifyContent:'space-around',paddingVertical:16,borderTopWidth:1,borderTopColor:'#222',marginTop:4},
 navText:{fontSize:9,letterSpacing:1.5,color:'#666',fontWeight:'800'},
 navActive:{color:'#d3ae58'},
 footer:{textAlign:'center',fontSize:8,color:'#444',letterSpacing:1,marginTop:8}
});
