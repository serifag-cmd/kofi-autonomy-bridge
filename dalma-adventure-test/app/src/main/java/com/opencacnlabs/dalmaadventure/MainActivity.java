package com.opencacnlabs.dalmaadventure;

import android.app.Activity;
import android.os.Bundle;
import android.content.SharedPreferences;
import android.graphics.*;
import android.view.*;
import java.util.Random;

public class MainActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(7,7,7));
        getWindow().setNavigationBarColor(Color.rgb(7,7,7));
        setContentView(new GameView());
    }

    final class GameView extends View {
        final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        final Random random = new Random();
        final SharedPreferences save = getSharedPreferences("dalma_test", MODE_PRIVATE);

        int energy, coins, level, position, relics, streak, shields, attacks, world, tab;
        int[] buildings = new int[3];
        final String[] worlds = {"GENESIS ISLAND","ASTRAL WILDS","ABYSSAL OCEAN","VOLCANIC CROWN","NEON NEXUS","SHADOW DIMENSION","ORIGIN CORE"};
        final String[][] zones = {{"Genesis Gate","Golden Relic","Canine Sanctuary"},{"Sky Garden","Star Forge","Celestial Harbor"},{"Pearl Trench","Tide Temple","Leviathan Vault"},{"Basalt Citadel","Lava Observatory","Obsidian Throne"},{"Neon Market","Quantum Arcade","Signal Spire"},{"Void Forest","Mirror Citadel","Dark Archive"},{"Origin Garden","Genesis Engine","Eternal Gate"}};
        int[] cards = new int[9];
        int actionMode = 0;
        int raidChoice = -1;
        boolean dailyClaimed;
        String message;

        final String[] tiles = {"START","+120","SHIELD","BUILD","+200","ATTACK","+300","CHEST","CARD","RAID","+450","SHIELD","+250","ATTACK","CARD","BUILD","RAID","+600","CHEST","START"};
        final int[] type = {0,1,2,3,1,5,1,4,6,7,1,2,1,5,6,3,7,1,4,0};

        GameView() {
            super(MainActivity.this);
            load();
            setFocusable(true);
        }

        void load() {
            energy = save.getInt("energy", 8);
            coins = save.getInt("coins", 1250);
            level = save.getInt("level", 1);
            position = save.getInt("position", 0);
            relics = save.getInt("relics", 1);
            streak = save.getInt("streak", 0);
            shields = save.getInt("shields", 1);
            attacks = save.getInt("attacks", 0);
            world = save.getInt("world", 1);
            tab = 0;
            dailyClaimed = save.getBoolean("daily", false);
            for (int i=0;i<3;i++) buildings[i] = save.getInt("b"+i, 0);
            for (int i=0;i<9;i++) cards[i] = save.getInt("c"+i, 0);
            message = "Gira para avanzar por el mundo de DALMA.";
        }

        void persist() {
            SharedPreferences.Editor e = save.edit();
            e.putInt("energy",energy).putInt("coins",coins).putInt("level",level)
             .putInt("position",position).putInt("relics",relics).putInt("streak",streak)
             .putInt("shields",shields).putInt("attacks",attacks).putInt("world",world)
             .putBoolean("daily",dailyClaimed);
            for (int i=0;i<3;i++) e.putInt("b"+i,buildings[i]);
            for (int i=0;i<9;i++) e.putInt("c"+i,cards[i]);
            e.apply();
        }

        void reset() {
            save.edit().clear().apply();
            load();
            invalidate();
        }

        void fill(Canvas c,int color,float l,float t,float r,float b,float rad){
            p.setStyle(Paint.Style.FILL); p.setColor(color); c.drawRoundRect(l,t,r,b,rad,rad,p);
        }
        void stroke(Canvas c,int color,float l,float t,float r,float b,float rad){
            p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(2); p.setColor(color); c.drawRoundRect(l,t,r,b,rad,rad,p); p.setStyle(Paint.Style.FILL);
        }
        void text(Canvas c,String s,float x,float y,float size,int color,boolean bold){
            p.setTextSize(size); p.setColor(color);
            p.setTypeface(Typeface.create(Typeface.DEFAULT,bold?Typeface.BOLD:Typeface.NORMAL));
            c.drawText(s,x,y,p);
        }
        void center(Canvas c,String s,float x,float y,float size,int color,boolean bold){
            p.setTextSize(size);
            p.setTypeface(Typeface.create(Typeface.DEFAULT,bold?Typeface.BOLD:Typeface.NORMAL));
            text(c,s,x-p.measureText(s)/2,y,size,color,bold);
        }
        void stat(Canvas c,float x,float y,float width,String value,String label,String icon){
            fill(c,Color.rgb(15,15,15),x,y,x+width,y+50,14);
            stroke(c,Color.rgb(40,40,40),x,y,x+width,y+50,14);
            text(c,icon,x+9,y+23,16,Color.rgb(215,178,86),false);
            text(c,value,x+31,y+22,14,Color.WHITE,true);
            text(c,label,x+31,y+39,7,Color.rgb(125,120,110),true);
        }
        void nav(Canvas c,String s,float x,float y,boolean active,int gold){
            center(c,s,x,y+27,9,active?gold:Color.rgb(90,90,86),true);
        }

        @Override protected void onDraw(Canvas c){
            float w=getWidth(), h=getHeight();
            c.drawColor(Color.rgb(7,7,7));
            int gold=Color.rgb(199,163,79), cream=Color.rgb(246,240,223), muted=Color.rgb(150,142,128), panel=Color.rgb(16,16,16);

            text(c,"DALMA",20,36,28,cream,true);
            text(c,"ADVENTURE // GENESIS WORLD",21,54,8,gold,false);
            fill(c,Color.rgb(12,12,12),w-86,13,w-18,61,14);
            stroke(c,Color.rgb(95,73,32),w-86,13,w-18,61,14);
            center(c,"WORLD "+world,w-52,29,8,gold,true);
            center(c,"LV "+level,w-52,50,17,cream,true);

            float sy=70, sw=(w-48)/4f;
            stat(c,10,sy,sw,""+energy,"ENERGY","⚡");
            stat(c,16+sw,sy,sw,""+coins,"COINS","◉");
            stat(c,22+2*sw,sy,sw,""+shields,"SHIELD","◆");
            stat(c,28+3*sw,sy,sw,""+attacks,"ATTACK","⚔");

            if(tab==0) board(c,w,h,gold,cream,muted,panel);
            else if(tab==1) world(c,w,h,gold,cream,muted,panel);
            else if(tab==2) collection(c,w,h,gold,cream,muted,panel);
            else missions(c,w,h,gold,cream,muted,panel);

            if(actionMode>0) actionOverlay(c,w,h,gold,cream,muted);
            float ny=h-57;
            p.setColor(Color.rgb(18,18,18)); c.drawRect(0,ny,w,h,p);
            nav(c,"BOARD",w*.125f,ny,tab==0,gold);
            nav(c,"WORLD",w*.375f,ny,tab==1,gold);
            nav(c,"CARDS",w*.625f,ny,tab==2,gold);
            nav(c,"MISSIONS",w*.875f,ny,tab==3,gold);
        }

        void board(Canvas c,float w,float h,int gold,int cream,int muted,int panel){
            float right=w-12, heroTop=136, heroBot=258;
            fill(c,Color.rgb(25,21,12),12,heroTop,right,heroBot,20);
            stroke(c,Color.rgb(88,68,28),12,heroTop,right,heroBot,20);
            text(c,worlds[Math.min(worlds.length-1,world-1)],28,heroTop+29,9,gold,true);
            text(c,"THE FIRST CANINE LEGEND",28,heroTop+58,11,cream,true);
            text(c,"Explore • Build • Raid • Collect • Evolve",28,heroTop+82,12,Color.WHITE,false);

            if(!dailyClaimed){
                fill(c,gold,right-128,heroTop+24,right-26,heroTop+67,11);
                center(c,"DAILY +500",right-77,heroTop+50,9,Color.rgb(8,8,8),true);
            }

            float top=270;
            fill(c,panel,12,top,right,h-95,18); stroke(c,Color.rgb(40,40,40),12,top,right,h-95,18);
            text(c,"GENESIS BOARD",27,top+25,14,cream,true);
            text(c,""+(position+1)+"/"+tiles.length,right-50,top+25,10,gold,false);

            float gap=7, gridW=right-28, tileW=(gridW-gap*3)/4f, tileH=45;
            for(int i=0;i<tiles.length;i++){
                int row=i/4, col=i%4;
                float x=20+col*(tileW+gap), y=top+38+row*(tileH+gap);
                int bg=(i==position)?Color.rgb(39,29,13):Color.rgb(22,22,22);
                int bd=(i==position)?gold:Color.rgb(42,42,42);
                fill(c,bg,x,y,x+tileW,y+tileH,11); stroke(c,bd,x,y,x+tileW,y+tileH,11);
                String glyph=type[i]==1?"◉":type[i]==2?"◆":type[i]==3?"⌂":type[i]==4?"■":type[i]==5?"⚔":type[i]==6?"★":type[i]==7?"✦":"●";
                center(c,glyph,x+tileW/2,y+19,16,gold,true);
                center(c,tiles[i],x+tileW/2,y+34,7,cream,true);
            }

            float my=top+38+5*(tileH+gap)+10;
            text(c,message,24,my,10,muted,false);

            float by=h-119;
            fill(c,energy>0?gold:Color.rgb(78,73,64),12,by,right,by+46,15);
            center(c,energy>0?"GIRAR · 1–6":"SIN ENERGÍA",w/2,by+21,17,Color.rgb(8,8,8),true);
            center(c,energy>0?"Cada tirada puede dar monedas, escudos, ataques, cartas o raid":"Reclama una misión para recuperar energía",w/2,by+36,8,Color.rgb(50,40,18),true);
        }

        void world(Canvas c,float w,float h,int gold,int cream,int muted,int panel){
            float right=w-12, top=136;
            fill(c,panel,12,top,right,h-95,18); stroke(c,Color.rgb(40,40,40),12,top,right,h-95,18);
            text(c,"DALMA WORLD",27,top+27,15,cream,true);
            text(c,"Construye las zonas de este mundo para abrir el siguiente universo.",27,top+49,10,muted,false);
            String[] names=zones[Math.min(zones.length-1,world-1)];
            for(int i=0;i<3;i++){
                float y=top+65+i*91;
                fill(c,Color.rgb(22,22,22),23,y,right-23,y+76,14);
                text(c,names[i],36,y+25,14,cream,true);
                text(c,"ZONE LEVEL "+buildings[i]+"/3",36,y+46,9,muted,false);
                int cost=300+(buildings[i]*150);
                fill(c,coins>=cost && buildings[i]<3?gold:Color.rgb(70,68,60),right-110,y+18,right-35,y+56,10);
                center(c,buildings[i]>=3?"DONE":cost+" ◉",right-72,y+42,8,Color.rgb(10,10,10),true);
            }
            if(allBuilt()){
                fill(c,gold,23,top+345,right-23,top+393,14);
                center(c,"DESBLOQUEAR SIGUIENTE MUNDO",w/2,top+375,10,Color.rgb(8,8,8),true);
            }
            text(c,"Shields protect this universe. Attacks open rival actions.",27,h-120,9,muted,false);
            text(c,"Persistent local save • Offline core • Universe progression",27,h-105,8,Color.rgb(82,80,74),false);
        }

        void collection(Canvas c,float w,float h,int gold,int cream,int muted,int panel){
            float right=w-12, top=136;
            fill(c,panel,12,top,right,h-95,18); stroke(c,Color.rgb(40,40,40),12,top,right,h-95,18);
            text(c,"CARD COLLECTION",27,top+27,15,cream,true);
            text(c,"Completa colecciones de cada universo para bonus permanentes.",27,top+49,10,muted,false);
            for(int i=0;i<9;i++){
                int row=i/3,col=i%3;
                float gap=9, cw=(right-42-gap*2)/3f, ch=92;
                float x=21+col*(cw+gap), y=top+63+row*(ch+gap);
                boolean owned=cards[i]>0;
                fill(c,owned?Color.rgb(39,31,14):Color.rgb(21,21,21),x,y,x+cw,y+ch,14);
                stroke(c,owned?gold:Color.rgb(43,43,43),x,y,x+cw,y+ch,14);
                center(c,""+(i+1),x+cw/2,y+30,24,owned?gold:Color.rgb(70,68,62),true);
                center(c,owned?"FOUND":"LOCKED",x+cw/2,y+53,8,cream,true);
                center(c,owned?"x"+cards[i]:"?",x+cw/2,y+72,8,muted,false);
            }
            int sets=completeSets();
            text(c,"SETS COMPLETED: "+sets+"/3",27,h-120,10,gold,true);
            text(c,"Card tiles and chests can reveal new cards.",27,h-105,9,muted,false);
        }

        void missions(Canvas c,float w,float h,int gold,int cream,int muted,int panel){
            float right=w-12, top=136;
            fill(c,panel,12,top,right,h-95,18); stroke(c,Color.rgb(40,40,40),12,top,right,h-95,18);
            text(c,"MISSIONS & REWARDS",27,top+27,15,cream,true);
            mission(c,23,top+57,right-23,"FIRST EXPEDITION","Make 3 moves","+"+(streak>=3?500:200)+" ◉  +2 ⚡",streak>=3,gold,cream,muted);
            mission(c,23,top+151,right-23,"WORLD BUILDER","Build a district","+1 ◆  +1 ⚔",buildCount()>0,gold,cream,muted);
            mission(c,23,top+245,right-23,"CARD HUNTER","Find 3 cards","+1 shield  +1 relic",totalCards()>=3,gold,cream,muted);
            fill(c,Color.rgb(28,28,28),23,h-155,right-23,h-105,12);
            text(c,"RESET TEST DATA",37,h-125,9,Color.rgb(150,145,135),true);
        }

        void mission(Canvas c,float l,float t,float r,String title,String desc,String reward,boolean ready,int gold,int cream,int muted){
            fill(c,Color.rgb(22,22,22),l,t,r,t+76,14);
            text(c,title,l+13,t+22,13,cream,true);
            text(c,desc,l+13,t+42,9,muted,false);
            text(c,reward,l+13,t+61,9,gold,true);
            fill(c,ready?gold:Color.rgb(64,63,57),r-75,t+20,r-13,t+55,10);
            center(c,ready?"CLAIM":"LOCK",r-44,t+42,8,Color.rgb(8,8,8),true);
        }

        void actionOverlay(Canvas c,float w,float h,int gold,int cream,int muted){
            p.setColor(Color.argb(220,0,0,0)); c.drawRect(0,0,w,h,p);
            float l=18,r=w-18,t=155,b=h-115;
            fill(c,Color.rgb(17,17,17),l,t,r,b,22); stroke(c,gold,l,t,r,b,22);
            if(actionMode==1){
                text(c,"ATTACK",l+22,t+34,18,cream,true);
                text(c,"Choose a rival structure. "+attacks+" attack(s) ready.",l+22,t+58,10,muted,false);
                for(int i=0;i<3;i++){
                    float yy=t+78+i*85;
                    fill(c,Color.rgb(31,24,15),l+20,yy,r-20,yy+65,14);
                    text(c,"RIVAL WORLD ZONE "+(i+1),l+34,yy+25,12,cream,true);
                    text(c,buildings[i]<3?"HP "+(3-buildings[i]):"DESTROYED",l+34,yy+46,9,muted,false);
                    fill(c,attacks>0?gold:Color.rgb(70,68,60),r-105,yy+15,r-35,yy+51,10);
                    center(c,"STRIKE",r-70,yy+38,8,Color.rgb(8,8,8),true);
                }
            } else if(actionMode==2){
                text(c,"RAID",l+22,t+34,18,cream,true);
                text(c,"Encuentra tesoro en 3 excavaciones.",l+22,t+58,10,muted,false);
                for(int i=0;i<3;i++){
                    float xx=l+25+i*112;
                    fill(c,Color.rgb(28,28,28),xx,t+88,xx+90,t+180,16);
                    center(c,raidChoice==i?(i==0?"+500 ◉":i==1?"+800 ◉":"+1 ◆"):"?",xx+45,t+145,13,raidChoice==i?gold:cream,true);
                }
                fill(c,gold,l+25,t+205,r-25,t+252,13);
                center(c,raidChoice<0?"ELIGE UN SITIO":"CONTINUAR",w/2,t+234,10,Color.rgb(8,8,8),true);
            } else {
                text(c,"BONUS",l+22,t+38,20,cream,true);
                text(c,message,l+22,t+66,11,muted,false);
            }
        }

        boolean allBuilt(){ return buildCount()>=9; }
        int buildCount(){ return buildings[0]+buildings[1]+buildings[2]; }
        int totalCards(){ int n=0; for(int x:cards)n+=x; return n; }
        int completeSets(){ int n=0; for(int s=0;s<3;s++) if(cards[s*3]>0&&cards[s*3+1]>0&&cards[s*3+2]>0)n++; return n; }

        void daily(){
            if(dailyClaimed) return;
            coins+=500; energy=Math.min(12,energy+2); dailyClaimed=true;
            message="Daily bonus: +500 coins +2 energy.";
            persist(); invalidate();
        }

        void spin(){
            if(energy<=0){ message="Sin energía. Reclama la misión."; invalidate(); return; }
            energy--; streak++;
            int steps=1+random.nextInt(6);
            position=(position+steps)%tiles.length;
            switch(type[position]){
                case 1: coins+=Integer.parseInt(tiles[position].substring(1)); message="Coins +"+tiles[position].substring(1); break;
                case 2: shields=Math.min(5,shields+1); message="Shield gained. Protect your world."; break;
                case 3:
                    int idx=firstBuilding();
                    if(idx>=0){ buildings[idx]=Math.min(3,buildings[idx]+1); coins+=150; message="Free world zone build!"; }
                    else message="All zones in this world are complete.";
                    break;
                case 4: coins+=350+level*40; relics++; addCard(); message="Chest opened: coins + card."; break;
                case 5:
                    attacks++;
                    if(shields>0) message="Attack token gained.";
                    else { actionMode=1; message="Attack opportunity!"; }
                    break;
                case 6: addCard(); message="New card discovered!"; break;
                case 7: actionMode=2; raidChoice=-1; message="RAID available!"; break;
                default: message="DALMA advanced "+steps+" spaces."; break;
            }
            if(position==0){ level++; energy=Math.min(12,energy+2); message="Board loop complete! Level +1 and +2 energy."; }
            persist(); invalidate();
        }

        void addCard(){
            int i=random.nextInt(cards.length);
            cards[i]++;
            if(completeSets()>0 && cards[i]==1) relics++;
        }

        @Override public boolean onTouchEvent(MotionEvent e){
            if(e.getAction()!=MotionEvent.ACTION_UP) return true;
            float x=e.getX(), y=e.getY(), h=getHeight(), w=getWidth();

            if(actionMode==1){
                float top=233;
                for(int i=0;i<3;i++){
                    float yy=top+i*85;
                    if(y>=yy && y<=yy+65 && x>22 && x<w-22){
                        if(attacks>0){
                            attacks--; int gain=120+level*70; coins+=gain;
                            message="Rival zone raided. +"+gain+" coins.";
                            actionMode=0; persist(); invalidate();
                        } else {
                            message="No attack tokens.";
                            invalidate();
                        }
                        return true;
                    }
                }
                return true;
            }

            if(actionMode==2){
                for(int i=0;i<3;i++){
                    float xx=43+i*112;
                    if(y>=243 && y<=335 && x>=xx && x<=xx+90){
                        raidChoice=i;
                        if(i==0){ coins+=500; }
                        else if(i==1){ coins+=800; }
                        else { relics++; }
                        message=i==2?"Raid found a relic!":"Raid found treasure!";
                        actionMode=3; persist(); invalidate(); return true;
                    }
                }
                return true;
            }

            if(actionMode==3){
                actionMode=0; invalidate(); return true;
            }

            if(y>h-65){
                if(x<w*.25f) tab=0;
                else if(x<w*.50f) tab=1;
                else if(x<w*.75f) tab=2;
                else tab=3;
                invalidate(); return true;
            }

            if(tab==0){
                if(y>=heroButtonTop() && y<=heroButtonTop()+52 && x>getWidth()-150){ daily(); return true; }
                if(y>h-140){ spin(); return true; }
            } else if(tab==1){
                float top=201;
                for(int i=0;i<3;i++){
                    float yy=top+i*91;
                    int cost=300+(buildings[i]*150);
                    if(y>=yy && y<=yy+76 && x>getWidth()-125 && buildings[i]<3){
                        if(coins>=cost){ coins-=cost; buildings[i]++; relics++; message="World zone upgraded."; persist(); }
                        else message="Need "+cost+" coins.";
                        invalidate(); return true;
                    }
                }
            } else if(tab==3){
                if(y>h-155 && y<h-105){ reset(); return true; }
                if(y>188 && y<260 && x>w-100 && streak>=3){ coins+=500; energy=Math.min(12,energy+2); message="Expedition claimed."; persist(); invalidate(); return true; }
                if(y>282 && y<355 && x>w-100 && buildCount()>0){ shields++; attacks++; message="Builder reward claimed."; persist(); invalidate(); return true; }
                if(y>376 && y<448 && x>w-100 && totalCards()>=3){ shields++; relics++; message="Card Hunter reward claimed."; persist(); invalidate(); return true; }
            }

            return true;
        }

        float heroButtonTop(){ return 160; }
        int firstBuilding(){ for(int i=0;i<3;i++) if(buildings[i]<3) return i; return -1; }
    }
}
