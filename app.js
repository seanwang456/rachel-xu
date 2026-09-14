'use strict';
const $=s=>document.querySelector(s);
const scenes=[
 {image:'shore-new.jpg',label:'PROLOGUE / 岸边',title:'沿着光，<br>走向海洋。',desc:'我把感受，变成可以进入的世界。',alt:'夜晚海岸，一顶透出暖光的帐篷',action:'开始探索'},
 {image:'girl-new.jpg',label:'01 / 相遇',title:'海面之上，<br>一个身影。',desc:'在光与水之间，感受开始有了形状。',alt:'蓝色海水中，身着白衣的女孩',action:'继续靠近'},
 {image:'jelly-new.jpg',label:'02 / 微光',title:'把一片海，<br>捧在手里。',desc:'那些轻盈的、透明的、缓慢流动的事物。',alt:'女孩低头看着光，周围环绕着水母',action:'跟随微光'},
 {image:'room-new.jpg',label:'03 / 海洋的房间',title:'原来，海洋<br>就在房间里。',desc:'蓝色的水，温暖的灯。情绪在这里成为作品。',alt:'暖色房间里散发蓝光的水母缸',action:'进入作品房间'},
 {image:'swing-new.png',label:'04 / 收藏的世界',title:'每一件作品，<br>都是一个入口。',desc:'选择一个名字，走进它的故事。',alt:'昏暗空间中的秋千、女孩和气球',action:'打开全部作品'}];
let sceneIndex=-1,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,changeAt=performance.now(),pointer={x:-10,y:-10},imageReady=false;
const photo=$('#scene-photo'),canvas=$('#particles'),gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false});
let program,buf,count=0,ratio=1,last=0,raf=0;
const imgs=scenes.map(s=>{let im=new Image();im.src='assets/'+s.image;return im});
if(gl){
 const vs=`attribute vec2 pos;attribute vec3 col;attribute float seed;uniform float t;uniform float formed;uniform float aspect;uniform vec2 fit;uniform vec2 offset;uniform vec2 mouse;uniform float px;varying vec3 color;varying float opacity;void main(){vec2 p=pos;float spread=1.0-formed;float a=seed*62.83;p+=vec2(sin(a+t*.11),cos(a*1.7+t*.09))*spread*.28;p+=vec2(sin(t*.22+a),cos(t*.18+a))*.0009;vec2 q=p*fit+offset;vec2 delta=q-mouse;float dist=length(delta);q+=normalize(delta+vec2(.0001))*max(0.0,.16-dist)*.045;gl_Position=vec4(q,0.,1.);gl_PointSize=px*(1.1+seed*.9+spread*.9);color=col;opacity=.88*min(1.,formed*2.2+.12);}`;
 const fs=`precision mediump float;varying vec3 color;varying float opacity;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.28,.5,d);gl_FragColor=vec4(color,opacity*a);}`;
 const shader=(type,src)=>{let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Particle program link failed');gl.useProgram(program);buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
 for(const [name,size,offset] of [['pos',2,0],['col',3,8],['seed',1,20]]){let a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,24,offset)}gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
}
function resize(){let d=Math.min(devicePixelRatio,1.5);canvas.width=innerWidth*d;canvas.height=innerHeight*d;if(gl)gl.viewport(0,0,canvas.width,canvas.height)}resize();addEventListener('resize',resize);
function sample(im){ratio=im.width/im.height;let c=document.createElement('canvas');c.width=innerWidth<700?360:650;c.height=Math.round(c.width/ratio);let ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,c.width,c.height);let data=ctx.getImageData(0,0,c.width,c.height).data,points=[];for(let y=0;y<c.height;y++){for(let x=0;x<c.width;x++){let k=(y*c.width+x)*4;if(Math.max(data[k],data[k+1],data[k+2])<14)continue;points.push(x/c.width*2-1,1-y/c.height*2,data[k]/255,data[k+1]/255,data[k+2]/255,Math.random())}}count=points.length/6;if(gl){gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW)}imageReady=true;changeAt=performance.now();}
function changeScene(i){if(i===sceneIndex)return;sceneIndex=i;const s=scenes[i];imageReady=false;photo.src=imgs[i].src;photo.alt=s.alt;$('#scene-title').innerHTML=s.title;$('#scene-label').textContent=s.label;$('#scene-desc').textContent=s.desc;$('#next-scene').innerHTML=s.action+' <span>↓</span>';$('#scene-counter').textContent=String(i+1).padStart(2,'0')+' / 05';document.querySelectorAll('#scene-dots button').forEach((b,j)=>b.setAttribute('aria-current',String(i===j)));if(imgs[i].complete&&imgs[i].naturalWidth)sample(imgs[i]);else imgs[i].onload=()=>{if(sceneIndex===i)sample(imgs[i])};}
function goScene(i){if(i>4){leaveStory('#exhibition');return}changeScene(i);$('#journey').scrollIntoView({behavior:'instant'})}
scenes.forEach((s,i)=>{let b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0');b.setAttribute('aria-label',s.label);b.onclick=()=>goScene(i);$('#scene-dots').append(b)});$('#next-scene').onclick=()=>goScene(sceneIndex+1);
function scrollScene(){if(sceneIndex<0)changeScene(0)}scrollScene();
canvas.addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth*2-1;pointer.y=1-e.clientY/innerHeight*2});canvas.addEventListener('pointerleave',()=>pointer={x:-10,y:-10});
function draw(now){raf=requestAnimationFrame(draw);if(now-last<32||document.hidden)return;last=now;if($('#journey').hidden)return;let elapsed=(now-changeAt)/1000;let formed=paused?1:Math.min(1,elapsed/3.6);formed=formed*formed*(3-2*formed);let reveal=paused?1:Math.max(0,Math.min(1,(elapsed-2.5)/2.8));photo.style.opacity=imageReady?String(.05+reveal*.86):'0';canvas.style.opacity=paused?'0':String(1-reveal*.62);if(!gl||!imageReady){photo.style.opacity='1';return}gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);let screenRatio=innerWidth/innerHeight;let fx=Math.max(1,ratio/screenRatio),fy=Math.max(1,screenRatio/ratio);let ox=0;for(const [n,v]of [['t',paused?0:now/1000],['formed',formed],['aspect',screenRatio],['px',Math.min(devicePixelRatio,1.5)*(innerWidth/(innerWidth<700?360:650))*Math.max(1,ratio/screenRatio)*.65]])gl.uniform1f(gl.getUniformLocation(program,n),v);gl.uniform2f(gl.getUniformLocation(program,'fit'),fx,fy);gl.uniform2f(gl.getUniformLocation(program,'offset'),ox,0);gl.uniform2f(gl.getUniformLocation(program,'mouse'),pointer.x,pointer.y);gl.drawArrays(gl.POINTS,0,count)}requestAnimationFrame(draw);
$('#motion').onclick=()=>{paused=!paused;$('#motion').textContent=paused?'恢复动态':'暂停动态';$('#motion').setAttribute('aria-pressed',String(paused))};if(paused)$('#motion').click(),$('#motion').click();
let projects=[],seen=new Set(),returnFocus=null,cleanupLab=()=>{};
const dialog=$('#project-dialog'),lightbox=$('#lightbox');
function figure(file,label){let f=document.createElement('figure'),im=document.createElement('img'),cap=document.createElement('figcaption'),b=document.createElement('button');im.src='assets/'+file;im.alt=label;im.loading='lazy';im.decoding='async';b.style.cssText='padding:0;width:100%;display:block';b.setAttribute('aria-label','放大：'+label);b.append(im);b.onclick=()=>{lightbox.querySelector('img').src=im.src;lightbox.querySelector('img').alt=label;lightbox.querySelector('p').textContent=label;lightbox.showModal()};cap.textContent=label;f.append(b,cap);return f}
function closeProject(){cleanupLab();cleanupLab=()=>{};dialog.close();document.body.classList.remove('modal-open');returnFocus?.focus({preventScroll:true})}
$('#close-project').onclick=closeProject;dialog.addEventListener('cancel',e=>{e.preventDefault();closeProject()});$('#close-lightbox').onclick=()=>lightbox.close();lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});
function openProject(p,button){returnFocus=button;seen.add(p.id);if(button?.querySelector('.viewed'))button.querySelector('.viewed').textContent='已浏览';$('#project-category').textContent=p.category;const host=$('#project-content');host.replaceChildren();let intro=document.createElement('div');intro.className='project-intro';intro.innerHTML='<p class="eyebrow">SELECTED PROJECT / '+p.category+'</p><h2 id="project-title">'+p.name+'</h2><p>'+p.description+'</p>';host.append(intro);let hero=figure(p.cover,p.name+' · 主视觉');hero.style.margin='0';hero.querySelector('img').className='hero-art';host.append(hero);let heading=document.createElement('h3');heading.className='detail-heading';heading.textContent='关于这件作品';let story=document.createElement('p');story.className='project-note';story.textContent=p.story;host.append(heading,story);
 if(p.lab){let lab=document.createElement('div');lab.className='lab';host.append(lab);if(p.lab==='yuanqi')cleanupLab=yuanqiLab(lab);else cleanupLab=soundLab(lab)}
 if(p.pdf){let link=document.createElement('a');link.href='assets/'+p.pdf;link.target='_blank';link.rel='noopener';link.className='text-button';link.textContent='阅读完整项目文档 ↗';host.append(link)}
 let h=document.createElement('h3');h.className='detail-heading';h.textContent='作品与过程';host.append(h);let gallery=document.createElement('div');gallery.className='detail-gallery';p.images.forEach((f,i)=>gallery.append(figure(f,p.name+' / '+String(i+1).padStart(2,'0'))));host.append(gallery);let end=document.createElement('button');end.className='text-button';end.textContent='返回作品展场 ↑';end.onclick=closeProject;host.append(end);document.body.classList.add('modal-open');dialog.showModal();dialog.scrollTop=0}
fetch('projects.json').then(r=>{if(!r.ok)throw Error('项目内容加载失败');return r.json()}).then(data=>{projects=data;buildExhibition(data);for(const [i,p]of data.entries()){let b=document.createElement('button');b.className='project-card';b.innerHTML='<div class="project-image"><img src="assets/'+p.cover+'" alt="'+p.name+'作品封面" loading="lazy"></div><div class="card-meta"><span>'+String(i+1).padStart(2,'0')+' / '+p.category+'</span><span class="viewed"></span></div><h3>'+p.name+'</h3><p>'+p.description+'</p>';b.onclick=()=>openProject(p,b);$('#project-grid').append(b)}for(let i=0;i<3;i++)$('#behind-gallery').append(figure('portfolio-11-'+i+'.webp','制作与现场 / '+(i+1)));}).catch(()=>{$('#project-grid').innerHTML='<p>作品内容暂时未能加载。请刷新页面重试。</p>'});
function yuanqiLab(host){host.innerHTML='<p class="eyebrow">INTERACTIVE STUDY / 网页交互演示</p><h3>让触摸留下痕迹</h3><p>长按聚集，拖动导流，释放扩散。</p><div class="controls"><button aria-pressed="true" data-mode="0">木生火</button><button aria-pressed="false" data-mode="1">木克土</button><button aria-pressed="false" data-mode="2">水生木</button></div><canvas aria-label="五行粒子演示画布，长按聚集，拖动导流，释放扩散"></canvas><div class="controls"><label>密度 <input type="range" min="80" max="450" value="240" aria-label="粒子密度"></label><label>速度 <input type="range" min="1" max="6" value="2" aria-label="粒子速度"></label><button data-pulse>释放脉冲</button><button data-reset>重置</button></div><small>根据项目文档制作的简化交互演示，完整实验参数与研究见下方文档。</small>';
 let c=host.querySelector('canvas'),cx=c.getContext('2d'),ranges=host.querySelectorAll('input'),n=240,mode=0,down=false,pt={x:450,y:190},alive=true,id,ts=0;const colors=[['#758e84','#9c7470'],['#758e84','#8f8078'],['#71838f','#869488']];c.width=900;c.height=380;let ps=[];function reset(){ps=Array.from({length:n},()=>({x:Math.random()*900,y:Math.random()*380,vx:0,vy:0}));cx.fillStyle='#0a0d0e';cx.fillRect(0,0,900,380)}reset();function pulse(){ps.forEach(p=>{let dx=p.x-pt.x,dy=p.y-pt.y,d=Math.hypot(dx,dy)+1;p.vx+=dx/d*7;p.vy+=dy/d*7});down=false}const move=e=>{let r=c.getBoundingClientRect();pt={x:(e.clientX-r.left)/r.width*900,y:(e.clientY-r.top)/r.height*380}};c.onpointerdown=e=>{move(e);down=true;c.setPointerCapture(e.pointerId)};c.onpointermove=move;c.onpointerup=pulse;c.onpointercancel=()=>down=false;host.querySelector('[data-pulse]').onclick=pulse;host.querySelector('[data-reset]').onclick=reset;host.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=+b.dataset.mode;host.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));reset()});ranges[0].oninput=()=>{n=+ranges[0].value;reset()};function frame(t){if(!alive)return;id=requestAnimationFrame(frame);if(t-ts<32||document.hidden)return;ts=t;cx.fillStyle='rgba(10,13,14,.13)';cx.fillRect(0,0,900,380);ps.forEach((p,i)=>{let ox=p.x,oy=p.y,a=Math.sin(p.x*.008+t*.0002)+Math.cos(p.y*.015)*2;let sp=+ranges[1].value*.3;p.vx=p.vx*.94+Math.cos(a)*.07;p.vy=p.vy*.94+Math.sin(a)*.07;if(down){p.vx+=(pt.x-p.x)*.0008;p.vy+=(pt.y-p.y)*.0008}p.x+=p.vx*sp;p.y+=p.vy*sp;if(p.x<0||p.x>900||p.y<0||p.y>380){p.x=Math.random()*900;p.y=Math.random()*380;return}cx.strokeStyle=colors[mode][i%2];cx.globalAlpha=.55;cx.lineWidth=.65;cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(p.x,p.y);cx.stroke()});cx.globalAlpha=1}id=requestAnimationFrame(frame);return()=>{alive=false;cancelAnimationFrame(id)}}
function soundLab(host){host.innerHTML='<p class="eyebrow">LISTENING STUDY / 网页声音演示</p><h3>听见声音的位置</h3><p>戴上耳机，选择左、中、右，听声音如何移动。</p><canvas aria-label="随实际声音频谱变化的声场"></canvas><div class="controls"><button data-play>开启声音</button><button data-pan="-1" aria-pressed="false">左</button><button data-pan="0" aria-pressed="true">中</button><button data-pan="1" aria-pressed="false">右</button><label>音量 <input aria-label="音量" type="range" min="0" max="0.2" step="0.01" value="0.08"></label></div><small>此处为声道与频谱原理演示；三件完整游戏的玩法与界面见项目文档。</small>';
 let c=host.querySelector('canvas'),ctx=c.getContext('2d'),audio,analyser,gain,panner,playing=false,pan=0,id,alive=true;c.width=900;c.height=320;const play=host.querySelector('[data-play]');async function toggle(){try{if(!audio){audio=new AudioContext();gain=audio.createGain();gain.gain.value=+host.querySelector('input').value;panner=audio.createStereoPanner();panner.pan.value=pan;analyser=audio.createAnalyser();analyser.fftSize=512;[174.61,261.63,349.23].forEach((f,i)=>{let o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.22;o.connect(g).connect(gain);o.start()});gain.connect(panner).connect(analyser).connect(audio.destination)}if(playing)await audio.suspend();else await audio.resume();playing=!playing;play.textContent=playing?'暂停声音':'开启声音';play.setAttribute('aria-pressed',String(playing));if(playing)draw()}catch(e){play.textContent='声音无法开启，请重试'}}play.onclick=toggle;host.querySelectorAll('[data-pan]').forEach(b=>b.onclick=()=>{pan=+b.dataset.pan;if(panner)panner.pan.setTargetAtTime(pan,audio.currentTime,.15);host.querySelectorAll('[data-pan]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(!playing)still()});host.querySelector('input').oninput=e=>{if(gain)gain.gain.setTargetAtTime(+e.target.value,audio.currentTime,.05)};function still(){ctx.fillStyle='#0a0d0e';ctx.fillRect(0,0,900,320);ctx.fillStyle='#9dacb0';ctx.beginPath();ctx.arc(450+pan*230,160,3,0,7);ctx.fill()}function draw(){if(!alive||!playing)return;still();let d=new Uint8Array(analyser.frequencyBinCount);analyser.getByteFrequencyData(d);for(let i=0;i<150;i++){let a=i/150*Math.PI*2,r=40+d[i%d.length]*.55;ctx.fillStyle='rgba(160,183,186,.55)';ctx.fillRect(450+pan*230+Math.cos(a)*r,160+Math.sin(a)*r*.65,1.5,1.5)}id=requestAnimationFrame(draw)}still();return()=>{alive=false;cancelAnimationFrame(id);if(audio)audio.close()}}
// Spatial exhibition: continuous wrap-around carousel. pos is in work units.
// Drags track 1:1; a velocity-adaptive detent adds gear texture only on slow
// drags. Release uses a noise-resistant velocity estimate with a deadzone, the
// snap spring is critically damped, and parallax freezes during any carousel
// motion — so real (noisy) input never turns into jitter or wrong-way flings.
let activeWork=0,spatialButtons=[],cameraX=0,cameraY=0,camTX=0,camTY=0;
let pos=0,vel=0,springTarget=null,dragging=false,dragMoved=false,activePtr=null,downX=0,lastX=0,samples=[],rafId=0,lastT=0;
const workWidth=()=>innerWidth<700?innerWidth*.6:innerWidth*.29,pxPerWork=()=>workWidth()*.94;
function buildExhibition(data){const gallery=$('#spatial-gallery');data.forEach((p,i)=>{let b=document.createElement('button');b.className='spatial-art';b.style.setProperty('--i',i);b.innerHTML='<img draggable="false" decoding="async" src="assets/'+p.cover+'" alt="'+p.name+'作品"><span class="art-label">'+p.name+'</span>';b.setAttribute('aria-label','选择作品：'+p.name);b.onclick=()=>{if(dragMoved)return;if(activeWork===i)openProject(p,b);else selectWork(i)};gallery.append(b);spatialButtons.push(b)});spatialButtons.forEach(b=>{const im=b.querySelector('img');if(im.decode)im.decode().catch(()=>{})});syncCaption();render()}
function syncCaption(){const p=projects[activeWork];$('#exhibit-count').textContent=String(activeWork+1).padStart(2,'0')+' / '+String(projects.length).padStart(2,'0');$('#exhibit-name').textContent=p.name;$('#exhibit-category').textContent=p.category;if(!paused){const h=$('#exhibit-name');if(h.animate)h.animate([{opacity:.4},{opacity:1}],{duration:240,easing:'ease-out'})}}
function render(){const n=projects.length;if(!n)return;const width=workWidth();
 const g=Math.round(pos),c=((g%n)+n)%n;
 if(c!==activeWork&&Math.abs(pos-g)<=.46){activeWork=c;syncCaption();if(dragging)navigator.vibrate?.(8)}
 spatialButtons.forEach((b,i)=>{let d=i-pos;d-=Math.round(d/n)*n;const abs=Math.abs(d);
  if(abs>2.6){if(!b._off){b.style.opacity='0';b.style.pointerEvents='none';b.tabIndex=-1;b._off=true;b._t=b._o=null}return}
  b._off=false;const x=d*width*.94;
  const t=`translate(-50%,-50%) translate3d(${x+cameraX*(abs+1)}px,${abs*20+cameraY}px,${-abs*230}px) rotateY(${-d*13+cameraX*.06}deg)`;
  if(b._t!==t){b.style.transform=t;b._t=t}
  const o=Math.max(0,(1-abs*.23)*Math.min(1,Math.max(0,(2.6-abs)/.6))).toFixed(3);
  if(b._o!==o){b.style.opacity=o;b._o=o}
  let blur=b._b||false;
  if(!blur&&abs>1.25)blur=true;else if(blur&&abs<1.05)blur=false;
  if(b._b!==blur){b.style.filter=blur?'blur(1.1px)':'none';b._b=blur}
  const act=i===activeWork;if(b._a!==act){b.dataset.active=String(act);b.setAttribute('aria-pressed',String(act));b._a=act}})}
function kick(){if(!rafId){lastT=performance.now();rafId=requestAnimationFrame(tick)}}
function tick(t){rafId=requestAnimationFrame(tick);const dt=Math.min(50,t-lastT);lastT=t;
 const moving=dragging||springTarget!==null||vel!==0;
 const etx=moving?cameraX:(paused?0:camTX),ety=moving?cameraY:(paused?0:camTY),ease=1-Math.exp(-dt*.008);
 cameraX+=(etx-cameraX)*ease;cameraY+=(ety-cameraY)*ease;
 if(Math.abs(etx-cameraX)<.02)cameraX=etx;if(Math.abs(ety-cameraY)<.02)cameraY=ety;
 if(!dragging){
  // Exact critically damped solution, in milliseconds. Euler stepping made
  // damping alternate at long frame intervals, causing visible stutter.
  if(springTarget!==null){
   const omega=.014,offset=pos-springTarget,c=vel+omega*offset,decay=Math.exp(-omega*dt);
   pos=springTarget+(offset+c*dt)*decay;
   vel=(vel-omega*c*dt)*decay;
   if(Math.abs(springTarget-pos)<.002&&Math.abs(vel)<.0002){pos=springTarget;vel=0;springTarget=null}
  }else if(vel!==0){
   const decay=Math.exp(-.0032*dt);
   pos+=vel*(1-decay)/.0032;vel*=decay;
   if(Math.abs(vel)<.0006){
    // Keep enough distance to absorb residual speed without overshooting.
    // round() could select a tooth behind us and yank the artwork backwards.
    const landing=pos+vel/.014;
    springTarget=vel>0?Math.ceil(landing):Math.floor(landing);
   }
  }
 }
 render();
 if(!dragging&&springTarget===null&&!vel&&cameraX===etx&&cameraY===ety){cancelAnimationFrame(rafId);rafId=0}}
function animateToIndex(i){if(!projects.length)return;const n=projects.length;let delta=(i-pos)%n;if(delta>n/2)delta-=n;if(delta<-n/2)delta+=n;if(paused){pos+=delta;vel=0;springTarget=null;render();return}springTarget=pos+delta;vel=Math.sign(delta)*Math.min(.003,Math.abs(delta)*.014,Math.abs(delta*.002+vel*.25));kick()}
const selectWork=animateToIndex;
$('#prev-work').onclick=()=>animateToIndex(Math.round(springTarget??pos)-1);$('#next-work').onclick=()=>animateToIndex(Math.round(springTarget??pos)+1);$('#enter-exhibit').onclick=()=>{if(!projects.length)return;const n=projects.length,i=((Math.round(springTarget??pos)%n)+n)%n;openProject(projects[i],$('#enter-exhibit'))};$('#reset-view').onclick=()=>{camTX=camTY=0;animateToIndex(0)};
const gallery=$('#spatial-gallery');
gallery.addEventListener('pointerdown',e=>{if(dragging||e.button>0)return;dragging=true;dragMoved=false;activePtr=e.pointerId;downX=lastX=e.clientX;vel=0;springTarget=null;samples=[[performance.now(),e.clientX]];gallery.classList.add('grabbing');kick()});
gallery.addEventListener('pointermove',e=>{if(dragging&&e.pointerId===activePtr){const dx=e.clientX-lastX;lastX=e.clientX;samples.push([performance.now(),e.clientX]);if(samples.length>8)samples.shift();if(!dragMoved&&Math.abs(e.clientX-downX)>6){dragMoved=true;try{gallery.setPointerCapture(activePtr)}catch(_){}}
  const k=.28*Math.max(0,1-Math.abs(dx)/14); // detent texture fades out at speed
  pos-=dx/pxPerWork()*(1-k*Math.sin(Math.PI*pos)**2)}else if(!dragging&&!paused&&e.pointerType==='mouse'){camTX=(e.clientX/innerWidth-.5)*18;camTY=(e.clientY/innerHeight-.5)*10;kick()}});
const endDrag=e=>{if(!dragging||e.pointerId!==activePtr)return;dragging=false;gallery.classList.remove('grabbing');
 vel=0;
 if(e.type!=='pointercancel'&&samples.length>1){const now=performance.now(),old=samples.find(s=>now-s[0]<=120)||samples[0],span=now-old[0];
  if(span>30){const v=(old[1]-lastX)/span/pxPerWork();if(Math.abs(v)>.0012)vel=Math.max(-.003,Math.min(.003,v))}}
 if(paused){pos=Math.round(pos);vel=0;render()}else if(!vel)springTarget=Math.round(pos);
 kick();setTimeout(()=>dragMoved=false,50)};
gallery.addEventListener('pointerup',endDrag);gallery.addEventListener('pointercancel',endDrag);
gallery.addEventListener('pointerleave',()=>{if(!dragging){camTX=camTY=0;kick()}});
gallery.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();animateToIndex(Math.round(springTarget??pos)+1)}if(e.key==='ArrowLeft'){e.preventDefault();animateToIndex(Math.round(springTarget??pos)-1)}});
addEventListener('resize',()=>render());
function leaveStory(target){$('#journey').hidden=true;$(target).scrollIntoView({behavior:'instant'})}
$('#show-prologue').onclick=()=>{$('#journey').hidden=false;goScene(0)};$('#close-prologue').onclick=()=>leaveStory('#exhibition');
document.querySelectorAll('header a,footer a').forEach(a=>a.addEventListener('click',e=>{const target=a.getAttribute('href');if(target?.startsWith('#')&&$(target)){e.preventDefault();leaveStory(target);history.replaceState(null,'',target)}}));

// Restore the ocean particle story as the entrance, with all five chapters.
if(!location.hash||location.hash==='#exhibition'){
 $('#journey').hidden=false;
 requestAnimationFrame(()=>{scrollTo({top:$('#journey').offsetTop,behavior:'instant'});scrollScene()});
}
