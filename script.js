const $ = (s)=>document.querySelector(s);
const $$ = (s)=>[...document.querySelectorAll(s)];
let current=1;

const scenes = $$("[id^='scene']");
function showScene(n){
  scenes.forEach(s=>s.classList.remove("active"));
  const el = $("#scene"+n);
  if(el){el.classList.add("active"); current=n; window.scrollTo({top:0,behavior:"smooth"});}
  if(n===10) startFinale();
}
function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2200);
}

// background
for(let i=0;i<70;i++){
  const s=document.createElement("i"); s.className="star";
  s.style.left=Math.random()*100+"%"; s.style.top=Math.random()*100+"%";
  s.style.animationDelay=Math.random()*3+"s"; $("#stars").appendChild(s);
}
setInterval(()=>{
  const p=document.createElement("i"); p.className="particle";
  p.textContent=["❤","✦","•","♡"][Math.floor(Math.random()*4)];
  p.style.left=Math.random()*100+"%"; p.style.fontSize=(8+Math.random()*14)+"px";
  p.style.animationDuration=(5+Math.random()*7)+"s";
  $("#particles").appendChild(p); setTimeout(()=>p.remove(),13000);
},500);

$("#startBtn").onclick=()=>showScene(2);

// dodging verification
const dodge=$("#obviousBtn");
function dodgeButton(){
  const x=(Math.random()*140)-70, y=(Math.random()*90)-45;
  dodge.style.transform=`translate(${x}px,${y}px)`;
  toast("Nice try, Alexa 😂");
}
dodge.addEventListener("mouseenter",dodgeButton);
dodge.addEventListener("touchstart",(e)=>{e.preventDefault();dodgeButton()});
dodge.onclick=dodgeButton;
$("#yesBtn").onclick=()=>{toast("ACCESS GRANTED 💗");setTimeout(()=>showScene(3),650)};

// puzzle
const correct=["❤️","💗","💖"];
let puzzle=["💖","❤️","💗"], selected=null;
function renderPuzzle(){
  $$("#puzzle .tile").forEach((b,i)=>{b.textContent=puzzle[i];b.classList.toggle("selected",selected===i)});
}
$$("#puzzle .tile").forEach((b)=>{
  b.onclick=()=>{
    const i=Number(b.dataset.pos);
    if(selected===null){selected=i;renderPuzzle();return}
    [puzzle[selected],puzzle[i]]=[puzzle[i],puzzle[selected]];
    selected=null;renderPuzzle();
    if(puzzle.join("")===correct.join("")){
      $("#puzzleHint").textContent="Perfect. I knew you could do it, my bachaa. 🥹";
      $("#puzzleNext").classList.remove("hidden");
      confetti(35);
    }
  }
});
renderPuzzle();
$("#puzzleNext").onclick=()=>showScene(4);

// memories
const memories=[
 {img:"photos/memory1.jpg",cap:"Some moments don't look special when they're happening... until they become memories. ❤️"},
 {img:"photos/memory2.jpg",cap:"And then there are moments that make me quietly think, 'haan, this one is mine.' 🥹"},
 {img:"photos/memory3.jpg",cap:"A little laughter, a little madness, and somehow a memory worth keeping forever. 😂"},
 {img:"photos/memory4.jpg",cap:"You probably don't even realise how many ordinary moments you made beautiful. ✨"},
 {img:"photos/memory5.jpg",cap:"If I could keep one thing from every chapter, it would be the memories with you. 🌙"}
];
let mi=0;
function loadMemory(){
  const m=memories[mi]; $("#memoryNumber").textContent=String(mi+1).padStart(2,"0");
  const img=$("#memoryImage"), fallback=$("#memoryFallback");
  img.classList.remove("missing"); img.src=m.img; $("#memoryCaption").textContent=m.cap;
  img.onerror=()=>{img.classList.add("missing");fallback.style.display="flex"};
  img.onload=()=>{fallback.style.display="none"};
}
$("#nextMemory").onclick=()=>{
  mi++;
  if(mi<memories.length){loadMemory();return}
  showScene(5);
};
loadMemory();

// secret
$$("#scene5 .secret-object").forEach(o=>o.onclick=()=>{
  if(o.dataset.secret==="true"){
    $("#keyHint").textContent="You found it, my bachaa. 🔑❤️";
    o.textContent="🔑"; o.style.borderColor="var(--pink)";
    $("#keyNext").classList.remove("hidden"); confetti(25);
  }else{o.classList.add("wrong");setTimeout(()=>o.classList.remove("wrong"),400);toast("Nope 😭 try another one");}
});
$("#keyNext").onclick=()=>showScene(6);

// candle / mic
let blown=false, audioContext=null, analyser=null, stream=null, monitor=null;
function candlesOff(){
  $$(".candle").forEach(c=>c.classList.add("off"));
  $(".cake").classList.add("blown"); blown=true;
  $("#blowStatus").textContent="You did it! Make your wish come true. ✨";
  $("#cakeNext").classList.remove("hidden"); confetti(100); fireworks(12);
}
function manualBlow(){if(!blown)candlesOff()}
$("#manualBlow").onclick=manualBlow;
$("#micBtn").onclick=async()=>{
  if(blown)return;
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    audioContext=new (window.AudioContext||window.webkitAudioContext)();
    const source=audioContext.createMediaStreamSource(stream);
    analyser=audioContext.createAnalyser(); analyser.fftSize=1024;
    source.connect(analyser);
    const data=new Uint8Array(analyser.fftSize);
    $("#micBtn").textContent="🎙️ LISTENING... BLOW NOW";
    $("#manualBlow").classList.remove("hidden");
    $("#blowStatus").textContent="I'm listening... give the candles a good blow 🌬️";
    let strong=0;
    monitor=setInterval(()=>{
      analyser.getByteTimeDomainData(data);
      let sum=0; for(let i=0;i<data.length;i++){const v=(data[i]-128)/128;sum+=v*v}
      const rms=Math.sqrt(sum/data.length);
      if(rms>.10) strong++; else strong=Math.max(0,strong-1);
      if(strong>=3){clearInterval(monitor);try{stream.getTracks().forEach(t=>t.stop())}catch(e){}candlesOff();}
    },80);
  }catch(e){
    $("#blowStatus").textContent="Mic permission wasn't available, so use the backup button. ❤️";
    $("#manualBlow").classList.remove("hidden");
  }
};
$("#cakeNext").onclick=()=>showScene(7);

// cake cutting
$("#cutBtn").onclick=()=>{
  $("#cutCake").classList.add("cut"); $("#cutMessage").classList.remove("hidden");
  $("#cutBtn").classList.add("hidden"); confetti(55);
  setTimeout(()=>$("#letterNext").classList.remove("hidden"),1000);
};
$("#letterNext").onclick=()=>showScene(8);

// letter
const letterText=`Happy Birthday, my Alexa my BAby ❤️

My bachaa, I don't know how to fit everything I feel into one little birthday message, but I still wanted to try.

You know what's funny? Somewhere between all the random conversations, teasing matlab tang karne wla moments, little fights, laughs, and those tiny things that probably don't even seem important... you became such a beautiful part of my life.

And honestly, I hope you know this — you deserve to be loved gently, understood patiently bahut time lagega but i will do it, annoyed occasionally 😂, and celebrated loudly.

So today, on your birthday, I just want you to smile. Not the 'haan haan I'm fine' smile... the real one samjhe. The one that reaches your eyes.

My baby booo my bachaa, I hope this new year of your life brings you peace, happiness, success, and a thousand little reasons to feel proud of yourself.

And ... I hope I get to be there for many of those reasons.

Thank you for being you, thank you for being with me.

Happy Birthday once again, my bachaa. ❤️
Now go make your wish... and don't forget that somewhere, someone is very happy that you were born. 🥹✨`;

$("#openLetter").onclick=()=>{
  $("#envelopeWrap").classList.add("hidden"); $("#letter").classList.remove("hidden");
  typeText($("#typedLetter"),letterText,22,()=>$("#timelineBtn").classList.remove("hidden"));
};
function typeText(el,text,speed,done){
  el.textContent="";let i=0;
  const timer=setInterval(()=>{el.textContent+=text[i++]||"";if(i>=text.length){clearInterval(timer);done&&done()}},speed);
}
$("#timelineBtn").onclick=()=>showScene(9);

// timeline clicks
$$(".timeline-item").forEach((item,i)=>item.onclick=()=>{
  item.animate([{transform:"scale(1)"},{transform:"scale(1.04)"},{transform:"scale(1)"}],{duration:500});
  toast(["A little memory. ❤️","Still smiling? ✨","This one is cute. 😂","This one hits different. 🥹","And this one... I want more. 🌙"][i]);
});
$("#finalBtn").onclick=()=>showScene(10);

function confetti(n=70){
  for(let i=0;i<n;i++){
    const c=document.createElement("i");c.className="confetti";
    c.style.left=Math.random()*100+"%";
    c.style.animationDelay=Math.random()*.7+"s";
    c.style.transform=`rotate(${Math.random()*360}deg)`;
    c.style.background=["#ff78b3","#ffd166","#b987ff","#ffffff"][Math.floor(Math.random()*4)];
    document.body.appendChild(c);setTimeout(()=>c.remove(),3500);
  }
}
function fireworks(n=8){
  const wrap=$("#fireworks");
  for(let i=0;i<n;i++){
    const f=document.createElement("i");f.className="firework";
    f.style.left=(10+Math.random()*80)+"%";f.style.top=(10+Math.random()*65)+"%";
    f.style.background=["#ff80b8","#ffd166","#a979ff","#fff"][Math.floor(Math.random()*4)];
    f.style.boxShadow=`0 0 18px 5px ${f.style.background}`;
    wrap.appendChild(f);setTimeout(()=>f.remove(),1600);
  }
}
function startFinale(){
  setTimeout(()=>{fireworks(16);confetti(120)},300);
  setInterval(()=>{if(current===10)fireworks(4)},1700);
}
$$(".final-yes").forEach(b=>b.onclick=()=>{
  $("#finalMessage").classList.remove("hidden"); confetti(150);fireworks(25);
  toast("Okay then... it's a promise. ❤️");
  b.blur();
});
