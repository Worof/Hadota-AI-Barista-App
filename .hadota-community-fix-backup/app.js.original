


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
}catch(e){}})();

/* ---- sound: typed caption starts with the voice ---- */
let mute=false,vol=.35,ac,gain,tk=0;const talk=o=>document.querySelectorAll(".chr").forEach(c=>c.classList.toggle("talk",o));
function say(t,el){if(!el)return;const my=++tk;el.textContent="";talk(true);if(!mute)speak(t);let i=0;const iv=setInterval(()=>{if(my!==tk||!el.isConnected){clearInterval(iv);return}el.textContent=t.slice(0,++i);if(i>=t.length){clearInterval(iv);talk(false)}},68)}
async function cafe(){try{ac=new(window.AudioContext||window.webkitAudioContext)();gain=ac.createGain();gain.gain.value=0;gain.connect(ac.destination);const raw=CAFE.startsWith("url:")?await (await fetch(CAFE.slice(4))).arrayBuffer():Uint8Array.from(atob(CAFE),c=>c.charCodeAt(0)).buffer;const b=await ac.decodeAudioData(raw);const s=ac.createBufferSource();s.buffer=b;s.loop=true;s.connect(gain);s.start();gain.gain.setTargetAtTime(mute?0:vol,ac.currentTime,.6)}catch(e){try{const a=new Audio(CAFE.startsWith("url:")?CAFE.slice(4):"data:audio/mpeg;base64,"+CAFE);a.loop=true;a.volume=mute?0:vol;a.play();window._a=a}catch(_){}}}
function audio(){if(gain)gain.gain.setTargetAtTime(mute?0:vol,ac.currentTime,.2);if(window._a)window._a.volume=mute?0:vol;if(mute)stopVoice();$("#mb").textContent=mute?"🔇":"🔊"}

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
function nxt(){const r=nextQuestion(S.ans);S.ans=r.answers;S.q=r.question||null;S.sel=[];S.R=null;S.fbSel=[];if(!S.q&&S.ans.drink){const m=me(),lr=armOf(m)==="learner";S.R=recommend(S.ans,lr?m.model:newModel(12),lr?m.prefs:undefined);S.e={id:uid2(),at:Date.now(),recipe:snap(S.R),drink:S.ans.drink,answers:S.ans,blend:S.R.blend.map(p=>({bean:p.bean.id,percent:p.percent})),x:S.R.x,explored:S.R.explored,roast:S.R.roast,method:S.R.method,pred:lr&&m.model.n?Math.round(stats(m.model,S.R.x,0).mean*100)/100:null};m.history=[...m.history,S.e].slice(-50);sv();track("result_shown",{drink:S.e.drink,method:S.e.method,roast:S.e.roast,beans:S.e.blend.map(b=>b.bean),explored:S.R.explored,pred:S.e.pred,n_rated:m.model.n})}}
function reset(){S={ans:{},stack:[],q:null,sel:[],R:null,e:null,started:true};nxt()}
const CHR=()=>`<div class="chr" data-a="hop"><img src="${IMG}" alt="${T.hadota.alt}"><i class="st s1"></i><i class="st s2"></i><i class="st s3"></i></div>`;
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

let ACCT=null,TB=[],MS=[],unsubs=[];
const unwatch=()=>unsubAll(),tid=()=>location.hash.split("/")[1]||"",seats=t=>t.cap-t.n,mine=t=>ACCT&&t.members.some(m=>m.id===ACCT.id);
const errMsg=e=>{const m=String(e&&e.message||e);return/no-server/.test(m)?"المجتمع مش متصل بسيرفر. حط بيانات Supabase في config.js.":/table_full|full/.test(m)?"الترابيزة كملت.":/confirm-email/.test(m)?"بعتنالك إيميل تأكيد. أكّده وبعدين سجّل دخول.":/Invalid login/.test(m)?"البريد أو كلمة السر غلط.":/no-preview-db|no-account/.test(m)?"مش قادر أوصل لقاعدة بيانات الترابيزات. أعد تحميل الصفحة وجرّب تاني.":/row-level|permission|policy/i.test(m)?"مش مسموحلك بالعملية دي.":m};
function toast(m){const e=$("#toast");e.textContent=m;e.classList.remove("hide");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.add("hide"),4200)}
const TOPICS=["هيل","تركي","كولد برو","إسبريسو","V60","فرنش بريس","يرجاتشيف","كولومبيا","مستكة","قرفة","تحويجة","كابتشينو","لاتيه","فلات وايت","موكا","تحميص","طحن","حموضة","أرابيكا","روبوستا","كراميل","شوكولاتة","فانيليا","سادة","كبّينج"];
let TP=[],FT="";
const chall=()=>`<div class="card"><h3>${T.community.challenge.title}</h3><p>${T.community.challenges[Math.floor(Date.now()/6048e5)%T.community.challenges.length]}</p></div>`;
const acctNote=()=>Backend.kind==="supabase"?"محتاج حساب عشان تدخل المجتمع وتقعد على ترابيزة.":Backend.kind==="preview"?"اكتب اسمك وفعّل حسابك، وبعدها تدخل المجتمع.":Backend.missingLib?"مكتبة Supabase ماتحمّلتش. اتأكد من النت وأعد تحميل الصفحة.":"حسابك محفوظ على جهازك. عشان المجتمع والترابيزات اربط Supabase في config.js (الخطوات في README).";
const setupCard=()=>`<h2>${T.nav.community}</h2><p class="mute">${T.community.tagline}</p><div class="card"><h3>المجتمع محتاج سيرفر</h3>${Backend.kind==="preview"?"<p>مش قادر أوصل لقاعدة بيانات الترابيزات دلوقتي. أعد تحميل الصفحة وجرّب تاني.</p>":Backend.missingLib?"<p>إعداد Supabase موجود لكن مكتبته ماتحمّلتش. اتأكد من النت وأعد تحميل الصفحة.</p>":"<p>الأكونتات والترابيزات والشات بتشتغل على سيرفر. افتح <b>config.js</b> وحط رابط Supabase والمفتاح، وبعدها أعد تحميل الصفحة (الخطوات في README).</p>"}<p class="mute">باقي التطبيق (الخلطات والتحويجة والمتجر) شغال من غير سيرفر.</p></div>${chall()}`;
V.account=()=>{const em=Backend.needsEmail;if(ACCT)return`<h2>حسابك</h2><div class="card"><b>${esc(ACCT.name)}</b><p class="mute">خلطاتك وتقييماتك محفوظة على حسابك.</p><button class="btn alt" data-a="logout">تسجيل خروج</button></div>`;
return`<h2>حسابك في حدوتة</h2><p class="mute">${acctNote()}</p><input type="text" id="an" maxlength="30" placeholder="اسمك" aria-label="اسمك" value="${me()?esc(me().name):""}">${em?`<input type="text" id="ae" dir="ltr" autocomplete="email" placeholder="email" aria-label="email"><input type="password" id="ap" dir="ltr" autocomplete="current-password" placeholder="password (٨ حروف على الأقل)" aria-label="password">`:""}<button class="btn" data-a="signup">${em?"اعمل حساب":"فعّل حسابي"}</button>${em?`<button class="btn alt" data-a="signin">عندي حساب</button>`:""}`};
async function afterAuth(a){ACCT=a;if(!me()||me().name!==a.name)signIn(a.name);try{const d=await Backend.loadData();if(d&&d.history&&d.history.length>=me().history.length){DB.users[DB.current]={...d,name:a.name};sv()}}catch(e){}render()}

let CH=[];
const gold=q=>{const n=rn();return/حموض/.test(q)?"لو بتحب الحموضة العالية خد تحميص فاتح يا "+n+"، والغامق أهدى وأتقل.":/هيل|تحويج|مستك|قرفة|قرنفل/.test(q)?"التحويجة بتتطحن مع البن مش بتتضاف بعدين. هيل للشوكولاتة والتوابل، ومستكة وقرفة للكراميل.":/طحن/.test(q)?"تركي: ناعم جداً. إسبريسو: ناعم. فلتر: وسط. كولد برو: خشن.":/تحميص|روست/.test(q)?"فاتح: حموضة وفواكه. وسط: متوازن. غامق: تقل وشوكولاتة.":/كولد|ساقع/.test(q)?"الكولد برو بياخد ١٢ لـ ١٦ ساعة في التلاجة بطحن خشن، وطعمه أهدى وأحلى.":/لبن/.test(q)?"اللبن الكامل أحلى وأكرم، والشوفان أقرب طعم ليه من غير لاكتوز.":"سؤال حلو يا "+n+"! جرّب «ابدأ رحلتك» وأنا أظبطلك خلطتك."};
V.chat=()=>`<h2>${T.nav.ask}</h2><div class="say"><img src="${IMG}" alt=""><div class="bubble">اسألني في أي حاجة عن القهوة${me()?" يا "+nm():""}.</div></div>${CH.map(m=>`<div class="card ${m[0]==="u"?"post":""}">${esc(m[1])}</div>`).join("")}<textarea id="ci" rows="2" placeholder="اكتب سؤالك" aria-label="سؤالك"></textarea><button class="btn alt" data-a="mic">🎤 اتكلم بدل ما تكتب</button><button class="btn" data-a="send" id="sb">ابعت</button>`;


/* ---- router ---- */
const NAV=[["home",T.nav.home],["community",T.nav.community],["shop",T.nav.shop],["blog",T.nav.blog],["ask",T.nav.ask]],IC={home:"🏠",community:"👥",shop:"🛍️",blog:"📖",ask:"💬"};

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
cont(){if(!S.sel.length)return;S.stack.push(JSON.stringify(S.ans));S.ans={...S.ans,[S.q.id]:S.sel};nxt();render()},
back(){if(!S.stack.length)return;if(S.e&&S.R){const m=me();m.history=m.history.filter(h=>h!==S.e)}S.ans=JSON.parse(S.stack.pop());nxt();render()},
again(){const m=me();if(S.e&&!S.e.rating&&S.e.reward===undefined){if(armOf(m)==="learner"){m.model=learn(m.model,S.e.x,-.25);S.e.reward=-.25}track("skipped",{drink:S.e.drink});sv()}reset();render()},
rate(t){const n=+t.dataset.n,m=me(),r=rewardOfRating(n);if(armOf(m)==="learner")m.model=learn(m.model,S.e.x,r,S.e.reward);const again=S.e.rated?1:0;S.e.rating=n;S.e.reward=r;S.e.rated=1;sv();track("rated",{rating:n,drink:S.e.drink,roast:S.e.roast,beans:S.e.blend.map(b=>b.bean),explored:S.e.explored,pred:S.e.pred,rerate:again});render()},
ftag(t){const id=t.dataset.id;S.fbSel=S.fbSel||[];S.fbSel=S.fbSel.includes(id)?S.fbSel.filter(x=>x!==id):[...S.fbSel,id];t.classList.toggle("on")},
fbsend(){const e=S.e,m=me();if(!e)return;const txt=($("#fbt").value||"").trim().slice(0,400),tags=[...new Set([...(S.fbSel||[]),...tagsFromText(txt)])];if(!tags.length&&!txt){toast("اختار حاجة أو اكتب كلمتين عن تجربتك");return}
e.fb={tags,text:txt,at:Date.now()};if(armOf(m)==="learner"){m.prefs=applyFeedback(m.prefs,tags);e.fbActs=tags.map(x=>FB_ACT[x]).filter(Boolean)}else e.fbActs=[];sv();track("feedback_sent",{tags,chars:txt.length,rating:e.rating||null});try{Backend.sendFeedback&&Backend.sendFeedback({tags,rating:e.rating||null,drink:e.drink,roast:e.roast})}catch(x){}render()},
share(){const R=S.R,txt=T.extras.cardTitle+": "+A(R.drink.name)+" — "+R.blend.map(p=>A(p.bean.name)+" "+p.percent+"%").join("، ")+" — "+A(ROAST_NAMES[R.roast])+" / "+A(GRIND_NAMES[R.grind]);cp(txt)},
order(){track("order_started",{});const m=me();if(S.R)m.bag=[...new Set([...(m.bag||[]),...S.R.blend.map(p=>p.bean.id)])];sv()},
bag(t){const m=me();if(!m)return;m.bag=[...new Set([...(m.bag||[]),t.dataset.id])];sv();render()},
unbag(t){const m=me();m.bag=m.bag.filter(x=>x!==t.dataset.id);sv();render()},
copy(){const m=me();cp(T.shop.orderHeader+"\n"+m.bag.map(id=>"- "+A(BEANS.find(b=>b.id===id).name)).join("\n"))},
mute(){mute=!mute;audio()},theme(){const d=document.documentElement;d.dataset.theme=d.dataset.theme==="dark"?"light":"dark"},big(){document.body.classList.toggle("big")},
out(){delete DB.current;S.started=false;sv();location.hash="#home";render()},
wipe(){try{localStorage.removeItem(KEY)}catch(e){}DB={users:{}};S.started=false;sv();location.hash="#home";render()},
async send(){const ta=$("#ci"),q=ta.value.trim();if(!q)return;CH.push(["u",q]);$("#sb").disabled=true;let ans="";const last=S.R?A(S.R.drink.name)+" ببن "+S.R.blend.map(p=>A(p.bean.name)).join(" و "):"";
try{if(Backend.ask)ans=await Backend.ask(q,last,ruleLines(me()&&me().prefs).join("، "))||""}catch(e){}
if(!ans)try{const sm=window.claude?await claude.use("sample"):null;if(sm){const r=await sm([{role:"user",content:"أنت حدوتة، باريستا مصري ودود بيتكلم بالعامية المصرية وبيخدم مدمني القهوة. رد في ٣ جمل بالكتير. "+(last?"آخر خلطة اتقترحت عليه: "+last+". ":"")+(ruleLines(me()&&me().prefs).length?"تفضيلات العميل: "+ruleLines(me()&&me().prefs).join("، ")+". ":"")+"سؤاله: "+q}],{cache:false,modelTier:"quick"});ans=r.text}}catch(e){}
if(!ans)ans=gold(q);
CH.push(["b",ans]);render()}};
function cp(t){try{navigator.clipboard.writeText(t).then(()=>{const e=$("#cp");if(e)e.textContent=T.extras.copied})}catch(e){const e2=$("#cp");if(e2)e2.textContent=t}}
document.addEventListener("click",e=>{const t=e.target.closest("[data-a]");if(t&&ACT[t.dataset.a]&&!t.disabled)ACT[t.dataset.a](t)});
$("#sphint").textContent=T.splash.hint;$("#enter").textContent=T.splash.enter;
$("#enter").onclick=()=>{$("#splash").classList.add("hide");cafe();window._greet=T.hadota.greeting+(me()?"! "+f(T.lines.welcomeBack,{name:rn()}):"");render()};
/* ================= v2 features: recipes, favourites, usage, shop pages, articles, community news feed, voice =================
   This block is appended to app.js. It re-defines views (V.*) and adds actions (ACT.*). */

/* ---- sound: clip-only voice (one male voice on every device) and silence when you leave the app ---- */
let VM=null,_clips=[];try{fetch("assets/voice/manifest.json").then(r=>r.ok?r.json():null).then(j=>{VM=j}).catch(()=>{})}catch(e){}
const spoken=t=>{const n=rn();return t.split("يا "+n).join("").split(n).join("").replace(/\s+/g," ").replace(/\s([!،.؟?])/g,"$1").replace(/^[\s،,]+/,"").trim()};
const sentences=t=>spoken(t).split(/(?<=[.!؟?])\s+/).map(x=>x.trim()).filter(Boolean);
function stopVoice(){_clips.forEach(a=>{try{a.pause()}catch(e){}});_clips=[]}
function playClips(l){let i=0;const nx=()=>{if(i>=l.length)return;const a=new Audio(l[i++]);_clips.push(a);a.onended=nx;a.play().catch(()=>{})};nx()}
/* Hadota speaks ONLY with the recorded male clips. No device voice is ever used, so he sounds the same everywhere. Without clips he is silent and the caption still types. */
function speak(t){stopVoice();const ss=sentences(t);if(VM&&ss.length&&ss.every(x=>VM[x]))playClips(ss.map(x=>"assets/voice/"+VM[x]))}
function hushAudio(hide){try{if(hide){if(ac&&ac.state==="running")ac.suspend();if(window._a)window._a.pause();stopVoice()}else{if(ac&&ac.state==="suspended")ac.resume();if(window._a&&!mute)window._a.play().catch(()=>{})}}catch(e){}}
document.addEventListener("visibilitychange",()=>hushAudio(document.hidden));
addEventListener("pagehide",()=>hushAudio(true));addEventListener("pageshow",()=>hushAudio(false));

/* ---- helpers ---- */
const uid2=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const rid=e=>e.id||(e.id=String(e.at));
const findE=id=>{const u=me();return u?u.history.find(e=>rid(e)===id):null};
const dstr=ts=>new Date(ts).toLocaleDateString("ar-EG",{day:"numeric",month:"short"});
const tstr=ts=>new Date(ts).toLocaleString("ar-EG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const beanName=id=>{const b=BEANS.find(x=>x.id===id);return b?A(b.name):id};
const recipeTitle=e=>{const d=drinkById(e.drink);return(d?A(d.name):"قهوة")+(e.blend&&e.blend[0]?" · "+beanName(e.blend[0].bean):"")};
const snap=R=>({drink:R.drink.id,serve:R.serve,method:R.method,blend:R.blend.map(p=>({bean:p.bean.id,percent:p.percent})),roast:R.roast,grind:R.grind,dose:R.dose,milk:R.milk,sweetness:R.sweetness,addons:R.addons,profile:R.profile,aroma:R.aroma,notes:R.notes});
const hydrate=e=>{let s=e.recipe;if(!s){const r=recommend(e.answers||{},null);if(!r)return null;s=snap(r)}return{drink:drinkById(s.drink),serve:s.serve,method:s.method,blend:s.blend.map(p=>({bean:BEANS.find(b=>b.id===p.bean),percent:p.percent})),roast:s.roast,grind:s.grind,dose:s.dose,milk:s.milk,sweetness:s.sweetness,addons:s.addons,profile:s.profile,aroma:s.aroma,notes:s.notes}};
const errM=e=>{const m=String(e&&e.message||e);return/media-too-big/.test(m)?"الصورة كبيرة على المعاينة. جرّب صورة أصغر.":/video-unsupported/.test(m)?"الفيديو مش مدعوم في المعاينة (شغّال على النسخة المنشورة).":/not-member/.test(m)?"الأعضاء بس يقدروا يصوّتوا.":/repost_private/.test(m)?"مينفعش تعيد نشر منشور ترابيزة برّا الترابيزة.":/duplicate key|already exists|23505/.test(m)?"انت عملت الطلب ده قبل كده.":errMsg(e)};
const favBtn=e=>{const on=(me().favs||[]).includes(rid(e));return`<button class="btn alt" data-a="fav" data-id="${rid(e)}">${on?"💔 شيل من المفضلة":"❤️ ضيف للمفضلة"}</button>`};

/* ---- the recipe (shared by the result page and the recipe page) ---- */
function recipeCards(R,a){const d=R.dose,tw=tahweeg(R,a);
const steps=(T.steps[R.method]||[]).map(s=>f(s,{water:d.waterMl,g:d.grams,grind:A(GRIND_NAMES[R.grind]),min:d.minutes,temp:d.tempC,shots:d.shots}));
const mk=R.milk?f(R.serve==="hot"?T.extra.milkHot:T.extra.milkIced,{ml:R.milk.ml,milk:A(MILKS.find(x=>x.id===R.milk.id).name)}):"";
const sw=R.sweetness.tsp?f(T.result.sugarSome,{tsp:R.sweetness.tsp,type:R.sweetness.sweetener?A(SWEETENERS.find(x=>x.id===R.sweetness.sweetener).name):""}):T.result.sugarNone;
const adn=R.addons.map(x=>A(ADDONS.find(y=>y.id===x).name));
return`<div class="card"><h2>${A(R.drink.name)} · ${R.serve==="hot"?T.result.hot:T.result.iced}</h2>
<h3>${T.result.blend}</h3>${R.blend.map(p=>`<div class="pct"><span>${A(p.bean.name)} <span class="mute">· ${A(p.bean.origin)} · ${T.result.species[p.bean.species]}</span></span><b>${p.percent}%</b></div>`).join("")}
<dl><dt>${T.result.roast}</dt><dd>${A(ROAST_NAMES[R.roast])}</dd><dt>${T.result.grind}</dt><dd>${A(GRIND_NAMES[R.grind])}</dd><dt>${T.result.acidity}</dt><dd>${lvl("acidity",R.profile.acidity)}</dd><dt>${T.result.body}</dt><dd>${lvl("body",R.profile.body)}</dd><dt>${T.result.sweet}</dt><dd>${lvl("sweet",R.profile.sweet)}</dd><dt>${T.result.aroma}</dt><dd>${R.aroma.map(x=>A(FAMILIES.find(y=>y.id===x).name)).join("، ")}</dd><dt>${T.result.notes}</dt><dd>${R.notes.map(x=>{const o=FLAVORS.find(y=>y.id===x);return o?A(o.name):x}).join("، ")}</dd></dl></div>
<div class="card"><h3>التحويجة اللي بتتطحن مع البن</h3>${tw.length?tw.map(t=>`<span class="tag">${t.n} · ${t.g} جم لكل ١٠٠ جم بن</span>`).join(""):`<p>من غير تحويجة المرة دي: الطعم اللي اخترته أحلى مع بن صافي.</p>`}<p class="mute">ده اقتراح حدوتة على حسب النكهة اللي اخترتها. بتتطحن مع البن نفسه قبل ما تحضّر القهوة.</p></div>
<div class="card"><h3>${T.result.recipe}</h3><p class="mute">${d.grams} ${T.result.unit.g} · ${d.waterMl} ${T.result.unit.ml}</p><ol>${steps.map(s=>`<li>${s}</li>`).join("")}</ol>${mk?`<p>${mk}</p>`:""}<p>${sw}</p>${adn.length?`<p>${f(T.extra.addons,{list:adn.join("، ")})}</p>`:""}<p class="mute">${f(T.result.fresh,{hours:HOURS})}</p></div>`}

/* ---- opinions: anything the user wants to say, any time; Hadota turns it into taste rules ---- */
const noteHTML=n=>`<div class="note"><small>${tstr(n.at)}${n.recipe&&findE(n.recipe)?` · <a href="#recipe/${n.recipe}">${esc(recipeTitle(findE(n.recipe)))}</a>`:""}</small><p>${esc(n.text||"(اخترت وسوم بس)")}</p>${(n.tags||[]).map(x=>`<span class="tag">${(FEEDBACK_TAGS.find(t=>t.id===x)||{}).ar||x}</span>`).join("")}${n.acts&&n.acts.length?`<p class="mute">حدوتة سجّل: ${n.acts.map(esc).join("، ")}</p>`:""}</div>`;
function opinionBox(e){const notes=e?(me().notes||[]).filter(n=>n.recipe===rid(e)):[];
return`<div class="card" id="ob"><h3>${e?"رأيك وتجربتك في الوصفة دي":"قول لحدوتة رأيك أو ذوقك"}</h3><p class="mute">اكتب أي رأي في أي وقت: طعم، حموضة، حاجة بتحبها أو بتكرهها، أو أي ملاحظة. حدوتة بيقراه وبيحفظه في قواعد ذوقك ويظبط خلطاتك الجاية. تقدر كمان تختار من الخيارات.</p>
<div id="ft">${FEEDBACK_TAGS.map(t=>`<button class="tag ${S.fbSel&&S.fbSel.includes(t.id)?"on":""}" data-a="ftag" data-id="${t.id}">${t.ar}</button>`).join("")}</div>
<textarea id="fbt" rows="3" maxlength="600" placeholder="اكتب رأيك بكلامك، مثلاً: كانت حامضة شوية، وأنا بحب الشوكولاتة ومبحبش الفواكه" aria-label="رأيك"></textarea>
<button class="btn" data-a="fbsend" ${e?`data-id="${rid(e)}"`:""}>ابعت رأيي</button>${notes.length?`<h4>آراؤك في الوصفة دي</h4>${notes.map(noteHTML).join("")}`:""}</div>`}
function learnFrom(text,tags,e){const m=me(),lr=armOf(m)==="learner",rules=extractRules(text);tags=[...new Set([...tags,...rules.tags])];let acts=[];
 if(lr){m.prefs=applyRules(applyFeedback(m.prefs,tags),rules);acts=[...tags.map(x=>FB_ACT[x]).filter(Boolean),...rules.lines]}
 const n={id:uid2(),at:Date.now(),text,tags,recipe:e?rid(e):null,acts};m.notes=[...(m.notes||[]),n].slice(-200);if(e){e.fb={tags,text,at:n.at};e.fbActs=acts}
 sv();track("opinion_sent",{tags,chars:text.length,likes:Object.keys(rules.pf),caf:rules.caf||null,recipe:!!e,rating:e&&e.rating||null});
 try{Backend.sendFeedback&&Backend.sendFeedback({tags,rating:e&&e.rating||null,drink:e&&e.drink,roast:e&&e.roast})}catch(x){}return n}

/* ---- ask flow: one spoken line per question; spoken answers ---- */
V.ask=()=>{if(!me())return`<h2>${T.site.hero.nameLabel}</h2><p class="mute">${T.site.hero.nameRequired}</p><input type="text" id="nm" maxlength="30" placeholder="${T.site.hero.namePlaceholder}" aria-label="${T.site.hero.nameLabel}"><button class="btn" data-a="start">${T.site.hero.start}</button>`;
if(!S.started)reset();
if(!S.q)return res();
const q=S.q,n=Object.keys(S.ans).length;
return`<div class="bar"><i style="width:${Math.min(95,n*8+4)}%"></i></div><div class="say"><img src="${IMG}" alt=""><div class="bubble" id="bb"></div></div>
${q.multi?`<p class="mute" id="pk">${f(T.app.pickUpTo,{max:q.max,n:S.sel.length})}</p>`:""}
<div class="opts" id="ops">${q.options(S.ans).map(o=>`<button class="opt ${S.sel.includes(o.id)?"on":""}" data-a="pick" data-id="${esc(o.id)}">${esc(lab(q,o))}</button>`).join("")}</div>
${q.multi?`<button class="btn" id="ct" data-a="cont" ${S.sel.length?"":"disabled style='opacity:.5'"}>${T.app.continue}</button>`:""}
<button class="btn alt" data-a="vans">🎤 جاوب بصوتك</button>
${S.stack.length?`<button class="btn alt" data-a="back">رجوع</button>`:""}`};
function uiSel(){document.querySelectorAll("#ops .opt").forEach(b=>b.classList.toggle("on",S.sel.includes(b.dataset.id)));const pk=$("#pk"),ct=$("#ct");if(pk&&S.q)pk.textContent=f(T.app.pickUpTo,{max:S.q.max,n:S.sel.length});if(ct){ct.disabled=!S.sel.length;ct.style.opacity=S.sel.length?"":".5"}}
function togglePick(q,id){const ex=["any","none"];if(ex.includes(id))S.sel=[id];else{S.sel=S.sel.filter(x=>!ex.includes(x));S.sel=S.sel.includes(id)?S.sel.filter(x=>x!==id):S.sel.length<q.max?[...S.sel,id]:S.sel}uiSel()}
function listen(cb){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){toast("المتصفح ده مش بيدعم تسجيل الصوت. جرّب Chrome أو Edge.");return}const r=new R();r.lang="ar-EG";r.interimResults=false;r.maxAlternatives=3;
 r.onresult=e=>cb([...e.results[0]].map(x=>x.transcript));r.onerror=e=>toast(e.error==="not-allowed"?"اسمح للمتصفح باستخدام الميكروفون.":"مسمعتش حاجة، جرّب تاني");try{r.start();toast("سامعك… قول إجابتك")}catch(e){}}

/* ---- result page ---- */
function res(){const R=S.R;if(!R)return`<p>…</p>`;const m=me(),e=S.e,rt=e.rating||0;
return`<div class="say"><img src="${IMG}" alt=""><div class="bubble" id="bb"></div></div>${recipeCards(R,S.ans)}
<div class="card"><b>${T.extras.rate}</b><div class="stars" role="radiogroup">${[1,2,3,4,5].map(n=>`<button class="star ${n<=rt?"on":""}" data-a="rate" data-n="${n}" aria-label="${n}">★</button>`).join("")}</div>${rt?`<p role="status">${T.extras[rt>=4?"thanksHigh":"thanksLow"]}</p>`:""}
<p class="mute">${R.explored?T.learn.explored+" ":""}${m.model.n?f(T.learn.n,{n:m.model.n}):T.learn.none}</p>
${favBtn(e)}<button class="btn" data-a="share">${T.extras.share}</button><a class="btn alt" href="#shoplist" data-a="order">اطلب خلطتك من المتجر</a><button class="btn alt" data-a="again">جرّب خلطة تانية</button><p id="cp" class="mute"></p></div>${opinionBox(e)}`}

/* ---- favourites and recipe pages ---- */
const recipeRow=e=>`<a class="card rrow" href="#recipe/${rid(e)}"><b>${esc(recipeTitle(e))}</b><span class="mute">${dstr(e.at)}${e.roast?" · "+A(ROAST_NAMES[e.roast]):""}</span></a>`;
V.favorites=()=>{const u=me();if(!u)return V.ask();const l=(u.favs||[]).map(findE).filter(Boolean).reverse();
return`<h2>❤️ المفضلة</h2>${l.length?l.map(recipeRow).join(""):`<div class="card"><p>لسه مفيش وصفات في المفضلة. بعد ما تطلّع خلطة، دوس «ضيف للمفضلة».</p><a class="btn" href="#ask">جرّب خلطة</a></div>`}`};
V.recipe=()=>{const u=me();if(!u)return V.ask();const e=findE(tid());if(!e)return`<p>الوصفة دي مش موجودة.</p><a class="btn" href="#usage">وصفاتي</a>`;const R=hydrate(e);
return`<a href="#usage">← وصفاتي</a><h2>${esc(recipeTitle(e))}</h2><p class="mute">${tstr(e.at)}</p>${R?recipeCards(R,e.answers||{}):"<p>مقدرتش أرجّع تفاصيل الوصفة.</p>"}
${favBtn(e)}<a class="btn alt" href="#shoplist" data-a="orderE" data-id="${rid(e)}">ضيف البن لقايمة التسوق</a>${opinionBox(e)}`};

/* ---- usage page (replaces the old profile) ---- */
function curve(u){const r=u.history.filter(h=>h.rating);if(r.length<2)return`<p class="mute">محتاج وصفتين متقيّمتين على الأقل عشان يظهر المنحنى.</p>`;
const W=300,H=130,px=i=>20+i*(W-40)/(r.length-1),py=v=>H-20-(v-1)*(H-40)/4;
return`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="منحنى رضاك عن الخلطات">${[1,2,3,4,5].map(v=>`<line x1="20" x2="${W-20}" y1="${py(v)}" y2="${py(v)}" stroke="var(--line)"/><text x="4" y="${py(v)+4}" font-size="9" fill="var(--mute)">${v}</text>`).join("")}<polyline fill="none" stroke="var(--brand)" stroke-width="2.5" points="${r.map((h,i)=>px(i).toFixed(1)+","+py(h.rating).toFixed(1)).join(" ")}"/>${r.map((h,i)=>`<circle cx="${px(i).toFixed(1)}" cy="${py(h.rating).toFixed(1)}" r="3.5" fill="var(--brand)"/>`).join("")}</svg>`}
V.usage=()=>{const u=me();if(!u)return V.ask();const rl=ruleLines(u.prefs),notes=[...(u.notes||[])].reverse(),hist=[...u.history].reverse();
return`<h2>📊 استخدامي</h2><div class="row3" style="grid-template-columns:repeat(4,1fr)"><div class="card"><b>${u.history.length}</b>وصفات</div><div class="card"><b>${notes.length}</b>آراء</div><div class="card"><b>${rl.length}</b>ملاحظات حدوتة</div><div class="card"><b>${(u.favs||[]).length}</b>مفضلة</div></div>
<div class="card"><h3>منحنى رضاك عن الخلطات</h3>${curve(u)}</div>
<div class="card"><h3>حدوتة لاحظ إيه على ذوقك</h3>${rl.length?`<ul>${rl.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:`<p class="mute">لسه مفيش ملاحظات. اكتب رأيك في أي وصفة أو قول لحدوتة ذوقك تحت، وهيسجّله هنا.</p>`}</div>
${opinionBox(null)}
<h3>آراؤك وتعليقاتك</h3>${notes.length?notes.map(noteHTML).join(""):`<div class="card mute">لسه مكتبتش آراء.</div>`}
<div id="act"></div>
<h3>وصفاتك</h3>${hist.length?hist.map(recipeRow).join(""):`<div class="card mute">لسه مفيش وصفات.</div>`}
<a class="btn" href="#ask">جرّب خلطة جديدة</a>`};
V.profile=V.usage;
function loadAct(){const el=$("#act");if(!el||!ACCT)return;Backend.myActivity().then(a=>{const e2=$("#act");if(!e2)return;
 e2.innerHTML=`<h3>نشاطك في المجتمع</h3>`+(a.posts.length||a.comments.length?(a.posts.length?`<h4>منشوراتك</h4>${a.posts.map(p=>`<div class="note"><small>${tstr(p.at)}</small><p>${esc(p.text||"(صورة أو فيديو)")}</p></div>`).join("")}`:"")+(a.comments.length?`<h4>تعليقاتك</h4>${a.comments.map(p=>`<div class="note"><small>${tstr(p.at)}</small><p>${esc(p.text)}</p></div>`).join("")}`:""):`<p class="mute">لسه معملتش منشورات أو تعليقات في المجتمع.</p>`)}).catch(()=>{})}

/* ---- menu ---- */
V.more=()=>{const u=me();
return`<h2>القايمة</h2><a class="opt" href="#favorites">❤️ المفضلة <small>(${u?(u.favs||[]).length:0})</small></a><a class="opt" href="#shoplist">🛒 قايمة التسوق <small>(${u?(u.bag||[]).length:0})</small></a><a class="opt" href="#usage">📊 استخدامي ونشاطي</a><a class="opt" href="#chat">💬 شات مع حدوتة</a><a class="opt" href="#account">👤 ${ACCT?esc(ACCT.name):"سجّل دخول أو اعمل حساب"}</a>
<h3 style="margin-top:1rem">${T.app.settings}</h3><div class="card"><h3>صوت حدوتة</h3><p class="mute">${VM?"بيتكلم بصوت راجل مسجّل، نفس الصوت على كل الأجهزة.":"الصوت المسجّل لسه مش متاح على النسخة دي (ملفات assets/voice لسه متضافتش). الكلام بيظهر مكتوب بس."}</p></div>
<button class="opt" data-a="mute">${T.app.mute} / ${T.app.unmute}</button><label class="mute">${T.app.ambience}</label><input type="range" min="0" max="100" value="${vol*100}" id="vl" aria-label="${T.app.ambience}"><button class="opt" data-a="theme">الوضع الليلي / النهاري</button><button class="opt" data-a="big">${T.app.largeText}</button>${u?`<button class="opt" data-a="out">${T.app.signOut}</button><button class="opt" data-a="wipe">مسح كل بياناتي</button>`:""}`};

/* ---- shop: browse, product pages, shopping list (the shop itself is not open yet) ---- */
const SHOPWARN=`<div class="card warn"><b>🚧 المتجر لسه مش جاهز</b><p>بنجهّز صفحات المنتجات والأسعار والدفع. تقدر تتفرج وتضيف لقايمة التسوق، بس الشراء لسه مش متاح.</p></div>`;
V.shop=()=>{const u=me(),bag=u?u.bag||[]:[];
return`<h2>${T.shop.title}</h2>${SHOPWARN}<a class="btn alt" href="#shoplist">🛒 قايمة التسوق (${bag.length})</a>
${["arabica","robusta","liberica","excelsa"].map(sp=>`<h3 style="margin-top:1rem">${T.result.species[sp]}</h3><div class="grid">${BEANS.filter(b=>b.species===sp).map(b=>`<div class="card"><a href="#product/${b.id}"><b>${A(b.name)}</b></a><br><span class="mute">${A(b.origin)} · ${b.roasts.map(r=>A(ROAST_NAMES[r])).join(" / ")}</span><br>${b.notes.slice(0,3).map(x=>{const o=FLAVORS.find(y=>y.id===x);return`<span class="tag">${o?A(o.name):x}</span>`}).join("")}<a class="btn alt sm" href="#product/${b.id}">تفاصيل المنتج</a> <button class="btn alt sm" data-a="bag" data-id="${b.id}">${bag.includes(b.id)?T.shop.added:"ضيف للقايمة"}</button></div>`).join("")}</div>`).join("")}`};
V.product=()=>{const b=BEANS.find(x=>x.id===tid());if(!b)return`<p>المنتج مش موجود.</p><a class="btn" href="#shop">المتجر</a>`;const bag=(me()&&me().bag)||[];
return`<a href="#shop">← المتجر</a><div class="card warn"><b>🚧 المتجر لسه مش جاهز</b><p>صفحة المنتج دي لسه مش مكتملة. الوصف الكامل والصور والأسعار هتتضاف قريب، والشراء مش متاح دلوقتي.</p></div>
<div class="card"><div class="pimg" aria-hidden="true">☕</div><h2>${A(b.name)}</h2><p class="mute">${A(b.origin)} · ${T.result.species[b.species]}</p>
<dl><dt>التحميص المتاح</dt><dd>${b.roasts.map(r=>A(ROAST_NAMES[r])).join("، ")}</dd><dt>${T.result.acidity}</dt><dd>${lvl("acidity",b.acidity)}</dd><dt>${T.result.body}</dt><dd>${lvl("body",b.body)}</dd><dt>${T.result.sweet}</dt><dd>${lvl("sweet",b.sweet)}</dd><dt>الكافيين</dt><dd>${["قليل","متوسط","عالي","عالي جداً"][b.caffeine]||"—"}</dd><dt>${T.result.aroma}</dt><dd>${b.aroma.map(x=>A(FAMILIES.find(y=>y.id===x).name)).join("، ")}</dd></dl>
<p>${b.notes.map(x=>{const o=FLAVORS.find(y=>y.id===x);return`<span class="tag">${o?A(o.name):x}</span>`}).join("")}</p><p class="mute">الوصف الكامل: لسه جاي.</p>
<button class="btn" data-a="bag" data-id="${b.id}">${bag.includes(b.id)?"✔ في قايمة التسوق":"ضيف لقايمة التسوق"}</button></div>`};
V.shoplist=()=>{const u=me(),bag=u?u.bag||[]:[];
return`<h2>🛒 قايمة التسوق</h2>${SHOPWARN}${bag.length?bag.map(id=>`<div class="card rrow"><a href="#product/${id}"><b>${beanName(id)}</b></a><button class="btn alt sm" data-a="unbag" data-id="${id}">${T.shop.remove}</button></div>`).join("")+`<button class="btn" data-a="copy">${T.shop.copy}</button><p id="cp" class="mute"></p>`:`<div class="card"><p>${T.shop.bagEmpty}</p><a class="btn" href="#shop">تصفّح البن</a></div>`}`};

/* ---- blog: every article has its own page ---- */
V.blog=()=>`<h2>${T.blog.title}</h2><p class="mute">${T.blog.sub}</p>${ARTICLES.map(a=>`<a class="card rrow" href="#article/${a.id}"><span><b>${A(a.title)}</b><br><span class="mute">${f(T.blog.min,{n:a.minutes})}</span></span><span class="btn alt sm">${T.blog.read}</span></a>`).join("")}`;
V.article=()=>{const i=ARTICLES.findIndex(x=>x.id===tid()),a=ARTICLES[i];if(!a)return`<p>المقال مش موجود.</p><a class="btn" href="#blog">المدونة</a>`;
return`<a href="#blog">← ${T.blog.title}</a><article class="card"><h2>${A(a.title)}</h2><p class="mute">${f(T.blog.min,{n:a.minutes})}</p>${a.body.ar.map(p=>`<p>${f(p.replace(/\{hours\}/g,HOURS))}</p>`).join("")}</article>${ARTICLES[i+1]?`<a class="btn alt" href="#article/${ARTICLES[i+1].id}">المقال الجاي: ${A(ARTICLES[i+1].title)}</a>`:""}`};

/* ---- community: news feed (آخر الأخبار) for everybody + member-approved tables ---- */

const tx=t=>t.title+" "+(t.vibe||"");
const topicsLocal=()=>TOPICS.map(w=>({word:w,n:TB.filter(t=>tx(t).includes(w)).reduce((a,t)=>a+1+t.n,0)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,10);
const taste=()=>{const u=me(),h=u&&u.history.length?u.history[u.history.length-1]:null;if(!h)return[];const a=h.answers||{},nn=[A(drinkById(h.drink).name),...many(a,"flavor").map(x=>{const o=FLAVORS.find(y=>y.id===x);return o?A(o.name):""})];return nn.join(" ").split(/\s+/).filter(w=>w.length>2)};
const scoreT=t=>taste().filter(w=>tx(t).includes(w)).length;
const tph=()=>TP.length?`<span class="mute">الأكتر كلاماً:</span> `+TP.map(x=>`<button class="tag ${FT===x.word?"on":""}" data-a="tf" data-w="${esc(x.word)}">${esc(x.word)} · ${x.n}</button>`).join("")+(FT?` <button class="tag" data-a="tf" data-w="">الكل</button>`:""):`<span class="mute">لسه مفيش نقاش كفاية. ابدأ بموضوع:</span> `+TOPICS.slice(0,6).map(w=>`<button class="tag" data-a="seed" data-w="${w}">${w}</button>`).join("");
const loadTopics=()=>{if(!Backend.topics)return;Backend.topics().then(r=>{TP=r;const p=$("#tp");if(p)p.innerHTML=tph()}).catch(()=>{})};
const tcard=t=>{const m=mine(t),free=t.cap-t.n;
return`<div class="card"><h3>${esc(t.title)}</h3><p class="mute">${t.vibe?`<span class="tag">${esc(t.vibe)}</span>`:""}${!m&&scoreT(t)>0?`<span class="tag">🎯 قريبة من ذوقك</span>`:""}${t.when?" 🕒 "+esc(t.when):""}</p><p>👥 ${t.n}/${t.cap} · ${free>0?"فاضل "+free+" مكان":"الترابيزة كاملة"}</p>
${m?`<p class="mute">${t.members.map(x=>esc(x.name)).join("، ")}</p>${t.pending.length?`<p class="badge">🔔 ${t.pending.length} طلب انضمام مستني ردك</p>`:""}<a class="btn sm" href="#table/${t.id}">افتح الترابيزة</a> <button class="btn alt sm" data-a="leave" data-id="${t.id}">امشي</button>`
:`<p class="mute">🔒 الأعضاء بس بيشوفوا الأعضاء والشات والمنشورات.</p>${t.myReq==="pending"?`<p>⏳ طلبك مستني موافقة كل الأعضاء</p><button class="btn alt sm" data-a="creq" data-id="${t.id}">الغي الطلب</button>`:t.myReq==="rejected"?`<p>❌ الطلب اترفض</p><button class="btn alt sm" data-a="creq" data-id="${t.id}">مسح الطلب</button>`:`<button class="btn sm" data-a="rjoin" data-id="${t.id}" ${free>0?"":"disabled"}>اطلب الانضمام</button>`}`}
${t.host===ACCT.id?` <button class="btn alt sm" data-a="rmtable" data-id="${t.id}">امسح</button>`:""}</div>`};
const tsec=(h,l)=>l.length?`<h3 style="margin-top:1rem">${h}</h3><div class="grid">${l.map(tcard).join("")}</div>`:"";
const tl=()=>{const ok=t=>!FT||tx(t).includes(FT),open=TB.filter(t=>!mine(t)&&t.cap-t.n>0&&ok(t)).sort((a,b)=>scoreT(b)-scoreT(a)||(b.cap-b.n)-(a.cap-a.n)),my=TB.filter(mine),full=TB.filter(t=>!mine(t)&&t.cap-t.n<=0&&ok(t));
 return TB.length?tsec("ترابيزات تقدر تطلب تنضم ليها ("+open.length+")",open)+(open.length?"":`<p class="mute" style="margin-top:.6rem">${FT?"مفيش ترابيزات مفتوحة عن «"+esc(FT)+"». افتح انت واحدة!":"مفيش ترابيزات مفتوحة دلوقتي. افتح انت واحدة!"}</p>`)+tsec("ترابيزاتك",my)+tsec("كاملة",full):`<p class="mute">لسه مفيش ترابيزات. افتح أول واحدة!</p>`};
let LASTT="",CT="feed",TT="chat",TBK="",FEED=[],FS={table:null},FW=null,CMW={},OC={},CM={},PF=null,PICK="image",SUB={};
const msgsHTML=()=>MS.length?MS.map(m=>`<div class="m ${m.uid===ACCT.id?"me":""}"><small>${esc(m.name)} · ${new Date(m.at).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"})}</small>${esc(m.text)}</div>`).join(""):`<p class="mute">ابدأ الكلام.</p>`;
const mh=msgsHTML;
const body1=x=>`${x.text?`<p class="ptxt">${esc(x.text)}</p>`:""}${x.mediaUrl?(x.mediaType==="video"?`<video src="${esc(x.mediaUrl)}" controls preload="metadata" class="pmed"></video>`:`<img src="${esc(x.mediaUrl)}" class="pmed" alt="صورة من المنشور" loading="lazy">`):""}`;
const cmList=id=>(CM[id]||[]).map(c=>`<div class="cm"><b>${esc(c.name)}</b> <small>${tstr(c.at)}</small><br>${esc(c.text)}</div>`).join("")||`<p class="mute">لسه مفيش تعليقات.</p>`;
const cmBox=id=>`<div class="cms"><div id="cl-${id}">${cmList(id)}</div><div class="crow"><input type="text" id="ci-${id}" maxlength="500" placeholder="اكتب تعليق" aria-label="تعليق"><button class="btn sm" data-a="pcsend" data-id="${id}">ابعت</button></div></div>`;
const postHTML=p=>{const o=p.repostOf;return`<article class="card pst" id="po-${p.id}"><div class="phd"><b>${esc(p.name)}</b><small>${tstr(p.at)}${p.table?" · 🔒 ترابيزة":""}</small></div>${o?(o.missing?`<p class="mute">🔁 أعاد نشر منشور اتمسح</p>`:`<p class="mute">🔁 أعاد النشر</p><div class="quote"><b>${esc(o.name)}</b>${body1(o)}</div>`):""}${body1(p)}
<div class="pact"><button class="pb ${p.liked?"on":""}" data-a="plike" data-id="${p.id}" aria-label="لايك">${p.liked?"❤️":"🤍"} ${p.likes}</button><button class="pb" data-a="pcm" data-id="${p.id}" aria-label="تعليقات">💬 ${p.comments}</button><button class="pb" data-a="prepost" data-id="${p.id}" aria-label="إعادة نشر">🔁 ${p.reposts}</button>${ACCT&&p.uid===ACCT.id?`<button class="pb" data-a="pdel" data-id="${p.id}" aria-label="مسح">🗑️</button>`:""}</div>${OC[p.id]?cmBox(p.id):""}</article>`};
const feedHTML=()=>FEED.length?FEED.map(postHTML).join(""):`<p class="mute">لسه مفيش منشورات. كون أول واحد!</p>`;
function updF(force){const fd=$("#fd");if(!fd)return;const a=document.activeElement;if(!force&&(fd.contains(a)&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA")||[...fd.querySelectorAll("input,textarea")].some(i=>i.value)))return;fd.innerHTML=feedHTML()}
function patchPost(id){const p=FEED.find(x=>x.id===id),el=$("#po-"+id);if(p&&el)el.outerHTML=postHTML(p)}
function updC(id){const l=$("#cl-"+id);if(l)l.innerHTML=cmList(id)}
const composer=tbl=>`<div class="card"><textarea id="pt" rows="3" maxlength="1000" placeholder="${tbl?"اكتب حاجة للترابيزة":"اكتب أي حاجة: فكرة، وصفة، سؤال..."}" aria-label="منشور جديد"></textarea><div id="pv" class="mute"></div>
<div class="crow"><button class="btn alt sm" data-a="pimg">📷 صورة</button><button class="btn alt sm" data-a="pvid">🎞️ فيديو</button></div>
${tbl?"":`<label class="mute">النشر في:</label><select id="pa" aria-label="النشر في"><option value="">للكل (آخر الأخبار)</option>${TB.filter(mine).map(t=>`<option value="${t.id}">🔒 ${esc(t.title)}</option>`).join("")}</select>`}
<input type="file" id="pfile" class="hide"><button class="btn" data-a="ppost" data-t="${tbl||""}">انشر</button></div>`;
const tabs=(cur,list,act)=>`<div class="tabs">${list.map(([k,l])=>`<button class="tab ${cur===k?"on":""}" data-a="${act}" data-t="${k}">${l}</button>`).join("")}</div>`;
function tabTables(){return`<div class="card"><h3>افتح ترابيزة جديدة</h3><input type="text" id="tt" maxlength="60" placeholder="اسم الترابيزة، مثلاً: تركي بالهيل" aria-label="اسم الترابيزة"><select id="tv" aria-label="نوع القعدة"><option>قعدة هادية</option><option>قهوة مختصة</option><option>تذوق وكبّينج</option><option>تركي وتحويجة</option><option>شباب وألعاب</option></select><input type="text" id="tw" maxlength="60" placeholder="الميعاد، مثلاً: الخميس ٩ مساءً" aria-label="الميعاد"><label class="mute">عدد الأماكن</label><select id="tc" aria-label="عدد الأماكن">${[2,3,4,5,6,8,10,12].map(n=>`<option ${n===6?"selected":""}>${n}</option>`).join("")}</select><button class="btn" data-a="mk">افتح الترابيزة</button></div>
<h3>الأكتر كلاماً في الحكواتية</h3><div id="tp">${tph()}</div><div id="tl">${tl()}</div>`}
V.community=()=>{const C=T.community;if(Backend.kind==="local"||(ACCT&&ACCT.id==="local"))return setupCard();if(!ACCT)return`<h2>${T.nav.community}</h2><p class="mute">${C.tagline}</p><div class="card"><p>عشان تنشر وتقعد على ترابيزة لازم يكون ليك حساب، عشان باقي الأعضاء يعرفوا اسمك.</p><a class="btn" href="#account">سجّل دخول أو اعمل حساب</a></div>${chall()}`;
return`<h2>${T.nav.community}</h2><p class="mute">أهلاً يا ${esc(ACCT.name)}. انشر للكل، أو اطلب تقعد على ترابيزة.</p>${tabs(CT,[["feed","📰 آخر الأخبار"],["tables","🪑 الترابيزات"]],"ctab")}${CT==="feed"?`${chall()}${composer(null)}<div id="fd">${feedHTML()}</div>`:tabTables()}`};
const mpInner=t=>`<h3>الأعضاء (${t.n}/${t.cap})</h3><p>${t.members.map(m=>`<span class="tag">${esc(m.name)}</span>`).join("")}</p><h3>طلبات الانضمام</h3><p class="mute">أي حد جديد لازم كل الأعضاء يوافقوا عليه.</p>${t.pending.length?t.pending.map(r=>{const yes=Object.values(r.votes).filter(v=>v===true).length,my=r.votes[ACCT.id];return`<div class="card"><b>${esc(r.name)}</b> عايز ينضم<p class="mute">وافق ${yes} من ${t.n}</p>${my===undefined?`<button class="btn sm" data-a="vote" data-id="${t.id}" data-u="${r.uid}" data-v="1">✅ أوافق</button> <button class="btn alt sm" data-a="vote" data-id="${t.id}" data-u="${r.uid}" data-v="0">❌ أرفض</button>`:`<p>${my?"✅ انت وافقت":"❌ انت رفضت"}</p>`}</div>`}).join(""):`<p class="mute">مفيش طلبات دلوقتي.</p>`}`;
V.table=()=>{if(!ACCT)return V.community();const t=TB.find(x=>x.id===tid()),back=`<a href="#community" data-a="ctab" data-t="tables">← الترابيزات</a>`;
 if(!t){TBK="n";return`${back}<p class="mute">…</p>`}
 const head=`<div id="th"><h2>${esc(t.title)}</h2><p class="mute">${t.vibe?esc(t.vibe)+" · ":""}${t.when?esc(t.when)+" · ":""}${t.n}/${t.cap}</p></div>`;
 if(!mine(t)){TBK="o";return`${back}${head}<div class="card warn"><b>🔒 الترابيزة دي للأعضاء بس</b><p>الأعضاء والشات والمنشورات مش ظاهرين غير لأعضاء الترابيزة. تقدر تبعت طلب انضمام، ولازم كل الأعضاء يوافقوا عليه.</p>${t.myReq==="pending"?`<p>⏳ طلبك مستني موافقة كل الأعضاء</p><button class="btn alt sm" data-a="creq" data-id="${t.id}">الغي الطلب</button>`:`<button class="btn" data-a="rjoin" data-id="${t.id}" ${t.cap-t.n>0?"":"disabled"}>اطلب الانضمام</button>`}</div>`}
 TBK="m";const body=TT==="chat"?`<div class="chat" id="msgs">${msgsHTML()}</div><textarea id="mi" rows="2" maxlength="500" placeholder="اكتب رسالتك" aria-label="رسالتك"></textarea><button class="btn" data-a="sendm">ابعت</button>`:TT==="feed"?`${composer(t.id)}<div id="fd">${feedHTML()}</div>`:`<div id="mp">${mpInner(t)}</div>`;
 return`${back}${head}${tabs(TT,[["chat","💬 الشات"],["feed","🗨️ المنشورات"],["members",`👥 الأعضاء${t.pending.length?" 🔔"+t.pending.length:""}`]],"ttab")}${body}`};

/* subscriptions: one slot per kind, so re-subscribing one never kills another */
function sub(k,un){SUB[k]&&SUB[k]();SUB[k]=un}
function unsubAll(){Object.values(SUB).forEach(u=>u&&u());SUB={};Object.values(CMW).forEach(u=>u&&u());CMW={};OC={};FW&&FW();FW=null}
const watchT=()=>sub("t",Backend.watchTables(l=>{TB=l;
 if(page()==="table"){const t=TB.find(x=>x.id===tid()),key=t?(mine(t)?"m":"o"):"n";if(key!==TBK){render();return}if(t){const h=$("#th");if(h)h.innerHTML=`<h2>${esc(t.title)}</h2><p class="mute">${t.vibe?esc(t.vibe)+" · ":""}${t.when?esc(t.when)+" · ":""}${t.n}/${t.cap}</p>`;const mp=$("#mp");if(mp)mp.innerHTML=mpInner(t)}}
 const e=$("#tl");if(e)e.innerHTML=tl();if(!Backend.topics)TP=topicsLocal();const pp=$("#tp");if(pp)pp.innerHTML=tph();
 const sel=$("#pa");if(sel&&page()==="community"){const v=sel.value;sel.innerHTML=`<option value="">للكل (آخر الأخبار)</option>${TB.filter(mine).map(t=>`<option value="${t.id}">🔒 ${esc(t.title)}</option>`).join("")}`;sel.value=v}}));
const watchM=()=>sub("m",Backend.watchMessages(tid(),l=>{MS=l;const e=$("#msgs");if(e){const at=e.scrollTop+e.clientHeight>=e.scrollHeight-40;e.innerHTML=msgsHTML();if(at)e.scrollTop=e.scrollHeight}}));
const watchF=scope=>{FS=scope;FW&&FW();FW=Backend.watchFeed(scope,l=>{FEED=l;updF()})};

function shrink(file,max,q){return new Promise((ok,no)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);c.toBlob(b=>{URL.revokeObjectURL(url);b?ok(b):no(new Error("shrink"))},"image/jpeg",q)};img.onerror=()=>no(new Error("shrink"));img.src=url})}
document.addEventListener("change",async e=>{if(e.target.id!=="pfile"||!e.target.files[0])return;const f0=e.target.files[0];
 if(PICK==="video"){if(f0.size>15*1024*1024){toast("الفيديو أكبر من ١٥ ميجا");return}PF={blob:f0,kind:"video"};$("#pv").textContent="🎞️ "+f0.name;return}
 try{const pv=Backend.kind==="preview",b=await shrink(f0,pv?640:1280,pv?.6:.82);PF={blob:b,kind:"image"};$("#pv").innerHTML=`<img src="${URL.createObjectURL(b)}" class="pmed" alt="">`}catch(x){toast("مقدرتش أفتح الصورة دي")}});
function pickFile(kind){const i=$("#pfile");if(!i)return;PICK=kind;i.accept=kind==="video"?"video/*":"image/*";i.value="";i.click()}

/* ---- render: routing, say-once, subscriptions ---- */
function render(){const p=page(),k=V[p]?p:"home";
 const nav=k==="chat"?"ask":k==="table"?"community":k==="product"?"shop":k==="article"?"blog":["recipe","favorites","usage","profile","more","account","shoplist"].includes(k)?"":k;
 $("#top").innerHTML=NAV.map(n=>`<a href="#${n[0]}" data-r="${n[0]}" class="${n[0]===nav?"on":""}">${n[1]}</a>`).join("");
 $("#tabs").innerHTML=NAV.map(n=>`<a href="#${n[0]}" class="${n[0]===nav?"on":""}"><span>${IC[n[0]]}</span>${n[0]==="community"?"الحكواتية":n[1]}</a>`).join("");
 if(k==="table"&&tid()!==LASTT){LASTT=tid();TT="chat"}
 unsubAll();$("#view").innerHTML=V[k]();talk(false);
 if(ACCT&&k==="community"){watchT();loadTopics();if(CT==="feed")watchF({table:null})}
 if(ACCT&&k==="table"){watchT();const t=TB.find(x=>x.id===tid());if(t&&mine(t)){if(TT==="chat")watchM();if(TT==="feed")watchF({table:t.id})}}
 if(k==="usage")loadAct();
 const mi=$("#mi");if(mi)mi.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ACT.sendm()}};
 const b=$("#bb");
 if(b&&S.q&&k==="ask"){const q=S.q;if(S.saidQ!==q.id){S.saidQ=q.id;S.line=S.stack.length?T.callouts[Math.floor(Math.random()*T.callouts.length)].replace("{{name}}",rn())+T.q[q.id].ask:f(T.lines.intro,{name:rn()});say(S.line,b)}else b.textContent=S.line}
 if(b&&!S.q&&S.R&&k==="ask"){if(S.saidR!==S.e.id){S.saidR=S.e.id;S.line=f(T.result.intro,{name:rn()})+" "+T.cheers[Math.floor(Math.random()*2)];say(S.line,b)}else b.textContent=S.line}
 const hb=$("#hb");if(hb&&!hb.textContent&&window._greet){say(window._greet,hb);window._greet=0}
 const vl=$("#vl");if(vl)vl.oninput=()=>{vol=vl.value/100;audio()}}
addEventListener("hashchange",()=>{S.art=null;render();const v=$("#view");if(v)v.scrollTop=0});

/* ---- actions ---- */
Object.assign(ACT,{
pick(t){const q=S.q,id=t.dataset.id;if(q.multi){togglePick(q,id);return}S.stack.push(JSON.stringify(S.ans));S.ans={...S.ans,[q.id]:id};nxt();render()},
vans(){const q=S.q;if(!q)return;listen(alts=>{const os=q.options(S.ans),opts=os.map(o=>({id:o.id,label:lab(q,o)}));let m=[];for(const t of alts){m=matchOptions(t,opts);if(m.length)break}
 if(!m.length){toast("مفهمتش «"+alts[0]+"». قولها تاني أو اختار من القايمة.");track("voice_answer",{q:q.id,ok:false});return}
 const L=id=>(opts.find(o=>o.id===id)||{}).label;track("voice_answer",{q:q.id,ok:true});
 if(q.multi){S.sel=m.slice(0,q.max).map(x=>x.id);uiSel();toast("فهمت: "+S.sel.map(L).join("، ")+". دوس «كمّل» لو تمام.");return}
 if(m[1]&&m[1].score===m[0].score){toast("مش متأكد قصدك أنهي واحدة. قولها تاني.");return}
 toast("فهمت: "+L(m[0].id));S.stack.push(JSON.stringify(S.ans));S.ans={...S.ans,[q.id]:m[0].id};nxt();render()})},
fav(t){const m=me(),id=t.dataset.id;if(!id)return;m.favs=m.favs||[];m.favs=m.favs.includes(id)?m.favs.filter(x=>x!==id):[...m.favs,id];sv();track("fav_toggled",{on:m.favs.includes(id)});toast(m.favs.includes(id)?"اتضافت للمفضلة":"اتشالت من المفضلة");render()},
fbsend(t){const id=t&&t.dataset?t.dataset.id:"",e=id?findE(id):null,txt=($("#fbt").value||"").trim().slice(0,600),tags=[...(S.fbSel||[])];if(!tags.length&&!txt){toast("اختار حاجة أو اكتب رأيك");return}learnFrom(txt,tags,e);S.fbSel=[];toast("اتسجّل رأيك يا "+rn());render()},
orderE(t){const m=me(),e=findE(t.dataset.id);if(e){m.bag=[...new Set([...(m.bag||[]),...e.blend.map(p=>p.bean)])];sv()}},
order(){track("order_started",{});const m=me();if(S.R)m.bag=[...new Set([...(m.bag||[]),...S.R.blend.map(p=>p.bean.id)])];sv()},
bag(t){const m=me();if(!m)return;m.bag=[...new Set([...(m.bag||[]),t.dataset.id])];sv();toast("اتضاف لقايمة التسوق");render()},
ctab(t){CT=t.dataset.t||CT;if(page()==="community")render()},
ttab(t){TT=t.dataset.t;render()},
async rjoin(t){try{await Backend.request(t.dataset.id);toast("الطلب اتبعت. لازم كل الأعضاء يوافقوا عليه.");track("join_requested",{});watchT()}catch(e){toast(errM(e))}},
async creq(t){try{await Backend.cancelRequest(t.dataset.id);watchT()}catch(e){toast(errM(e))}},
async vote(t){const tb=TB.find(x=>x.id===t.dataset.id),req=tb&&tb.pending.find(r=>r.uid===t.dataset.u);if(!req)return;try{await Backend.vote(tb.id,req,t.dataset.v==="1");track("join_vote",{approve:t.dataset.v==="1"});watchT()}catch(e){toast(errM(e))}},
async leave(t){try{await Backend.leave(t.dataset.id);watchT()}catch(e){toast(errM(e))}},
pimg(){pickFile("image")},pvid(){pickFile("video")},
async ppost(t){const txt=($("#pt").value||"").trim(),tbl=t.dataset.t||($("#pa")?$("#pa").value:"")||null;if(!txt&&!PF){toast("اكتب حاجة أو اختار صورة أو فيديو");return}
 try{await Backend.post({text:txt,table:tbl,file:PF&&PF.blob,kind:PF&&PF.kind});track("post_created",{table:!!tbl,media:PF?PF.kind:null});$("#pt").value="";PF=null;const pv=$("#pv");if(pv)pv.textContent="";watchF(tbl&&page()==="table"?{table:tbl}:{table:null});toast("اتنشر")}catch(e){toast(errM(e))}},
async plike(t){const p=FEED.find(x=>x.id===t.dataset.id);if(!p)return;const was=p.liked;p.liked=!was;p.likes+=was?-1:1;patchPost(p.id);try{await (was?Backend.unlike:Backend.like)(p.id)}catch(e){toast(errM(e));watchF(FS)}},
pcm(t){const id=t.dataset.id;if(OC[id]){delete OC[id];CMW[id]&&CMW[id]();delete CMW[id]}else{OC[id]=1;CMW[id]=Backend.watchComments(id,l=>{CM[id]=l;updC(id)})}patchPost(id)},
async pcsend(t){const id=t.dataset.id,i=$("#ci-"+id),v=(i&&i.value||"").trim();if(!v)return;try{await Backend.comment(id,v.slice(0,500));i.value="";track("comment_created",{})}catch(e){toast(errM(e))}},
async prepost(t){const p=FEED.find(x=>x.id===t.dataset.id);if(!p)return;const src=p.repostOf&&!p.repostOf.missing?p.repostOf.id:p.id;try{await Backend.post({text:"",table:p.table||null,repostOf:src});track("repost",{});watchF(FS);toast("اتعاد نشره")}catch(e){toast(errM(e))}},
async pdel(t){if(!confirm("تمسح المنشور؟"))return;try{await Backend.deletePost(t.dataset.id);watchF(FS)}catch(e){toast(errM(e))}},
async sendm(){const v=($("#mi").value||"").trim();if(!v)return;$("#mi").value="";try{await Backend.say(tid(),v.slice(0,500));watchM()}catch(e){toast(errM(e))}},
async logout(){await Backend.signOut();ACCT=null;unsubAll();location.hash="#home";render()}
});
["vtest","export","cups","post","invite","art"].forEach(k=>{delete ACT[k]});

Backend.init().then(a=>{if(a)afterAuth(a)}).catch(()=>{});
render();
