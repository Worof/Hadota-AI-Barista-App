/* Backend adapter. Same interface everywhere:
   - Supabase (real accounts + shared tables) when config.js has supabaseUrl/supabaseKey
   - claude.ai preview database otherwise (artifact preview only) */
const Backend=(()=>{
const CFG=window.HADOTA_CONFIG||{};
const ok=CFG.supabaseUrl&&CFG.supabaseKey&&window.supabase;
const gid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
let SB=null;if(ok){
 const c=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey);let user=null;
 const nameOf=u=>(u&&u.user_metadata&&u.user_metadata.name)||(u&&u.email?u.email.split("@")[0]:"");
 const poll=(fn,cb,ms)=>{let on=true;const run=async()=>{try{const r=await fn();if(on)cb(r)}catch(e){}};run();const t=setInterval(run,ms);return()=>{on=false;clearInterval(t)}};
 const tables=async()=>{const{data,error}=await c.from("tables").select("id,title,vibe,meet_at,capacity,host,table_members(user_id,profiles(name))").order("created_at",{ascending:false}).limit(50);if(error)throw error;return data.map(t=>({id:t.id,title:t.title,vibe:t.vibe,when:t.meet_at,cap:t.capacity,host:t.host,members:t.table_members.map(m=>({id:m.user_id,name:(m.profiles&&m.profiles.name)||"؟"}))}))};
 const msgs=async id=>{const{data,error}=await c.from("messages").select("id,body,created_at,user_id,profiles(name)").eq("table_id",id).order("created_at",{ascending:true}).limit(100);if(error)throw error;return data.map(m=>({id:m.id,text:m.body,at:m.created_at,uid:m.user_id,name:(m.profiles&&m.profiles.name)||"؟"}))};
 const chk=r=>{if(r.error)throw r.error};
 const q=[];let qt=null;const flush=async()=>{if(!q.length||!user)return;const rows=q.splice(0,q.length);try{chk(await c.from("events").insert(rows))}catch(e){}};if(typeof addEventListener==="function")addEventListener("pagehide",flush);
 SB={kind:"supabase",needsEmail:true,
  async init(){const{data}=await c.auth.getSession();user=data.session?data.session.user:null;return user?{id:user.id,name:nameOf(user)}:null},
  async signUp(email,pw,name){const{data,error}=await c.auth.signUp({email,password:pw,options:{data:{name}}});if(error)throw error;if(!data.session)throw new Error("confirm-email");user=data.user;return{id:user.id,name}},
  async signIn(email,pw){const{data,error}=await c.auth.signInWithPassword({email,password:pw});if(error)throw error;user=data.user;return{id:user.id,name:nameOf(user)}},
  async signOut(){await c.auth.signOut();user=null},
  async loadData(){const{data}=await c.from("user_data").select("data").eq("user_id",user.id).maybeSingle();return data?data.data:null},
  async saveData(d){if(user)chk(await c.from("user_data").upsert({user_id:user.id,data:d,updated_at:new Date().toISOString()}))},
  watchTables:cb=>poll(tables,cb,5000),
  watchMessages:(id,cb)=>poll(()=>msgs(id),cb,3500),
  async create(t){chk(await c.from("tables").insert({title:t.title,vibe:t.vibe,meet_at:t.when,capacity:t.cap,host:user.id}))},
  async join(id){chk(await c.from("table_members").insert({table_id:id,user_id:user.id}))},
  async leave(id){chk(await c.from("table_members").delete().eq("table_id",id).eq("user_id",user.id))},
  async remove(id){chk(await c.from("tables").delete().eq("id",id))},
  async say(id,text){chk(await c.from("messages").insert({table_id:id,user_id:user.id,body:text}))},
  /* Telemetry: batched inserts into `events` (own rows only, no free text). Guests are not tracked remotely. */
  track(ev){if(!user)return;q.push({at:new Date(ev.t).toISOString(),name:ev.name,arm:ev.arm,session:ev.sid,props:ev.props});clearTimeout(qt);qt=setTimeout(flush,4000)},
  async sendFeedback(f){if(!user)return;chk(await c.from("feedback").insert({tags:f.tags,rating:f.rating,drink:f.drink,roast:f.roast}))},
  async topics(){const{data,error}=await c.rpc("trending_topics");if(error)throw error;return(data||[]).map(r=>({word:r.word,n:Number(r.n)}))},
  /* Minimal data out: only the question and the last blend leave the browser. No name, no id. */
  async ask(q,ctx){const{data,error}=await c.functions.invoke("ask-hadota",{body:{q:String(q).slice(0,300),ctx:ctx?String(ctx).slice(0,200):""}});return error?"":((data&&data.text)||"")}}}
/* ---- preview backend (claude.ai artifact database) ---- */
let db=null,uid=null,acct=null;
const ready=(async()=>{try{if(!window.claude)return;const u=await claude.use("user");uid=u&&u.id?await u.id():null;db=await claude.use("db")}catch(e){}})();
const need=()=>{if(!db||!uid)throw new Error("no-preview-db")};
const watch=(path,order,cb)=>{let un=()=>{},dead=false;ready.then(()=>{if(!db||dead)return;try{un=db.collection(path).orderBy(order[0],order[1]).limit(100).onSnapshot(s=>cb(s.docs.map(d=>d.data())),()=>{})}catch(e){}});return()=>{dead=true;try{un()}catch(e){}}};
const PV={kind:"preview",needsEmail:false,
 async init(){await ready;if(!db||!uid)return null;try{const s=await db.doc("accounts/"+uid).get();if(s.exists)return acct={id:uid,name:s.data().name}}catch(e){}return null},
 async signUp(_e,_p,name){try{need();await db.doc("accounts/"+uid).set({name});return acct={id:uid,name}}catch(e){return LC.signUp(_e,_p,name)}},
 async signIn(){const a=await this.init();if(!a)throw new Error("no-account");return a},
 async signOut(){acct=null},
 async loadData(){return null},async saveData(){},
 watchTables:cb=>watch("tables",["at","desc"],cb),
 watchMessages:(id,cb)=>watch("tables/"+id+"/msgs",["at","asc"],cb),
 async create(t){need();const id="t"+gid();await db.doc("tables/"+id).set({id,title:t.title,vibe:t.vibe,when:t.when,cap:t.cap,host:uid,at:Date.now(),members:[{id:uid,name:acct.name}]})},
 async join(id){need();const r=db.doc("tables/"+id),s=await r.get(),t=s.data();if(t.members.some(m=>m.id===uid))return;if(t.members.length>=t.cap)throw new Error("full");await r.set({...t,members:[...t.members,{id:uid,name:acct.name}]})},
 async leave(id){need();const r=db.doc("tables/"+id),s=await r.get(),t=s.data();await r.set({...t,members:t.members.filter(m=>m.id!==uid)})},
 async remove(id){need();await db.doc("tables/"+id).delete()},
 async say(id,text){need();const m="m"+gid();await db.doc("tables/"+id+"/msgs/"+m).set({id:m,text,uid,name:acct.name,at:Date.now()})}};
/* ---- local mode: no server at all (running from your own computer without Supabase) ---- */
const LK="hadota.local.account",lget=()=>{try{return JSON.parse(localStorage.getItem(LK))}catch(e){return null}},no=async()=>{throw new Error("no-server")};
const LC={kind:"local",needsEmail:false,async init(){return lget()},async signUp(_e,_p,name){const a={id:"local",name};try{localStorage.setItem(LK,JSON.stringify(a))}catch(e){}return a},async signIn(){const a=lget();if(!a)throw new Error("no-account");return a},async signOut(){try{localStorage.removeItem(LK)}catch(e){}},async loadData(){return null},async saveData(){},watchTables:cb=>{cb([]);return()=>{}},watchMessages:(id,cb)=>{cb([]);return()=>{}},create:no,join:no,leave:no,remove:no,say:no};
const pick=()=>SB||(window.claude?PV:LC);
const B={get kind(){return pick().kind},get needsEmail(){return pick().needsEmail},get missingLib(){return !!(CFG.supabaseUrl&&!window.supabase)}};
["signUp","signIn","signOut","loadData","saveData","watchTables","watchMessages","create","join","leave","remove","say"].forEach(m=>{B[m]=(...a)=>pick()[m](...a)});
B.init=async()=>{const p=pick(),a=await p.init();return a||(p===PV?LC.init():null)};
if(SB){B.topics=SB.topics;B.ask=SB.ask;B.track=SB.track;B.sendFeedback=SB.sendFeedback}
return B;
})();
