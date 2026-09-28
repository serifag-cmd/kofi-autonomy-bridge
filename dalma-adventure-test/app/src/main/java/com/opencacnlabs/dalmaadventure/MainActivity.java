package com.opencacnlabs.dalmaadventure;

import android.app.Activity;
import android.os.Bundle;
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

        int energy=8, coins=1250, level=1, position=0, relics=1, streak=0, tab=0;
        int[] buildings={0,0,0};
        String message="Gira para avanzar por el mundo de DALMA.";

        final String[] tiles={"DALMA","+80","BUILD","+2","+140","CHEST","+220","BUILD","+3","RAID","+350","CHEST"};
        final int[] type={0,1,2,3,1,4,1,2,3,5,1,4};

        GameView(){ super(MainActivity.this); p.setTypeface(Typeface.DEFAULT); }

        void fill(Canvas c,int color,float l,float t,float r,float b,float rad){
            p.setStyle(Paint.Style.FILL); p.setColor(color); c.drawRoundRect(l,t,r,b,rad,rad,p);
        }
        void stroke(Canvas c,int color,float l,float t,float r,float b,float rad){
            p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(2); p.setColor(color); c.drawRoundRect(l,t,r,b,rad,rad,p); p.setStyle(Paint.Style.FILL);
        }
        void text(Canvas c,String s,float x,float y,float size,int color,boolean bold){
            p.setTextSize(size); p.setColor(color); p.setTypeface(Typeface.create(Typeface.DEFAULT,bold?Typeface.BOLD:Typeface.NORMAL)); c.drawText(s,x,y,p);
        }
        void center(Canvas c,String s,float x,float y,float size,int color,boolean bold){
            p.setTextSize(size); p.setTypeface(Typeface.create(Typeface.DEFAULT,bold?Typeface.BOLD:Typeface.NORMAL));
            text(c,s,x-p.measureText(s)/2,y,size,color,bold);
        }

        @Override protected void onDraw(Canvas c){
            float w=getWidth(), h=getHeight();
            c.drawColor(Color.rgb(7,7,7));
            int gold=Color.rgb(199,163,79), cream=Color.rgb(246,240,223), muted=Color.rgb(150,142,128), panel=Color.rgb(16,16,16);

            text(c,"DALMA",22,38,29,cream,true);
            text(c,"ADVENTURE // GENESIS WORLD",23,56,9,gold,false);
            fill(c,panel,w-80,15,w-18,62,15); stroke(c,Color.rgb(92,72,34),w-80,15,w-18,62,15);
            center(c,"LEVEL",w-49,31,8,gold,true); center(c,""+level,w-49,52,18,cream,true);

            float sy=73, sw=(w-50)/3f;
            stat(c,12,sy,sw,energy,"ENERGY","⚡");
            stat(c,19+sw,sy,sw,coins,"COINS","◉");
            stat(c,26+2*sw,sy,sw,relics,"RELICS","◆");

            if(tab==0) board(c,w,h,gold,cream,muted,panel);
            else if(tab==1) world(c,w,h,gold,cream,muted,panel);
            else missions(c,w,h,gold,cream,muted,panel);

            float ny=h-58;
            p.setColor(Color.rgb(18,18,18)); c.drawRect(0,ny,w,h,p);
            nav(c,"BOARD",w*.17f,ny,tab==0,gold);
            nav(c,"WORLD",w*.50f,ny,tab==1,gold);
            nav(c,"MISSIONS",w*.83f,ny,tab==2,gold);
        }

        void stat(Canvas c,float x,float y,float width,int value,String label,String icon){
            fill(c,Color.rgb(15,15,15),x,y,x+width,y+54,14); stroke(c,Color.rgb(39,39,39),x,y,x+width,y+54,14);
            text(c,icon,x+10,y+25,17,Color.rgb(199,163,79),false);
            text(c,String.valueOf(value),x+33,y+24,15,Color.WHITE,true);
            text(c,label,x+33,y+41,7,Color.rgb(120,115,105),true);
        }

        void board(Canvas c,float w,float h,int gold,int cream,int muted,int panel){
            float top=145, left=12, right=w-12, heroBottom=286;
            fill(c,Color.rgb(24,20,12),left,top,right,heroBottom,20);
            stroke(c,Color.rgb(88,68,28),left,top,right,heroBottom,20);
            text(c,"THE FIRST CANINE LEGEND",28,heroBottom-72,9,gold,true);
            text(c,"DALMA",28,heroBottom-40,38,Color.WHITE,true);
            text(c,"Un ADN. Un mundo. Infinitas aventuras.",29,heroBottom-17,11,cream,false);

            float cardTop=300;
            fill(c,panel,12,cardTop,right,h-92,18); stroke(c,Color.rgb(40,40,40),12,cardTop,right,h-92,18);
            text(c,"GENESIS BOARD",28,cardTop+27,14,cream,true);
            text(c,(position+1)+"/"+tiles.length,right-52,cardTop+27,10,gold,false);

            float gap=8, gridW=right-28, tileW=(gridW-gap*3)/4f, tileH=66;
            for(int i=0;i<tiles.length;i++){
                int row=i/4, col=i%4;
                float x=20+col*(tileW+gap), y=cardTop+40+row*(tileH+gap);
                int bg=(i==position)?Color.rgb(34,27,15):Color.rgb(22,22,22);
                int bd=(i==position)?gold:Color.rgb(42,42,42);
                fill(c,bg,x,y,x+tileW,y+tileH,12); stroke(c,bd,x,y,x+tileW,y+tileH,12);
                String glyph=type[i]==1?"◉":type[i]==2?"⌂":type[i]==3?"⚡":type[i]==4?"◆":type[i]==5?"⚔":"●";
                center(c,glyph,x+tileW/2,y+25,20,gold,true);
                center(c,tiles[i],x+tileW/2,y+48,8,cream,true);
            }
            text(c,message,24,cardTop+40+3*(tileH+gap)+18,11,muted,false);

            float by=h-118;
            fill(c,energy>0?gold:Color.rgb(80,75,65),12,by,right,by+48,15);
            center(c,energy>0?"GIRAR":"SIN ENERGÍA",w/2,by+22,17,Color.rgb(8,8,8),true);
            center(c,energy>0?"Toca para tirar 1–6":"Completa una misión",w/2,by+39,8,Color.rgb(48,38,18),true);
        }

        void world(Canvas c,float w,float h,int gold,int cream,int muted,int panel){
            float right=w-12, top=145;
            fill(c,panel,12,top,right,h-92,18); stroke(c,Color.rgb(40,40,40),12,top,right,h-92,18);
            text(c,"DALMA WORLD",28,top+29,15,cream,true);
            text(c,"Construye distritos para aumentar tu progreso.",28,top+53,11,muted,false);
            String[] names={"Genesis Gate","Golden Relic","Neon District"};
            for(int i=0;i<3;i++){
                float y=top+72+i*82;
                fill(c,Color.rgb(22,22,22),24,y,right-24,y+67,14);
                text(c,names[i],38,y+25,14,cream,true);
                text(c,"LEVEL "+buildings[i]+"/3",38,y+45,9,muted,false);
                fill(c,coins>=300?gold:Color.rgb(70,68,60),right-108,y+14,right-38,y+53,10);
                center(c,"300 ◉",right-73,y+38,9,Color.rgb(10,10,10),true);
            }
        }

        void missions(Canvas c,float w,float h,int gold,int cream,int muted,int panel){
            float right=w-12, top=145;
            fill(c,panel,12,top,right,h-92,18); stroke(c,Color.rgb(40,40,40),12,top,right,h-92,18);
            text(c,"MISSIONS",28,top+29,15,cream,true);
            missionCard(c,24,top+60,right-24,"FIRST EXPEDITION","Complete 3 moves","+3 ⚡  +200 ◉",gold,cream,muted,true);
            missionCard(c,24,top+150,right-24,"WORLD BUILDER","Build a district","+1 ◆",gold,cream,muted,false);
        }

        void missionCard(Canvas c,float l,float t,float r,String title,String desc,String reward,int gold,int cream,int muted,boolean claimable){
            fill(c,Color.rgb(22,22,22),l,t,r,t+76,14);
            text(c,title,l+14,t+23,13,cream,true); text(c,desc,l+14,t+43,10,muted,false); text(c,reward,l+14,t+62,9,gold,true);
            fill(c,claimable?gold:Color.rgb(65,64,58),r-82,t+20,r-14,t+56,10);
            center(c,claimable?"CLAIM":"GO",r-48,t+43,9,Color.rgb(8,8,8),true);
        }

        void nav(Canvas c,String s,float x,float y,boolean active,int gold){
            center(c,s,x,y+31,9,active?gold:Color.rgb(90,90,86),true);
        }

        @Override public boolean onTouchEvent(android.view.MotionEvent e){
            if(e.getAction()!=MotionEvent.ACTION_UP) return true;
            float x=e.getX(), y=e.getY(), h=getHeight(), w=getWidth();

            if(y>h-65){
                if(x<w/3) tab=0; else if(x<2*w/3) tab=1; else tab=2;
                invalidate(); return true;
            }

            if(tab==0 && y>h-128){
                if(energy<=0){ message="Sin energía. Reclama la misión."; invalidate(); return true; }
                energy--; streak++;
                int steps=1+random.nextInt(6);
                position=(position+steps)%tiles.length;
                switch(type[position]){
                    case 1: coins += Integer.parseInt(tiles[position].substring(1)); message="DALMA ganó monedas."; break;
                    case 2:
                        int idx=firstBuilding();
                        if(idx>=0){ buildings[idx]=Math.min(3,buildings[idx]+1); coins+=150; message="Nueva mejora construida."; }
                        else message="Todos los distritos están completos.";
                        break;
                    case 3: energy=Math.min(12,energy+Integer.parseInt(tiles[position].substring(1))); message="Energía recuperada."; break;
                    case 4: coins += 300+level*50; relics++; message="Cofre abierto: monedas y reliquia."; break;
                    case 5: coins += 500+level*75; message="¡RAID DALMA! Tesoro recuperado."; break;
                    default: message="DALMA avanzó "+steps+" casillas."; break;
                }
                if(position==0){ level++; energy=Math.min(12,energy+2); message="¡Vuelta completa! Nivel y energía +."; }
                invalidate(); return true;
            }

            if(tab==1){
                float top=145;
                for(int i=0;i<3;i++){
                    float yy=top+72+i*82;
                    if(y>=yy-10 && y<=yy+76 && x>getWidth()-130){
                        if(coins>=300 && buildings[i]<3){ coins-=300; buildings[i]++; relics++; message="Distrito mejorado."; }
                        invalidate(); return true;
                    }
                }
            }

            if(tab==2 && y>205 && y<360 && x>getWidth()-110){
                energy=Math.min(12,energy+3); coins+=200; message="Misión completada: +3 energía y +200 monedas."; invalidate(); return true;
            }

            return true;
        }

        int firstBuilding(){ for(int i=0;i<buildings.length;i++) if(buildings[i]<3) return i; return -1; }
    }
}
