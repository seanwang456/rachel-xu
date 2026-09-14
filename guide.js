'use strict';
// The guide is an interactive photo sticker; project content stays unchanged.
const guide=document.createElement('aside');
guide.id='diary-guide';guide.setAttribute('aria-label','作品集小向导');
guide.innerHTML=`<div id="guide-note" hidden><p class="guide-salutation">A little companion</p><p id="guide-message" aria-live="polite"></p><div class="guide-actions"><button id="guide-surprise" class="label-control">带我看看作品 ↗</button><button id="guide-pat" class="label-control">再打个招呼 ♡</button><button id="guide-hide" class="label-control">先休息一下</button></div></div><button id="guide-character" aria-label="和小向导打招呼" aria-expanded="false" aria-controls="guide-note"><img src="assets/diary-guide.jpg" alt="粉色头发、蓝色翅膀的芭蕾女孩与云朵伙伴"><span>点我，打个招呼 ♡</span></button><button id="guide-restore" class="label-control" hidden>小向导 ♡</button>`;
document.body.append(guide);
const character=document.getElementById('guide-character'),note=document.getElementById('guide-note'),message=document.getElementById('guide-message'),restore=document.getElementById('guide-restore'),surprise=document.getElementById('guide-surprise');
let greeting=0,lastGuideProject=-1;
const greetings=['你好呀，我在这里等你。要一起翻开许多的作品日记吗？','收到你的招呼啦 ♡ 每件作品，都藏着一点小小的想象。','今天想遇见颜色、声音，还是一个新的空间？让我带你去看看。','你负责好奇，我负责带路。下一页也许会有惊喜。'];
function guideMotion(){if(paused||matchMedia('(prefers-reduced-motion: reduce)').matches)return;character.classList.remove('guide-bounce');void character.offsetWidth;character.classList.add('guide-bounce');guide.querySelectorAll('.guide-spark').forEach(n=>n.remove());for(let i=0;i<7;i++){const s=document.createElement('span');s.className='guide-spark';s.textContent=i%2?'✧':'♡';s.style.setProperty('--sx',Math.cos(i*Math.PI*2/7)*75+'px');s.style.setProperty('--sy',Math.sin(i*Math.PI*2/7)*65-30+'px');s.style.setProperty('--delay',i*.035+'s');s.setAttribute('aria-hidden','true');guide.append(s);s.addEventListener('animationend',()=>s.remove(),{once:true})}}
function showGuide(){note.hidden=false;character.setAttribute('aria-expanded','true');message.textContent=greetings[greeting++%greetings.length];surprise.disabled=!projects.length;guideMotion()}
function closeGuide(){note.hidden=true;character.setAttribute('aria-expanded','false')}
character.onclick=()=>{if(note.hidden)showGuide();else{closeGuide();guideMotion()}};
document.getElementById('guide-pat').onclick=showGuide;
character.addEventListener('animationend',()=>character.classList.remove('guide-bounce'));
document.getElementById('guide-hide').onclick=()=>{closeGuide();character.hidden=true;restore.hidden=false;restore.focus({preventScroll:true})};
restore.onclick=()=>{restore.hidden=true;character.hidden=false;showGuide();character.focus({preventScroll:true})};
surprise.onclick=()=>{if(!projects.length){message.textContent='作品正在准备中，稍等一下再来找我。';return}let i=Math.floor(Math.random()*projects.length);if(projects.length>1&&i===lastGuideProject)i=(i+1)%projects.length;lastGuideProject=i;closeGuide();if(openingActive)finishOpening();selectWork(i);openProject(projects[i],character)};
character.addEventListener('pointermove',e=>{if(paused||e.pointerType!=='mouse')return;const r=character.getBoundingClientRect();character.style.setProperty('--guide-tilt',((e.clientX-r.left)/r.width-.5)*10+'deg')});
character.addEventListener('pointerleave',()=>character.style.setProperty('--guide-tilt','-4deg'));
addEventListener('keydown',e=>{if(e.key==='Escape'&&!note.hidden){closeGuide();character.focus({preventScroll:true})}});
// Re-evaluate readiness on every greeting rather than polling in the background.
