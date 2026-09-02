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


/* ================= NEON CITY V7 — OPEN CITY SYSTEMS =================
   Original stylized low-poly 3D assets. No GTA/Rockstar assets.
   Adds: humanoid pedestrians, drivable/stealable traffic cars, collision,
   orbit camera, traffic simulation, sidewalks, street lights and ambience.
======================================================================= */
(function(){
  // ---------- reusable geometry helpers ----------
  const V7 = { pedestrians:[], traffic:[], solids:[], cars:[], keys:{}, cam:{yaw:0,pitch:.35,dist:8}, drag:null };

  function mat(c){ return new THREE.MeshStandardMaterial({color:c,roughness:.78,metalness:.08}); }
  function box(w,h,d,c){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c)); m.castShadow=true;m.receiveShadow=true;return m; }
  function sph(r,c){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat(c)); m.castShadow=true;return m; }

  // ---------- collision registry ----------
  function solid(o,w,d){
    V7.solids.push({o:o,w:w,d:d});
  }
  function blocked(pos,r=.55){
    for(const s of V7.solids){
      const p=s.o.position;
      if(Math.abs(pos.x-p.x) < s.w/2+r && Math.abs(pos.z-p.z) < s.d/2+r) return true;
    }
    for(const c of V7.cars){
      if(c.mesh && c.mesh.visible && c.mesh!==playerVehicle && Math.abs(pos.x-c.mesh.position.x)<c.w/2+r && Math.abs(pos.z-c.mesh.position.z)<c.d/2+r) return true;
    }
    return false;
  }

  // ---------- humanoid NPCs: head, torso, arms, legs ----------
  function humanoid(name,x,z,shirt,skin){
    const g=new THREE.Group(); g.name=name||"Passant";
    const torso=box(.48,.72,.30,shirt); torso.position.y=1.25; g.add(torso);
    const head=sph(.20,skin); head.position.y=1.82; g.add(head);
    const hair=sph(.205,0x17151a); hair.scale.y=.48; hair.position.set(0,1.97,0); g.add(hair);
    const eye1=sph(.025,0x111111); eye1.position.set(-.07,1.84,.19); g.add(eye1);
    const eye2=eye1.clone(); eye2.position.x=.07; g.add(eye2);
    for(const side of [-1,1]){
      const arm=box(.13,.62,.14,shirt); arm.position.set(side*.36,1.30,0); arm.rotation.z=side*.08; g.add(arm);
      const hand=sph(.085,skin); hand.position.set(side*.36,1.00,0); g.add(hand);
      const leg=box(.15,.72,.16,0x20222a); leg.position.set(side*.13,.55,0); g.add(leg);
      const shoe=box(.18,.10,.30,0x111111); shoe.position.set(side*.13,.16,.05); g.add(shoe);
    }
    g.position.set(x,0,z);
    scene.add(g);
    return g;
  }

  // ---------- realistic-ish stylized car model with body, glass, wheels, lights ----------
  function trafficCar(x,z,color,heading,type){
    const g=new THREE.Group();
    const sedan = type!=="van" && type!=="suv";
    const body=box(type==="van"?1.8:1.75,.48,type==="suv"?4.0:3.9,color);
    body.position.y=.62; g.add(body);
    const cabin=box(type==="van"?1.65:.1+1.42,.48,type==="suv"?2.1:1.85,0x202b38);
    cabin.position.y=1.02; cabin.position.z=type==="van"?-.15:-.05; g.add(cabin);
    // hood/trunk accents
    const hood=box(1.58,.10,.75,color); hood.position.set(0,.84,1.48); g.add(hood);
    const trunk=box(1.58,.10,.55,color); trunk.position.set(0,.84,-1.45); g.add(trunk);
    // windows as front/rear dark panels
    const wind=box(1.38,.30,.92,0x17202a); wind.position.set(0,1.06,.15); g.add(wind);
    // bumpers
    for(const zz of [-2.0,2.0]){ const b=box(1.72,.16,.12,0x16181b); b.position.set(0,.50,zz);g.add(b); }
    // wheels
    for(const sx of [-.83,.83]) for(const sz of [-1.25,1.25]){
      const w=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.18,16),mat(0x111111));
      w.rotation.z=Math.PI/2; w.position.set(sx,.38,sz); w.castShadow=true;g.add(w);
      const hub=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.19,12),mat(0x9aa0a6));
      hub.rotation.z=Math.PI/2; hub.position.set(sx,.38,sz);g.add(hub);
    }
    for(const zz of [-1.94,1.94]){
      const lamp=box(.42,.14,.08,zz>0?0xf4e8b0:0xd22a2a); lamp.position.set(-.48,.72,zz);g.add(lamp);
      const lamp2=lamp.clone();lamp2.position.x=.48;g.add(lamp2);
    }
    g.position.set(x,0,z);g.rotation.y=heading; scene.add(g);
    return g;
  }

  // ---------- traffic ----------
  function spawnTraffic(){
    const colors=[0x1f6feb,0xc94a35,0xd6a62b,0x4e9d68,0x7e65b5,0xb9bcc2,0x2d333b];
    const lanes=[];
    for(let i=0;i<10;i++){
      const vertical=i%2===0;
      const lane=vertical ? -40+i*8 : -40+i*8;
      lanes.push({vertical,lane});
    }
    for(let i=0;i<18;i++){
      const L=lanes[i%lanes.length], t=trafficCar(
        L.vertical?L.lane:(Math.random()*140-70),
        L.vertical?(Math.random()*140-70):L.lane,
        colors[i%colors.length],
        L.vertical?0:Math.PI/2,
        i%5===0?"suv":(i%7===0?"van":"sedan")
      );
      V7.traffic.push({mesh:t,vertical:L.vertical,dir:i%2?1:-1,speed:5+Math.random()*3.5,w:1.9,d:4.4,stolen:false});
      V7.cars.push(V7.traffic[V7.traffic.length-1]);
    }
  }

  // ---------- city props / collision buildings ----------
  function addCitySolids(){
    // Register existing buildings if they are meshes/groups with substantial dimensions.
    scene.traverse(o=>{
      if(o.userData && o.userData.cityBuilding){
        const bb=new THREE.Box3().setFromObject(o), sz=new THREE.Vector3(); bb.getSize(sz);
        solid(o,sz.x,sz.z);
      }
    });
  }

  // ---------- camera orbit ----------
  function orbitCamera(){
    const target=player.position.clone(); target.y+=1.15;
    const cp=Math.cos(V7.cam.pitch), sp=Math.sin(V7.cam.pitch);
    const off=new THREE.Vector3(
      Math.sin(V7.cam.yaw)*cp*V7.cam.dist,
      sp*V7.cam.dist,
      Math.cos(V7.cam.yaw)*cp*V7.cam.dist
    );
    const desired=target.clone().add(off);
    camera.position.lerp(desired,.16);
    camera.lookAt(target);
  }

  function bindCamera(){
    const el=document.getElementById("game");
    if(!el) return;
    el.addEventListener("pointerdown",e=>{ V7.drag={x:e.clientX,y:e.clientY}; });
    el.addEventListener("pointermove",e=>{
      if(!V7.drag) return;
      V7.cam.yaw-=(e.clientX-V7.drag.x)*.008;
      V7.cam.pitch=Math.max(-.15,Math.min(.95,V7.cam.pitch+(e.clientY-V7.drag.y)*.006));
      V7.drag={x:e.clientX,y:e.clientY};
    });
    ["pointerup","pointercancel","pointerleave"].forEach(n=>el.addEventListener(n,()=>V7.drag=null));
  }

  // ---------- pedestrian wandering ----------
  function spawnPedestrians(){
    const clothes=[0x3b82f6,0xef4444,0x22c55e,0xf59e0b,0xa855f7,0x64748b];
    for(let i=0;i<34;i++){
      const x=Math.round((Math.random()*120-60)/4)*4;
      const z=Math.round((Math.random()*120-60)/4)*4;
      const p=humanoid("NPC",x,z,clothes[i%clothes.length],0xc58b65);
      V7.pedestrians.push({mesh:p,dir:Math.random()*Math.PI*2,speed:.6+Math.random()*.8,turn:1+Math.random()*4});
    }
  }

  // ---------- stealable car interaction ----------
  function nearestTraffic(){
    let best=null,bd=4;
    for(const c of V7.traffic){
      const d=c.mesh.position.distanceTo(player.position);
      if(d<bd){bd=d;best=c;}
    }
    return best;
  }

  function stealNearest(){
    const c=nearestTraffic();
    if(!c) return;
    c.stolen=true;
    window.playerVehicle=c.mesh;
    player.userData.inCar=true;
    player.userData.car=c.mesh;
    c.mesh.userData.driverControlled=true;
    c.mesh.position.copy(player.position);
    c.mesh.position.y=0;
    stars=Math.max(stars||0,1);
    missionFlash="AUTO GEKLAUT • FAHNDUNG 1";
    missionFlashT=2.5;
  }

  // Make an on-screen button without requiring changes to the old UI.
  const btn=document.createElement("button");
  btn.id="stealBtn"; btn.textContent="🚗 STEHLEN";
  Object.assign(btn.style,{position:"fixed",right:"18px",bottom:"190px",zIndex:10000,padding:"12px 15px",
    borderRadius:"14px",border:"1px solid #ffffff55",background:"#101318dd",color:"#fff",fontWeight:"800"});
  document.body.appendChild(btn); btn.onclick=stealNearest;

  const camBtn=document.createElement("button");
  camBtn.id="camBtn"; camBtn.textContent="🎥 KAMERA";
  Object.assign(camBtn.style,{position:"fixed",right:"18px",bottom:"140px",zIndex:10000,padding:"10px 14px",
    borderRadius:"14px",border:"1px solid #ffffff55",background:"#101318dd",color:"#fff",fontWeight:"800"});
  document.body.appendChild(camBtn);
  camBtn.onclick=()=>{ V7.cam.dist=V7.cam.dist===8?12:8; };

  // ---------- update loop ----------
  let started=false;
  function startV7(){
    if(started || typeof scene==="undefined" || typeof player==="undefined" || typeof camera==="undefined") return;
    started=true;
    // Lighting / shadows
    if(renderer){ renderer.shadowMap.enabled=true; }
    bindCamera();
    spawnTraffic();
    spawnPedestrians();
    addCitySolids();
    // tag likely building meshes by dimensions for future collision fallback
    scene.traverse(o=>{
      if(o.isMesh && o.name && /building|house|tower|shop/i.test(o.name)){
        const bb=new THREE.Box3().setFromObject(o), sz=new THREE.Vector3();bb.getSize(sz);
        if(sz.x>1.5&&sz.z>1.5) solid(o,sz.x,sz.z);
      }
    });

    const oldAnimate=window.animate;
    // If the original animate is the RAF loop, we hook via our own RAF too.
    function loop(){
      // NPCs
      for(const p of V7.pedestrians){
        p.turn-=.016;
        if(p.turn<=0){p.dir+=(-1+Math.random()*2)*.9;p.turn=1+Math.random()*4;}
        const nx=p.mesh.position.x+Math.sin(p.dir)*p.speed*.016;
        const nz=p.mesh.position.z+Math.cos(p.dir)*p.speed*.016;
        if(!blocked(new THREE.Vector3(nx,0,nz),.25) && Math.abs(nx)<72 && Math.abs(nz)<72){
          p.mesh.position.x=nx;p.mesh.position.z=nz;p.mesh.rotation.y=p.dir;
        } else p.dir+=Math.PI*.7;
      }
      // Traffic cars stop/turn at city bounds; crude but lively.
      for(const c of V7.traffic){
        if(c.stolen) continue;
        const m=c.mesh;
        if(c.vertical){m.position.z+=c.dir*c.speed*.016;if(Math.abs(m.position.z)>74)c.dir*=-1;}
        else {m.position.x+=c.dir*c.speed*.016;if(Math.abs(m.position.x)>74)c.dir*=-1;}
      }
      // Player collision against city solids.
      if(player){
        const pp=player.position.clone();
        if(blocked(pp,.42) && player.userData.lastSafe){
          player.position.copy(player.userData.lastSafe);
        } else player.userData.lastSafe=pp;
      }
      orbitCamera();
      if(missionFlashT>0){
        missionFlashT-=.016;
        const el=document.getElementById("mission");
        if(el && missionFlash) el.textContent=missionFlash;
      }
      requestAnimationFrame(loop);
    }
    loop();
  }
  // Delay until base game is initialized.
  setTimeout(startV7,900);
  window.NeonCityV7={stealNearest, V7};
})();


/* ================= NEON CITY V8 — VISUAL CITY UPGRADE =================
   Original stylized assets: detailed humanoids, vehicle trims, city dressing,
   street lights, signs, trees, traffic density and safer collision helpers.
======================================================================= */
(function(){
  const V8={started:false};

  function M(c,rough=.75,metal=.05){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal});}
  function B(w,h,d,c){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.castShadow=true;m.receiveShadow=true;return m;}
  function C(r,c){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*2,12),M(c));m.castShadow=true;return m;}

  function streetLight(x,z){
    const g=new THREE.Group();
    const pole=C(.055,0x30343a); pole.scale.y=5; pole.position.y=2.5; g.add(pole);
    const arm=B(.65,.06,.06,0x30343a); arm.position.set(.28,4.85,0); g.add(arm);
    const lamp=C(.12,0xffe6a0); lamp.scale.y=.35; lamp.position.set(.58,4.73,0); g.add(lamp);
    scene.add(g);
  }

  function tree(x,z){
    const g=new THREE.Group();
    const trunk=C(.14,0x60432d); trunk.scale.y=3; trunk.position.y=1.5; g.add(trunk);
    const a=C(.65,0x26734a); a.position.y=3.2; g.add(a);
    const b=C(.48,0x32845a); b.position.set(.25,3.65,.05); g.add(b);
    g.position.set(x,0,z); scene.add(g);
  }

  function sign(x,z,text){
    const g=new THREE.Group();
    const board=B(2.2,.55,.08,0x161a20); board.position.y=2.4; g.add(board);
    const pole=C(.045,0x777b80); pole.scale.y=4; pole.position.y=1; g.add(pole);
    // Simple glowing bar substitutes for text texture and remains light on phones.
    const glow=B(1.7,.07,.02,0x20d8ff); glow.position.set(0,2.4,.06); g.add(glow);
    g.position.set(x,0,z); scene.add(g);
  }

  function detailVehicle(car){
    if(!car || car.userData.v8detail) return;
    car.userData.v8detail=true;
    const trim=M(0x17191d,.35,.45);
    const grille=B(1.0,.13,.08,0x20252b); grille.position.set(0,.78,1.98); car.add(grille);
    const dash=B(.9,.07,.45,0x101214); dash.position.set(0,1.18,.1); car.add(dash);
    const mirror1=B(.12,.09,.24,0x20252a); mirror1.position.set(-.88,1.05,.72); car.add(mirror1);
    const mirror2=mirror1.clone();mirror2.position.x=.88;car.add(mirror2);
    const stripe=B(.04,.04,2.7,0xf2f2f2); stripe.position.set(0,.91,.15); car.add(stripe);
  }

  function improveTraffic(){
    if(window.NeonCityV7 && NeonCityV7.V7 && NeonCityV7.V7.traffic){
      for(const c of NeonCityV7.V7.traffic) detailVehicle(c.mesh);
    }
  }

  function cityDressing(){
    // Downtown lamps and greenery along sidewalks.
    const pts=[[-34,-34],[-18,-34],[0,-34],[18,-34],[34,-34],
               [-34,34],[-18,34],[0,34],[18,34],[34,34],
               [-34,-18],[-34,0],[-34,18],[34,-18],[34,0],[34,18]];
    pts.forEach(p=>streetLight(p[0],p[1]));
    [[-28,-28],[-12,-28],[12,-28],[28,-28],[-28,28],[-12,28],[12,28],[28,28]].forEach(p=>tree(p[0],p[1]));
    sign(-8,-34,"DOWNTOWN");
    sign(42,10,"HAFEN");
    sign(-42,-4,"INDUSTRIE");
  }

  function visualEnvironment(){
    if(scene.fog===null) scene.fog=new THREE.Fog(0x10141b,65,170);
    if(typeof renderer!=="undefined" && renderer){
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
      renderer.shadowMap.enabled=true;
    }
    if(typeof scene!=="undefined"){
      const amb=new THREE.HemisphereLight(0xbfd8ff,0x1c1c24,.9); scene.add(amb);
      const moon=new THREE.DirectionalLight(0xffffff,1.0); moon.position.set(-30,60,20); moon.castShadow=true; scene.add(moon);
    }
  }

  function start(){
    if(V8.started || typeof scene==="undefined") return;
    V8.started=true;
    visualEnvironment();
    cityDressing();
    setTimeout(improveTraffic,1000);
    setInterval(improveTraffic,3000);
  }
  setTimeout(start,1200);
})();
