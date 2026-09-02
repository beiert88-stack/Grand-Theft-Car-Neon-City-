let scene,camera,renderer,player,clock=new THREE.Clock(),cameraSide=0;
let input={x:0,y:0},carMode=false,health=100,money=2500,stars=0,mission=0;
let characterIndex=0,weaponIndex=0,ammo=12,reserve=60,lastShot=0;
const characters=[
{name:"Rico",role:"Fahrer",color:0x248cff,speed:6},
{name:"Maya",role:"Hackerin",color:0xb35cff,speed:5.4},
{name:"Jax",role:"Kämpfer",color:0xef4d57,speed:5.7}
];
const weapons=[
{name:"Pistole",mag:12,reserve:60,damage:20,cool:.28},
{name:"Schrotflinte",mag:6,reserve:30,damage:55,cool:.75,pellets:5},
{name:"Maschinenpistole",mag:24,reserve:120,damage:11,cool:.10},
{name:"Gewehr",mag:8,reserve:40,damage:42,cool:.55}
];
const vehicles=[],npcs=[],projectiles=[],policeUnits=[];
const districts=[
{name:"Innenstadt",x:0,z:0,color:0x3a4050},
{name:"Hafen",x:-72,z:-72,color:0x31463b},
{name:"Industriegebiet",x:72,z:-72,color:0x493c32},
{name:"Vororte",x:72,z:72,color:0x304a32}
];
const services=[
{x:36,z:42,name:"Tankstelle",color:0x1e91dd},
{x:58,z:-50,name:"Werkstatt",color:0xff9c25},
{x:-48,z:-52,name:"Nachtclub",color:0x9d45e8},
{x:-58,z:54,name:"Laden",color:0x45bd77}
];

function material(c){return new THREE.MeshStandardMaterial({color:c,roughness:.75})}
function cube(w,h,d,c){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c))}
function label(text,pos){
  const cv=document.createElement("canvas");cv.width=256;cv.height=64;const g=cv.getContext("2d");
  g.fillStyle="#ffffff";g.font="bold 28px Arial";g.textAlign="center";g.fillText(text,128,40);
  const tx=new THREE.CanvasTexture(cv),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true}));
  sp.position.set(pos.x,pos.y,pos.z);sp.scale.set(8,2,1);scene.add(sp);
}
function build(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x0e1620);scene.fog=new THREE.Fog(0x0e1620,60,230);
 camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,600);
 renderer=new THREE.WebGLRenderer({canvas:document.getElementById("game"),antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
 scene.add(new THREE.HemisphereLight(0xc6dcff,0x17251a,2));
 const sun=new THREE.DirectionalLight(0xffffff,2.1);sun.position.set(50,90,35);scene.add(sun);
 let ground=cube(280,.4,280,0x17361d);ground.position.y=-.2;scene.add(ground);
 for(let i=-120;i<=120;i+=24){let a=cube(7,.07,280,0x4b4b4b);a.position.x=i;scene.add(a);let b=cube(280,.07,7,0x4b4b4b);b.position.z=i;scene.add(b)}
 for(let x=-108;x<=108;x+=24)for(let z=-108;z<=108;z+=24){
   if((x+z)%48!==0){let h=7+Math.random()*22,b=cube(16,h,16,0x343944);b.position.set(x,h/2,z);scene.add(b)}
 }
 districts.forEach(d=>{let m=cube(45,.04,45,d.color);m.position.set(d.x,0.04,d.z);scene.add(m);label(d.name,{x:d.x,y:8,z:d.z})});
 services.forEach(s=>{let b=cube(8,3.2,8,s.color);b.position.set(s.x,1.6,s.z);scene.add(b);label(s.name,{x:s.x,y:6,z:s.z})});
 let marker=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,.2,24),material(0xffd400));marker.position.set(54,0.12,54);scene.add(marker);
 createPlayer();
 addVehicle(26,8,0xd13d43,"Sportwagen",10,false);
 addVehicle(-34,36,0xe7e7e7,"Streifenwagen",8,true);
 addVehicle(6,-43,0x345fd0,"Muscle Car",8,false);
 addVehicle(63,-22,0x30343a,"SUV",7,false);
 addVehicle(-62,54,0x6e7278,"Limousine",7,false);
 addVehicle(-25,-62,0x8a8a8a,"Transporter",6,false);
 addVehicle(38,70,0x242424,"Motorrad",11,false,true);
 for(let i=0;i<18;i++)createNPC();
 updateUI();animate();
}
function createPlayer(){
 player=new THREE.Group();
 let body=cube(1.15,1.65,.75,characters[0].color);body.position.y=.83;body.name="body";player.add(body);
 let head=new THREE.Mesh(new THREE.SphereGeometry(.43,18,14),material(0xd39a6a));head.position.y=1.9;head.name="head";player.add(head);
 let leg1=cube(.38,.8,.45,0x22252d);leg1.position.set(-.27,.1,0);player.add(leg1);
 let leg2=leg1.clone();leg2.position.x=.27;player.add(leg2);
 scene.add(player);
}
function switchCharacter(){characterIndex=(characterIndex+1)%characters.length;player.getObjectByName("body").material.color.setHex(characters[characterIndex].color);updateUI();msg(characters[characterIndex].name+" – "+characters[characterIndex].role)}
function addVehicle(x,z,color,type,speed,police,moto=false){
 let g=new THREE.Group();
 let body=cube(moto?1:.2?2.4:2.4,.85,moto?2.7:4.4,color);body.position.y=.65;g.add(body);
 if(!moto){let roof=cube(1.8,.55,2,color);roof.position.y=1.2;g.add(roof)}
 else {let seat=cube(.55,.45,1.4,0x202020);seat.position.y=1.2;g.add(seat)}
 if(police){let sir=cube(.8,.18,.45,0x278cff);sir.position.y=1.55;g.add(sir)}
 g.position.set(x,0,z);g.userData={type,speed,police,moto};scene.add(g);vehicles.push(g);if(police)policeUnits.push(g);
}
function createNPC(){
 let enemy=Math.random()<.28,n=cube(.8,1.7,.8,enemy?0xed4b8b:0xe2b56a);n.position.set(Math.random()*210-105,.85,Math.random()*210-105);
 n.userData={enemy,hp:enemy?70:35,goal:new THREE.Vector3(Math.random()*210-105,.85,Math.random()*210-105)};scene.add(n);npcs.push(n)
}
function nearestVehicle(){let b=null,d=5;vehicles.forEach(v=>{let q=v.position.distanceTo(player.position);if(q<d){d=q;b=v}});return b}
function vehicleToggle(){let v=nearestVehicle();if(!v){msg("Kein Fahrzeug in Reichweite.");return}carMode=!carMode;msg(carMode?"Fahrzeug: "+v.userData.type:"Ausgestiegen");if(v.userData.police)stars=Math.max(stars,2);updateUI()}
function cycleWeapon(){weaponIndex=(weaponIndex+1)%weapons.length;ammo=weapons[weaponIndex].mag;reserve=weapons[weaponIndex].reserve;updateUI();msg("Waffe: "+weapons[weaponIndex].name)}
function reload(){let w=weapons[weaponIndex],need=w.mag-ammo,take=Math.min(need,reserve);ammo+=take;reserve-=take;updateUI()}
function shoot(){
 let now=performance.now()/1000,w=weapons[weaponIndex];if(now-lastShot<w.cool)return;lastShot=now;
 if(ammo<=0){msg("Magazin leer – ↻ Nachladen");return}
 ammo--;stars=Math.min(5,stars+.45);updateUI();
 let count=w.pellets||1;
 for(let i=0;i<count;i++){let spread=(Math.random()-.5)*(w.pellets?.22:.06),dir=new THREE.Vector3(Math.sin(player.rotation.y+spread),0,Math.cos(player.rotation.y+spread));projectiles.push({x:player.position.x,z:player.position.z,dx:dir.x,dz:dir.z,damage:w.damage,life:1})}
}
function interact(){
 if(mission===0){msg("Gehe zum gelben Kontakt-Marker.");return}
 if(mission===1){msg("Finde ein Fahrzeug und drücke 🚗.");return}
 if(mission===2){msg("Fahre ins Industriegebiet.");return}
 if(mission===3){msg("Nutze die Werkstatt am orangefarbenen Gebäude.");return}
 if(mission===4){msg("Wechsle zu Maya und hacke den markierten Terminal.");return}
 if(mission===5){msg("Fliehe vor der Polizei.");return}
 if(mission===6){msg("MISSION ERFOLGREICH – Finale vorbereitet.");return}
}
function missionCheck(){
 if(mission===0&&Math.hypot(player.position.x-54,player.position.z-54)<8){mission=1;msg("Kontakt getroffen. Finde ein Fahrzeug.");}
 else if(mission===1&&carMode){mission=2;msg("Fahre ins Industriegebiet im Südwesten.");}
 else if(mission===2&&player.position.x>45&&player.position.z<-45){mission=3;msg("Werkstatt erreicht. Bereite das Fahrzeug vor.");money+=1000;}
 else if(mission===3&&Math.hypot(player.position.x-58,player.position.z+50)<10){mission=4;msg("Wechsle zu Maya (👤) und hacke den Terminal.");}
 else if(mission===4&&characterIndex===1&&Math.hypot(player.position.x-48,player.position.z+70)<15){mission=5;stars=3;msg("Alarm! Fliehe aus dem Industriegebiet.");}
 else if(mission===5&&stars<1){mission=6;money+=5000;msg("MISSION ERFOLGREICH! + $5.000");}
}
function updateProjectiles(dt){
 for(let i=projectiles.length-1;i>=0;i--){let b=projectiles[i];b.x+=b.dx*34*dt;b.z+=b.dz*34*dt;b.life-=dt;
  let hit=false;npcs.forEach(n=>{if(n.userData.hp>0&&Math.hypot(n.position.x-b.x,n.position.z-b.z)<2){n.userData.hp-=b.damage;if(n.userData.hp<=0)n.visible=false;hit=true}});
  if(hit||b.life<=0)projectiles.splice(i,1);
 }
}
function policeAI(dt){
 policeUnits.forEach(p=>{
   let d=p.position.distanceTo(player.position);
   if(stars>0&&d<105){let dir=player.position.clone().sub(p.position);dir.y=0;if(dir.length()>5){dir.normalize();p.position.add(dir.multiplyScalar(dt*p.userData.speed*.75));p.lookAt(player.position.x,0,player.position.z)}if(d<6)health=Math.max(0,health-dt*8)}
 });
 if(stars>0&&stars<5)stars=Math.max(0,stars-dt*.018);
}
function districtName(){
 let best="Stadtgebiet",bd=999;
 districts.forEach(d=>{let q=Math.hypot(player.position.x-d.x,player.position.z-d.z);if(q<bd){bd=q;best=d.name}});
 return best
}
function updateUI(){
 document.getElementById("money").textContent=Math.floor(money);document.getElementById("hp").textContent=Math.floor(health);
 document.getElementById("ammo").textContent=ammo;document.getElementById("reserve").textContent=reserve;
 document.getElementById("stars").textContent=Math.floor(stars);document.getElementById("weaponName").textContent=weapons[weaponIndex].name;
 document.getElementById("character").textContent=characters[characterIndex].name;document.getElementById("role").textContent=characters[characterIndex].role;
 document.getElementById("district").textContent=districtName();
}
function msg(t){document.getElementById("mission").innerHTML=t}
function animate(){
 requestAnimationFrame(animate);let dt=Math.min(clock.getDelta(),.05);
 let speed=carMode?characters[characterIndex].speed+5:characters[characterIndex].speed;
 player.position.x+=input.x*speed*dt;player.position.z+=input.y*speed*dt;
 player.position.x=THREE.MathUtils.clamp(player.position.x,-130,130);player.position.z=THREE.MathUtils.clamp(player.position.z,-130,130);
 if(Math.hypot(input.x,input.y)>.05)player.rotation.y=Math.atan2(input.x,input.y);
 let a=cameraSide?.85:-.85,dist=carMode?11:8.5;
 let desired=new THREE.Vector3(player.position.x+Math.sin(a)*dist,player.position.y+5.3,player.position.z+Math.cos(a)*dist);
 camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(player.position.x,1.15,player.position.z);
 npcs.forEach(n=>{if(n.userData.hp<=0)return;let d=n.userData.goal.clone().sub(n.position);d.y=0;if(d.length()<2)n.userData.goal.set(Math.random()*210-105,.85,Math.random()*210-105);else n.position.add(d.normalize().multiplyScalar(dt*(n.userData.enemy?1.2:.75)))});
 updateProjectiles(dt);policeAI(dt);missionCheck();updateUI();renderer.render(scene,camera);drawMini();
}
function drawMini(){
 const m=document.getElementById("mini"),g=m.getContext("2d");g.clearRect(0,0,130,95);g.fillStyle="#111820";g.fillRect(0,0,130,95);
 g.strokeStyle="#555";for(let i=0;i<130;i+=24){g.beginPath();g.moveTo(i,0);g.lineTo(i,95);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(130,i);g.stroke()}
 const sx=v=>65+(v-player.position.x)*.35,sz=v=>47+(v-player.position.z)*.35;g.fillStyle="#ffd400";g.beginPath();g.arc(sx(54),sz(54),4,0,7);g.fill();
 policeUnits.forEach(v=>{g.fillStyle="#4aa9ff";g.fillRect(sx(v.position.x)-2,sz(v.position.z)-2,4,4)});g.fillStyle="#ff4050";g.beginPath();g.arc(65,47,4,0,7);g.fill();
}
document.getElementById("shoot").onclick=shoot;document.getElementById("vehicle").onclick=vehicleToggle;document.getElementById("action").onclick=interact;
document.getElementById("charBtn").onclick=switchCharacter;document.getElementById("weapon").onclick=cycleWeapon;document.getElementById("reload").onclick=reload;
const stick=document.getElementById("stick"),knob=document.getElementById("knob");
function stickMove(e){let r=stick.getBoundingClientRect(),t=e.touches[0],xx=t.clientX-r.left-r.width/2,yy=t.clientY-r.top-r.height/2,d=Math.hypot(xx,yy),mx=56;if(d>mx){xx=xx/d*mx;yy=yy/d*mx}knob.style.left=46+xx+"px";knob.style.top=46+yy+"px";input={x:xx/mx,y:yy/mx}}
stick.addEventListener("touchstart",stickMove);stick.addEventListener("touchmove",stickMove);stick.addEventListener("touchend",()=>{input={x:0,y:0};knob.style.left="46px";knob.style.top="46px"});
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
build();
