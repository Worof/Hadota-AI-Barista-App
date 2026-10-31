


const CAFE="url:assets/cafe.mp3",IMG="assets/hadota.webp";
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f=(s,v={})=>String(s).replace(/\{\{(\w+)\}\}/g,(_,k)=>v[k]??"");
const A=x=>x&&x.ar!==undefined?x.ar:x;
const KEY="hadota.users.v1";
const SID=Math.random().toString(36).slice(2,10),HOLDOUT=0.1;
/* A/B arm: 10% of accounts are a "control" group with no personalisation, so we can measure how much the learning really helps. Set HOLDOUT=0 to switch it off. */
const armOf=u=>{if(!u.arm){let h=0;const k=u.name+"|"+u.createdAt;for(let i=0;i<k.length;i++)h=(h*31+k.charCodeAt(i))>>>0;u.arm=(h%100)<HOLDOUT*100?"control":"learner"}return u.arm};
function track(name,props){const u=me(),ev={t:Date.now(),name,sid:SID,arm:u?armOf(u):null,props:props||{}};DB.log=[...(DB.log||[]),ev].slice(-300);try{Backend.track&&Backend.track(ev)}catch(e){}}
const FB_ACT={"too-acidic":"هقلّل الحموضة","not-bright":"هزوّد الحموضة شوية","too-heavy":"هخفّف القوام","too-light":"هقوّي القوام","too-bitter":"هفتّح التحميص","too-pale":"هغمّق التحميص","too-sweet":"هقلّل الحلاوة","not-sweet":"هزوّد الحلاوة","perfect":"هفضل على نفس الخط"};
const PREFTXT={pa:["بتحب الحموضة أهدى","بتحب الحموضة أعلى"],pb:["بتحب القوام أخف","بتحب القوام أتقل"],pr:["التحميص الأفتح أنسبلك","التحميص الأغمق أنسبلك"],ps:["بتحب الحلاوة أقل","بتحب الحلاوة أكتر"]};
function ld(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.users)return d}catch(e){}return{users:{}}}
let DB=ld(),cdb=null,uid=null,posts=[];
function sv(){DB.ts=Date.now();if(typeof ACCT!=="undefined"&&ACCT&&Backend.kind==="supabase"&&me()){clearTimeout(sv.t);sv.t=setTimeout(()=>Backend.saveData(me()).catch(()=>{}),1200)}try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}if(cdb&&uid)cdb.doc("data/users/"+uid+"/profile").set({blob:JSON.stringify(DB)}).catch(()=>{})}
const me=()=>DB.current?DB.users[DB.current]:null,nm=()=>me()?esc(me().name):"يا باشا",rn=()=>me()?me().name:"يا باشا";
function signIn(n){n=n.replace(/[\u0000-\u001f<>]/g,"").replace(/\s+/g," ").trim().slice(0,30);if(!n)return false;const k=n.toLowerCase();DB.users[k]=DB.users[k]||{name:n,createdAt:Date.now(),history:[],model:newModel(12),bag:[]};DB.current=k;sv();return true}
(async()=>{try{if(!window.claude)return;const u=await claude.use("user");uid=u&&u.id?await u.id():null;cdb=await claude.use("db");if(cdb&&uid){const s=await cdb.doc("data/users/"+uid+"/profile").get();if(s.exists){const c=JSON.parse(s.data().blob);if((c.ts||0)>(DB.ts||0)){DB=c;try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}render()}}}
if(cdb)cdb.collection("posts").orderBy("at","desc").limit(40).onSnapshot(s=>{posts=s.docs.map(d=>d.data());if(page()==="community")render()},()=>{})}catch(e){}})();

/* ---- sound: typed caption starts with the voice ---- */
let mute=false,vol=.35,ac,gain,tk=0;const talk=o=>document.querySelectorAll(".chr").forEach(c=>c.classList.toggle("talk",o));
function speak(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="ar-EG";const v=speechSynthesis.getVoices().find(v=>/^ar/i.test(v.lang));if(v)u.voice=v;u.rate=.92;speechSynthesis.speak(u)}catch(e){}}
function say(t,el){if(!el)return;const my=++tk;el.textContent="";talk(true);if(!mute)speak(t);let i=0;const iv=setInterval(()=>{if(my!==tk||!el.isConnected){clearInterval(iv);return}el.textContent=t.slice(0,++i);if(i>=t.length){clearInterval(iv);talk(false)}},68)}
async function cafe(){try{ac=new(window.AudioContext||window.webkitAudioContext)();gain=ac.createGain();gain.gain.value=0;gain.connect(ac.destination);const raw=CAFE.startsWith("url:")?await (await fetch(CAFE.slice(4))).arrayBuffer():Uint8Array.from(atob(CAFE),c=>c.charCodeAt(0)).buffer;const b=await ac.decodeAudioData(raw);const s=ac.createBufferSource();s.buffer=b;s.loop=true;s.connect(gain);s.start();gain.gain.setTargetAtTime(mute?0:vol,ac.currentTime,.6)}catch(e){try{const a=new Audio(CAFE.startsWith("url:")?CAFE.slice(4):"data:audio/mpeg;base64,"+CAFE);a.loop=true;a.volume=mute?0:vol;a.play();window._a=a}catch(_){}}}
function audio(){if(gain)gain.gain.setTargetAtTime(mute?0:vol,ac.currentTime,.2);if(window._a)window._a.volume=mute?0:vol;if(mute)try{speechSynthesis.cancel()}catch(e){}$("#mb").textContent=mute?"🔇":"🔊"}

/* ---- tahweeg: spices ground WITH the beans, suggested from the flavours chosen ---- */
const SP={cardamom:["هيل",4],cinnamon:["قرفة",2],clove:["قرنفل",.5],nutmeg:["جوزة الطيب",.3],anise:["يانسون",1],pepper:["فلفل أسود",.4],mastic:["مستكة",.5],ginger:["زنجبيل",1],saffron:["زعفران",.1]};
function tahweeg(R,a){const fl=many(a,"flavor"),d=R.drink.id,out=new Map(),add=(k,w)=>out.set(k,Math.max(out.get(k)||0,w));
 if(d==="arabic"){add("cardamom",10);add("saffron",1);add("clove",1);return fmt(out)}
 fl.forEach(x=>{if(SP[x])add(x,1)});const fam=fl.map(x=>(FLAVORS.find(y=>y.id===x)||{}).family);
 if(fam.some(x=>x==="nutty-cocoa"))add("cinnamon",1),add("cardamom",.6);
 if(fam.some(x=>x==="sweet"))add("mastic",1),add("cinnamon",.6);
 if(fam.some(x=>x==="roasted"))add("cardamom",1),add("clove",.6);
 if(d==="turkish"&&!out.size)add("cardamom",.8);
 return fmt(out);
 function fmt(m){return[...m.keys()].slice(0,3).map(k=>({n:SP[k][0],g:Math.round(SP[k][1]*(m.get(k)>5?1:Math.min(1,m.get(k)))*10)/10}))}}

/* ---- state ---- */
let S={ans:{},stack:[],q:null,sel:[],R:null,e:null,started:false};
const page=()=>(location.hash||"#home").slice(1).split("/")[0];
const lab=(q,o)=>o.key?o.key.split(".").reduce((a,k)=>a&&a[k],T):A(o.label);
function nxt(){const r=nextQuestion(S.ans);S.ans=r.answers;S.q=r.question||null;S.sel=[];S.R=null;S.fbSel=[];if(!S.q&&S.ans.drink){const m=me(),lr=armOf(m)==="learner";S.R=recommend(S.ans,lr?m.model:newModel(12),lr?m.prefs:undefined);S.e={at:Date.now(),drink:S.ans.drink,answers:S.ans,blend:S.R.blend.map(p=>({bean:p.bean.id,percent:p.percent})),x:S.R.x,explored:S.R.explored,roast:S.R.roast,method:S.R.method,pred:lr&&m.model.n?Math.round(stats(m.model,S.R.x,0).mean*100)/100:null};m.history=[...m.history,S.e].slice(-50);sv();track("result_shown",{drink:S.e.drink,method:S.e.method,roast:S.e.roast,beans:S.e.blend.map(b=>b.bean),explored:S.R.explored,pred:S.e.pred,n_rated:m.model.n})}}
function reset(){S={ans:{},stack:[],q:null,sel:[],R:null,e:null,started:true};nxt()}
const CHR=()=>`<div class="chr" data-a="hop"><img src="${IMG}" alt="${T.hadota.alt}"><i class="st s1"></i><i class="st s2"></i><i class="st s3"></i></div>`;
const fbHTML=()=>{const e=S.e;if(!e)return"";if(e.fb)return`<div class="card" role="status"><h3>شكراً على رأيك يا ${nm()}</h3>${e.fbActs&&e.fbActs.length?`<p>المرة الجاية:</p><ul>${e.fbActs.map(a=>`<li>${a}</li>`).join("")}</ul>`:`<p class="mute">وصلني كلامك.</p>`}</div>`;
return`<div class="card"><h3>رأيك وتجربتك</h3><p class="mute">قولّي حسّيت بإيه في الكوباية. حدوتة بيتعلم من كلامك ويظبط الخلطة الجاية.</p><div id="ft">${FEEDBACK_TAGS.map(t=>`<button class="tag ${S.fbSel&&S.fbSel.includes(t.id)?"on":""}" data-a="ftag" data-id="${t.id}">${t.ar}</button>`).join("")}</div><textarea id="fbt" rows="3" maxlength="400" placeholder="اكتب تجربتك بكلامك، مثلاً: كانت حامضة شوية وعايزها أتقل" aria-label="رأيك وتجربتك"></textarea><button class="btn" data-a="fbsend">ابعت رأيي</button><p class="mute">كلامك المكتوب بيفضل في حسابك أنت بس. اللي بيتعلم منه حدوتة هو الكلمات اللي بتدل على الطعم (حامضة، تقيلة، مرة...).</p></div>`};
function learnCard(u){const rated=u.history.filter(h=>h.rating),n=rated.length;if(!n)return`<div class="card"><h3>حدوتة بيتعلم ذوقك</h3><p class="mute">${T.learn.none}</p></div>`;
const avg=a=>a.reduce((t,x)=>t+x.rating,0)/a.length,k=Math.min(3,Math.floor(n/2));
const trend=n>=4?(()=>{const a=avg(rated.slice(0,k)),b=avg(rated.slice(-k));return b>a+.2?"📈 تقييماتك بتزيد: من "+a.toFixed(1)+" لـ "+b.toFixed(1):b<a-.2?"📉 تقييماتك نزلت: من "+a.toFixed(1)+" لـ "+b.toFixed(1)+". قولّي ليه":"➖ تقييماتك ثابتة حوالي "+b.toFixed(1)})():"محتاج كام تقييم كمان عشان أقولك الاتجاه.";
const pts=rated.map((h,i)=>(n>1?i/(n-1)*100:50).toFixed(1)+","+(40-(h.rating-1)*9).toFixed(1)).join(" ");
const p=u.prefs||{},lines=Object.keys(PREFTXT).filter(x=>Math.abs(p[x]||0)>=.5).map(x=>PREFTXT[x][p[x]>0?1:0]);
const fam=FAMILIES.map((f,i)=>({n:A(f.name),v:stats(u.model,Object.assign(Array(12).fill(0),{[4+i]:1}),0).mean})).sort((a,b)=>b.v-a.v);
const likes=u.model.n>=3?fam.filter(x=>x.v>.1).slice(0,2).map(x=>x.n):[],dis=u.model.n>=3?fam.filter(x=>x.v<-.1).slice(-1).map(x=>x.n):[];
return`<div class="card"><h3>حدوتة بيتعلم ذوقك</h3><p>${f(T.learn.n,{n:n})}</p><p>${trend}</p><svg viewBox="0 0 100 44" width="100%" height="70" role="img" aria-label="تقييماتك"><polyline fill="none" stroke="var(--brand)" stroke-width="2" points="${pts}"/></svg>${lines.length||likes.length||dis.length?`<p><b>اللي لقيته في ذوقك:</b></p><ul>${lines.map(x=>`<li>${x}</li>`).join("")}${likes.length?`<li>الريحة اللي بتعجبك: ${likes.join("، ")}</li>`:""}${dis.length?`<li>الريحة اللي مش بتحبها: ${dis.join("، ")}</li>`:""}</ul>`:`<p class="mute">لسه بجمع معلومات. كل تقييم وتعليق بيوضّح الصورة.</p>`}<button class="btn alt sm" data-a="export">نزّل بياناتي</button></div>`}
const lvl=(k,i)=>T.result.levels[k][i];

/* ---- views ---- */
const V={};
V.home=()=>{const c=[...new Set(BEANS.map(b=>A(b.origin)))].length,u=me();
return`<section class="hero"><div><p class="eyebrow">${T.site.hero.eyebrow}</p><h1>${T.site.hero.title}</h1><p>${T.site.hero.sub}</p>
${u?`<p><b>${f(T.site.hero.welcomeBack,{name:nm()})}</b></p><a class="btn" href="#ask" data-a="go">${f(T.site.hero.continue,{name:nm()})}</a>`:`<label for="nm"><b>${T.site.hero.nameLabel}</b></label><input type="text" id="nm" maxlength="30" placeholder="${T.site.hero.namePlaceholder}"><button class="btn" data-a="start">${T.site.hero.start}</button>`}</div>
<div><div class="bubble" id="hb" style="margin-bottom:.5rem;color:var(--ink)"></div>${CHR()}</div></section>
<h2>${T.site.how.title}</h2><div class="grid">${[0,1,2].map(i=>`<div class="card"><h3>${i+1}. ${T.site.how.steps[i].title}</h3><p class="mute">${T.site.how.steps[i].text}</p></div>`).join("")}</div>
<h2 style="margin-top:1.2rem">${T.site.coverage.title}</h2><div class="row3" style="grid-template-columns:repeat(4,1fr)"><div class="card"><b>${BEANS.length}</b>${T.site.coverage.beans}</div><div class="card"><b>${c}</b>${T.site.coverage.origins}</div><div class="card"><b>${DRINKS.length}</b>${T.site.coverage.drinks}</div><div class="card"><b>${FLAVORS.length}</b>${T.site.coverage.flavors}</div></div>
<div class="card"><h3>${T.site.promise.title}</h3><p>${f(T.site.promise.text,{hours:HOURS})}</p></div>
<footer><b>حدوتة</b> · ${T.site.footer.tagline}<br>${T.site.footer.privacy}<br>${f(T.site.footer.rights,{year:2026,brand:"حدوتة"})}</footer>`};

V.ask=()=>{if(!me())return`<h2>${T.site.hero.nameLabel}</h2><p class="mute">${T.site.hero.nameRequired}</p><input type="text" id="nm" maxlength="30" placeholder="${T.site.hero.namePlaceholder}" aria-label="${T.site.hero.nameLabel}"><button class="btn" data-a="start">${T.site.hero.start}</button>`;
if(!S.started)reset();
if(!S.q)return res();
const q=S.q,n=Object.keys(S.ans).length;
return`<div class="bar"><i style="width:${Math.min(95,n*8+4)}%"></i></div><div class="say"><img src="${IMG}" alt=""><div class="bubble" id="bb"></div></div>
${q.multi?`<p class="mute">${f(T.app.pickUpTo,{max:q.max,n:S.sel.length})}</p>`:""}
<div class="opts">${q.options(S.ans).map(o=>`<button class="opt ${S.sel.includes(o.id)?"on":""}" data-a="pick" data-id="${esc(o.id)}">${esc(lab(q,o))}</button>`).join("")}</div>
${q.multi?`<button class="btn" data-a="cont" ${S.sel.length?"":"disabled style='opacity:.5'"}>${T.app.continue}</button>`:""}
${S.stack.length?`<button class="btn alt" data-a="back">رجوع</button>`:""}`};

function res(){const R=S.R;if(!R)return`<p>…</p>`;const d=R.dose,a=S.ans,m=me(),tw=tahweeg(R,a),rt=S.e.rating||0;
const steps=(T.steps[R.method]||[]).map(s=>f(s,{water:d.waterMl,g:d.grams,grind:A(GRIND_NAMES[R.grind]),min:d.minutes,temp:d.tempC,shots:d.shots}));
const mk=R.milk?f(R.serve==="hot"?T.extra.milkHot:T.extra.milkIced,{ml:R.milk.ml,milk:A(MILKS.find(x=>x.id===R.milk.id).name)}):"";
const sw=R.sweetness.tsp?f(T.result.sugarSome,{tsp:R.sweetness.tsp,type:R.sweetness.sweetener?A(SWEETENERS.find(x=>x.id===R.sweetness.sweetener).name):""}):T.result.sugarNone;
const adn=R.addons.map(x=>A(ADDONS.find(y=>y.id===x).name));
return`<div class="say"><img src="${IMG}" alt=""><div class="bubble" id="bb"></div></div>
<div class="card"><h2>${A(R.drink.name)} · ${R.serve==="hot"?T.result.hot:T.result.iced}</h2>
<h3>${T.result.blend}</h3>${R.blend.map(p=>`<div class="pct"><span>${A(p.bean.name)} <span class="mute">· ${A(p.bean.origin)} · ${T.result.species[p.bean.species]}</span></span><b>${p.percent}%</b></div>`).join("")}
<dl><dt>${T.result.roast}</dt><dd>${A(ROAST_NAMES[R.roast])}</dd><dt>${T.result.grind}</dt><dd>${A(GRIND_NAMES[R.grind])}</dd><dt>${T.result.acidity}</dt><dd>${lvl("acidity",R.profile.acidity)}</dd><dt>${T.result.body}</dt><dd>${lvl("body",R.profile.body)}</dd><dt>${T.result.sweet}</dt><dd>${lvl("sweet",R.profile.sweet)}</dd><dt>${T.result.aroma}</dt><dd>${R.aroma.map(x=>A(FAMILIES.find(y=>y.id===x).name)).join("، ")}</dd><dt>${T.result.notes}</dt><dd>${R.notes.map(x=>{const o=FLAVORS.find(y=>y.id===x);return o?A(o.name):x}).join("، ")}</dd></dl></div>
<div class="card"><h3>التحويجة اللي بتتطحن مع البن</h3>${tw.length?tw.map(t=>`<span class="tag">${t.n} · ${t.g} جم لكل ١٠٠ جم بن</span>`).join(""):`<p>من غير تحويجة المرة دي: الطعم اللي اخترته أحلى مع بن صافي.</p>`}<p class="mute">ده اقتراح حدوتة على حسب النكهة اللي اخترتها. بتتطحن مع البن نفسه قبل ما تحضّر القهوة.</p></div>
<div class="card"><h3>${T.result.recipe}</h3><p class="mute">${d.grams} ${T.result.unit.g} · ${d.waterMl} ${T.result.unit.ml}</p><ol>${steps.map(s=>`<li>${s}</li>`).join("")}</ol>${mk?`<p>${mk}</p>`:""}<p>${sw}</p>${adn.length?`<p>${f(T.extra.addons,{list:adn.join("، ")})}</p>`:""}<p class="mute">${f(T.result.fresh,{hours:HOURS})}</p></div>
<div class="card"><b>${T.extras.rate}</b><div class="stars" role="radiogroup">${[1,2,3,4,5].map(n=>`<button class="star ${n<=rt?"on":""}" data-a="rate" data-n="${n}" aria-label="${n}">★</button>`).join("")}</div>${rt?`<p role="status">${T[rt>=4?"extras":"extras"][rt>=4?"thanksHigh":"thanksLow"]}</p>`:""}
<p class="mute">${R.explored?T.learn.explored+" ":""}${m.model.n?f(T.learn.n,{n:m.model.n}):T.learn.none}</p>
<button class="btn" data-a="share">${T.extras.share}</button><a class="btn alt" href="#shop" data-a="order">اطلب خلطتك من المتجر</a><button class="btn alt" data-a="again">جرّب خلطة تانية</button><p id="cp" class="mute"></p></div>${fbHTML()}`}

V.profile=()=>{const u=me();if(!u)return V.ask();const h=u.history,fav=h.filter(x=>x.rating>=4).length,bd=(u.cups?1:0)+(h.length>=3?1:0)+(posts.some(p=>p.uid===uid)?1:0);
return`<div class="hero" style="padding-bottom:1rem"><h2>${f(T.site.hero.welcomeBack,{name:nm()})}</h2></div><div class="row3"><div class="card"><b>${h.length}</b>خلطات</div><div class="card"><b>${fav}</b>مفضلة</div><div class="card"><b>${bd}</b>شارات</div></div>
${learnCard(u)}<h3>خلطاتك</h3>
${h.length?[...h].reverse().map(x=>`<div class="card"><b>${A(drinkById(x.drink).name)}</b> ${x.rating?"· "+"★".repeat(x.rating):""}<br><span class="mute">${x.blend.map(p=>A(BEANS.find(b=>b.id===p.bean).name)+" "+p.percent+"%").join(" · ")}</span></div>`).join(""):`<div class="card mute">لسه مفيش خلطات.</div>`}
<a class="btn" href="#ask" data-a="again">عدّل تفضيلاتك وجرّب خلطة جديدة</a>`};

let ACCT=null,TB=[],MS=[],unsubs=[];
const unwatch=()=>{unsubs.forEach(u=>u());unsubs=[]},tid=()=>location.hash.split("/")[1]||"",seats=t=>t.cap-t.members.length,mine=t=>ACCT&&t.members.some(m=>m.id===ACCT.id);
const errMsg=e=>{const m=String(e&&e.message||e);return/no-server/.test(m)?"المجتمع مش متصل بسيرفر. حط بيانات Supabase في config.js.":/table_full|full/.test(m)?"الترابيزة كملت.":/confirm-email/.test(m)?"بعتنالك إيميل تأكيد. أكّده وبعدين سجّل دخول.":/Invalid login/.test(m)?"البريد أو كلمة السر غلط.":/no-preview-db|no-account/.test(m)?"مش قادر أوصل لقاعدة بيانات الترابيزات. أعد تحميل الصفحة وجرّب تاني.":/row-level|permission|policy/i.test(m)?"مش مسموحلك بالعملية دي.":m};
function toast(m){const e=$("#toast");e.textContent=m;e.classList.remove("hide");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.add("hide"),4200)}
const TOPICS=["هيل","تركي","كولد برو","إسبريسو","V60","فرنش بريس","يرجاتشيف","كولومبيا","مستكة","قرفة","تحويجة","كابتشينو","لاتيه","فلات وايت","موكا","تحميص","طحن","حموضة","أرابيكا","روبوستا","كراميل","شوكولاتة","فانيليا","سادة","كبّينج"];
let TP=[],FT="";
const tx=t=>t.title+" "+(t.vibe||"");
const topicsLocal=()=>TOPICS.map(w=>({word:w,n:TB.filter(t=>tx(t).includes(w)).reduce((a,t)=>a+1+t.members.length,0)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,10);
const taste=()=>{const u=me(),h=u&&u.history.length?u.history[u.history.length-1]:null;if(!h)return[];const a=h.answers||{},nn=[A(drinkById(h.drink).name),...many(a,"flavor").map(x=>{const o=FLAVORS.find(y=>y.id===x);return o?A(o.name):""})];return nn.join(" ").split(/\s+/).filter(w=>w.length>2)};
const scoreT=t=>taste().filter(w=>tx(t).includes(w)).length;
const card=t=>`<div class="card"><h3>${esc(t.title)}</h3><p class="mute">${t.vibe?`<span class="tag">${esc(t.vibe)}</span>`:""}${!mine(t)&&scoreT(t)>0?`<span class="tag">🎯 قريبة من ذوقك</span>`:""}${t.when?" 🕒 "+esc(t.when):""}</p><p>👥 ${t.members.length}/${t.cap} · ${seats(t)>0?"فاضل "+seats(t)+" مكان":"الترابيزة كاملة"}</p><p class="mute">${t.members.map(m=>esc(m.name)).join("، ")}</p>${mine(t)?`<a class="btn sm" href="#table/${t.id}">افتح الترابيزة</a> <button class="btn alt sm" data-a="leave" data-id="${t.id}">امشي</button>`:`<button class="btn sm" data-a="join" data-id="${t.id}" ${seats(t)>0?"":"disabled"}>احجز مكان</button>`}${t.host===ACCT.id?` <button class="btn alt sm" data-a="rmtable" data-id="${t.id}">امسح</button>`:""}</div>`;
const sec=(h,l)=>l.length?`<h3 style="margin-top:1rem">${h}</h3><div class="grid">${l.map(card).join("")}</div>`:"";
const tl=()=>{const ok=t=>!FT||tx(t).includes(FT),open=TB.filter(t=>!mine(t)&&seats(t)>0&&ok(t)).sort((a,b)=>scoreT(b)-scoreT(a)||seats(b)-seats(a)),my=TB.filter(mine),full=TB.filter(t=>!mine(t)&&seats(t)<=0&&ok(t));
 return TB.length?sec("ترابيزات تقدر تنضم ليها ("+open.length+")",open)+(open.length?"":`<p class="mute" style="margin-top:.6rem">${FT?"مفيش ترابيزات مفتوحة عن «"+esc(FT)+"». افتح انت واحدة!":"مفيش ترابيزات مفتوحة دلوقتي. افتح انت واحدة!"}</p>`)+sec("ترابيزاتك",my)+sec("كاملة",full):`<p class="mute">لسه مفيش ترابيزات. افتح أول واحدة!</p>`};
const tph=()=>TP.length?`<span class="mute">الأكتر كلاماً:</span> `+TP.map(x=>`<button class="tag ${FT===x.word?"on":""}" data-a="tf" data-w="${esc(x.word)}">${esc(x.word)} · ${x.n}</button>`).join("")+(FT?` <button class="tag" data-a="tf" data-w="">الكل</button>`:""):`<span class="mute">لسه مفيش نقاش كفاية. ابدأ بموضوع:</span> `+TOPICS.slice(0,6).map(w=>`<button class="tag" data-a="seed" data-w="${w}">${w}</button>`).join("");
const loadTopics=()=>{if(!Backend.topics)return;Backend.topics().then(r=>{TP=r;const p=$("#tp");if(p)p.innerHTML=tph()}).catch(()=>{})};
const chall=()=>`<div class="card"><h3>${T.community.challenge.title}</h3><p>${T.community.challenges[Math.floor(Date.now()/6048e5)%T.community.challenges.length]}</p></div>`;
const acctNote=()=>Backend.kind==="supabase"?"محتاج حساب عشان تدخل المجتمع وتقعد على ترابيزة.":Backend.kind==="preview"?"اكتب اسمك وفعّل حسابك، وبعدها تدخل المجتمع.":Backend.missingLib?"مكتبة Supabase ماتحمّلتش. اتأكد من النت وأعد تحميل الصفحة.":"حسابك محفوظ على جهازك. عشان المجتمع والترابيزات اربط Supabase في config.js (الخطوات في README).";
const setupCard=()=>`<h2>${T.nav.community}</h2><p class="mute">${T.community.tagline}</p><div class="card"><h3>المجتمع محتاج سيرفر</h3>${Backend.kind==="preview"?"<p>مش قادر أوصل لقاعدة بيانات الترابيزات دلوقتي. أعد تحميل الصفحة وجرّب تاني.</p>":Backend.missingLib?"<p>إعداد Supabase موجود لكن مكتبته ماتحمّلتش. اتأكد من النت وأعد تحميل الصفحة.</p>":"<p>الأكونتات والترابيزات والشات بتشتغل على سيرفر. افتح <b>config.js</b> وحط رابط Supabase والمفتاح، وبعدها أعد تحميل الصفحة (الخطوات في README).</p>"}<p class="mute">باقي التطبيق (الخلطات والتحويجة والمتجر) شغال من غير سيرفر.</p></div>${chall()}`;
V.community=()=>{const C=T.community;if(Backend.kind==="local"||(ACCT&&ACCT.id==="local"))return setupCard();if(!ACCT)return`<h2>${T.nav.community}</h2><p class="mute">${C.tagline}</p><div class="card"><p>عشان تقعد على ترابيزة لازم يكون ليك حساب، عشان باقي الأعضاء يعرفوا اسمك.</p><a class="btn" href="#account">سجّل دخول أو اعمل حساب</a></div>${chall()}`;
return`<h2>${T.nav.community}</h2><p class="mute">أهلاً يا ${esc(ACCT.name)}. اختار ترابيزة تقعد عليها أو افتح ترابيزتك.</p>${chall()}
<div class="card"><h3>افتح ترابيزة جديدة</h3><input type="text" id="tt" maxlength="60" placeholder="اسم الترابيزة، مثلاً: تركي بالهيل" aria-label="اسم الترابيزة"><select id="tv" aria-label="نوع القعدة"><option>قعدة هادية</option><option>قهوة مختصة</option><option>تذوق وكبّينج</option><option>تركي وتحويجة</option><option>شباب وألعاب</option></select><input type="text" id="tw" maxlength="60" placeholder="الميعاد، مثلاً: الخميس ٩ مساءً" aria-label="الميعاد"><label class="mute">عدد الأماكن</label><select id="tc" aria-label="عدد الأماكن">${[2,3,4,5,6,8,10,12].map(n=>`<option ${n===6?"selected":""}>${n}</option>`).join("")}</select><button class="btn" data-a="mk">افتح الترابيزة</button></div>
<h3>الأكتر كلاماً في الحكواتية</h3><div id="tp">${tph()}</div><div id="tl">${tl()}</div>`};
const th=()=>{const t=TB.find(x=>x.id===tid());return t?`<h2>${esc(t.title)}</h2><p class="mute">${t.vibe?esc(t.vibe)+" · ":""}${t.when?esc(t.when)+" · ":""}${t.members.length}/${t.cap}</p><p>${t.members.map(m=>`<span class="tag">${esc(m.name)}</span>`).join("")}</p>`:`<h2>الترابيزة</h2>`};
const mh=()=>MS.length?MS.map(m=>`<div class="m ${m.uid===ACCT.id?"me":""}"><small>${esc(m.name)} · ${new Date(m.at).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"})}</small>${esc(m.text)}</div>`).join(""):`<p class="mute">ابدأ الكلام.</p>`;
V.table=()=>{if(!ACCT)return V.community();return`<a href="#community">← الترابيزات</a><div id="th">${th()}</div><div class="chat" id="msgs">${mh()}</div><textarea id="mi" rows="2" maxlength="500" placeholder="اكتب رسالتك" aria-label="رسالتك"></textarea><button class="btn" data-a="sendm">ابعت</button>`};
V.account=()=>{const em=Backend.needsEmail;if(ACCT)return`<h2>حسابك</h2><div class="card"><b>${esc(ACCT.name)}</b><p class="mute">خلطاتك وتقييماتك محفوظة على حسابك.</p><button class="btn alt" data-a="logout">تسجيل خروج</button></div>`;
return`<h2>حسابك في حدوتة</h2><p class="mute">${acctNote()}</p><input type="text" id="an" maxlength="30" placeholder="اسمك" aria-label="اسمك" value="${me()?esc(me().name):""}">${em?`<input type="text" id="ae" dir="ltr" autocomplete="email" placeholder="email" aria-label="email"><input type="password" id="ap" dir="ltr" autocomplete="current-password" placeholder="password (٨ حروف على الأقل)" aria-label="password">`:""}<button class="btn" data-a="signup">${em?"اعمل حساب":"فعّل حسابي"}</button>${em?`<button class="btn alt" data-a="signin">عندي حساب</button>`:""}`};
async function afterAuth(a){ACCT=a;if(!me()||me().name!==a.name)signIn(a.name);try{const d=await Backend.loadData();if(d&&d.history&&d.history.length>=me().history.length){DB.users[DB.current]={...d,name:a.name};sv()}}catch(e){}render()}
const watchT=()=>{unwatch();unsubs.push(Backend.watchTables(l=>{TB=l;const e=$("#tl");if(e)e.innerHTML=tl();if(!Backend.topics)TP=topicsLocal();const pp=$("#tp");if(pp)pp.innerHTML=tph();const h=$("#th");if(h)h.innerHTML=th()}))};
const watchM=()=>{unsubs.push(Backend.watchMessages(tid(),l=>{MS=l;const e=$("#msgs");if(e){const at=e.scrollTop+e.clientHeight>=e.scrollHeight-40;e.innerHTML=mh();if(at)e.scrollTop=e.scrollHeight}}))};
V.shop=()=>{const u=me(),bag=u?u.bag||[]:[];
return`<h2>${T.shop.title}</h2><p class="mute">${f(T.shop.sub,{hours:HOURS})}</p>
${["arabica","robusta","liberica","excelsa"].map(sp=>`<h3 style="margin-top:1rem">${T.result.species[sp]}</h3><div class="grid">${BEANS.filter(b=>b.species===sp).map(b=>`<div class="card"><b>${A(b.name)}</b><br><span class="mute">${A(b.origin)} · ${b.roasts.map(r=>A(ROAST_NAMES[r])).join(" / ")}</span><br>${b.notes.slice(0,3).map(x=>{const o=FLAVORS.find(y=>y.id===x);return`<span class="tag">${o?A(o.name):x}</span>`}).join("")}<button class="btn alt sm" data-a="bag" data-id="${b.id}">${bag.includes(b.id)?T.shop.added:T.shop.add}</button></div>`).join("")}</div>`).join("")}
<h3 style="margin-top:1rem">${T.shop.bag}</h3>${bag.length?bag.map(id=>`<div class="pct"><span>${A(BEANS.find(b=>b.id===id).name)}</span><button class="btn alt sm" data-a="unbag" data-id="${id}">${T.shop.remove}</button></div>`).join("")+`<button class="btn" data-a="copy">${T.shop.copy}</button><p id="cp" class="mute"></p>`:`<p class="mute">${T.shop.bagEmpty}</p>`}<p class="mute">${T.shop.note}</p>`};

V.blog=()=>`<h2>${T.blog.title}</h2><p class="mute">${T.blog.sub}</p>${ARTICLES.map(a=>`<div class="card"><h3>${A(a.title)}</h3><p class="mute">${f(T.blog.min,{n:a.minutes})}</p>${S.art===a.id?a.body.ar.map(p=>`<p>${f(p.replace(/\{hours\}/g,HOURS))}</p>`).join("")+`<button class="btn alt sm" data-a="art" data-id="">${T.blog.back}</button>`:`<button class="btn alt sm" data-a="art" data-id="${a.id}">${T.blog.read}</button>`}</div>`).join("")}`;

let CH=[];
const gold=q=>{const n=rn();return/حموض/.test(q)?"لو بتحب الحموضة العالية خد تحميص فاتح يا "+n+"، والغامق أهدى وأتقل.":/هيل|تحويج|مستك|قرفة|قرنفل/.test(q)?"التحويجة بتتطحن مع البن مش بتتضاف بعدين. هيل للشوكولاتة والتوابل، ومستكة وقرفة للكراميل.":/طحن/.test(q)?"تركي: ناعم جداً. إسبريسو: ناعم. فلتر: وسط. كولد برو: خشن.":/تحميص|روست/.test(q)?"فاتح: حموضة وفواكه. وسط: متوازن. غامق: تقل وشوكولاتة.":/كولد|ساقع/.test(q)?"الكولد برو بياخد ١٢ لـ ١٦ ساعة في التلاجة بطحن خشن، وطعمه أهدى وأحلى.":/لبن/.test(q)?"اللبن الكامل أحلى وأكرم، والشوفان أقرب طعم ليه من غير لاكتوز.":"سؤال حلو يا "+n+"! جرّب «ابدأ رحلتك» وأنا أظبطلك خلطتك."};
V.chat=()=>`<h2>${T.nav.ask}</h2><div class="say"><img src="${IMG}" alt=""><div class="bubble">اسألني في أي حاجة عن القهوة${me()?" يا "+nm():""}.</div></div>${CH.map(m=>`<div class="card ${m[0]==="u"?"post":""}">${esc(m[1])}</div>`).join("")}<textarea id="ci" rows="2" placeholder="اكتب سؤالك" aria-label="سؤالك"></textarea><button class="btn alt" data-a="mic">🎤 اتكلم بدل ما تكتب</button><button class="btn" data-a="send" id="sb">ابعت</button>`;

V.more=()=>`<h2>${T.app.settings}</h2><a class="opt" href="#account" style="text-decoration:none">${ACCT?"حسابك: "+esc(ACCT.name):"سجّل دخول أو اعمل حساب"}</a><button class="opt" data-a="mute">${T.app.mute} / ${T.app.unmute}</button><label class="mute">${T.app.ambience}</label><input type="range" min="0" max="100" value="${vol*100}" id="vl" aria-label="${T.app.ambience}"><button class="opt" data-a="theme">الوضع الليلي / النهاري</button><button class="opt" data-a="big">${T.app.largeText}</button>${me()?`<button class="opt" data-a="out">${T.app.signOut}</button><button class="opt" data-a="wipe">مسح كل بياناتي</button>`:""}`;

/* ---- router ---- */
const NAV=[["home",T.nav.home],["community",T.nav.community],["shop",T.nav.shop],["blog",T.nav.blog],["ask",T.nav.ask]],IC={home:"🏠",community:"👥",shop:"🛍️",blog:"📖",ask:"💬"};
function render(){let p=page();if(p==="chat")p="chat";const k=V[p]?p:"home",nav=k==="chat"?"ask":k==="table"?"community":k==="profile"||k==="more"||k==="account"?"":k;
const hk=k==="chat"?"ask":k;$("#top").innerHTML=NAV.map(n=>`<a href="#${n[0]==="ask"?"ask":n[0]}" data-r="${n[0]}" class="${n[0]===nav?"on":""}">${n[1]}</a>`).join("");
$("#tabs").innerHTML=NAV.map(n=>`<a href="#${n[0]}" class="${n[0]===nav?"on":""}"><span>${IC[n[0]]}</span>${n[0]==="community"?"الحكواتية":n[1]}</a>`).join("");
$("#view").innerHTML=V[k]();talk(false);unwatch();if(ACCT&&k==="community"){watchT();loadTopics()}if(ACCT&&k==="table"){watchT();watchM()}const mi=$("#mi");if(mi)mi.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ACT.sendm()}};
const b=$("#bb");if(b&&S.q&&k==="ask"){const q=S.q;say(S.stack.length?T.callouts[Math.floor(Math.random()*T.callouts.length)].replace("{{name}}",rn())+T.q[q.id].ask:f(T.lines.intro,{name:rn()}),b)}
if(b&&!S.q&&S.R)say(f(T.result.intro,{name:rn()})+" "+T.cheers[Math.floor(Math.random()*2)],b);
const hb=$("#hb");if(hb&&!hb.textContent&&window._greet){say(window._greet,hb);window._greet=0}
const vl=$("#vl");if(vl)vl.oninput=()=>{vol=vl.value/100;audio()}}
addEventListener("hashchange",()=>{S.art=null;render()});

/* ---- actions ---- */
const ACT={
tf(t){FT=t.dataset.w;const l=$("#tl");if(l)l.innerHTML=tl();const p=$("#tp");if(p)p.innerHTML=tph()},
seed(t){const i=$("#tt");if(i){i.value=t.dataset.w+" ";i.focus()}},
mic(){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){toast("المتصفح ده مش بيدعم الميكروفون. جرّب Chrome.");return}const r=new R();r.lang="ar-EG";r.onresult=e=>{$("#ci").value=e.results[0][0].transcript};r.onerror=()=>toast("مسمعتش حاجة، جرّب تاني");r.start();toast("اتكلم دلوقتي…")},
async signup(){const n=$("#an").value.trim();if(!n){$("#an").focus();return}try{const em=Backend.needsEmail;await afterAuth(await Backend.signUp(em?$("#ae").value.trim():"",em?$("#ap").value:"",n));location.hash="#community"}catch(e){toast(errMsg(e))}},
async signin(){try{await afterAuth(await Backend.signIn($("#ae").value.trim(),$("#ap").value));location.hash="#community"}catch(e){toast(errMsg(e))}},
async logout(){await Backend.signOut();ACCT=null;unwatch();location.hash="#home";render()},
hop(t){t.classList.remove("hop");void t.offsetWidth;t.classList.add("hop");say(T.hadota.greeting,$("#hb")||$("#bb"))},
async mk(){const t=$("#tt").value.trim();if(t.length<2){$("#tt").focus();return}try{await Backend.create({title:t,vibe:$("#tv").value,when:$("#tw").value.trim(),cap:+$("#tc").value});$("#tt").value="";watchT();toast("الترابيزة اتفتحت")}catch(e){toast(errMsg(e))}},
async join(t){try{await Backend.join(t.dataset.id);location.hash="#table/"+t.dataset.id}catch(e){toast(errMsg(e));watchT()}},
async leave(t){try{await Backend.leave(t.dataset.id);watchT()}catch(e){toast(errMsg(e))}},
async rmtable(t){if(!confirm("تمسح الترابيزة؟"))return;try{await Backend.remove(t.dataset.id);watchT()}catch(e){toast(errMsg(e))}},
async sendm(){const v=$("#mi").value.trim();if(!v)return;$("#mi").value="";try{await Backend.say(tid(),v.slice(0,500));unwatch();watchT();watchM()}catch(e){toast(errMsg(e))}},
start(){const v=$("#nm").value;if(!signIn(v)){$("#nm").focus();return}reset();location.hash="#ask";render()},
go(){if(!S.started)reset()},
pick(t){const q=S.q,id=t.dataset.id;if(q.multi){const ex=["any","none"];if(ex.includes(id))S.sel=[id];else{S.sel=S.sel.filter(x=>!ex.includes(x));S.sel=S.sel.includes(id)?S.sel.filter(x=>x!==id):S.sel.length<q.max?[...S.sel,id]:S.sel}render();return}
S.stack.push(JSON.stringify(S.ans));S.ans={...S.ans,[q.id]:id};nxt();render()},
cont(){if(!S.sel.length)return;S.stack.push(JSON.stringify(S.ans));S.ans={...S.ans,[S.q.id]:S.sel};nxt();render()},
back(){if(!S.stack.length)return;if(S.e&&S.R){const m=me();m.history=m.history.filter(h=>h!==S.e)}S.ans=JSON.parse(S.stack.pop());nxt();render()},
again(){const m=me();if(S.e&&!S.e.rating&&S.e.reward===undefined){if(armOf(m)==="learner"){m.model=learn(m.model,S.e.x,-.25);S.e.reward=-.25}track("skipped",{drink:S.e.drink});sv()}reset();render()},
rate(t){const n=+t.dataset.n,m=me(),r=rewardOfRating(n);if(armOf(m)==="learner")m.model=learn(m.model,S.e.x,r,S.e.reward);const again=S.e.rated?1:0;S.e.rating=n;S.e.reward=r;S.e.rated=1;sv();track("rated",{rating:n,drink:S.e.drink,roast:S.e.roast,beans:S.e.blend.map(b=>b.bean),explored:S.e.explored,pred:S.e.pred,rerate:again});render()},
ftag(t){const id=t.dataset.id;S.fbSel=S.fbSel||[];S.fbSel=S.fbSel.includes(id)?S.fbSel.filter(x=>x!==id):[...S.fbSel,id];t.classList.toggle("on")},
fbsend(){const e=S.e,m=me();if(!e)return;const txt=($("#fbt").value||"").trim().slice(0,400),tags=[...new Set([...(S.fbSel||[]),...tagsFromText(txt)])];if(!tags.length&&!txt){toast("اختار حاجة أو اكتب كلمتين عن تجربتك");return}
e.fb={tags,text:txt,at:Date.now()};if(armOf(m)==="learner"){m.prefs=applyFeedback(m.prefs,tags);e.fbActs=tags.map(x=>FB_ACT[x]).filter(Boolean)}else e.fbActs=[];sv();track("feedback_sent",{tags,chars:txt.length,rating:e.rating||null});try{Backend.sendFeedback&&Backend.sendFeedback({tags,rating:e.rating||null,drink:e.drink,roast:e.roast})}catch(x){}render()},
export(){const u=me(),blob=new Blob([JSON.stringify({user:{name:u.name,arm:u.arm,prefs:u.prefs||null,history:u.history},log:DB.log||[]},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="hadota-my-data.json";document.body.appendChild(a);a.click();a.remove()},
share(){const R=S.R,txt=T.extras.cardTitle+": "+A(R.drink.name)+" — "+R.blend.map(p=>A(p.bean.name)+" "+p.percent+"%").join("، ")+" — "+A(ROAST_NAMES[R.roast])+" / "+A(GRIND_NAMES[R.grind]);cp(txt)},
order(){track("order_started",{});const m=me();if(S.R)m.bag=[...new Set([...(m.bag||[]),...S.R.blend.map(p=>p.bean.id)])];sv()},
bag(t){const m=me();if(!m)return;m.bag=[...new Set([...(m.bag||[]),t.dataset.id])];sv();render()},
unbag(t){const m=me();m.bag=m.bag.filter(x=>x!==t.dataset.id);sv();render()},
copy(){const m=me();cp(T.shop.orderHeader+"\n"+m.bag.map(id=>"- "+A(BEANS.find(b=>b.id===id).name)).join("\n"))},
art(t){S.art=t.dataset.id||null;render()},
cups(t){me().cups=t.dataset.k;sv();render()},
async post(){const v=$("#pi").value.trim();if(!v)return;const m=me(),att=$("#pa").checked&&S.R?S.R.blend.map(p=>A(p.bean.name)).join("، "):"";const p={uid:uid||"local",name:m.name,badge:T.community.badge[m.cups],text:v.slice(0,280),blend:att,at:Date.now()};
if(cdb){try{await cdb.collection("posts").add(p)}catch(e){m.posts=[...(m.posts||[]),p];sv();render()}}else{m.posts=[...(m.posts||[]),p];sv();render()}},
invite(){cp(T.community.invite.text)},
mute(){mute=!mute;audio()},theme(){const d=document.documentElement;d.dataset.theme=d.dataset.theme==="dark"?"light":"dark"},big(){document.body.classList.toggle("big")},
out(){delete DB.current;S.started=false;sv();location.hash="#home";render()},
wipe(){try{localStorage.removeItem(KEY)}catch(e){}DB={users:{}};S.started=false;sv();location.hash="#home";render()},
async send(){const ta=$("#ci"),q=ta.value.trim();if(!q)return;CH.push(["u",q]);$("#sb").disabled=true;let ans="";const last=S.R?A(S.R.drink.name)+" ببن "+S.R.blend.map(p=>A(p.bean.name)).join(" و "):"";
try{if(Backend.ask)ans=await Backend.ask(q,last)||""}catch(e){}
if(!ans)try{const sm=window.claude?await claude.use("sample"):null;if(sm){const r=await sm([{role:"user",content:"أنت حدوتة، باريستا مصري ودود بيتكلم بالعامية المصرية وبيخدم مدمني القهوة. رد في ٣ جمل بالكتير. "+(last?"آخر خلطة اتقترحت عليه: "+last+". ":"")+"سؤاله: "+q}],{cache:false,modelTier:"quick"});ans=r.text}}catch(e){}
if(!ans)ans=gold(q);
CH.push(["b",ans]);render()}};
function cp(t){try{navigator.clipboard.writeText(t).then(()=>{const e=$("#cp");if(e)e.textContent=T.extras.copied})}catch(e){const e2=$("#cp");if(e2)e2.textContent=t}}
document.addEventListener("click",e=>{const t=e.target.closest("[data-a]");if(t&&ACT[t.dataset.a]&&!t.disabled)ACT[t.dataset.a](t)});
$("#sphint").textContent=T.splash.hint;$("#enter").textContent=T.splash.enter;
$("#enter").onclick=()=>{$("#splash").classList.add("hide");cafe();window._greet=T.hadota.greeting+(me()?"! "+f(T.lines.welcomeBack,{name:rn()}):"");render()};
Backend.init().then(a=>{if(a)afterAuth(a)}).catch(()=>{});
render();
