
const Backend=(()=>{
const CFG=window.HADOTA_CONFIG||{};
const ok=CFG.supabaseUrl&&CFG.supabaseKey&&window.supabase;
const gid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
let SB=null;
if(ok){
 const c=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey);let user=null;
 const nameOf=u=>(u&&u.user_metadata&&u.user_metadata.name)||(u&&u.email?u.email.split("@")[0]:"");
 const poll=(fn,cb,ms,onError)=>{let on=true,inFlight=false,lastError="";const run=async()=>{if(!on||inFlight)return;inFlight=true;try{const r=await fn();if(!on)return;lastError="";cb(r)}catch(e){if(on&&onError){const key=String(e&&((e.code||"")+":"+(e.message||""))||e);if(key!==lastError){lastError=key;try{onError(e)}catch(_){}}}}finally{inFlight=false}};run();const t=setInterval(run,ms);return()=>{on=false;clearInterval(t)}};
 const chk=r=>{if(r.error)throw r.error};
 const q=[];let qt=null;const flush=async()=>{if(!q.length||!user)return;const rows=q.splice(0,q.length);try{chk(await c.from("events").insert(rows))}catch(e){}};if(typeof addEventListener==="function")addEventListener("pagehide",flush);
 const TCOLS="id,title,vibe,meet_at,capacity,host,members_n,table_members(user_id,profiles!table_members_user_id_fkey(name)),table_requests(id,user_id,status,profiles!table_requests_user_id_fkey(name),table_votes(voter_id,approve))";
 const tables=async()=>{const{data,error}=await c.from("tables").select(TCOLS).order("created_at",{ascending:false}).limit(50);if(error)throw error;
  return data.map(t=>{const members=(t.table_members||[]).map(m=>({id:m.user_id,name:(m.profiles&&m.profiles.name)||"؟"})),reqs=t.table_requests||[],mine=reqs.find(r=>user&&r.user_id===user.id),isM=user&&members.some(m=>m.id===user.id);
   return{id:t.id,title:t.title,vibe:t.vibe,when:t.meet_at,cap:t.capacity,host:t.host,n:t.members_n,members,myReq:mine?mine.status:null,
    pending:isM?reqs.filter(r=>r.status==="pending").map(r=>({id:r.id,uid:r.user_id,name:(r.profiles&&r.profiles.name)||"؟",votes:Object.fromEntries((r.table_votes||[]).map(v=>[v.voter_id,v.approve]))})):[]}})};
 const msgs=async id=>{const{data,error}=await c.from("messages").select("id,body,created_at,user_id,profiles!messages_user_id_fkey(name)").eq("table_id",id).order("created_at",{ascending:true}).limit(100);if(error)throw error;return data.map(m=>({id:m.id,text:m.body,at:m.created_at,uid:m.user_id,name:(m.profiles&&m.profiles.name)||"؟"}))};
 const PCOLS="id,author,table_id,body,media_path,media_type,repost_of,like_count,comment_count,repost_count,created_at,profiles!posts_author_fkey(name)";
 const sig=new Map();   // signed-url cache so private images do not reload on every poll
 const mediaUrls=async ps=>{const m=new Map(),need=[];for(const p of ps){if(!p.media_path)continue;if(!p.table_id){m.set(p.id,c.storage.from("media").getPublicUrl(p.media_path).data.publicUrl);continue}const h=sig.get(p.media_path);if(h&&h.exp>Date.now())m.set(p.id,h.url);else need.push(p)}
  if(need.length){const{data,error}=await c.storage.from("media-private").createSignedUrls(need.map(p=>p.media_path),3600);if(error)throw error;(data||[]).forEach((d,i)=>{if(d&&d.signedUrl){sig.set(need[i].media_path,{url:d.signedUrl,exp:Date.now()+3000e3});m.set(need[i].id,d.signedUrl)}})}return m};
 const feed=async scope=>{let qb=c.from("posts").select(PCOLS).order("created_at",{ascending:false}).limit(60);qb=scope&&scope.table?qb.eq("table_id",scope.table):qb.is("table_id",null);
  const{data,error}=await qb;if(error)throw error;const ids=data.map(p=>p.id),oids=[...new Set(data.filter(p=>p.repost_of).map(p=>p.repost_of))];
  const[lk,og]=await Promise.all([ids.length?c.from("post_likes").select("post_id").eq("user_id",user.id).in("post_id",ids):{data:[]},oids.length?c.from("posts").select(PCOLS).in("id",oids):{data:[]}]);
  chk(lk);chk(og);const liked=new Set((lk.data||[]).map(x=>x.post_id)),orig=new Map((og.data||[]).map(x=>[x.id,x])),urls=await mediaUrls([...data,...(og.data||[])]);
  const shape=p=>({id:p.id,uid:p.author,name:(p.profiles&&p.profiles.name)||"؟",text:p.body,at:p.created_at,table:p.table_id,mediaType:p.media_type,mediaUrl:urls.get(p.id)||null,likes:p.like_count,comments:p.comment_count,reposts:p.repost_count,liked:liked.has(p.id)});
  return data.map(p=>({...shape(p),repostOf:p.repost_of?(orig.get(p.repost_of)?shape(orig.get(p.repost_of)):{missing:true}):null}))};
 const cmts=async id=>{const{data,error}=await c.from("post_comments").select("id,body,created_at,user_id,profiles!post_comments_user_id_fkey(name)").eq("post_id",id).order("created_at",{ascending:true}).limit(100);if(error)throw error;return data.map(m=>({id:m.id,text:m.body,at:m.created_at,uid:m.user_id,name:(m.profiles&&m.profiles.name)||"؟"}))};
 SB={kind:"supabase",needsEmail:true,
  async init(){const{data}=await c.auth.getSession();user=data.session?data.session.user:null;return user?{id:user.id,name:nameOf(user)}:null},
  async signUp(email,pw,name){const{data,error}=await c.auth.signUp({email,password:pw,options:{data:{name}}});if(error)throw error;if(!data.session)throw new Error("confirm-email");user=data.user;return{id:user.id,name}},
  async signIn(email,pw){const{data,error}=await c.auth.signInWithPassword({email,password:pw});if(error)throw error;user=data.user;return{id:user.id,name:nameOf(user)}},
  async signOut(){await c.auth.signOut();user=null},
  async loadData(){const{data}=await c.from("user_data").select("data").eq("user_id",user.id).maybeSingle();return data?data.data:null},
  async saveData(d){if(user)chk(await c.from("user_data").upsert({user_id:user.id,data:d,updated_at:new Date().toISOString()}))},
  watchTables:(cb,onError)=>poll(tables,cb,5000,onError),
  watchMessages:(id,cb,onError)=>poll(()=>msgs(id),cb,3500,onError),
  async create(t){const{data,error}=await c.from("tables").insert({title:t.title,vibe:t.vibe,meet_at:t.when,capacity:t.cap,host:user.id}).select("id").single();if(error)throw error;if(!data||!data.id)throw new Error("table-create-no-id");return data.id},
  /* joining = a request that every current member must approve (enforced by triggers in 002_social_and_requests.sql) */
  async request(id){chk(await c.from("table_requests").insert({table_id:id,user_id:user.id}))},
  async cancelRequest(id){chk(await c.from("table_requests").delete().eq("table_id",id).eq("user_id",user.id))},
  async vote(tid,req,approve){chk(await c.from("table_votes").insert({request_id:req.id,voter_id:user.id,approve}))},
  async leave(id){chk(await c.from("table_members").delete().eq("table_id",id).eq("user_id",user.id))},
  async remove(id){chk(await c.from("tables").delete().eq("id",id))},
  async say(id,text){chk(await c.from("messages").insert({table_id:id,user_id:user.id,body:text}))},
  watchFeed:(scope,cb,onError)=>poll(()=>feed(scope),cb,6000,onError),
  async post({text,table,file,kind,repostOf}){let path=null,type=null,bucket=table?"media-private":"media";
   if(file){type=kind;const ext=((file.name||"").split(".").pop()||(kind==="video"?"mp4":"jpg")).replace(/[^a-z0-9]/gi,"").slice(0,5)||"bin",name=Date.now()+"-"+Math.random().toString(36).slice(2,7)+"."+ext;
    path=table?table+"/"+user.id+"/"+name:user.id+"/"+name;const up=await c.storage.from(bucket).upload(path,file,{contentType:file.type||(kind==="video"?"video/mp4":"image/jpeg"),upsert:false});if(up.error)throw up.error}
   try{const{data,error}=await c.from("posts").insert({body:text||"",table_id:table||null,media_path:path,media_type:type,repost_of:repostOf||null}).select("id").single();if(error)throw error;if(!data||!data.id)throw new Error("post-create-no-id");return data.id}
   catch(e){if(path){try{const{error:cleanupError}=await c.storage.from(bucket).remove([path]);if(cleanupError)console.error("Hadota media cleanup failed:",cleanupError)}catch(cleanupError){console.error("Hadota media cleanup failed:",cleanupError)}}throw e}},
  async like(id){chk(await c.from("post_likes").insert({post_id:id,user_id:user.id}))},
  async unlike(id){chk(await c.from("post_likes").delete().eq("post_id",id).eq("user_id",user.id))},
  async comment(id,text){chk(await c.from("post_comments").insert({post_id:id,body:text}))},
  watchComments:(id,cb,onError)=>poll(()=>cmts(id),cb,5000,onError),
  async deletePost(id){chk(await c.from("posts").delete().eq("id",id))},
  async myActivity(){const[p,cm]=await Promise.all([c.from("posts").select("id,body,created_at,table_id").eq("author",user.id).order("created_at",{ascending:false}).limit(20),c.from("post_comments").select("post_id,body,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(20)]);
   return{posts:(p.data||[]).map(x=>({id:x.id,text:x.body,at:x.created_at,table:x.table_id})),comments:(cm.data||[]).map(x=>({postId:x.post_id,text:x.body,at:x.created_at}))}},
  /* Telemetry: batched inserts into `events` (own rows only, no free text). Guests are not tracked remotely. */
  track(ev){if(!user)return;q.push({at:new Date(ev.t).toISOString(),name:ev.name,arm:ev.arm,session:ev.sid,props:ev.props});clearTimeout(qt);qt=setTimeout(flush,4000)},
  async sendFeedback(f){if(!user)return;chk(await c.from("feedback").insert({tags:f.tags,rating:f.rating,drink:f.drink,roast:f.roast}))},
  async topics(){const{data,error}=await c.rpc("trending_topics");if(error)throw error;return(data||[]).map(r=>({word:r.word,n:Number(r.n)}))},
  /* Minimal data out: the question, the last blend and the user's taste rules leave the browser. No name, no id. */
  async ask(q,ctx,rules){const{data,error}=await c.functions.invoke("ask-hadota",{body:{q:String(q).slice(0,300),ctx:ctx?String(ctx).slice(0,200):"",rules:rules?String(rules).slice(0,500):""}});return error?"":((data&&data.text)||"")}}
}
/* ---- preview backend (claude.ai artifact database) ---- */
let db=null,uid=null,acct=null,rawT=[],rawF=[],tOn=false,fOn=false;
const ready=(async()=>{try{if(!window.claude)return;const u=await claude.use("user");uid=u&&u.id?await u.id():null;db=await claude.use("db")}catch(e){}})();
const need=()=>{if(!db||!uid)throw new Error("no-preview-db")};
const watch=(path,order,cb,onError)=>{let un=()=>{},dead=false;ready.then(()=>{if(!db||dead){if(!db&&!dead&&onError)onError(new Error("no-preview-db"));return}try{un=db.collection(path).orderBy(order[0],order[1]).limit(100).onSnapshot(s=>{if(!dead)cb(s.docs.map(d=>d.data()))},e=>{if(!dead&&onError)onError(e)})}catch(e){if(!dead&&onError)onError(e)}});return()=>{dead=true;try{un()}catch(e){}}};
const keep=()=>{ready.then(()=>{if(!db)return;if(!tOn){tOn=true;try{db.collection("tables").orderBy("at","desc").limit(100).onSnapshot(s=>{rawT=s.docs.map(d=>d.data())},()=>{})}catch(e){}}if(!fOn){fOn=true;try{db.collection("feed").orderBy("at","desc").limit(150).onSnapshot(s=>{rawF=s.docs.map(d=>d.data())},()=>{})}catch(e){}}})};
const myTables=()=>new Set(rawT.filter(t=>t.members.some(m=>m.id===uid)).map(t=>t.id));
const mapTable=t=>{const isM=t.members.some(m=>m.id===uid),reqs=t.requests||{},my=reqs[uid];return{id:t.id,title:t.title,vibe:t.vibe,when:t.when,cap:t.cap,host:t.host,n:t.members.length,members:isM?t.members:[],myReq:my?my.status:null,
 pending:isM?Object.entries(reqs).filter(([k,r])=>r.status==="pending").map(([k,r])=>({id:k,uid:k,name:r.name,votes:r.votes||{}})):[]}};
const shapeP=(p,all)=>({id:p.id,uid:p.uid,name:p.name,text:p.text,at:p.at,table:p.table||null,mediaType:p.media?p.media.type:null,mediaUrl:p.media?p.media.dataUrl:null,likes:Object.keys(p.likes||{}).length,comments:p.commentCount||0,reposts:all.filter(x=>x.repostOf===p.id).length,liked:!!(p.likes||{})[uid]});
const blobToUrl=b=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(b)});
const PV={kind:"preview",needsEmail:false,
 async init(){await ready;if(!db||!uid)return null;keep();try{const s=await db.doc("accounts/"+uid).get();if(s.exists)return acct={id:uid,name:s.data().name}}catch(e){}return null},
 async signUp(_e,_p,name){try{need();await db.doc("accounts/"+uid).set({name});keep();return acct={id:uid,name}}catch(e){return LC.signUp(_e,_p,name)}},
 async signIn(){const a=await this.init();if(!a)throw new Error("no-account");return a},
 async signOut(){acct=null},
 async loadData(){return null},async saveData(){},
 watchTables:(cb,onError)=>{keep();return watch("tables",["at","desc"],d=>cb(d.map(mapTable)),onError)},
 watchMessages:(id,cb,onError)=>watch("tables/"+id+"/msgs",["at","asc"],cb,onError),
 async create(t){need();const id="t"+gid();await db.doc("tables/"+id).set({id,title:t.title,vibe:t.vibe,when:t.when,cap:t.cap,host:uid,at:Date.now(),members:[{id:uid,name:acct.name}],requests:{}});return id},
 async request(id){need();const r=db.doc("tables/"+id),t=(await r.get()).data();if(t.members.some(m=>m.id===uid))return;t.requests=t.requests||{};t.requests[uid]={name:acct.name,votes:{},status:"pending",at:Date.now()};await r.set(t)},
 async cancelRequest(id){need();const r=db.doc("tables/"+id),t=(await r.get()).data();if(t.requests)delete t.requests[uid];await r.set(t)},
 async vote(tid,req,approve){need();const r=db.doc("tables/"+tid),t=(await r.get()).data(),q=(t.requests||{})[req.uid];if(!q||q.status!=="pending")return;if(!t.members.some(m=>m.id===uid))throw new Error("not-member");q.votes[uid]=approve;
  if(!approve)q.status="rejected";else if(t.members.every(m=>q.votes[m.id]===true)){if(t.members.length>=t.cap)q.status="rejected";else{t.members.push({id:req.uid,name:q.name});delete t.requests[req.uid]}}await r.set(t)},
 async leave(id){need();const r=db.doc("tables/"+id),t=(await r.get()).data();t.members=t.members.filter(m=>m.id!==uid);if(t.requests)delete t.requests[uid];await r.set(t)},
 async remove(id){need();await db.doc("tables/"+id).delete()},
 async say(id,text){need();const m="m"+gid();await db.doc("tables/"+id+"/msgs/"+m).set({id:m,text,uid,name:acct.name,at:Date.now()})},
 watchFeed:(scope,cb,onError)=>{keep();return watch("feed",["at","desc"],d=>{const mt=myTables();rawF=d;const vis=d.filter(p=>scope&&scope.table?p.table===scope.table&&mt.has(p.table):!p.table);
  cb(vis.map(p=>({...shapeP(p,d),repostOf:p.repostOf?(()=>{const o=d.find(x=>x.id===p.repostOf);return o?shapeP(o,d):{missing:true}})():null})))},onError)},
 async post({text,table,file,kind,repostOf}){need();let media=null;if(file){if(kind==="video")throw new Error("video-unsupported");if(file.size>260*1024)throw new Error("media-too-big");media={type:"image",dataUrl:await blobToUrl(file)}}
  const id="p"+gid();await db.doc("feed/"+id).set({id,uid,name:acct.name,text:text||"",at:Date.now(),table:table||null,media,repostOf:repostOf||null,likes:{},commentCount:0});return id},
 async like(id){need();const r=db.doc("feed/"+id),p=(await r.get()).data();p.likes=p.likes||{};p.likes[uid]=true;await r.set(p)},
 async unlike(id){need();const r=db.doc("feed/"+id),p=(await r.get()).data();if(p.likes)delete p.likes[uid];await r.set(p)},
 async comment(id,text){need();const cid="c"+gid();await db.doc("feed/"+id+"/comments/"+cid).set({id:cid,uid,name:acct.name,text,at:Date.now()});const r=db.doc("feed/"+id),p=(await r.get()).data();p.commentCount=(p.commentCount||0)+1;await r.set(p)},
 watchComments:(id,cb,onError)=>watch("feed/"+id+"/comments",["at","asc"],cb,onError),
 async deletePost(id){need();await db.doc("feed/"+id).delete()},
 async myActivity(){return{posts:rawF.filter(p=>p.uid===uid).slice(0,20).map(p=>({id:p.id,text:p.text,at:p.at,table:p.table})),comments:[]}}};
/* ---- local mode: no server at all (running from your own computer without Supabase) ---- */
const LK="hadota.local.account",lget=()=>{try{return JSON.parse(localStorage.getItem(LK))}catch(e){return null}},no=async()=>{throw new Error("no-server")};
const LC={kind:"local",needsEmail:false,async init(){return lget()},async signUp(_e,_p,name){const a={id:"local",name};try{localStorage.setItem(LK,JSON.stringify(a))}catch(e){}return a},async signIn(){const a=lget();if(!a)throw new Error("no-account");return a},async signOut(){try{localStorage.removeItem(LK)}catch(e){}},async loadData(){return null},async saveData(){},
 watchTables:cb=>{cb([]);return()=>{}},watchMessages:(id,cb)=>{cb([]);return()=>{}},watchFeed:(s,cb)=>{cb([]);return()=>{}},watchComments:(i,cb)=>{cb([]);return()=>{}},
 create:no,request:no,cancelRequest:no,vote:no,leave:no,remove:no,say:no,post:no,like:no,unlike:no,comment:no,deletePost:no,async myActivity(){return{posts:[],comments:[]}}};
const pick=()=>SB||(window.claude?PV:LC);
const B={get kind(){return pick().kind},get needsEmail(){return pick().needsEmail},get missingLib(){return !!(CFG.supabaseUrl&&!window.supabase)}};
["signUp","signIn","signOut","loadData","saveData","watchTables","watchMessages","create","request","cancelRequest","vote","leave","remove","say","watchFeed","post","like","unlike","comment","watchComments","deletePost","myActivity"].forEach(m=>{B[m]=(...a)=>pick()[m](...a)});
B.init=async()=>{const p=pick(),a=await p.init();return a||(p===PV?LC.init():null)};
if(SB){B.topics=SB.topics;B.ask=SB.ask;B.track=SB.track;B.sendFeedback=SB.sendFeedback}
return B;
})();
