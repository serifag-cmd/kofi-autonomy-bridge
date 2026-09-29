package com.everest.twodthree;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Shader;
import android.graphics.drawable.*;
import android.net.Uri;
import android.opengl.*;
import android.view.*;
import android.widget.*;
import java.io.*;
import java.nio.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

public class MainActivity extends Activity {
    DepthView depthView;
    TextView status;
    float depth = 0.55f;
    Bitmap currentBitmap;
    final ArrayList<Uri> batchUris = new ArrayList<>();

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(5,7,11));
        depthView = new DepthView(this);
        root.addView(depthView, new FrameLayout.LayoutParams(-1,-1));

        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.HORIZONTAL);
        panel.setGravity(Gravity.CENTER_VERTICAL);
        panel.setPadding(24,18,24,18);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(0xDD0B1018); bg.setCornerRadius(28);
        panel.setBackground(bg);

        Button open = new Button(this);
        open.setText("2D → 3D");
        open.setTextColor(Color.WHITE);
        open.setOnClickListener(v -> pickImage());
        panel.addView(open, new LinearLayout.LayoutParams(0,64,1));

        SeekBar bar = new SeekBar(this);
        bar.setMax(100); bar.setProgress(55);
        bar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            public void onProgressChanged(SeekBar s,int p,boolean f){ depth=p/100f; depthView.setDepth(depth); }
            public void onStartTrackingTouch(SeekBar s){} public void onStopTrackingTouch(SeekBar s){}
        });
        panel.addView(bar, new LinearLayout.LayoutParams(0,64,1.0f));

        Button export = new Button(this);
        export.setText("ZIP");
        export.setTextColor(Color.WHITE);
        export.setOnClickListener(v -> chooseZipDestination());
        panel.addView(export, new LinearLayout.LayoutParams(0,64,0.65f));

        FrameLayout.LayoutParams pp = new FrameLayout.LayoutParams(-1,100,Gravity.BOTTOM);
        pp.setMargins(18,0,18,24); root.addView(panel,pp);

        status = new TextView(this);
        status.setText("EVEREST 2D→3D  •  Arrastra para explorar");
        status.setTextColor(Color.WHITE); status.setTextSize(14);
        status.setPadding(28,16,28,16);
        GradientDrawable sbg=new GradientDrawable(); sbg.setColor(0xAA0B1018); sbg.setCornerRadius(30);
        status.setBackground(sbg);
        FrameLayout.LayoutParams sp=new FrameLayout.LayoutParams(-2,58,Gravity.TOP|Gravity.CENTER_HORIZONTAL);
        sp.setMargins(0,28,0,0); root.addView(status,sp);
        setContentView(root);
    }

    void pickImage(){
        Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.setType("image/*"); i.addCategory(Intent.CATEGORY_OPENABLE); i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,true);
        startActivityForResult(i,42);
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null) return;
        if (requestCode == 42) {
            batchUris.clear();
            ClipData clips = data.getClipData();
            if (clips != null) {
                for (int i = 0; i < clips.getItemCount(); i++) batchUris.add(clips.getItemAt(i).getUri());
            } else if (data.getData() != null) {
                batchUris.add(data.getData());
            }
            if (!batchUris.isEmpty()) {
                try (InputStream in = getContentResolver().openInputStream(batchUris.get(0))) {
                    Bitmap b = BitmapFactory.decodeStream(in);
                    if (b != null) {
                        currentBitmap = b;
                        depthView.setBitmap(b);
                        status.setText("Cargado: " + batchUris.size() + " imagen" + (batchUris.size() == 1 ? "" : "es") + " • arrastra para explorar");
                    }
                } catch (Exception e) {
                    status.setText("No se pudo cargar la imagen");
                }
            }
        } else if (requestCode == 43) {
            final Uri target = data.getData();
            if (target == null) return;
            status.setText("Exportando assets…");
            new Thread(() -> {
                try {
                    writeZip(target);
                    runOnUiThread(() -> status.setText("ZIP exportado correctamente"));
                } catch (Exception e) {
                    runOnUiThread(() -> status.setText("Error al exportar: " + e.getClass().getSimpleName()));
                }
            }).start();
        }
    }

    void chooseZipDestination(){
        if(batchUris.isEmpty() && currentBitmap==null){ status.setText("Primero carga una imagen 2D"); return; }
        Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);
        i.setType("application/zip");
        i.putExtra(Intent.EXTRA_TITLE,"EVEREST_2D3D_ASSET.zip");
        startActivityForResult(i,43);
    }

    void writeZip(Uri target) throws Exception {
        if(batchUris.isEmpty() && currentBitmap==null) throw new IOException("No assets");
        try(OutputStream os=getContentResolver().openOutputStream(target); ZipOutputStream zip=new ZipOutputStream(os)){
            int index=0;
            for(Uri uri: batchUris){
                Bitmap original;
                try(InputStream in=getContentResolver().openInputStream(uri)){ original=BitmapFactory.decodeStream(in); }
                if(original==null) continue;
                Bitmap src=Bitmap.createScaledBitmap(original,1024,1024,true);
                Bitmap depthMap=Bitmap.createBitmap(src.getWidth(),src.getHeight(),Bitmap.Config.ARGB_8888);
                for(int y=0;y<src.getHeight();y++) for(int x=0;x<src.getWidth();x++){
                    int px=src.getPixel(x,y);
                    int lum=(int)(0.2126f*Color.red(px)+0.7152f*Color.green(px)+0.0722f*Color.blue(px));
                    depthMap.setPixel(x,y,Color.rgb(lum,lum,lum));
                }
                String base=String.format(Locale.US,"asset_%03d",++index);
                addBitmap(zip,"assets/"+base+"/original.png",src);
                addBitmap(zip,"assets/"+base+"/depth_map.png",depthMap);
                String meta="{\n"+
                    "  \"asset_id\": \""+base+"\",\n"+
                    "  \"source_width\": "+original.getWidth()+",\n"+
                    "  \"source_height\": "+original.getHeight()+",\n"+
                    "  \"export_width\": "+src.getWidth()+",\n"+
                    "  \"export_height\": "+src.getHeight()+",\n"+
                    "  \"depth_strength\": "+depth+",\n"+
                    "  \"depth_method\": \"luminance_heightfield\",\n"+
                    "  \"engine_version\": \"1.1.0\"\n}";
                addText(zip,"assets/"+base+"/metadata.json",meta);
                original.recycle(); src.recycle(); depthMap.recycle();
            }
            addText(zip,"manifest.json","{\n  \"product\": \"EVEREST 2D→3D\",\n  \"format\": \"organized multi-asset ZIP\",\n  \"asset_count\": "+index+",\n  \"version\": \"1.1.0\"\n}");
            addText(zip,"README.txt","EVEREST 2D→3D batch export\\n\\nEach asset folder contains original.png, depth_map.png and metadata.json.\\nThe depth map is an intermediate luminance heightfield, not a photogrammetric mesh.\\n");
        }
    }
    void addBitmap(ZipOutputStream zip,String name,Bitmap b) throws Exception{
        zip.putNextEntry(new ZipEntry(name)); b.compress(Bitmap.CompressFormat.PNG,100,zip); zip.closeEntry();
    }
    void addText(ZipOutputStream zip,String name,String text) throws Exception{
        zip.putNextEntry(new ZipEntry(name)); zip.write(text.getBytes("UTF-8")); zip.closeEntry();
    }

    static class DepthView extends GLSurfaceView implements GLSurfaceView.Renderer {
        final float[] proj=new float[16], view=new float[16], model=new float[16], mvp=new float[16];
        FloatBuffer vertices, tex;
        int program, texture=0, count=0;
        Bitmap pending; float depth=.55f, yaw=0, pitch=0;
        float lastX,lastY; boolean dragging;

        DepthView(Context c){ super(c); setEGLContextClientVersion(2); setRenderer(this); setRenderMode(RENDERMODE_CONTINUOUSLY); setPreserveEGLContextOnPause(true); }
        void setDepth(float d){ depth=d; }
        void setBitmap(Bitmap b){ pending=b; }
        public boolean onTouchEvent(android.view.MotionEvent e){
            float x=e.getX(), y=e.getY();
            if(e.getAction()==MotionEvent.ACTION_DOWN){lastX=x;lastY=y;dragging=true;return true;}
            if(e.getAction()==MotionEvent.ACTION_MOVE && dragging){ yaw+=(x-lastX)*0.35f; pitch+=(y-lastY)*0.25f; pitch=Math.max(-70,Math.min(70,pitch)); lastX=x;lastY=y; return true; }
            if(e.getAction()==MotionEvent.ACTION_UP){dragging=false;return true;} return true;
        }

        public void onSurfaceCreated(GL10 gl,EGLConfig cfg){
            GLES20.glClearColor(0.02f,0.03f,0.05f,1);
            String vs="attribute vec3 aPos; attribute vec2 aTex; uniform mat4 uMVP; varying vec2 vTex; void main(){gl_Position=uMVP*vec4(aPos,1.0);vTex=aTex;}";
            String fs="precision mediump float; varying vec2 vTex; uniform sampler2D uTex; void main(){vec4 c=texture2D(uTex,vTex); gl_FragColor=vec4(c.rgb,1.0);}";
            int v=compile(GLES20.GL_VERTEX_SHADER,vs), f=compile(GLES20.GL_FRAGMENT_SHADER,fs);
            program=GLES20.glCreateProgram(); GLES20.glAttachShader(program,v); GLES20.glAttachShader(program,f); GLES20.glLinkProgram(program);
            pending=sample();
        }
        int compile(int type,String src){int s=GLES20.glCreateShader(type);GLES20.glShaderSource(s,src);GLES20.glCompileShader(s);return s;}

        public void onSurfaceChanged(GL10 gl,int w,int h){ GLES20.glViewport(0,0,w,h); Matrix.frustumM(proj,0,-1,1,-1f*h/w,1f*h/w,1,10); }
        public void onDrawFrame(GL10 gl){
            if(pending!=null){ Bitmap b=pending; pending=null; build(b); }
            GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT|GLES20.GL_DEPTH_BUFFER_BIT); GLES20.glEnable(GLES20.GL_DEPTH_TEST);
            Matrix.setLookAtM(view,0,0,0,3.1f,0,0,0,0,1,0);
            Matrix.setIdentityM(model,0); Matrix.rotateM(model,0,pitch,1,0,0); Matrix.rotateM(model,0,yaw,0,1,0);
            float[] mv=new float[16]; Matrix.multiplyMM(mv,0,view,0,model,0); Matrix.multiplyMM(mvp,0,proj,0,mv,0);
            GLES20.glUseProgram(program);
            int p=GLES20.glGetAttribLocation(program,"aPos"), t=GLES20.glGetAttribLocation(program,"aTex"), u=GLES20.glGetUniformLocation(program,"uMVP");
            GLES20.glUniformMatrix4fv(u,1,false,mvp,0);
            GLES20.glEnableVertexAttribArray(p); GLES20.glVertexAttribPointer(p,3,GLES20.GL_FLOAT,false,0,vertices);
            GLES20.glEnableVertexAttribArray(t); GLES20.glVertexAttribPointer(t,2,GLES20.GL_FLOAT,false,0,tex);
            GLES20.glActiveTexture(GLES20.GL_TEXTURE0); GLES20.glBindTexture(GLES20.GL_TEXTURE_2D,texture);
            GLES20.glDrawArrays(GLES20.GL_TRIANGLES,0,count);
            GLES20.glDisableVertexAttribArray(p); GLES20.glDisableVertexAttribArray(t);
        }

        void build(Bitmap src){
            Bitmap b=Bitmap.createScaledBitmap(src,128,128,true);
            int n=64, verts=(n+1)*(n+1); float[] va=new float[n*n*6*3], ta=new float[n*n*6*2]; int vi=0,ti=0;
            for(int y=0;y<n;y++) for(int x=0;x<n;x++){
                int[] ids={y*(n+1)+x,y*(n+1)+x+1,(y+1)*(n+1)+x,(y+1)*(n+1)+x+1};
                float[][] q=new float[4][3]; float[][] uv={{x/(float)n,y/(float)n},{(x+1)/(float)n,y/(float)n},{x/(float)n,(y+1)/(float)n},{(x+1)/(float)n,(y+1)/(float)n}};
                for(int k=0;k<4;k++){float xx=uv[k][0]*2-1, yy=1-uv[k][1]*2; int px=Math.min(127,(int)(uv[k][0]*127)), py=Math.min(127,(int)(uv[k][1]*127)); int c=b.getPixel(px,py); float lum=(0.2126f*Color.red(c)+0.7152f*Color.green(c)+0.0722f*Color.blue(c))/255f; q[k]=new float[]{xx,yy,(lum-.5f)*depth};}
                int[][] tri={{0,1,2},{1,3,2}};
                for(int[] tr:tri) for(int k:tr){va[vi++]=q[k][0];va[vi++]=q[k][1];va[vi++]=q[k][2];ta[ti++]=uv[k][0];ta[ti++]=1-uv[k][1];}
            }
            vertices=ByteBuffer.allocateDirect(vi*4).order(ByteOrder.nativeOrder()).asFloatBuffer(); vertices.put(va,0,vi).position(0);
            tex=ByteBuffer.allocateDirect(ti*4).order(ByteOrder.nativeOrder()).asFloatBuffer(); tex.put(ta,0,ti).position(0); count=vi/3;
            if(texture==0) GLES20.glGenTextures(1,new int[]{0},0);
            int[] ids2=new int[1]; if(texture==0){GLES20.glGenTextures(1,ids2,0);texture=ids2[0];}
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D,texture); GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D,GLES20.GL_TEXTURE_MIN_FILTER,GLES20.GL_LINEAR); GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D,GLES20.GL_TEXTURE_MAG_FILTER,GLES20.GL_LINEAR); GLUtils.texImage2D(GLES20.GL_TEXTURE_2D,0,b,0);
            b.recycle();
        }
        Bitmap sample(){
            Bitmap b=Bitmap.createBitmap(512,512,Bitmap.Config.ARGB_8888); Canvas c=new Canvas(b);
            Paint p=new Paint(3); p.setShader(new LinearGradient(0,0,0,512,0xFF13284A,0xFFB6D8E8,Shader.TileMode.CLAMP)); c.drawRect(0,0,512,512,p);
            p.setShader(new LinearGradient(0,240,0,512,0xFF203D52,0xFF07131B,Shader.TileMode.CLAMP)); Path m=new Path();m.moveTo(0,330);m.lineTo(120,190);m.lineTo(220,300);m.lineTo(335,135);m.lineTo(512,320);m.lineTo(512,512);m.lineTo(0,512);m.close();c.drawPath(m,p);
            p.setColor(0xFF8FD3C8); c.drawCircle(390,120,45,p); p.setColor(0xFFFFFFFF); c.drawCircle(390,120,30,p); return b;
        }
    }
}
