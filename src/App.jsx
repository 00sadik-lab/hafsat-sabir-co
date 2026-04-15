import { useState, useEffect } from "react";

const C = {
  bg:"#F7F3EE", bg2:"#EDE8E0", card:"#FFFFFF", border:"#E2D9CC",
  gold:"#A0692A", goldL:"#C8914E", goldBg:"#FDF5E8", goldBorder:"#E8C97A",
  green:"#2D7A4F", greenBg:"#EAF6EF", greenBorder:"#A8D8BC",
  red:"#C0392B", redBg:"#FDECEA", redBorder:"#F0A89E",
  blue:"#2471A3", blueBg:"#EAF4FB",
  purple:"#7D3C98", purpleBg:"#F5EEF8",
  orange:"#D35400", orangeBg:"#FEF0E6",
  teal:"#1A7A6E", tealBg:"#E6F7F5",
  text:"#1A1208", textMid:"#5C4A2A", textMuted:"#9C8060", textDim:"#C4AE8A",
};
const CURRENCIES = ["₦ NGN","¥ RMB","$ USD"];
const RATES = {"₦ NGN":1,"¥ RMB":210,"$ USD":1550};
const PRODUCTS = ["Business Clarity Session","Life Audit","Canton Fair Guide","Organize Your Business Bootcamp","Procurement Service","China Travel Guide","Other"];
const SOURCES = ["WhatsApp Status","Instagram","Facebook","Referral","Direct Message","Other"];
const CITIES = ["Abuja","Kano","Kaduna","Lagos","China","Other"];
const SESSION_TYPES = ["Business Clarity Session","Life Audit Session","Canton Fair Consultation","Follow-up Session","Group Cohort Call","Procurement Consultation","Other"];
const LEAD_STATUSES = ["New Inquiry","Audit Sent","Following Up","Session Booked","Paid","Lost"];
const PAIN_TAGS = ["No system","Pricing confusion","Fear of starting","No customers","Cash flow","Social media overwhelm","Time management","China sourcing","Canton Fair prep","Mindset blocks","Marketing","Sales conversion","Scaling","Visibility","Other"];
const PAYMENT_METHODS = ["Bank Transfer – GTBank","Bank Transfer – Access","Bank Transfer – Zenith","Bank Transfer – First Bank","Opay","Palmpay","Moniepoint","Cash","Paystack Link","Flutterwave","WeChat Pay","Other"];
const MONTHLY_GOAL = 3000000;
const LEAD_STYLE = {
  "New Inquiry":    {bg:C.blueBg,   color:C.blue,   dot:C.blue},
  "Audit Sent":     {bg:C.goldBg,   color:C.gold,   dot:C.goldL},
  "Following Up":   {bg:C.orangeBg, color:C.orange, dot:C.orange},
  "Session Booked": {bg:C.purpleBg, color:C.purple, dot:C.purple},
  "Paid":           {bg:C.greenBg,  color:C.green,  dot:C.green},
  "Lost":           {bg:"#F5F5F5",  color:"#999",   dot:"#CCC"},
};
const SEED_TASKS = [
  {id:"t1",period:"April",goal:"Follow up all 50 Life Audit downloads",done:false,priority:"High"},
  {id:"t2",period:"April",goal:"Close 3 Business Clarity Sessions",done:false,priority:"High"},
  {id:"t3",period:"April",goal:"Post 1 WhatsApp status daily",done:false,priority:"High"},
  {id:"t4",period:"April",goal:"Fill Phase 1 Bootcamp to 20 students",done:false,priority:"High"},
  {id:"t5",period:"April",goal:"Collect 2 client reviews/testimonials",done:false,priority:"Medium"},
  {id:"t6",period:"May",goal:"Open Life Audit Cohort Phase 2",done:false,priority:"High"},
  {id:"t7",period:"May",goal:"Reach ₦1.5M monthly revenue",done:false,priority:"High"},
  {id:"t8",period:"May",goal:"Launch procurement inquiry service",done:false,priority:"Medium"},
  {id:"t9",period:"June",goal:"Run Instagram/Facebook ad for Bootcamp",done:false,priority:"High"},
  {id:"t10",period:"June",goal:"Pay July rent from business revenue",done:false,priority:"High"},
  {id:"t11",period:"July",goal:"Hit ₦3M/month target",done:false,priority:"High"},
  {id:"t12",period:"Q2 (Apr–Jun)",goal:"Build customer database of 100+",done:false,priority:"Medium"},
  {id:"t13",period:"Q2 (Apr–Jun)",goal:"Set up Wati.io WhatsApp automation",done:false,priority:"High"},
  {id:"t14",period:"Q2 (Apr–Jun)",goal:"Complete 2 cohort phases",done:false,priority:"High"},
  {id:"t15",period:"Q3 (Jul–Sep)",goal:"Stable ₦3M/month for 3 months",done:false,priority:"High"},
  {id:"t16",period:"Q3 (Jul–Sep)",goal:"Begin China Travel Guide product",done:false,priority:"Medium"},
  {id:"t17",period:"Q4 (Oct–Dec)",goal:"Launch Canton Fair 2026 prep program",done:false,priority:"Medium"},
  {id:"t18",period:"2025 Yearly",goal:"Train 500+ women through digital products",done:false,priority:"High"},
  {id:"t19",period:"2025 Yearly",goal:"Publish 3 products on Selar",done:false,priority:"High"},
  {id:"t20",period:"2025 Yearly",goal:"Register Hafsat Sabir Co. with CAC",done:false,priority:"Medium"},
];

function toNGN(a,c){return a*(RATES[c]||1);}
function fmtNGN(n){return "\u20A6"+Math.round(n).toLocaleString();}
function fmtAmt(a,c){return c.split(" ")[0]+Number(a).toLocaleString();}
function today(){return new Date().toISOString().split("T")[0];}
function isOverdue(d){return d && d<today();}

function makeSB(url, key) {
  const base = url.replace(/\/$/, "");
  const h = {"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json","Prefer":"return=representation"};
  return {
    async get(table){const r=await fetch(base+"/rest/v1/"+table+"?select=*",{headers:h});if(!r.ok)throw new Error(await r.text());return r.json();},
    async post(table,data){const r=await fetch(base+"/rest/v1/"+table,{method:"POST",headers:h,body:JSON.stringify(data)});if(!r.ok)throw new Error(await r.text());return r.json();},
    async patch(table,id,data){const r=await fetch(base+"/rest/v1/"+table+"?id=eq."+id,{method:"PATCH",headers:h,body:JSON.stringify(data)});if(!r.ok)throw new Error(await r.text());return r.json();},
    async del(table,id){const r=await fetch(base+"/rest/v1/"+table+"?id=eq."+id,{method:"DELETE",headers:h});if(!r.ok)throw new Error(await r.text());},
    async upsertTasks(rows){const r=await fetch(base+"/rest/v1/tasks",{method:"POST",headers:{...h,"Prefer":"resolution=ignore-duplicates,return=representation"},body:JSON.stringify(rows)});if(!r.ok)throw new Error(await r.text());return r.json();}
  };
}
const fromRow = r => ({ id: r.id, ...(r.data || {}) });

async function pickContact(onPick, toast$) {
  if("contacts" in navigator && "ContactsManager" in window) {
    try {
      const contacts = await navigator.contacts.select(["name","tel"],{multiple:false});
      if(contacts.length > 0) {
        const c = contacts[0];
        onPick({name:(c.name||[])[0]||"", phone:((c.tel||[])[0]||"").replace(/\s+/g,"")});
      }
    } catch(e) { toast$("Contact picker cancelled","err"); }
  } else {
    toast$("Contact picker works on Android Chrome only","err");
  }
}

function Badge({label,bg,color}){
  const s=LEAD_STYLE[label];
  return <span style={{background:bg||(s&&s.bg)||C.goldBg,color:color||(s&&s.color)||C.gold,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>{s&&<span style={{width:6,height:6,borderRadius:"50%",background:s.dot}}/>}{label}</span>;
}
const INP={background:C.bg,border:"1px solid "+C.border,color:C.text,padding:"9px 13px",borderRadius:9,width:"100%",fontSize:13,outline:"none",fontFamily:"inherit"};
const LBL={color:C.textMuted,fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:4};
function F({label,children}){return <div style={{marginBottom:12}}><label style={LBL}>{label}</label>{children}</div>;}
function Inp(p){return <input style={INP} {...p}/>;}
function Sel({children,...p}){return <select style={INP} {...p}>{children}</select>;}
function Txt(p){return <textarea style={{...INP,resize:"vertical",minHeight:72}} {...p}/>;}
function Row({children}){return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{children}</div>;}
function Card({children,style={}}){return <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:18,...style}}>{children}</div>;}
function GoldBtn({children,onClick,style={}}){return <button onClick={onClick} style={{background:"linear-gradient(135deg,"+C.gold+","+C.goldL+")",color:"#fff",border:"none",borderRadius:10,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",...style}}>{children}</button>;}
function GhostBtn({children,onClick}){return <button onClick={onClick} style={{background:"transparent",color:C.textMuted,border:"1px solid "+C.border,borderRadius:10,padding:"9px 16px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{children}</button>;}
function SectionHead({title,sub,action}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
    <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:C.text}}>{title}</div>{sub&&<div style={{fontSize:12,color:C.textMuted,marginTop:2}}>{sub}</div>}</div>
    {action}
  </div>;
}
function PhoneRow({value,onChange,onPickContact}){
  return <div style={{display:"flex",gap:6}}>
    <input style={{...INP,flex:1}} placeholder="08012345678" value={value} onChange={onChange}/>
    <button type="button" title="Pick from phone contacts" onClick={onPickContact}
      style={{background:C.goldBg,border:"1px solid "+C.goldBorder,borderRadius:9,padding:"0 12px",fontSize:16,cursor:"pointer",flexShrink:0}}>{"📱"}</button>
  </div>;
}

const TABS=[
  {id:"overview",icon:"◈",label:"Overview"},
  {id:"leads",icon:"🔥",label:"Leads"},
  {id:"sales",icon:"💰",label:"Sales"},
  {id:"customers",icon:"👥",label:"Customers"},
  {id:"bookings",icon:"📅",label:"Bookings"},
  {id:"cohorts",icon:"🎓",label:"Cohorts"},
  {id:"intel",icon:"🧠",label:"Client Intel"},
  {id:"procurement",icon:"📦",label:"Procurement"},
  {id:"tasks",icon:"✅",label:"Goals"},
];

function SetupScreen({onSave}) {
  const [url,setUrl]=useState("");
  const [key,setKey]=useState("");
  const [err,setErr]=useState("");
  function save(){
    if(!url||!key){setErr("Both fields required");return;}
    try{
      localStorage.setItem("sb_url",url.trim());
      localStorage.setItem("sb_key",key.trim());
      onSave(url.trim(),key.trim());
    }catch(e){setErr(e.message);}
  }
  const SQL="create table leads (id bigserial primary key, data jsonb default '{}');\ncreate table sales (id bigserial primary key, data jsonb default '{}');\ncreate table customers (id bigserial primary key, data jsonb default '{}');\ncreate table bookings (id bigserial primary key, data jsonb default '{}');\ncreate table intel (id bigserial primary key, data jsonb default '{}');\ncreate table cohorts (id bigserial primary key, data jsonb default '{}');\ncreate table procurement (id bigserial primary key, data jsonb default '{}');\ncreate table tasks (id text primary key, data jsonb default '{}');\n\ndo $$ declare t text; begin\n  foreach t in array array['leads','sales','customers','bookings','intel','cohorts','procurement','tasks'] loop\n    execute format('alter table %I disable row level security', t);\n  end loop;\nend $$;";
  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}"}</style>
      <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:20,padding:32,maxWidth:560,width:"100%",boxShadow:"0 8px 40px rgba(0,0,0,0.08)"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:700,color:C.gold,marginBottom:4}}>Hafsat Sabir Co.</div>
        <div style={{fontSize:10,color:C.textMuted,marginBottom:24,letterSpacing:"0.08em",textTransform:"uppercase"}}>One-time database setup</div>
        <div style={{background:C.goldBg,border:"1px solid "+C.goldBorder,borderRadius:12,padding:16,marginBottom:20,fontSize:13,color:C.textMid,lineHeight:2}}>
          <strong style={{color:C.gold}}>3-minute setup:</strong><br/>
          1. Go to <strong>supabase.com</strong> — create a free project<br/>
          2. Open <strong>SQL Editor</strong> — paste and run the SQL below<br/>
          3. Go to <strong>Project Settings — API</strong> — copy URL + anon key<br/>
          4. Paste them here — your data saves forever
        </div>
        <div style={{background:"#1a1a2e",borderRadius:10,padding:14,marginBottom:20,fontSize:11,color:"#a8dadc",fontFamily:"monospace",lineHeight:1.8,overflowX:"auto",whiteSpace:"pre",userSelect:"all",cursor:"text"}}>{SQL}</div>
        <div style={{marginBottom:12}}><label style={LBL}>Supabase Project URL</label><input style={INP} placeholder="https://xxxxxxxxxxxx.supabase.co" value={url} onChange={e=>setUrl(e.target.value)}/></div>
        <div style={{marginBottom:20}}><label style={LBL}>Supabase Anon / Public Key</label><input style={INP} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value={key} onChange={e=>setKey(e.target.value)} type="password"/></div>
        {err&&<div style={{color:C.red,fontSize:12,marginBottom:12,fontWeight:700}}>{"⚠ "+err}</div>}
        <GoldBtn onClick={save} style={{width:"100%",padding:"13px 0",fontSize:15}}>Connect Database</GoldBtn>
      </div>
    </div>
  );
}

export default function App(){
  const [configured,setConfigured]=useState(false);
  const [sb,setSb]=useState(null);
  const [initLoading,setInitLoading]=useState(true);
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=useState("overview");
  const [leadStatusFilter,setLeadStatusFilter]=useState("All");
  const [leads,setLeads]=useState([]);
  const [sales,setSales]=useState([]);
  const [customers,setCustomers]=useState([]);
  const [bookings,setBookings]=useState([]);
  const [intel,setIntel]=useState([]);
  const [cohorts,setCohorts]=useState([]);
  const [procurement,setProcurement]=useState([]);
  const [tasks,setTasks]=useState([]);
  const [toast,setToast]=useState(null);
  const [search,setSearch]=useState("");
  const [showLF,setShowLF]=useState(false);
  const [showSF,setShowSF]=useState(false);
  const [showCF,setShowCF]=useState(false);
  const [showBF,setShowBF]=useState(false);
  const [showIF,setShowIF]=useState(false);
  const [showCoF,setShowCoF]=useState(false);
  const [showPF,setShowPF]=useState(false);
  const [expandedLead,setExpandedLead]=useState(null);
  const [expandedSale,setExpandedSale]=useState(null);
  const [expandedIntel,setExpandedIntel]=useState(null);
  const [intelFilter,setIntelFilter]=useState("All");
  const [editingLead,setEditingLead]=useState(null);
  const [editLF,setEditLF]=useState({});
  const [showRefund,setShowRefund]=useState(null);
  const [refundAmt,setRefundAmt]=useState("");

  const blankL={name:"",phone:"",source:"WhatsApp Status",product:"Business Clarity Session",status:"New Inquiry",currency:"₦ NGN",amount:"",date:today(),lastContact:today(),followUpDate:"",auditSent:false,notes:""};
  const blankS={customer:"",product:"Business Clarity Session",amount:"",currency:"₦ NGN",date:today(),payStatus:"Paid",delivery:"Delivered",payMethod:"Bank Transfer – GTBank",payRef:""};
  const blankC={name:"",phone:"",city:"Abuja",notes:""};
  const blankB={client:"",phone:"",session:"Business Clarity Session",date:today(),time:"10:00",duration:"60",status:"Confirmed",notes:""};
  const blankI={client:"",date:today(),session:"Business Clarity Session",notes:"",summary:"",actions:"",tags:[]};
  const blankCo={name:"",phase:"Phase 1",status:"Upcoming",startDate:today(),endDate:"",targetEnrollment:"",enrolled:0,pricePerSeat:"",targetRevenue:"",currency:"₦ NGN",notes:""};
  const blankP={name:"",phone:"",product:"",qty:"",budget:"",timeline:"",status:"Inquiry",currency:"₦ NGN",notes:"",date:today()};
  const [lf,setLf]=useState(blankL);
  const [sf,setSf]=useState(blankS);
  const [cf,setCf]=useState(blankC);
  const [bf,setBf]=useState(blankB);
  const [inf,setInf]=useState(blankI);
  const [cof,setCof]=useState(blankCo);
  const [pf,setPf]=useState(blankP);

  const toast$=(msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),2800);};

  function navigateTo(newTab, filter){
    setTab(newTab);
    setSearch("");
    if(newTab==="leads" && filter) setLeadStatusFilter(filter);
  }

  function bookFromLead(lead){
    setBf({...blankB,client:lead.name||"",phone:lead.phone||""});
    setShowBF(true);
    setTab("bookings");
    setExpandedLead(null);
  }

  useEffect(()=>{
    function init(){
      try{
        const u=localStorage.getItem("sb_url");
        const k=localStorage.getItem("sb_key");
        if(u&&k){const client=makeSB(u,k);setSb(client);setConfigured(true);}
      }catch(e){}
      setInitLoading(false);
    }
    init();
  },[]);

  useEffect(()=>{if(sb&&configured)loadAll(sb);},[sb,configured]);

  async function loadAll(client){
    setLoading(true);
    try{
      const [l,s,c,b,i,co,p,t]=await Promise.all([
        client.get("leads"),client.get("sales"),client.get("customers"),
        client.get("bookings"),client.get("intel"),client.get("cohorts"),
        client.get("procurement"),client.get("tasks").catch(()=>[])
      ]);
      setLeads(l.map(fromRow).sort((a,b)=>b.id-a.id));
      setSales(s.map(fromRow).sort((a,b)=>b.id-a.id));
      setCustomers(c.map(fromRow).sort((a,b)=>b.id-a.id));
      setBookings(b.map(fromRow).sort((a,b)=>b.id-a.id));
      setIntel(i.map(fromRow).sort((a,b)=>b.id-a.id));
      setCohorts(co.map(fromRow).sort((a,b)=>b.id-a.id));
      setProcurement(p.map(fromRow).sort((a,b)=>b.id-a.id));
      if(t.length===0){
        const seeded=await client.upsertTasks(SEED_TASKS.map(task=>({id:task.id,data:{period:task.period,goal:task.goal,done:task.done,priority:task.priority}})));
        setTasks(seeded.map(fromRow));
      }else{setTasks(t.map(fromRow));}
    }catch(e){toast$("Load error: "+e.message,"err");}
    setLoading(false);
  }

  function handleSetup(url,key){const client=makeSB(url,key);setSb(client);setConfigured(true);}

  async function addLead(){
    if(!lf.name||!lf.phone)return toast$("Name and phone required","err");
    try{const [row]=await sb.post("leads",{data:{...lf,amount:parseFloat(lf.amount)||0}});setLeads([fromRow(row),...leads]);setLf(blankL);setShowLF(false);toast$("Lead added!");}
    catch(e){toast$(e.message,"err");}
  }
  async function saveEditLead(){
    if(!editLF.name||!editLF.phone)return toast$("Name and phone required","err");
    try{
      await sb.patch("leads",editingLead,{data:{...editLF,amount:parseFloat(editLF.amount)||0}});
      setLeads(leads.map(l=>l.id===editingLead?{...editLF,amount:parseFloat(editLF.amount)||0,id:editingLead}:l));
      setEditingLead(null);toast$("Lead updated!");
    }catch(e){toast$(e.message,"err");}
  }
  async function addSale(){
    if(!sf.customer||!sf.amount)return toast$("Customer and amount required","err");
    try{const [row]=await sb.post("sales",{data:{...sf,amount:parseFloat(sf.amount)}});setSales([fromRow(row),...sales]);setSf(blankS);setShowSF(false);toast$("Sale recorded!");}
    catch(e){toast$(e.message,"err");}
  }
  async function issueRefund(saleId){
    const sale=sales.find(s=>s.id===saleId);if(!sale)return;
    const amt=parseFloat(refundAmt)||sale.amount;
    const updated={...sale,refunded:true,refundAmount:amt,refundDate:today(),payStatus:"Refunded"};
    try{
      await sb.patch("sales",saleId,{data:updated});
      setSales(sales.map(s=>s.id===saleId?updated:s));
      setShowRefund(null);setRefundAmt("");toast$("Refund recorded");
    }catch(e){toast$(e.message,"err");}
  }
  async function addCustomer(){
    if(!cf.name||!cf.phone)return toast$("Name and phone required","err");
    try{const [row]=await sb.post("customers",{data:{...cf,totalNGN:0,purchases:0,lastPurchase:"-"}});setCustomers([fromRow(row),...customers]);setCf(blankC);setShowCF(false);toast$("Customer added!");}
    catch(e){toast$(e.message,"err");}
  }
  async function addBooking(){
    if(!bf.client||!bf.date)return toast$("Client and date required","err");
    const clash=bookings.find(b=>b.date===bf.date&&b.time===bf.time&&b.status!=="Cancelled");
    if(clash)return toast$("Clash with "+clash.client+" at "+clash.time,"err");
    try{const [row]=await sb.post("bookings",{data:bf});setBookings([fromRow(row),...bookings]);setBf(blankB);setShowBF(false);toast$("Booking saved!");}
    catch(e){toast$(e.message,"err");}
  }
  async function addIntel(){
    if(!inf.client)return toast$("Client name required","err");
    try{const [row]=await sb.post("intel",{data:inf});setIntel([fromRow(row),...intel]);setInf(blankI);setShowIF(false);toast$("Notes saved!");}
    catch(e){toast$(e.message,"err");}
  }
  async function addCohort(){
    if(!cof.name)return toast$("Name required","err");
    try{const [row]=await sb.post("cohorts",{data:{...cof,enrolled:parseInt(cof.enrolled)||0,revenue:0}});setCohorts([fromRow(row),...cohorts]);setCof(blankCo);setShowCoF(false);toast$("Cohort added!");}
    catch(e){toast$(e.message,"err");}
  }
  async function addProcurement(){
    if(!pf.name||!pf.product)return toast$("Name and product required","err");
    try{const [row]=await sb.post("procurement",{data:pf});setProcurement([fromRow(row),...procurement]);setPf(blankP);setShowPF(false);toast$("Inquiry saved!");}
    catch(e){toast$(e.message,"err");}
  }
  async function quickLeadStatus(id,status){
    const lead=leads.find(l=>l.id===id);if(!lead)return;
    const updated={...lead,status,lastContact:today()};
    try{await sb.patch("leads",id,{data:updated});setLeads(leads.map(l=>l.id===id?updated:l));toast$("Moved to "+status);}
    catch(e){toast$(e.message,"err");}
  }
  async function markAuditSent(id){
    const lead=leads.find(l=>l.id===id);if(!lead)return;
    const updated={...lead,auditSent:true};
    try{await sb.patch("leads",id,{data:updated});setLeads(leads.map(l=>l.id===id?updated:l));}
    catch(e){toast$(e.message,"err");}
  }
  async function toggleTask(id){
    const task=tasks.find(t=>t.id===id);if(!task)return;
    const updated={...task,done:!task.done};
    try{await sb.patch("tasks",id,{data:{period:updated.period,goal:updated.goal,done:updated.done,priority:updated.priority}});setTasks(tasks.map(t=>t.id===id?updated:t));}
    catch(e){toast$(e.message,"err");}
  }
  async function updateBookingStatus(id,status){
    const booking=bookings.find(b=>b.id===id);if(!booking)return;
    const updated={...booking,status};
    try{await sb.patch("bookings",id,{data:updated});setBookings(bookings.map(b=>b.id===id?updated:b));}
    catch(e){toast$(e.message,"err");}
  }
  async function delItem(table,id,setter,list,extra){
    try{await sb.del(table,id);setter(list.filter(x=>x.id!==id));if(extra)extra();toast$("Removed","err");}
    catch(e){toast$(e.message,"err");}
  }
  function toggleTag(tag){setInf(p=>({...p,tags:p.tags.includes(tag)?p.tags.filter(t=>t!==tag):[...p.tags,tag]}));}

  const totalNGN=sales.filter(s=>s.payStatus==="Paid"&&!s.refunded).reduce((a,s)=>a+toNGN(s.amount,s.currency),0);
  const goalPct=Math.min((totalNGN/MONTHLY_GOAL)*100,100);
  const overdueLeads=leads.filter(l=>isOverdue(l.followUpDate)&&!["Paid","Lost"].includes(l.status));
  const todayBookings=bookings.filter(b=>b.date===today()&&b.status==="Confirmed");
  const hotLeads=leads.filter(l=>["New Inquiry","Audit Sent","Following Up"].includes(l.status));
  const pendingBookingLeads=leads.filter(l=>l.status==="Session Booked"&&!bookings.find(b=>b.client===l.name&&b.status!=="Cancelled"));
  const taskPeriods=[...new Set(tasks.map(t=>t.period))];
  const filteredIntel=intelFilter==="All"?intel:intel.filter(i=>i.tags&&i.tags.includes(intelFilter));
  const q=search.toLowerCase();

  const statusFiltered=leadStatusFilter==="All"?leads
    :leadStatusFilter==="active"?leads.filter(l=>["New Inquiry","Audit Sent","Following Up"].includes(l.status))
    :leadStatusFilter==="overdue"?leads.filter(l=>isOverdue(l.followUpDate)&&!["Paid","Lost"].includes(l.status))
    :leads.filter(l=>l.status===leadStatusFilter);
  const fLeads=statusFiltered.filter(l=>!q||[l.name,l.phone,l.product,l.notes].some(x=>x&&x.toLowerCase().includes(q)));
  const fSales=sales.filter(s=>!q||s.customer&&s.customer.toLowerCase().includes(q));
  const fCustomers=customers.filter(c=>!q||[c.name,c.phone,c.city].some(x=>x&&x.toLowerCase().includes(q)));
  const fProcurement=procurement.filter(p=>!q||[p.name,p.product,p.notes].some(x=>x&&x.toLowerCase().includes(q)));

  const refundSale=sales.find(s=>s.id===showRefund);

  if(initLoading)return(
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif"}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Nunito:wght@700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}"}</style>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.gold}}>Hafsat Sabir Co...</div>
    </div>
  );
  if(!configured)return <SetupScreen onSave={handleSetup}/>;

  const CSS="@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Nunito:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input,select,textarea{font-family:'Nunito',sans-serif;}input::placeholder,textarea::placeholder{color:"+C.textDim+";}select option{background:#fff;}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-thumb{background:"+C.border+";border-radius:4px;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}@keyframes pop{from{opacity:0;transform:scale(0.97);}to{opacity:1;transform:scale(1);}}.fade{animation:fadeUp 0.3s ease both;}.pop{animation:pop 0.25s ease both;}.row-card{transition:all 0.15s;cursor:pointer;}.row-card:hover{border-color:"+C.goldBorder+" !important;box-shadow:0 2px 14px rgba(160,105,42,0.1);}input:focus,select:focus,textarea:focus{border-color:"+C.goldL+" !important;box-shadow:0 0 0 3px "+C.goldBg+";}.del-btn{background:transparent;border:none;color:"+C.textDim+";font-size:18px;cursor:pointer;padding:0 4px;transition:color 0.15s;line-height:1;}.del-btn:hover{color:"+C.red+";}.qbtn{border:none;border-radius:8px;padding:5px 11px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;transition:all 0.15s;}.qbtn:hover{opacity:0.8;}.tag-chip{display:inline-flex;align-items:center;gap:4px;border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid transparent;transition:all 0.15s;}.kpi-card{cursor:pointer;transition:all 0.2s;}.kpi-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.1);}";

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Nunito',sans-serif",color:C.text}}>
      <style>{CSS}</style>

      {/* Customer datalist for autocomplete */}
      <datalist id="cust-names">{customers.map(c=><option key={c.id} value={c.name}/>)}</datalist>

      {/* Refund Modal */}
      {showRefund&&refundSale&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.card,borderRadius:16,padding:24,maxWidth:380,width:"100%"}} className="pop">
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,marginBottom:4,color:C.text}}>Issue Refund</div>
            <div style={{fontSize:12,color:C.textMuted,marginBottom:16}}>
              For <strong>{refundSale.customer}</strong> — {fmtAmt(refundSale.amount,refundSale.currency)}
            </div>
            <F label="Refund Amount (leave blank = full refund)">
              <Inp type="number" placeholder={""+refundSale.amount} value={refundAmt} onChange={e=>setRefundAmt(e.target.value)}/>
            </F>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={()=>issueRefund(showRefund)} style={{background:C.red,color:"#fff",border:"none",borderRadius:10,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Confirm Refund</button>
              <GhostBtn onClick={()=>{setShowRefund(null);setRefundAmt("");}}>Cancel</GhostBtn>
            </div>
          </div>
        </div>
      )}

      {loading&&<div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,"+C.gold+","+C.goldL+")",zIndex:9999}}/>}
      {toast&&<div style={{position:"fixed",top:16,right:16,background:toast.type==="err"?C.red:C.green,color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}} className="pop">{toast.msg}</div>}

      {/* Header */}
      <div style={{background:C.card,borderBottom:"1px solid "+C.border,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
        <div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:C.gold,letterSpacing:"-0.01em"}}>Hafsat Sabir Co.</div>
          <div style={{fontSize:10,color:C.textMuted,letterSpacing:"0.12em",textTransform:"uppercase"}}>Operations Hub</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {overdueLeads.length>0&&<div onClick={()=>navigateTo("leads","overdue")} style={{background:C.redBg,color:C.red,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{"⚠ "+overdueLeads.length+" overdue"}</div>}
          <div style={{background:C.goldBg,border:"1px solid "+C.goldBorder,borderRadius:20,padding:"4px 14px",fontSize:12,color:C.gold,fontWeight:700}}>{fmtNGN(totalNGN)+" this month"}</div>
          <button onClick={()=>{localStorage.removeItem("sb_url");localStorage.removeItem("sb_key");setConfigured(false);setSb(null);}} style={{background:"transparent",border:"1px solid "+C.border,borderRadius:8,padding:"4px 10px",fontSize:10,color:C.textDim,cursor:"pointer",fontFamily:"inherit"}}>⚙</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:C.card,borderBottom:"1px solid "+C.border,display:"flex",overflowX:"auto",padding:"0 8px"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setSearch("");if(t.id!=="leads")setLeadStatusFilter("All");}} style={{background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid "+C.gold:"2px solid transparent",color:tab===t.id?C.gold:C.textMuted,padding:"11px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.2s",display:"flex",alignItems:"center",gap:5}}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"20px 16px",maxWidth:900,margin:"0 auto"}} className="fade">

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div>
            <div style={{background:"linear-gradient(145deg,#2C1A08,#3D2510)",borderRadius:18,padding:"22px 24px",marginBottom:16,color:"#FAF0E0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:11,color:"rgba(250,240,220,0.5)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Monthly Revenue Goal · July Target</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:"#E8C97A"}}>{fmtNGN(totalNGN)+" "}<span style={{fontSize:14,color:"rgba(250,240,220,0.35)"}}>/ ₦3,000,000</span></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:700,color:"#E8C97A"}}>{goalPct.toFixed(0)+"%"}</div>
                  <div style={{fontSize:10,color:"rgba(250,240,220,0.4)"}}>of target</div>
                </div>
              </div>
              <div style={{background:"rgba(255,255,255,0.1)",borderRadius:100,height:7}}>
                <div style={{width:goalPct+"%",background:"linear-gradient(90deg,"+C.gold+","+C.goldL+")",height:"100%",borderRadius:100,transition:"width 1s ease"}}/>
              </div>
              <div style={{marginTop:8,fontSize:11,color:"rgba(250,240,220,0.4)"}}>
                {fmtNGN(MONTHLY_GOAL-totalNGN)+" remaining · ¥"+Math.round((MONTHLY_GOAL-totalNGN)/210).toLocaleString()+" RMB · $"+Math.round((MONTHLY_GOAL-totalNGN)/1550).toLocaleString()+" USD"}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
              {[
                {label:"Active Leads",value:hotLeads.length,color:C.orange,bg:C.orangeBg,icon:"🔥",action:()=>navigateTo("leads","active")},
                {label:"Paid Clients",value:leads.filter(l=>l.status==="Paid").length,color:C.green,bg:C.greenBg,icon:"💰",action:()=>navigateTo("leads","Paid")},
                {label:"Customers",value:customers.length,color:C.blue,bg:C.blueBg,icon:"👥",action:()=>navigateTo("customers")},
                {label:"Sessions Today",value:todayBookings.length,color:C.purple,bg:C.purpleBg,icon:"📅",action:()=>navigateTo("bookings")},
                {label:"Overdue Followups",value:overdueLeads.length,color:C.red,bg:C.redBg,icon:"⚠",action:()=>navigateTo("leads","overdue")},
                {label:"Procurement",value:procurement.length,color:C.teal,bg:C.tealBg,icon:"📦",action:()=>navigateTo("procurement")},
              ].map((k,i)=>(
                <div key={i} className="kpi-card" onClick={k.action} style={{background:k.bg,border:"1px solid "+C.border,borderRadius:12,padding:"14px 14px",textAlign:"center"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{k.icon}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:k.color}}>{k.value}</div>
                  <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700}}>{k.label}</div>
                  <div style={{fontSize:9,color:k.color,marginTop:3,opacity:0.6}}>tap to view →</div>
                </div>
              ))}
            </div>

            {(overdueLeads.length>0||todayBookings.length>0)&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                {overdueLeads.length>0&&(
                  <Card style={{border:"1px solid "+C.redBorder,background:C.redBg}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>⚠ Follow Up Now</div>
                    {overdueLeads.slice(0,4).map(l=>(
                      <div key={l.id} style={{borderBottom:"1px solid rgba(192,57,43,0.1)",padding:"7px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div><div style={{fontSize:13,fontWeight:700}}>{l.name}</div><div style={{fontSize:11,color:C.red}}>{"Due: "+l.followUpDate}</div></div>
                        <button className="qbtn" onClick={()=>quickLeadStatus(l.id,"Following Up")} style={{background:C.red,color:"#fff"}}>Follow Up</button>
                      </div>
                    ))}
                  </Card>
                )}
                {todayBookings.length>0&&(
                  <Card style={{border:"1px solid "+C.greenBorder,background:C.greenBg}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>📅 Sessions Today</div>
                    {todayBookings.map(b=>(
                      <div key={b.id} style={{borderBottom:"1px solid rgba(45,122,79,0.1)",padding:"7px 0"}}>
                        <div style={{fontSize:13,fontWeight:700}}>{b.client}</div>
                        <div style={{fontSize:11,color:C.green}}>{b.session+" · "+b.time+" · "+b.duration+" mins"}</div>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Card>
                <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Latest Leads</div>
                {leads.slice(0,5).map(l=>(
                  <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid "+C.border}}>
                    <div><div style={{fontSize:13,fontWeight:700}}>{l.name}</div><div style={{fontSize:11,color:C.textMuted}}>{l.product}</div></div>
                    <Badge label={l.status}/>
                  </div>
                ))}
                {leads.length===0&&<div style={{fontSize:12,color:C.textDim,textAlign:"center",padding:16}}>No leads yet</div>}
              </Card>
              <Card>
                <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Recent Sales</div>
                {sales.slice(0,5).map(s=>(
                  <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid "+C.border}}>
                    <div><div style={{fontSize:13,fontWeight:700}}>{s.customer}</div><div style={{fontSize:11,color:C.textMuted}}>{s.product}</div></div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:s.refunded?C.red:C.green}}>{(s.refunded?"↩ ":"")+fmtAmt(s.amount,s.currency)}</div>
                  </div>
                ))}
                {sales.length===0&&<div style={{fontSize:12,color:C.textDim,textAlign:"center",padding:16}}>No sales yet</div>}
              </Card>
            </div>
          </div>
        )}

        {/* LEADS */}
        {tab==="leads"&&(
          <div>
            <SectionHead title="Lead Tracker" sub={leads.length+" total · "+hotLeads.length+" active · "+leads.filter(l=>l.status==="Paid").length+" converted"} action={<GoldBtn onClick={()=>setShowLF(!showLF)}>+ Add Lead</GoldBtn>}/>

            {showLF&&(
              <Card style={{marginBottom:16,border:"1px solid "+C.goldBorder,background:C.goldBg}} className="pop">
                <div style={{fontWeight:800,marginBottom:14,color:C.gold}}>New Lead</div>
                <Row>
                  <F label="Full Name *"><Inp placeholder="Aisha Musa" value={lf.name} onChange={e=>setLf({...lf,name:e.target.value})}/></F>
                  <F label="Phone *"><PhoneRow value={lf.phone} onChange={e=>setLf({...lf,phone:e.target.value})} onPickContact={()=>pickContact(c=>setLf(p=>({...p,name:c.name||p.name,phone:c.phone||p.phone})),toast$)}/></F>
                </Row>
                <Row><F label="Source"><Sel value={lf.source} onChange={e=>setLf({...lf,source:e.target.value})}>{SOURCES.map(s=><option key={s}>{s}</option>)}</Sel></F><F label="Product"><Sel value={lf.product} onChange={e=>setLf({...lf,product:e.target.value})}>{PRODUCTS.map(p=><option key={p}>{p}</option>)}</Sel></F></Row>
                <Row><F label="Status"><Sel value={lf.status} onChange={e=>setLf({...lf,status:e.target.value})}>{LEAD_STATUSES.map(s=><option key={s}>{s}</option>)}</Sel></F><F label="Currency"><Sel value={lf.currency} onChange={e=>setLf({...lf,currency:e.target.value})}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</Sel></F></Row>
                <Row><F label="Amount Paid"><Inp type="number" placeholder="0" value={lf.amount} onChange={e=>setLf({...lf,amount:e.target.value})}/></F><F label="Follow-up Date"><Inp type="date" value={lf.followUpDate} onChange={e=>setLf({...lf,followUpDate:e.target.value})}/></F></Row>
                <F label="Notes"><Txt placeholder="What did they ask? How did they find you?" value={lf.notes} onChange={e=>setLf({...lf,notes:e.target.value})}/></F>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.textMid,cursor:"pointer"}}>
                    <input type="checkbox" checked={lf.auditSent} onChange={e=>setLf({...lf,auditSent:e.target.checked})} style={{width:16,height:16,accentColor:C.gold}}/>Audit PDF Sent
                  </label>
                </div>
                <div style={{display:"flex",gap:10}}><GoldBtn onClick={addLead}>Save Lead</GoldBtn><GhostBtn onClick={()=>setShowLF(false)}>Cancel</GhostBtn></div>
              </Card>
            )}

            <input style={{...INP,marginBottom:12}} placeholder="Search by name, phone, product..." value={search} onChange={e=>setSearch(e.target.value)}/>

            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {["All",...LEAD_STATUSES].map(s=>{
                const count=s==="All"?leads.length:leads.filter(l=>l.status===s).length;
                const active=leadStatusFilter===s;
                const sty=LEAD_STYLE[s];
                return <button key={s} onClick={()=>setLeadStatusFilter(s)} style={{background:active?(sty?sty.bg:C.goldBg):C.bg2,color:active?(sty?sty.color:C.gold):C.textMuted,border:"2px solid "+(active?(sty?sty.color:C.gold):"transparent"),borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{s+" ("+count+")"}</button>;
              })}
            </div>

            {leadStatusFilter!=="All"&&<div style={{fontSize:11,color:C.textMuted,marginBottom:10,fontStyle:"italic"}}>{"Showing: "+leadStatusFilter+" · "}<span style={{color:C.gold,cursor:"pointer"}} onClick={()=>setLeadStatusFilter("All")}>Clear ×</span></div>}

            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {fLeads.map(lead=>{
                const overdue=isOverdue(lead.followUpDate)&&!["Paid","Lost"].includes(lead.status);
                const exp=expandedLead===lead.id;
                const isEditing=editingLead===lead.id;
                const sty=LEAD_STYLE[lead.status]||{};
                return(
                  <div key={lead.id} className="row-card" style={{background:C.card,border:"1px solid "+(overdue?C.red:C.border),borderRadius:14,overflow:"hidden"}}>
                    <div onClick={()=>{if(!isEditing)setExpandedLead(exp?null:lead.id);}} style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:9,height:9,borderRadius:"50%",background:sty.dot||C.textDim,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <span style={{fontWeight:800,fontSize:14}}>{lead.name}</span>
                          <Badge label={lead.status}/>
                          {lead.auditSent&&<span style={{background:C.tealBg,color:C.teal,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>📋 Audit Sent</span>}
                          {overdue&&<span style={{background:C.redBg,color:C.red,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>⚠ Overdue</span>}
                          {lead.status==="Session Booked"&&!bookings.find(b=>b.client===lead.name)&&<span style={{background:C.purpleBg,color:C.purple,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>📅 Needs Booking</span>}
                        </div>
                        <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>{lead.phone+" · "+lead.source+" · "+lead.product}</div>
                        {lead.followUpDate&&<div style={{fontSize:11,color:overdue?C.red:C.textDim,marginTop:1}}>{"Follow up: "+lead.followUpDate}</div>}
                      </div>
                      {lead.amount>0&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:C.green,flexShrink:0}}>{fmtAmt(lead.amount,lead.currency||"₦ NGN")}</div>}
                      <span style={{color:C.textDim,fontSize:14,flexShrink:0}}>{exp?"▲":"▼"}</span>
                    </div>

                    {exp&&!isEditing&&(
                      <div style={{borderTop:"1px solid "+C.border,padding:"14px 16px",background:C.bg}}>
                        {lead.notes&&<div style={{fontSize:13,color:C.textMid,fontStyle:"italic",marginBottom:12}}>{"\""+lead.notes+"\""}</div>}
                        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                          {LEAD_STATUSES.filter(s=>s!==lead.status).map(s=>{
                            const ss=LEAD_STYLE[s]||{};
                            return <button key={s} className="qbtn" onClick={()=>quickLeadStatus(lead.id,s)} style={{background:ss.bg,color:ss.color}}>{"→ "+s}</button>;
                          })}
                          <button className="qbtn" onClick={()=>markAuditSent(lead.id)} style={{background:C.tealBg,color:C.teal}}>✓ Audit Sent</button>
                          {lead.status==="Session Booked"&&(
                            <button className="qbtn" onClick={()=>bookFromLead(lead)} style={{background:C.purple,color:"#fff",fontWeight:800}}>📅 Book Session Now</button>
                          )}
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <button className="qbtn" onClick={()=>{setEditingLead(lead.id);setEditLF({...lead});}} style={{background:C.goldBg,color:C.gold,padding:"6px 14px",fontSize:12}}>✏️ Edit Lead</button>
                          <button className="del-btn" onClick={()=>delItem("leads",lead.id,setLeads,leads,()=>setExpandedLead(null))}>×</button>
                        </div>
                      </div>
                    )}

                    {isEditing&&(
                      <div style={{borderTop:"1px solid "+C.goldBorder,padding:"16px",background:C.goldBg}} className="pop">
                        <div style={{fontWeight:800,marginBottom:12,color:C.gold}}>{"Edit Lead — "+lead.name}</div>
                        <Row>
                          <F label="Full Name *"><Inp value={editLF.name||""} onChange={e=>setEditLF({...editLF,name:e.target.value})}/></F>
                          <F label="Phone *"><PhoneRow value={editLF.phone||""} onChange={e=>setEditLF({...editLF,phone:e.target.value})} onPickContact={()=>pickContact(c=>setEditLF(p=>({...p,name:c.name||p.name,phone:c.phone||p.phone})),toast$)}/></F>
                        </Row>
                        <Row><F label="Source"><Sel value={editLF.source||""} onChange={e=>setEditLF({...editLF,source:e.target.value})}>{SOURCES.map(s=><option key={s}>{s}</option>)}</Sel></F><F label="Product"><Sel value={editLF.product||""} onChange={e=>setEditLF({...editLF,product:e.target.value})}>{PRODUCTS.map(p=><option key={p}>{p}</option>)}</Sel></F></Row>
                        <Row><F label="Status"><Sel value={editLF.status||""} onChange={e=>setEditLF({...editLF,status:e.target.value})}>{LEAD_STATUSES.map(s=><option key={s}>{s}</option>)}</Sel></F><F label="Currency"><Sel value={editLF.currency||"₦ NGN"} onChange={e=>setEditLF({...editLF,currency:e.target.value})}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</Sel></F></Row>
                        <Row><F label="Amount Paid"><Inp type="number" value={editLF.amount||""} onChange={e=>setEditLF({...editLF,amount:e.target.value})}/></F><F label="Follow-up Date"><Inp type="date" value={editLF.followUpDate||""} onChange={e=>setEditLF({...editLF,followUpDate:e.target.value})}/></F></Row>
                        <F label="Notes"><Txt value={editLF.notes||""} onChange={e=>setEditLF({...editLF,notes:e.target.value})}/></F>
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.textMid,cursor:"pointer"}}>
                            <input type="checkbox" checked={editLF.auditSent||false} onChange={e=>setEditLF({...editLF,auditSent:e.target.checked})} style={{width:16,height:16,accentColor:C.gold}}/>Audit PDF Sent
                          </label>
                        </div>
                        <div style={{display:"flex",gap:10}}>
                          <GoldBtn onClick={saveEditLead}>Save Changes</GoldBtn>
                          <GhostBtn onClick={()=>setEditingLead(null)}>Cancel</GhostBtn>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {fLeads.length===0&&<div style={{textAlign:"center",padding:40,color:C.textMuted,fontSize:14}}>No leads found.</div>}
            </div>
          </div>
        )}

        {/* SALES */}
        {tab==="sales"&&(
          <div>
            <SectionHead title="Sales & Delivery"
              sub={fmtNGN(totalNGN)+" confirmed · "+sales.length+" transactions · "+sales.filter(s=>s.refunded).length+" refunded"}
              action={<GoldBtn onClick={()=>setShowSF(!showSF)}>+ Record Sale</GoldBtn>}/>

            {showSF&&(
              <Card style={{marginBottom:16,border:"1px solid "+C.goldBorder,background:C.goldBg}} className="pop">
                <div style={{fontWeight:800,marginBottom:14,color:C.gold}}>New Sale</div>
                <Row>
                  <F label="Customer *"><input style={INP} list="cust-names" placeholder="Start typing name..." value={sf.customer} onChange={e=>setSf({...sf,customer:e.target.value})}/></F>
                  <F label="Product"><Sel value={sf.product} onChange={e=>setSf({...sf,product:e.target.value})}>{PRODUCTS.map(p=><option key={p}>{p}</option>)}</Sel></F>
                </Row>
                <Row>
                  <F label="Amount *"><Inp type="number" placeholder="50000" value={sf.amount} onChange={e=>setSf({...sf,amount:e.target.value})}/></F>
                  <F label="Currency"><Sel value={sf.currency} onChange={e=>setSf({...sf,currency:e.target.value})}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</Sel></F>
                </Row>
                <Row>
                  <F label="Payment Method"><Sel value={sf.payMethod||""} onChange={e=>setSf({...sf,payMethod:e.target.value})}>{PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}</Sel></F>
                  <F label="Payment Reference / Teller No."><Inp placeholder="REF123456" value={sf.payRef||""} onChange={e=>setSf({...sf,payRef:e.target.value})}/></F>
                </Row>
                <Row>
                  <F label="Date"><Inp type="date" value={sf.date} onChange={e=>setSf({...sf,date:e.target.value})}/></F>
                  <F label="Payment Status"><Sel value={sf.payStatus} onChange={e=>setSf({...sf,payStatus:e.target.value})}>{["Paid","Pending","Overdue"].map(s=><option key={s}>{s}</option>)}</Sel></F>
                </Row>
                <F label="Delivery"><Sel value={sf.delivery} onChange={e=>setSf({...sf,delivery:e.target.value})}>{["Delivered","Scheduled","Pending","Not Sent"].map(s=><option key={s}>{s}</option>)}</Sel></F>
                <div style={{display:"flex",gap:10}}><GoldBtn onClick={addSale}>Save Sale</GoldBtn><GhostBtn onClick={()=>setShowSF(false)}>Cancel</GhostBtn></div>
              </Card>
            )}

            <input style={{...INP,marginBottom:12}} placeholder="Search sales..." value={search} onChange={e=>setSearch(e.target.value)}/>

            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {fSales.map(s=>{
                const exp=expandedSale===s.id;
                return(
                  <div key={s.id} style={{background:s.refunded?"#FFF5F5":C.card,border:"1px solid "+(s.refunded?C.redBorder:C.border),borderRadius:12,overflow:"hidden"}}>
                    <div className="row-card" onClick={()=>setExpandedSale(exp?null:s.id)} style={{padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontWeight:700,fontSize:14}}>{s.customer}</span>
                          <Badge label={s.refunded?"Refunded":s.payStatus} bg={s.refunded?C.redBg:s.payStatus==="Paid"?C.greenBg:C.orangeBg} color={s.refunded?C.red:s.payStatus==="Paid"?C.green:C.orange}/>
                          <Badge label={s.delivery} bg={s.delivery==="Delivered"?C.greenBg:C.blueBg} color={s.delivery==="Delivered"?C.green:C.blue}/>
                        </div>
                        <div style={{fontSize:12,color:C.textMuted}}>{s.product+" · "+s.date}</div>
                        {s.payMethod&&<div style={{fontSize:11,color:C.textDim}}>{"💳 "+s.payMethod+(s.payRef?" · Ref: "+s.payRef:"")}</div>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:s.refunded?C.red:C.green}}>{(s.refunded?"↩ ":"")+fmtAmt(s.amount,s.currency)}</div>
                          {s.currency!=="₦ NGN"&&<div style={{fontSize:10,color:C.textMuted}}>{"≈ "+fmtNGN(toNGN(s.amount,s.currency))}</div>}
                          {s.refunded&&<div style={{fontSize:10,color:C.red}}>{"Refunded "+s.refundDate}</div>}
                        </div>
                        <span style={{color:C.textDim,fontSize:12}}>{exp?"▲":"▼"}</span>
                      </div>
                    </div>
                    {exp&&(
                      <div style={{borderTop:"1px solid "+C.border,padding:"12px 16px",background:C.bg,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{fontSize:12,color:C.textMuted,flex:1}}>
                          {s.payMethod&&"💳 "+s.payMethod}
                          {s.payRef&&" · Ref: "+s.payRef}
                          {s.refunded&&" · Refunded: "+fmtAmt(s.refundAmount||s.amount,s.currency)+" on "+s.refundDate}
                        </span>
                        {!s.refunded&&s.payStatus==="Paid"&&(
                          <button className="qbtn" onClick={()=>setShowRefund(s.id)} style={{background:C.redBg,color:C.red}}>↩ Issue Refund</button>
                        )}
                        <button className="del-btn" onClick={()=>delItem("sales",s.id,setSales,sales,()=>setExpandedSale(null))}>×</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {fSales.length===0&&<div style={{textAlign:"center",padding:40,color:C.textMuted,fontSize:14}}>No sales yet.</div>}
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab==="customers"&&(
          <div>
            <SectionHead title="Customer Database" sub={customers.length+" customers"} action={<GoldBtn onClick={()=>setShowCF(!showCF)}>+ Add Customer</GoldBtn>}/>
            {showCF&&(
              <Card style={{marginBottom:16,border:"1px solid "+C.goldBorder,background:C.goldBg}} className="pop">
                <div style={{fontWeight:800,marginBottom:14,color:C.gold}}>New Customer</div>
                <Row>
                  <F label="Full Name *"><Inp placeholder="Hajiya Binta" value={cf.name} onChange={e=>setCf({...cf,name:e.target.value})}/></F>
                  <F label="Phone *"><PhoneRow value={cf.phone} onChange={e=>setCf({...cf,phone:e.target.value})} onPickContact={()=>pickContact(c=>setCf(p=>({...p,name:c.name||p.name,phone:c.phone||p.phone})),toast$)}/></F>
                </Row>
                <Row><F label="City"><Sel value={cf.city} onChange={e=>setCf({...cf,city:e.target.value})}>{CITIES.map(c=><option key={c}>{c}</option>)}</Sel></F><F label="Notes"><Inp placeholder="Any notes..." value={cf.notes} onChange={e=>setCf({...cf,notes:e.target.value})}/></F></Row>
                <div style={{display:"flex",gap:10}}><GoldBtn onClick={addCustomer}>Save</GoldBtn><GhostBtn onClick={()=>setShowCF(false)}>Cancel</GhostBtn></div>
              </Card>
            )}
            <input style={{...INP,marginBottom:12}} placeholder="Search customers..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {fCustomers.map(c=>(
                <div key={c.id} className="row-card" style={{background:C.card,border:"1px solid "+C.border,borderRadius:12,padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>{c.name}</div>
                    <div style={{fontSize:12,color:C.textMuted}}>{c.phone+" · "+c.city}</div>
                    {c.notes&&<div style={{fontSize:11,color:C.textDim,fontStyle:"italic",marginTop:3}}>{"\""+c.notes+"\""}</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:C.gold}}>{fmtNGN(c.totalNGN||0)}</div>
                    <div style={{fontSize:11,color:C.textMuted}}>{(c.purchases||0)+" purchase"+(c.purchases!==1?"s":"")+" · "+(c.lastPurchase||"-")}</div>
                    <button className="del-btn" onClick={()=>delItem("customers",c.id,setCustomers,customers)}>×</button>
                  </div>
                </div>
              ))}
              {fCustomers.length===0&&<div style={{textAlign:"center",padding:40,color:C.textMuted,fontSize:14}}>No customers yet.</div>}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab==="bookings"&&(
          <div>
            <SectionHead title="Session Bookings" sub={bookings.length+" total · "+bookings.filter(b=>b.status==="Confirmed").length+" confirmed"} action={<GoldBtn onClick={()=>setShowBF(!showBF)}>+ Book Session</GoldBtn>}/>

            {pendingBookingLeads.length>0&&(
              <Card style={{marginBottom:16,background:C.purpleBg,border:"1px solid rgba(125,60,152,0.2)"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.purple,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>📋 Leads Awaiting Booking</div>
                {pendingBookingLeads.map(l=>(
                  <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(125,60,152,0.1)"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700}}>{l.name}</div>
                      <div style={{fontSize:11,color:C.purple}}>{l.phone+" · "+l.product}</div>
                    </div>
                    <button className="qbtn" onClick={()=>bookFromLead(l)} style={{background:C.purple,color:"#fff"}}>📅 Book Now</button>
                  </div>
                ))}
              </Card>
            )}

            {showBF&&(
              <Card style={{marginBottom:16,border:"1px solid "+C.goldBorder,background:C.goldBg}} className="pop">
                <div style={{fontWeight:800,marginBottom:14,color:C.gold}}>New Booking</div>
                <Row>
                  <F label="Client Name *"><input style={INP} list="cust-names" placeholder="Start typing name..." value={bf.client} onChange={e=>setBf({...bf,client:e.target.value})}/></F>
                  <F label="Phone"><PhoneRow value={bf.phone} onChange={e=>setBf({...bf,phone:e.target.value})} onPickContact={()=>pickContact(c=>setBf(p=>({...p,client:c.name||p.client,phone:c.phone||p.phone})),toast$)}/></F>
                </Row>
                <F label="Session Type"><Sel value={bf.session} onChange={e=>setBf({...bf,session:e.target.value})}>{SESSION_TYPES.map(s=><option key={s}>{s}</option>)}</Sel></F>
                <Row><F label="Date *"><Inp type="date" value={bf.date} onChange={e=>setBf({...bf,date:e.target.value})}/></F><F label="Time"><Inp type="time" value={bf.time} onChange={e=>setBf({...bf,time:e.target.value})}/></F></Row>
                <Row><F label="Duration (mins)"><Sel value={bf.duration} onChange={e=>setBf({...bf,duration:e.target.value})}>{["30","45","60","90","120"].map(d=><option key={d}>{d}</option>)}</Sel></F><F label="Status"><Sel value={bf.status} onChange={e=>setBf({...bf,status:e.target.value})}>{["Confirmed","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}</Sel></F></Row>
                <F label="Notes"><Txt placeholder="Prep notes, what to discuss..." value={bf.notes} onChange={e=>setBf({...bf,notes:e.target.value})}/></F>
                {bf.date&&bf.time&&bookings.find(b=>b.date===bf.date&&b.time===bf.time&&b.status!=="Cancelled")&&(
                  <div style={{background:C.redBg,border:"1px solid "+C.red,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.red,marginBottom:12,fontWeight:700}}>
                    {"⚠ Time clash with "+bookings.find(b=>b.date===bf.date&&b.time===bf.time).client}
                  </div>
                )}
                <div style={{display:"flex",gap:10}}><GoldBtn onClick={addBooking}>Save Booking</GoldBtn><GhostBtn onClick={()=>setShowBF(false)}>Cancel</GhostBtn></div>
              </Card>
            )}

            {[...new Set(bookings.map(b=>b.date))].sort().map(date=>(
              <div key={date} style={{marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:date===today()?C.gold:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                  {date}{date===today()&&<span style={{background:C.goldBg,color:C.gold,fontSize:10,padding:"2px 8px",borderRadius:10}}>TODAY</span>}
                </div>
                {bookings.filter(b=>b.date===date).sort((a,b2)=>(a.time||"").localeCompare(b2.time||"")).map(b=>(
                  <div key={b.id} className="row-card" style={{background:C.card,border:"1px solid "+C.border,borderRadius:12,padding:"12px 16px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{textAlign:"center",background:C.purpleBg,borderRadius:10,padding:"6px 10px",minWidth:52}}>
                        <div style={{fontWeight:800,fontSize:14,color:C.purple}}>{b.time}</div>
                        <div style={{fontSize:10,color:C.purple}}>{b.duration+"m"}</div>
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{b.client}</div>
                        <div style={{fontSize:12,color:C.textMuted}}>{b.session}</div>
                        {b.notes&&<div style={{fontSize:11,color:C.textDim,fontStyle:"italic"}}>{"\""+b.notes+"\""}</div>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Badge label={b.status} bg={b.status==="Confirmed"?C.greenBg:b.status==="Completed"?C.purpleBg:C.redBg} color={b.status==="Confirmed"?C.green:b.status==="Completed"?C.purple:C.red}/>
                      {b.status==="Confirmed"&&<button className="qbtn" onClick={()=>updateBookingStatus(b.id,"Completed")} style={{background:C.purpleBg,color:C.purple}}>Done ✓</button>}
                      <button className="del-btn" onClick={()=>delItem("bookings",b.id,setBookings,bookings)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {bookings.length===0&&pendingBookingLeads.length===0&&<div style={{textAlign:"center",padding:40,color:C.textMuted,fontSize:14}}>No bookings yet.</div>}
          </div>
        )}

        {/* COHORTS */}
        {tab==="cohorts"&&(
          <div>
            <SectionHead title="Cohort Phases" sub="Bootcamp and Life Sessions tracking" action={<GoldBtn onClick={()=>setShowCoF(!showCoF)}>+ New Cohort</GoldBtn>}/>
            {showCoF&&(
              <Card style={{marginBottom:16,border:"1px solid "+C.goldBorder,background:C.goldBg}} className="pop">
                <div style={{fontWeight:800,marginBottom:14,color:C.gold}}>New Cohort / Phase</div>
                <Row><F label="Program Name *"><Inp placeholder="Organize Your Business Bootcamp" value={cof.name} onChange={e=>setCof({...cof,name:e.target.value})}/></F><F label="Phase"><Sel value={cof.phase} onChange={e=>setCof({...cof,phase:e.target.value})}>{["Phase 1","Phase 2","Phase 3","Phase 4","Phase 5"].map(p=><option key={p}>{p}</option>)}</Sel></F></Row>
                <Row><F label="Status"><Sel value={cof.status} onChange={e=>setCof({...cof,status:e.target.value})}>{["Upcoming","Active","Closed"].map(s=><option key={s}>{s}</option>)}</Sel></F><F label="Currency"><Sel value={cof.currency} onChange={e=>setCof({...cof,currency:e.target.value})}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</Sel></F></Row>
                <Row><F label="Start Date"><Inp type="date" value={cof.startDate} onChange={e=>setCof({...cof,startDate:e.target.value})}/></F><F label="End Date"><Inp type="date" value={cof.endDate} onChange={e=>setCof({...cof,endDate:e.target.value})}/></F></Row>
                <Row><F label="Price Per Seat"><Inp type="number" placeholder="35000" value={cof.pricePerSeat} onChange={e=>setCof({...cof,pricePerSeat:e.target.value})}/></F><F label="Target Seats"><Inp type="number" placeholder="20" value={cof.targetEnrollment} onChange={e=>setCof({...cof,targetEnrollment:e.target.value})}/></F></Row>
                <Row><F label="Target Revenue"><Inp type="number" placeholder="700000" value={cof.targetRevenue} onChange={e=>setCof({...cof,targetRevenue:e.target.value})}/></F><F label="Currently Enrolled"><Inp type="number" placeholder="0" value={cof.enrolled} onChange={e=>setCof({...cof,enrolled:e.target.value})}/></F></Row>
                <F label="Notes"><Inp placeholder="WhatsApp-based, daily tasks..." value={cof.notes} onChange={e=>setCof({...cof,notes:e.target.value})}/></F>
                <div style={{display:"flex",gap:10}}><GoldBtn onClick={addCohort}>Save Cohort</GoldBtn><GhostBtn onClick={()=>setShowCoF(false)}>Cancel</GhostBtn></div>
              </Card>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {cohorts.map(co=>{
                const ep=co.targetEnrollment?Math.min((co.enrolled/co.targetEnrollment)*100,100):0;
                const rp=co.targetRevenue?Math.min(((co.revenue||0)/co.targetRevenue)*100,100):0;
                return(
                  <Card key={co.id}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                      <div>
                        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,marginBottom:6}}>{co.name}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <Badge label={co.phase} bg={C.goldBg} color={C.gold}/>
                          <Badge label={co.status} bg={co.status==="Active"?C.greenBg:co.status==="Upcoming"?C.blueBg:"#F5F5F5"} color={co.status==="Active"?C.green:co.status==="Upcoming"?C.blue:"#999"}/>
                        </div>
                        <div style={{fontSize:11,color:C.textMuted,marginTop:6}}>{co.startDate+" → "+(co.endDate||"TBD")+" · "+co.currency}</div>
                      </div>
                      <button className="del-btn" onClick={()=>delItem("cohorts",co.id,setCohorts,cohorts)}>×</button>
                    </div>
                    <div style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textMid,marginBottom:4}}><span>{"Enrollment: "+co.enrolled+" / "+(co.targetEnrollment||"?")}</span><span style={{color:C.gold,fontWeight:700}}>{ep.toFixed(0)+"%"}</span></div>
                      <div style={{background:C.bg2,borderRadius:100,height:7}}><div style={{width:ep+"%",background:"linear-gradient(90deg,"+C.gold+","+C.goldL+")",height:"100%",borderRadius:100}}/></div>
                    </div>
                    <div style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textMid,marginBottom:4}}><span>{"Revenue: "+fmtAmt(co.revenue||0,co.currency)+" / "+(co.targetRevenue?fmtAmt(co.targetRevenue,co.currency):"?")}</span><span style={{color:C.green,fontWeight:700}}>{rp.toFixed(0)+"%"}</span></div>
                      <div style={{background:C.bg2,borderRadius:100,height:7}}><div style={{width:rp+"%",background:"linear-gradient(90deg,"+C.green+",#52D68A)",height:"100%",borderRadius:100}}/></div>
                    </div>
                    <div style={{fontSize:12,color:C.textMuted,display:"flex",gap:16,flexWrap:"wrap"}}>
                      <span>{"Price/seat: "+(co.pricePerSeat?fmtAmt(co.pricePerSeat,co.currency):"—")}</span>
                      <span>{"Projected: "+fmtAmt((co.enrolled||0)*(co.pricePerSeat||0),co.currency)}</span>
                      {co.notes&&<span style={{fontStyle:"italic"}}>{"· "+co.notes}</span>}
                    </div>
                  </Card>
                );
              })}
              {cohorts.length===0&&<div style={{textAlign:"center",padding:40,color:C.textMuted,fontSize:14}}>No cohorts yet.</div>}
            </div>
          </div>
        )}

        {/* INTEL */}
        {tab==="intel"&&(
          <div>
            <SectionHead title="Client Intelligence" sub="Session notes · pain points · market research" action={<GoldBtn onClick={()=>setShowIF(!showIF)}>+ New Session Note</GoldBtn>}/>
            <Card style={{marginBottom:16,background:C.goldBg,border:"1px solid "+C.goldBorder}}>
              <div style={{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🧠 Top Pain Points</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[...new Set(intel.flatMap(i=>i.tags||[]))].map(tag=>{
                  const count=intel.filter(i=>i.tags&&i.tags.includes(tag)).length;
                  return <span key={tag} style={{background:C.card,border:"1px solid "+C.goldBorder,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,color:C.gold,cursor:"pointer"}} onClick={()=>setIntelFilter(intelFilter===tag?"All":tag)}>{tag+" ×"+count}</span>;
                })}
                {intelFilter!=="All"&&<span style={{background:C.redBg,color:C.red,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>setIntelFilter("All")}>× Clear</span>}
              </div>
              <div style={{marginTop:10,fontSize:12,color:C.textMuted,fontStyle:"italic"}}>💡 Most repeated problems = highest demand = next product idea.</div>
            </Card>
            {showIF&&(
              <Card style={{marginBottom:16,border:"1px solid "+C.goldBorder,background:C.goldBg}} className="pop">
                <div style={{fontWeight:800,marginBottom:14,color:C.gold}}>New Session Notes</div>
                <Row>
                  <F label="Client Name *"><input style={INP} list="cust-names" placeholder="Start typing name..." value={inf.client} onChange={e=>setInf({...inf,client:e.target.value})}/></F>
                  <F label="Date"><Inp type="date" value={inf.date} onChange={e=>setInf({...inf,date:e.target.value})}/></F>
                </Row>
                <F label="Session Type"><Sel value={inf.session} onChange={e=>setInf({...inf,session:e.target.value})}>{SESSION_TYPES.map(s=><option key={s}>{s}</option>)}</Sel></F>
                <F label="Raw Notes"><Txt placeholder="Write freely — what did she share?" value={inf.notes} onChange={e=>setInf({...inf,notes:e.target.value})} style={{minHeight:120}}/></F>
                <F label="Your Summary"><Txt placeholder="What is the real root problem?" value={inf.summary} onChange={e=>setInf({...inf,summary:e.target.value})}/></F>
                <F label="Action Items"><Txt placeholder="1. Do this. 2. Try this." value={inf.actions} onChange={e=>setInf({...inf,actions:e.target.value})}/></F>
                <F label="Pain Point Tags">
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                    {PAIN_TAGS.map(tag=>{const sel=inf.tags.includes(tag);return <span key={tag} className="tag-chip" onClick={()=>toggleTag(tag)} style={{background:sel?C.goldBg:"#F5F0EA",color:sel?C.gold:C.textMuted,border:"1px solid "+(sel?C.goldBorder:C.border)}}>{(sel?"✓ ":"")+tag}</span>;})}
                  </div>
                </F>
                <div style={{display:"flex",gap:10,marginTop:8}}><GoldBtn onClick={addIntel}>Save Notes</GoldBtn><GhostBtn onClick={()=>setShowIF(false)}>Cancel</GhostBtn></div>
              </Card>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filteredIntel.map(i=>{
                const exp=expandedIntel===i.id;
                return(
                  <div key={i.id} className="row-card" style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,overflow:"hidden"}}>
                    <div onClick={()=>setExpandedIntel(exp?null:i.id)} style={{padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>{i.client}</div>
                        <div style={{fontSize:12,color:C.textMuted,marginBottom:6}}>{i.session+" · "+i.date}</div>
                        {i.summary&&<div style={{fontSize:13,color:C.textMid,fontStyle:"italic"}}>{"\""+i.summary+"\""}</div>}
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{(i.tags||[]).map(tag=><span key={tag} style={{background:C.goldBg,color:C.gold,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{tag}</span>)}</div>
                      </div>
                      <span style={{color:C.textDim,fontSize:14,flexShrink:0,marginLeft:12}}>{exp?"▲":"▼"}</span>
                    </div>
                    {exp&&(
                      <div style={{borderTop:"1px solid "+C.border,padding:"14px 16px",background:C.bg}}>
                        {i.notes&&<div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Session Notes</div><div style={{fontSize:13,color:C.textMid,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{i.notes}</div></div>}
                        {i.actions&&<div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Action Items</div><div style={{fontSize:13,color:C.textMid,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{i.actions}</div></div>}
                        <button className="del-btn" onClick={()=>delItem("intel",i.id,setIntel,intel,()=>setExpandedIntel(null))}>× Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredIntel.length===0&&<div style={{textAlign:"center",padding:40,color:C.textMuted,fontSize:14}}>No session notes yet.</div>}
            </div>
          </div>
        )}

        {/* PROCUREMENT */}
        {tab==="procurement"&&(
          <div>
            <SectionHead title="Procurement Inquiries" sub={procurement.length+" inquiries · China sourcing demand"} action={<GoldBtn onClick={()=>setShowPF(!showPF)}>+ New Inquiry</GoldBtn>}/>
            <Card style={{marginBottom:16,background:"linear-gradient(135deg,#EAF4FB,#F0F8FF)",border:"1px solid rgba(36,113,163,0.2)"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>📦 Market Signal</div>
              <div style={{fontSize:13,color:C.textMid,lineHeight:1.7}}>China imports to Nigeria surged <strong>37%</strong> in 2025. Track every inquiry here — high demand = your next procurement offering.</div>
            </Card>
            {showPF&&(
              <Card style={{marginBottom:16,border:"1px solid "+C.goldBorder,background:C.goldBg}} className="pop">
                <div style={{fontWeight:800,marginBottom:14,color:C.gold}}>New Procurement Inquiry</div>
                <Row>
                  <F label="Client Name *"><Inp placeholder="Maryam Garba" value={pf.name} onChange={e=>setPf({...pf,name:e.target.value})}/></F>
                  <F label="Phone"><PhoneRow value={pf.phone} onChange={e=>setPf({...pf,phone:e.target.value})} onPickContact={()=>pickContact(c=>setPf(p=>({...p,name:c.name||p.name,phone:c.phone||p.phone})),toast$)}/></F>
                </Row>
                <Row><F label="Product / Category *"><Inp placeholder="Kitchen appliances, fabric..." value={pf.product} onChange={e=>setPf({...pf,product:e.target.value})}/></F><F label="Quantity"><Inp placeholder="50 units" value={pf.qty} onChange={e=>setPf({...pf,qty:e.target.value})}/></F></Row>
                <Row><F label="Budget"><Inp placeholder="500,000" value={pf.budget} onChange={e=>setPf({...pf,budget:e.target.value})}/></F><F label="Currency"><Sel value={pf.currency} onChange={e=>setPf({...pf,currency:e.target.value})}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</Sel></F></Row>
                <Row><F label="Timeline"><Inp placeholder="Before June" value={pf.timeline} onChange={e=>setPf({...pf,timeline:e.target.value})}/></F><F label="Status"><Sel value={pf.status} onChange={e=>setPf({...pf,status:e.target.value})}>{["Inquiry","Quoted","In Progress","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}</Sel></F></Row>
                <F label="Notes"><Txt placeholder="Concerns, supplier needs..." value={pf.notes} onChange={e=>setPf({...pf,notes:e.target.value})}/></F>
                <div style={{display:"flex",gap:10}}><GoldBtn onClick={addProcurement}>Save Inquiry</GoldBtn><GhostBtn onClick={()=>setShowPF(false)}>Cancel</GhostBtn></div>
              </Card>
            )}
            <input style={{...INP,marginBottom:12}} placeholder="Search inquiries..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {procurement.length>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Most Requested</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[...new Set(procurement.map(p=>p.product))].map(prod=>{
                    const count=procurement.filter(p=>p.product===prod).length;
                    return <span key={prod} style={{background:C.tealBg,color:C.teal,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700}}>{prod+" ×"+count}</span>;
                  })}
                </div>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {fProcurement.map(p=>(
                <div key={p.id} className="row-card" style={{background:C.card,border:"1px solid "+C.border,borderRadius:12,padding:"13px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div><div style={{fontWeight:700,fontSize:14}}>{p.name}</div><div style={{fontSize:12,color:C.textMuted}}>{p.phone+" · "+p.date}</div></div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Badge label={p.status} bg={p.status==="Completed"?C.greenBg:p.status==="In Progress"?C.purpleBg:p.status==="Cancelled"?C.redBg:C.goldBg} color={p.status==="Completed"?C.green:p.status==="In Progress"?C.purple:p.status==="Cancelled"?C.red:C.gold}/>
                      <button className="del-btn" onClick={()=>delItem("procurement",p.id,setProcurement,procurement)}>×</button>
                    </div>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:4}}>{"📦 "+p.product}</div>
                  <div style={{display:"flex",gap:16,fontSize:12,color:C.textMuted,flexWrap:"wrap"}}>
                    {p.qty&&<span>{"Qty: "+p.qty}</span>}
                    {p.budget&&<span>{"Budget: "+p.budget+" "+p.currency}</span>}
                    {p.timeline&&<span>{"Timeline: "+p.timeline}</span>}
                  </div>
                  {p.notes&&<div style={{fontSize:12,color:C.textDim,fontStyle:"italic",marginTop:6}}>{"\""+p.notes+"\""}</div>}
                </div>
              ))}
              {fProcurement.length===0&&<div style={{textAlign:"center",padding:40,color:C.textMuted,fontSize:14}}>No inquiries yet.</div>}
            </div>
          </div>
        )}

        {/* GOALS */}
        {tab==="tasks"&&(
          <div>
            <SectionHead title="Goals & Roadmap" sub="Monthly · Quarterly · Yearly path to ₦3M/month"/>
            <Card style={{marginBottom:16,background:C.goldBg,border:"1px solid "+C.goldBorder}}>
              <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
                {[
                  {label:"Total",value:tasks.length,color:C.text},
                  {label:"Done",value:tasks.filter(t=>t.done).length,color:C.green},
                  {label:"Remaining",value:tasks.filter(t=>!t.done).length,color:C.gold},
                  {label:"High Priority Left",value:tasks.filter(t=>t.priority==="High"&&!t.done).length,color:C.red},
                ].map((s,i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.label}</div>
                  </div>
                ))}
                {tasks.length>0&&<div style={{flex:1,minWidth:140}}>
                  <div style={{fontSize:11,color:C.textMuted,marginBottom:5}}>Overall Progress</div>
                  <div style={{background:"rgba(160,105,42,0.15)",borderRadius:100,height:8}}>
                    <div style={{width:((tasks.filter(t=>t.done).length/tasks.length)*100)+"%",background:"linear-gradient(90deg,"+C.gold+","+C.goldL+")",height:"100%",borderRadius:100,transition:"width 0.8s ease"}}/>
                  </div>
                </div>}
              </div>
            </Card>
            {taskPeriods.map(period=>(
              <div key={period} style={{marginBottom:20}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:C.gold,marginBottom:10,paddingBottom:6,borderBottom:"2px solid "+C.goldBorder}}>{period}</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {tasks.filter(t=>t.period===period).map(t=>(
                    <div key={t.id} onClick={()=>toggleTask(t.id)} style={{background:t.done?C.greenBg:C.card,border:"1px solid "+(t.done?"#B8E0C8":C.border),borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all 0.2s",opacity:t.done?0.72:1}}>
                      <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(t.done?C.green:C.border),background:t.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                        {t.done&&<span style={{color:"#fff",fontSize:11,fontWeight:900}}>✓</span>}
                      </div>
                      <div style={{flex:1,fontSize:14,fontWeight:600,color:t.done?C.green:C.text,textDecoration:t.done?"line-through":"none"}}>{t.goal}</div>
                      <span style={{background:t.priority==="High"?C.redBg:C.goldBg,color:t.priority==="High"?C.red:C.gold,borderRadius:6,padding:"2px 9px",fontSize:10,fontWeight:700,flexShrink:0}}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
