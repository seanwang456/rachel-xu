const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

// Run the actual carousel controller with only its DOM/clock boundaries stubbed.
function controller(){
 const nodes=new Map();
 const node=()=>({style:{},classList:{add(){},remove(){}},addEventListener(){}});
 const context=vm.createContext({innerWidth:1200,performance:{now:()=>0},
  requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout(){},
  addEventListener(){},navigator:{},paused:false,projects:Array(12).fill({}),
  $:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)}});
 const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
 vm.runInContext(source.slice(source.indexOf('let activeWork='),source.indexOf('function leaveStory')),context);
 vm.runInContext('render=()=>{}',context);
 return code=>vm.runInContext(code,context);
}

test('a fling never reverses before settling, in either direction',()=>{
 for(const sign of [-1,1])for(const frame of [1000/120,1000/60,1000/30,50])
 for(const start of [.01,.12,.49,.95])for(const speed of [.00061,.0012,.003]){
  const run=controller();run(`pos=${sign*start};vel=${sign*speed}`);
  let previous=run('pos');
  for(let i=1;i<=500;i++){
   run(`tick(${i*frame})`);const current=run('pos');
   assert.ok((current-previous)*sign>=-1e-9,`reversed at ${frame}ms: ${previous} -> ${current}`);
   previous=current;
  }
  assert.equal(run('vel'),0);assert.equal(run('springTarget'),null);
 }
});

test('spring trajectory is independent of frame cadence',()=>{
 const positions=[1000/120,1000/60,1000/30,50].map(frame=>{
  const run=controller();run('pos=.5;vel=0;springTarget=1');
  for(let i=1;i<=Math.round(200/frame);i++)run(`tick(${i*frame})`);
  return run('pos');
 });
 assert.ok(Math.max(...positions)-Math.min(...positions)<1e-8,JSON.stringify(positions));
});

test('input cannot reset the clock of an already running animation',()=>{
 const run=controller();run('lastT=25;rafId=1;kick()');assert.equal(run('lastT'),25);
});

test('previous/next remains one work after multiple full rotations',()=>{
 for(const pos of [-25,25]){
  const run=controller();run(`pos=${pos};animateToIndex(${pos+1})`);
  assert.equal(run('springTarget'),pos+1);
 }
});
