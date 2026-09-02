const c=document.getElementById('game'),ctx=c.getContext('2d');
let W,H,px=0,pz=0,car=false,stars=0,stage=0,move={x:0,y:0};
const marker={x:520,z:520};
function resize(){W=c.width=innerWidth;H=c.height=innerHeight} addEventListener('resize',resize);resize();
function worldToScreen(x,z){const s=Math.min(W,H)/900;return [W/2+(x-px)*s,H/2+(z-pz)*s]}
function draw(){
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#17351b';ctx.fillRect(0,0,W,H);
 const s=Math.min(W,H)/900;
 for(let x=-900;x<=900;x+=240){let a=worldToScreen(x,-900),b=worldToScreen(x,900);ctx.strokeStyle='#555';ctx.lineWidth=70*s;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
 for(let z=-900;z<=900;z+=240){let a=worldToScreen(-900,z),b=worldToScreen(900,z);ctx.strokeStyle='#555';ctx.lineWidth=70*s;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
 for(let x=-900;x<=900;x+=120)for(let z=-900;z<=900;z+=120){
   if((x/120+z/120)%4!==0){let q=worldToScreen(x,z);ctx.fillStyle='#3b3d45';ctx.fillRect(q[0]-38*s,q[1]-38*s,76*s,76*s)}
 }
 let m=worldToScreen(marker.x,marker.z);ctx.fillStyle='#ffd900';ctx.beginPath();ctx.arc(m[0],m[1],18,0,7);ctx.fill();
 ctx.fillStyle=car?'#e33':'#2388ff';ctx.beginPath();ctx.arc(W/2,H/2,car?24:17,0,7);ctx.fill();
 requestAnimationFrame(draw)
}
function update(){
 const sp=car?5:3;
 px+=move.x*sp;pz+=move.y*sp;
 if(stage===0 && Math.hypot(px-marker.x,pz-marker.z)<70){stage=1;document.getElementById('mission').innerHTML='MISSION 1<br>Kontakt getroffen – finde ein Fahrzeug'}
 if(stage===1 && car){stage=2;document.getElementById('mission').innerHTML='MISSION 1<br>Fahre nach Norden'}
 if(stage===2 && pz<-600){stage=3;document.getElementById('mission').innerHTML='MISSION ERFOLGREICH!<br>+ $2,500'}
}
setInterval(update,30);draw();
const stick=document.getElementById('stick'),knob=document.getElementById('knob');
function setStick(e){let r=stick.getBoundingClientRect(),t=e.touches?e.touches[0]:e,x=t.clientX-(r.left+r.width/2),y=t.clientY-(r.top+r.height/2),d=Math.hypot(x,y),max=55;if(d>max){x=x/d*max;y=y/d*max}knob.style.left=(45+x)+'px';knob.style.top=(45+y)+'px';move={x:x/max,y:y/max}}
stick.addEventListener('touchstart',setStick);stick.addEventListener('touchmove',setStick);stick.addEventListener('touchend',()=>{move={x:0,y:0};knob.style.left='45px';knob.style.top='45px'});
document.getElementById('e').onclick=()=>{if(stage===0)document.getElementById('mission').innerHTML='MISSION 1<br>Erreiche den gelben Marker';};
document.getElementById('f').onclick=()=>{if(stage>=1){car=!car;document.getElementById('mission').innerHTML=car?'MISSION 1<br>Fahre nach Norden':'MISSION 1<br>Steige wieder ein'}}; 
document.getElementById('q').onclick=()=>{stars=Math.min(5,stars+1);document.getElementById('stars').textContent=stars};
