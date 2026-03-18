import { useState, useMemo } from "react";

type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
const ALL_DAYS: DayOfWeek[] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAY_VN: Record<DayOfWeek,string> = {Mon:"T2",Tue:"T3",Wed:"T4",Thu:"T5",Fri:"T6",Sat:"T7",Sun:"CN"};

interface Service { id:string; name:string; price:number; duration:number }
interface Staff { id:string; name:string; maxPerDay:number; days:DayOfWeek[]; start:string; end:string; svcIds:string[] }
type Status = "Chờ duyệt"|"Xác nhận"|"Hoàn thành"|"Hủy"
interface Appt { id:string; name:string; phone:string; staffId:string; svcId:string; date:string; time:string; status:Status }
interface Rating { id:string; apptId:string; staffId:string; stars:number; comment:string; reply:string }

const uid = () => Math.random().toString(36).slice(2,8);
const vnd = (n:number) => n.toLocaleString("vi-VN")+"đ";
const DOW = (d:string):DayOfWeek => (["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as DayOfWeek[])[new Date(d).getDay()];

const S0: Service[] = [
  {id:"s1",name:"Cắt tóc",price:80000,duration:30},
  {id:"s2",name:"Gội đầu",price:120000,duration:45},
  {id:"s3",name:"Spa mặt",price:200000,duration:60},
  {id:"s4",name:"Nhuộm tóc",price:400000,duration:120},
];
const E0: Staff[] = [
  {id:"e1",name:"Nguyễn Văn An",maxPerDay:8,days:["Mon","Tue","Wed","Thu","Fri"],start:"09:00",end:"17:00",svcIds:["s1","s2"]},
  {id:"e2",name:"Trần Thị Bích",maxPerDay:6,days:["Tue","Wed","Thu","Fri","Sat"],start:"10:00",end:"18:00",svcIds:["s3","s4"]},
];
const A0: Appt[] = [
  {id:"a1",name:"Khách A",phone:"0901234567",staffId:"e1",svcId:"s1",date:"2026-03-18",time:"09:00",status:"Hoàn thành"},
  {id:"a2",name:"Khách B",phone:"0912345678",staffId:"e2",svcId:"s3",date:"2026-03-18",time:"10:00",status:"Xác nhận"},
  {id:"a3",name:"Khách C",phone:"0923456789",staffId:"e1",svcId:"s2",date:"2026-03-20",time:"14:00",status:"Chờ duyệt"},
];
const R0: Rating[] = [
  {id:"r1",apptId:"a1",staffId:"e1",stars:5,comment:"Rất hài lòng!",reply:"Cảm ơn bạn!"},
];

const STATUS_LIST: Status[] = ["Chờ duyệt","Xác nhận","Hoàn thành","Hủy"];

export default function App() {
  const [tab, setTab] = useState<"appt"|"staff"|"svc"|"rating"|"stats">("appt");
  const [svcs, setSvcs] = useState<Service[]>(S0);
  const [staff, setStaff] = useState<Staff[]>(E0);
  const [appts, setAppts] = useState<Appt[]>(A0);
  const [ratings, setRatings] = useState<Rating[]>(R0);

  const [fDate,setFDate] = useState(""); const [fStatus,setFStatus] = useState<Status|"">("");  const [fStaff,setFStaff] = useState("");
  const [showAF,setShowAF] = useState(false);
  const [aName,setAName] = useState(""); const [aPhone,setAPhone] = useState("");
  const [aStaff,setAStaff] = useState(""); const [aSvc,setASvc] = useState("");
  const [aDate,setADate] = useState(""); const [aTime,setATime] = useState(""); const [aErr,setAErr] = useState("");
  const [showSF,setShowSF] = useState(false); const [editE,setEditE] = useState<Staff|null>(null);
  const [eName,setEName] = useState(""); const [eMax,setEMax] = useState(8);
  const [eDays,setEDays] = useState<DayOfWeek[]>(["Mon","Tue","Wed","Thu","Fri"]);
  const [eStart,setEStart] = useState("09:00"); const [eEnd,setEEnd] = useState("17:00"); const [eSvcs,setESvcs] = useState<string[]>([]);
  const [showVF,setShowVF] = useState(false); const [editV,setEditV] = useState<Service|null>(null);
  const [vName,setVName] = useState(""); const [vPrice,setVPrice] = useState(0); const [vDur,setVDur] = useState(30);
  const [showRM,setShowRM] = useState(false); const [rAppt,setRAppt] = useState("");
  const [rStars,setRStars] = useState(5); const [rCmt,setRCmt] = useState("");
  const [showRP,setShowRP] = useState(false); const [rpId,setRpId] = useState(""); const [rpText,setRpText] = useState("");
  const [sMonth,setSMonth] = useState("2026-03");

  function bookAppt() {
    setAErr("");
    if (!aName||!aPhone||!aStaff||!aSvc||!aDate||!aTime) { setAErr("Điền đủ thông tin."); return; }
    const e = staff.find(s=>s.id===aStaff)!;
    const dow = DOW(aDate);
    if (!e.days.includes(dow)) { setAErr("Nhân viên không làm ngày này."); return; }
    if (aTime<e.start||aTime>=e.end) { setAErr(`Ngoài giờ làm (${e.start}–${e.end}).`); return; }
    if (appts.find(a=>a.staffId===aStaff&&a.date===aDate&&a.time===aTime&&a.status!=="Hủy")) { setAErr("Trùng lịch."); return; }
    if (appts.filter(a=>a.staffId===aStaff&&a.date===aDate&&a.status!=="Hủy").length>=e.maxPerDay) { setAErr("Nhân viên đã đủ khách hôm đó."); return; }
    setAppts(p=>[...p,{id:uid(),name:aName,phone:aPhone,staffId:aStaff,svcId:aSvc,date:aDate,time:aTime,status:"Chờ duyệt"}]);
    setShowAF(false); setAName("");setAPhone("");setAStaff("");setASvc("");setADate("");setATime("");
  }

  function openAddE() { setEditE(null);setEName("");setEMax(8);setEDays(["Mon","Tue","Wed","Thu","Fri"]);setEStart("09:00");setEEnd("17:00");setESvcs([]);setShowSF(true); }
  function openEditE(e:Staff) { setEditE(e);setEName(e.name);setEMax(e.maxPerDay);setEDays(e.days);setEStart(e.start);setEEnd(e.end);setESvcs(e.svcIds);setShowSF(true); }
  function saveE() {
    if (!eName.trim()) return;
    const data = {name:eName,maxPerDay:eMax,days:eDays,start:eStart,end:eEnd,svcIds:eSvcs};
    editE ? setStaff(p=>p.map(s=>s.id===editE.id?{...s,...data}:s)) : setStaff(p=>[...p,{id:uid(),...data}]);
    setShowSF(false);
  }

  function openAddV() { setEditV(null);setVName("");setVPrice(0);setVDur(30);setShowVF(true); }
  function openEditV(v:Service) { setEditV(v);setVName(v.name);setVPrice(v.price);setVDur(v.duration);setShowVF(true); }
  function saveV() {
    if (!vName.trim()) return;
    const data = {name:vName,price:vPrice,duration:vDur};
    editV ? setSvcs(p=>p.map(s=>s.id===editV.id?{...s,...data}:s)) : setSvcs(p=>[...p,{id:uid(),...data}]);
    setShowVF(false);
  }

  function submitR() {
    if (ratings.find(r=>r.apptId===rAppt)) { alert("Đã đánh giá rồi."); return; }
    const a = appts.find(x=>x.id===rAppt)!;
    setRatings(p=>[...p,{id:uid(),apptId:rAppt,staffId:a.staffId,stars:rStars,comment:rCmt,reply:""}]);
    setShowRM(false);setRStars(5);setRCmt("");
  }
  function submitRP() {
    setRatings(p=>p.map(r=>r.id===rpId?{...r,reply:rpText}:r));
    setShowRP(false);setRpText("");
  }

  const filtAppts = useMemo(()=>appts.filter(a=>{
    if (fDate&&a.date!==fDate) return false;
    if (fStatus&&a.status!==fStatus) return false;
    if (fStaff&&a.staffId!==fStaff) return false;
    return true;
  }).sort((a,b)=>b.date+b.time>a.date+a.time?1:-1),[appts,fDate,fStatus,fStaff]);

  const sAppts = useMemo(()=>appts.filter(a=>a.date.startsWith(sMonth)),[appts,sMonth]);
  const totalRev = useMemo(()=>sAppts.filter(a=>a.status==="Hoàn thành").reduce((s,a)=>s+(svcs.find(v=>v.id===a.svcId)?.price||0),0),[sAppts,svcs]);

  const inp: React.CSSProperties = {padding:"6px 10px",border:"1px solid #ccc",borderRadius:4,fontSize:13,width:"100%",boxSizing:"border-box"};
  const btn = (danger?:boolean): React.CSSProperties => ({padding:"5px 12px",border:"1px solid #bbb",borderRadius:4,background:danger?"#fff0f0":"#fff",cursor:"pointer",fontSize:13});
  const pBtn: React.CSSProperties = {padding:"6px 14px",border:"none",borderRadius:4,background:"#222",color:"#fff",cursor:"pointer",fontSize:13};
  const ov: React.CSSProperties = {position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10};
  const md: React.CSSProperties = {background:"#fff",padding:20,borderRadius:6,width:"90%",maxWidth:420,maxHeight:"90vh",overflowY:"auto"};
  const th: React.CSSProperties = {textAlign:"left",padding:"7px 10px",borderBottom:"2px solid #eee",fontSize:12,color:"#666",whiteSpace:"nowrap"};
  const td: React.CSSProperties = {padding:"8px 10px",borderBottom:"1px solid #f0f0f0",fontSize:13,verticalAlign:"top"};
  const fr: React.CSSProperties = {marginBottom:11};
  const lb: React.CSSProperties = {display:"block",fontSize:12,marginBottom:3,color:"#555"};
  const row: React.CSSProperties = {display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"};

  return (
    <div style={{fontFamily:"sans-serif",fontSize:14,color:"#222",minHeight:"100vh",background:"#f5f5f5"}}>
      <div style={{background:"#222",color:"#fff",padding:"10px 20px",fontWeight:700}}>Quản Lý Lịch Hẹn</div>

      <div style={{display:"flex",borderBottom:"1px solid #ddd",background:"#fff",paddingLeft:12}}>
        {([["appt","Lịch hẹn"],["staff","Nhân viên"],["svc","Dịch vụ"],["rating","Đánh giá"],["stats","Thống kê"]] as [typeof tab,string][]).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"9px 14px",border:"none",background:"none",cursor:"pointer",fontWeight:tab===k?700:400,borderBottom:tab===k?"2px solid #222":"2px solid transparent",fontSize:13,color:tab===k?"#222":"#666"}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{padding:16,maxWidth:960,margin:"0 auto"}}>

        {}
        {tab==="appt"&&<>
          <div style={{...row,justifyContent:"space-between",marginBottom:10}}>
            <b>Danh sách lịch hẹn</b>
            <button style={pBtn} onClick={()=>setShowAF(true)}>+ Đặt lịch</button>
          </div>
          <div style={{...row,marginBottom:10,background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,padding:10}}>
            <div><label style={lb}>Ngày</label><input type="date" style={{...inp,width:140}} value={fDate} onChange={e=>setFDate(e.target.value)}/></div>
            <div><label style={lb}>Trạng thái</label>
              <select style={{...inp,width:130}} value={fStatus} onChange={e=>setFStatus(e.target.value as any)}>
                <option value="">Tất cả</option>
                {STATUS_LIST.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={lb}>Nhân viên</label>
              <select style={{...inp,width:150}} value={fStaff} onChange={e=>setFStaff(e.target.value)}>
                <option value="">Tất cả</option>
                {staff.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button style={{...btn(),marginTop:16}} onClick={()=>{setFDate("");setFStatus("");setFStaff("");}}>Xóa lọc</button>
          </div>
          <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Khách","Ngày / Giờ","Nhân viên","Dịch vụ","Trạng thái",""].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtAppts.length===0&&<tr><td colSpan={6} style={{...td,textAlign:"center",color:"#aaa",padding:24}}>Không có dữ liệu</td></tr>}
                {filtAppts.map(a=>{
                  const e=staff.find(s=>s.id===a.staffId); const v=svcs.find(s=>s.id===a.svcId);
                  const rated=ratings.find(r=>r.apptId===a.id);
                  return <tr key={a.id}>
                    <td style={td}><div style={{fontWeight:600}}>{a.name}</div><div style={{color:"#999",fontSize:12}}>{a.phone}</div></td>
                    <td style={td}>{a.date} {a.time}</td>
                    <td style={td}>{e?.name||"—"}</td>
                    <td style={td}>{v?.name||"—"}{v&&<div style={{color:"#999",fontSize:12}}>{vnd(v.price)}</div>}</td>
                    <td style={td}>
                      <select value={a.status} style={{...inp,width:"auto",padding:"3px 6px"}} onChange={ev=>setAppts(p=>p.map(x=>x.id===a.id?{...x,status:ev.target.value as Status}:x))}>
                        {STATUS_LIST.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={td}>
                      {a.status==="Hoàn thành"&&!rated&&<button style={btn()} onClick={()=>{setRAppt(a.id);setShowRM(true);}}>Đánh giá</button>}
                      {rated&&<span style={{color:"green",fontSize:12}}>✓ Đã đánh giá</span>}
                    </td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </>}

        {}
        {tab==="staff"&&<>
          <div style={{...row,justifyContent:"space-between",marginBottom:10}}><b>Nhân viên</b><button style={pBtn} onClick={openAddE}>+ Thêm</button></div>
          <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Tên","Giờ làm","Ngày làm","Tối đa/ngày","Dịch vụ",""].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {staff.map(e=><tr key={e.id}>
                  <td style={td}><b>{e.name}</b></td>
                  <td style={td}>{e.start}–{e.end}</td>
                  <td style={td}>{e.days.map(d=>DAY_VN[d]).join(", ")}</td>
                  <td style={td}>{e.maxPerDay}</td>
                  <td style={td}>{e.svcIds.map(id=>svcs.find(v=>v.id===id)?.name).filter(Boolean).join(", ")||"—"}</td>
                  <td style={td}><div style={row}>
                    <button style={btn()} onClick={()=>openEditE(e)}>Sửa</button>
                    <button style={btn(true)} onClick={()=>{if(confirm("Xóa?"))setStaff(p=>p.filter(s=>s.id!==e.id));}}>Xóa</button>
                  </div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </>}

        {/* DỊCH VỤ */}
        {tab==="svc"&&<>
          <div style={{...row,justifyContent:"space-between",marginBottom:10}}><b>Dịch vụ</b><button style={pBtn} onClick={openAddV}>+ Thêm</button></div>
          <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Tên dịch vụ","Giá","Thời gian",""].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {svcs.map(v=><tr key={v.id}>
                  <td style={td}>{v.name}</td>
                  <td style={td}>{vnd(v.price)}</td>
                  <td style={td}>{v.duration} phút</td>
                  <td style={td}><div style={row}>
                    <button style={btn()} onClick={()=>openEditV(v)}>Sửa</button>
                    <button style={btn(true)} onClick={()=>{if(confirm("Xóa?"))setSvcs(p=>p.filter(s=>s.id!==v.id));}}>Xóa</button>
                  </div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </>}

        {}
        {tab==="rating"&&<>
          <b style={{display:"block",marginBottom:12}}>Đánh giá</b>
          <div style={{...row,marginBottom:14}}>
            {staff.map(e=>{
              const rs=ratings.filter(r=>r.staffId===e.id);
              const avg=rs.length?(rs.reduce((s,r)=>s+r.stars,0)/rs.length).toFixed(1):null;
              return <div key={e.id} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,padding:"10px 16px"}}>
                <b>{e.name}</b><div style={{fontSize:13}}>{avg?`⭐ ${avg} (${rs.length} đánh giá)`:"Chưa có đánh giá"}</div>
              </div>;
            })}
          </div>
          {ratings.length===0&&<p style={{color:"#aaa"}}>Chưa có đánh giá.</p>}
          {ratings.map(r=>{
            const a=appts.find(x=>x.id===r.apptId); const e=staff.find(s=>s.id===r.staffId); const v=a?svcs.find(s=>s.id===a.svcId):null;
            return <div key={r.id} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,padding:12,marginBottom:8}}>
              <div style={{...row,marginBottom:4}}>
                <b>{a?.name}</b><span style={{color:"#888",fontSize:12}}>{e?.name} · {v?.name}</span>
                <span style={{color:"#f59e0b"}}>{"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}</span>
              </div>
              {r.comment&&<p style={{margin:"4px 0",color:"#444",fontSize:13}}>{r.comment}</p>}
              {r.reply
                ?<p style={{margin:"4px 0",fontSize:13,borderLeft:"3px solid #ccc",paddingLeft:8,color:"#555"}}><b>Phản hồi:</b> {r.reply}</p>
                :<button style={btn()} onClick={()=>{setRpId(r.id);setRpText("");setShowRP(true);}}>Phản hồi</button>}
            </div>;
          })}
        </>}

        {/* THỐNG KÊ */}
        {tab==="stats"&&<>
          <div style={{...row,justifyContent:"space-between",marginBottom:12}}>
            <b>Thống kê</b>
            <input type="month" style={{...inp,width:150}} value={sMonth} onChange={e=>setSMonth(e.target.value)}/>
          </div>
          <div style={{...row,marginBottom:14}}>
            {([["Tổng lịch hẹn",sAppts.length],["Hoàn thành",sAppts.filter(a=>a.status==="Hoàn thành").length],["Doanh thu",vnd(totalRev)]] as [string,string|number][]).map(([l,v])=>(
              <div key={l} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,padding:"10px 20px",flex:1,minWidth:120}}>
                <div style={{fontSize:12,color:"#666"}}>{l}</div><div style={{fontSize:20,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,padding:12}}>
              <b style={{display:"block",marginBottom:8}}>Doanh thu theo dịch vụ</b>
              {svcs.map(v=>{const rev=sAppts.filter(a=>a.svcId===v.id&&a.status==="Hoàn thành").length*v.price; return rev?<div key={v.id} style={{...row,justifyContent:"space-between",fontSize:13,marginBottom:4}}><span>{v.name}</span><b>{vnd(rev)}</b></div>:null;})}
              {!sAppts.find(a=>a.status==="Hoàn thành")&&<span style={{color:"#aaa",fontSize:13}}>Không có dữ liệu</span>}
            </div>
            <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,padding:12}}>
              <b style={{display:"block",marginBottom:8}}>Doanh thu theo nhân viên</b>
              {staff.map(e=>{const rev=sAppts.filter(a=>a.staffId===e.id&&a.status==="Hoàn thành").reduce((s,a)=>s+(svcs.find(v=>v.id===a.svcId)?.price||0),0); return rev?<div key={e.id} style={{...row,justifyContent:"space-between",fontSize:13,marginBottom:4}}><span>{e.name}</span><b>{vnd(rev)}</b></div>:null;})}
              {!sAppts.find(a=>a.status==="Hoàn thành")&&<span style={{color:"#aaa",fontSize:13}}>Không có dữ liệu</span>}
            </div>
          </div>
          <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:4,padding:12}}>
            <b style={{display:"block",marginBottom:8}}>Số lịch theo ngày</b>
            <div style={row}>
              {Object.entries(sAppts.reduce((m,a)=>{m[a.date]=(m[a.date]||0)+1;return m;},{} as Record<string,number>)).sort(([a],[b])=>a>b?1:-1).map(([d,c])=>(
                <div key={d} style={{textAlign:"center",background:"#f5f5f5",borderRadius:4,padding:"6px 12px",fontSize:13}}>
                  <div style={{fontWeight:700}}>{c}</div><div style={{color:"#777",fontSize:12}}>{d.slice(5)}</div>
                </div>
              ))}
              {sAppts.length===0&&<span style={{color:"#aaa",fontSize:13}}>Không có dữ liệu</span>}
            </div>
          </div>
        </>}
      </div>

      {/* MODAL: Đặt lịch */}
      {showAF&&<div style={ov} onClick={()=>setShowAF(false)}>
        <div style={md} onClick={e=>e.stopPropagation()}>
          <b style={{display:"block",marginBottom:12}}>Đặt lịch mới</b>
          {aErr&&<p style={{color:"red",fontSize:13,margin:"0 0 8px"}}>{aErr}</p>}
          {([["Tên khách",<input style={inp} value={aName} onChange={e=>setAName(e.target.value)} placeholder="Nguyễn Văn A"/>],
            ["Số điện thoại",<input style={inp} value={aPhone} onChange={e=>setAPhone(e.target.value)}/>],
            ["Nhân viên",<select style={inp} value={aStaff} onChange={e=>{setAStaff(e.target.value);setASvc("");}}>
              <option value="">-- Chọn --</option>{staff.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>],
            ["Dịch vụ",<select style={inp} value={aSvc} onChange={e=>setASvc(e.target.value)} disabled={!aStaff}>
              <option value="">-- Chọn --</option>
              {(aStaff?staff.find(s=>s.id===aStaff)?.svcIds||[]:[] ).map(id=>{const v=svcs.find(s=>s.id===id);return v?<option key={id} value={id}>{v.name} – {vnd(v.price)}</option>:null;})}
            </select>],
            ["Ngày",<input type="date" style={inp} value={aDate} onChange={e=>setADate(e.target.value)}/>],
            ["Giờ",<input type="time" style={inp} value={aTime} onChange={e=>setATime(e.target.value)}/>],
          ] as [string,React.ReactNode][]).map(([l,el])=><div key={l} style={fr}><label style={lb}>{l}</label>{el}</div>)}
          <div style={{...row,justifyContent:"flex-end",marginTop:8}}>
            <button style={btn()} onClick={()=>setShowAF(false)}>Hủy</button>
            <button style={pBtn} onClick={bookAppt}>Xác nhận</button>
          </div>
        </div>
      </div>}

      {}
      {showSF&&<div style={ov} onClick={()=>setShowSF(false)}>
        <div style={md} onClick={e=>e.stopPropagation()}>
          <b style={{display:"block",marginBottom:12}}>{editE?"Sửa nhân viên":"Thêm nhân viên"}</b>
          <div style={fr}><label style={lb}>Họ tên</label><input style={inp} value={eName} onChange={e=>setEName(e.target.value)}/></div>
          <div style={fr}><label style={lb}>Khách tối đa/ngày</label><input type="number" style={inp} value={eMax} min={1} onChange={e=>setEMax(+e.target.value)}/></div>
          <div style={fr}><label style={lb}>Giờ làm</label><div style={row}>
            <input type="time" style={{...inp,width:"auto"}} value={eStart} onChange={e=>setEStart(e.target.value)}/><span>–</span>
            <input type="time" style={{...inp,width:"auto"}} value={eEnd} onChange={e=>setEEnd(e.target.value)}/>
          </div></div>
          <div style={fr}><label style={lb}>Ngày làm</label><div style={row}>
            {ALL_DAYS.map(d=><label key={d} style={{fontSize:13,cursor:"pointer",display:"flex",gap:3,alignItems:"center"}}>
              <input type="checkbox" checked={eDays.includes(d)} onChange={ev=>setEDays(ev.target.checked?[...eDays,d]:eDays.filter(x=>x!==d))}/>{DAY_VN[d]}
            </label>)}
          </div></div>
          <div style={fr}><label style={lb}>Dịch vụ đảm nhận</label><div style={row}>
            {svcs.map(v=><label key={v.id} style={{fontSize:13,cursor:"pointer",display:"flex",gap:3,alignItems:"center"}}>
              <input type="checkbox" checked={eSvcs.includes(v.id)} onChange={ev=>setESvcs(ev.target.checked?[...eSvcs,v.id]:eSvcs.filter(x=>x!==v.id))}/>{v.name}
            </label>)}
          </div></div>
          <div style={{...row,justifyContent:"flex-end"}}>
            <button style={btn()} onClick={()=>setShowSF(false)}>Hủy</button>
            <button style={pBtn} onClick={saveE}>Lưu</button>
          </div>
        </div>
      </div>}

      {/* MODAL: Dịch vụ */}
      {showVF&&<div style={ov} onClick={()=>setShowVF(false)}>
        <div style={md} onClick={e=>e.stopPropagation()}>
          <b style={{display:"block",marginBottom:12}}>{editV?"Sửa dịch vụ":"Thêm dịch vụ"}</b>
          {([["Tên dịch vụ",<input style={inp} value={vName} onChange={e=>setVName(e.target.value)}/>],
            ["Giá (VNĐ)",<input type="number" style={inp} value={vPrice} onChange={e=>setVPrice(+e.target.value)}/>],
            ["Thời gian (phút)",<input type="number" style={inp} value={vDur} onChange={e=>setVDur(+e.target.value)}/>],
          ] as [string,React.ReactNode][]).map(([l,el])=><div key={l} style={fr}><label style={lb}>{l}</label>{el}</div>)}
          <div style={{...row,justifyContent:"flex-end"}}>
            <button style={btn()} onClick={()=>setShowVF(false)}>Hủy</button>
            <button style={pBtn} onClick={saveV}>Lưu</button>
          </div>
        </div>
      </div>}

      {/* MODAL: Đánh giá */}
      {showRM&&<div style={ov} onClick={()=>setShowRM(false)}>
        <div style={md} onClick={e=>e.stopPropagation()}>
          <b style={{display:"block",marginBottom:12}}>Đánh giá dịch vụ</b>
          <div style={fr}><label style={lb}>Số sao</label><div style={row}>
            {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:24,cursor:"pointer",color:n<=rStars?"#f59e0b":"#ddd"}} onClick={()=>setRStars(n)}>★</span>)}
          </div></div>
          <div style={fr}><label style={lb}>Nhận xét</label><textarea style={{...inp,minHeight:60,resize:"vertical"}} value={rCmt} onChange={e=>setRCmt(e.target.value)} placeholder="Nhận xét..."/></div>
          <div style={{...row,justifyContent:"flex-end"}}>
            <button style={btn()} onClick={()=>setShowRM(false)}>Hủy</button>
            <button style={pBtn} onClick={submitR}>Gửi</button>
          </div>
        </div>
      </div>}

      {/* MODAL: Phản hồi */}
      {showRP&&<div style={ov} onClick={()=>setShowRP(false)}>
        <div style={md} onClick={e=>e.stopPropagation()}>
          <b style={{display:"block",marginBottom:12}}>Phản hồi đánh giá</b>
          <div style={fr}><label style={lb}>Nội dung</label><textarea style={{...inp,minHeight:70,resize:"vertical"}} value={rpText} onChange={e=>setRpText(e.target.value)} placeholder="Nhập phản hồi..."/></div>
          <div style={{...row,justifyContent:"flex-end"}}>
            <button style={btn()} onClick={()=>setShowRP(false)}>Hủy</button>
            <button style={pBtn} onClick={submitRP}>Gửi</button>
          </div>
        </div>
      </div>}
    </div>
  );
}