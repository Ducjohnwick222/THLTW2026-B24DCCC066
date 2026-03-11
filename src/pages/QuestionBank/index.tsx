// FILE: src/pages/QuestionBank.tsx
// ROUTE: /question-bank

import { useState, useMemo } from "react";

type Difficulty = "Dễ" | "Trung bình" | "Khó" | "Rất khó";

interface KnowledgeBlock { id: string; name: string; }
interface Subject        { id: string; code: string; name: string; credits: number; }
interface Question       { id: string; code: string; subjectId: string; content: string; difficulty: Difficulty; knowledgeBlockId: string; }
interface ExamReq        { difficulty: Difficulty; knowledgeBlockId: string; count: number; }
interface SavedStructure { id: string; name: string; subjectId: string; reqs: ExamReq[]; }
interface Exam           { id: string; name: string; subjectId: string; questionIds: string[]; createdAt: string; }

const DIFFICULTIES: Difficulty[] = ["Dễ", "Trung bình", "Khó", "Rất khó"];

const initKbs: KnowledgeBlock[] = [
  { id: "kb1", name: "Tổng quan" },
  { id: "kb2", name: "Chuyên sâu" },
  { id: "kb3", name: "Ứng dụng" },
];

const initSubjects: Subject[] = [
  { id: "s1", code: "CS101", name: "Lập trình cơ bản",   credits: 3 },
  { id: "s2", code: "CS201", name: "Cấu trúc dữ liệu",   credits: 4 },
  { id: "s3", code: "CS301", name: "Mạng máy tính",       credits: 3 },
];

const initQuestions: Question[] = [
  { id:"q1",  code:"Q001", subjectId:"s1", content:"Biến là gì trong lập trình?",                        difficulty:"Dễ",         knowledgeBlockId:"kb1" },
  { id:"q2",  code:"Q002", subjectId:"s1", content:"Giải thích vòng lặp for và while.",                  difficulty:"Trung bình", knowledgeBlockId:"kb1" },
  { id:"q3",  code:"Q003", subjectId:"s1", content:"Đệ quy là gì? Cho ví dụ Fibonacci.",                 difficulty:"Khó",        knowledgeBlockId:"kb2" },
  { id:"q4",  code:"Q004", subjectId:"s1", content:"Phân tích độ phức tạp thuật toán sắp xếp nhanh.",    difficulty:"Rất khó",    knowledgeBlockId:"kb2" },
  { id:"q5",  code:"Q005", subjectId:"s2", content:"Mảng và danh sách liên kết khác nhau như thế nào?",  difficulty:"Dễ",         knowledgeBlockId:"kb1" },
  { id:"q6",  code:"Q006", subjectId:"s2", content:"Cây nhị phân tìm kiếm hoạt động như thế nào?",       difficulty:"Trung bình", knowledgeBlockId:"kb2" },
  { id:"q7",  code:"Q007", subjectId:"s2", content:"Giải thích thuật toán Dijkstra.",                    difficulty:"Khó",        knowledgeBlockId:"kb2" },
  { id:"q8",  code:"Q008", subjectId:"s3", content:"Mô hình OSI gồm mấy tầng?",                          difficulty:"Dễ",         knowledgeBlockId:"kb1" },
  { id:"q9",  code:"Q009", subjectId:"s3", content:"TCP và UDP khác nhau thế nào?",                      difficulty:"Trung bình", knowledgeBlockId:"kb1" },
  { id:"q10", code:"Q010", subjectId:"s3", content:"Triển khai VLAN trong môi trường doanh nghiệp.",     difficulty:"Rất khó",    knowledgeBlockId:"kb3" },
];

type Tab = "knowledge" | "subjects" | "questions" | "exams";

const s = {
  inp: { width:"100%", padding:"0.4rem 0.6rem", border:"1px solid #ccc", borderRadius:3, fontSize:"0.9rem", boxSizing:"border-box" } as React.CSSProperties,
  btn: { padding:"0.4rem 0.9rem", border:"1px solid #999", background:"#fff", borderRadius:3, cursor:"pointer", fontSize:"0.85rem" } as React.CSSProperties,
  btnPrimary: { padding:"0.4rem 0.9rem", border:"1px solid #000", background:"#000", color:"#fff", borderRadius:3, cursor:"pointer", fontSize:"0.85rem" } as React.CSSProperties,
  th: { padding:"6px 10px", textAlign:"left" as const, borderBottom:"2px solid #000", fontSize:"0.82rem", fontWeight:700 },
  td: { padding:"6px 10px", borderBottom:"1px solid #eee", fontSize:"0.88rem", verticalAlign:"top" as const },
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" }}>
      <div style={{ background:"#fff",borderRadius:4,padding:"1.5rem",width:"100%",maxWidth:440,maxHeight:"80vh",overflowY:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem" }}>
          <strong>{title}</strong>
          <button onClick={onClose} style={{ ...s.btn, border:"none", fontSize:"1.1rem" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function QuestionBank() {
  const [tab, setTab]         = useState<Tab>("knowledge");
  const [kbs, setKbs]         = useState(initKbs);
  const [subjects, setSubjects] = useState(initSubjects);
  const [questions, setQuestions] = useState(initQuestions);
  const [exams, setExams]     = useState<Exam[]>([]);
  const [savedStructures, setSaved] = useState<SavedStructure[]>([]);

  const [fSub, setFSub]       = useState("");
  const [fDiff, setFDiff]     = useState("");
  const [fKb, setFKb]         = useState("");
  const [fSearch, setFSearch] = useState("");

  const [showKb, setShowKb]   = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showQ, setShowQ]     = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [examDetail, setExamDetail] = useState<Exam | null>(null);

  const [kbForm, setKbForm]   = useState({ name:"" });
  const [subForm, setSubForm] = useState({ code:"", name:"", credits:"" });
  const [qForm, setQForm]     = useState({ code:"", subjectId:"", content:"", difficulty:"Dễ" as Difficulty, knowledgeBlockId:"" });
  const [examForm, setExamForm] = useState({ name:"", subjectId:"", structureName:"", reqs: DIFFICULTIES.map((d) => ({ difficulty:d, knowledgeBlockId:"", count:0 })) });
  const [examErr, setExamErr] = useState("");

  const uid = () => Math.random().toString(36).slice(2,9);

  const filteredQ = useMemo(() => questions.filter((q) =>
    (!fSub    || q.subjectId === fSub) &&
    (!fDiff   || q.difficulty === fDiff) &&
    (!fKb     || q.knowledgeBlockId === fKb) &&
    (!fSearch || q.content.toLowerCase().includes(fSearch.toLowerCase()) || q.code.toLowerCase().includes(fSearch.toLowerCase()))
  ), [questions, fSub, fDiff, fKb, fSearch]);

  const getSub = (id: string) => subjects.find((x) => x.id === id);
  const getKb  = (id: string) => kbs.find((x) => x.id === id);

  const addKb = () => {
    if (!kbForm.name.trim()) return;
    setKbs([...kbs, { id:uid(), name:kbForm.name.trim() }]);
    setKbForm({ name:"" }); setShowKb(false);
  };

  const addSub = () => {
    if (!subForm.code || !subForm.name || !subForm.credits) return;
    setSubjects([...subjects, { id:uid(), code:subForm.code, name:subForm.name, credits:parseInt(subForm.credits) }]);
    setSubForm({ code:"",name:"",credits:"" }); setShowSub(false);
  };

  const addQ = () => {
    if (!qForm.code || !qForm.subjectId || !qForm.content || !qForm.knowledgeBlockId) return;
    setQuestions([...questions, { id:uid(), ...qForm }]);
    setQForm({ code:"",subjectId:"",content:"",difficulty:"Dễ",knowledgeBlockId:"" }); setShowQ(false);
  };

  const createExam = () => {
    setExamErr("");
    if (!examForm.name || !examForm.subjectId) { setExamErr("Vui lòng điền đầy đủ."); return; }
    const reqs = examForm.reqs.filter((r) => r.count > 0 && r.knowledgeBlockId);
    if (!reqs.length) { setExamErr("Cần ít nhất 1 yêu cầu."); return; }
    const ids: string[] = [];
    for (const r of reqs) {
      const pool = questions.filter((q) => q.subjectId===examForm.subjectId && q.difficulty===r.difficulty && q.knowledgeBlockId===r.knowledgeBlockId);
      if (pool.length < r.count) { setExamErr(`Không đủ câu "${r.difficulty}" – "${getKb(r.knowledgeBlockId)?.name}". Cần ${r.count}, có ${pool.length}.`); return; }
      ids.push(...[...pool].sort(()=>Math.random()-.5).slice(0,r.count).map((q)=>q.id));
    }
    if (examForm.structureName) setSaved([...savedStructures, { id:uid(), name:examForm.structureName, subjectId:examForm.subjectId, reqs }]);
    setExams([...exams, { id:uid(), name:examForm.name, subjectId:examForm.subjectId, questionIds:ids, createdAt:new Date().toLocaleString("vi-VN") }]);
    setExamForm({ name:"",subjectId:"",structureName:"", reqs:DIFFICULTIES.map((d)=>({ difficulty:d,knowledgeBlockId:"",count:0 })) });
    setShowExam(false);
  };

  const MF = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom:"0.85rem" }}>
      <label style={{ display:"block", fontSize:"0.8rem", marginBottom:"0.3rem", fontWeight:600 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily:"sans-serif", background:"#fff", minHeight:"100vh", color:"#000" }}>
      {/* Top nav */}
      <div style={{ borderBottom:"1px solid #000", padding:"0.75rem 1.5rem", display:"flex", alignItems:"center", gap:"2rem" }}>
        <strong>Ngân Hàng Câu Hỏi</strong>
        {(["knowledge","subjects","questions","exams"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...s.btn, border:"none", background:"none", fontWeight: tab===t ? 700 : 400, textDecoration: tab===t ? "underline" : "none", padding:"0.2rem 0" }}>
            {{ knowledge:"Khối KT", subjects:"Môn học", questions:"Câu hỏi", exams:"Đề thi" }[t]}
          </button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:"0.82rem", color:"#666" }}>
          {kbs.length} khối · {subjects.length} môn · {questions.length} câu · {exams.length} đề
        </span>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"1.5rem 1rem" }}>

        {}
        {tab === "knowledge" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <h2 style={{ margin:0, fontSize:"1.1rem" }}>Khối Kiến Thức</h2>
              <button style={s.btnPrimary} onClick={() => setShowKb(true)}>+ Thêm</button>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr><th style={s.th}>Tên khối</th><th style={s.th}>Số câu hỏi</th><th style={s.th}></th></tr></thead>
              <tbody>
                {kbs.map((k) => (
                  <tr key={k.id}>
                    <td style={s.td}>{k.name}</td>
                    <td style={s.td}>{questions.filter((q)=>q.knowledgeBlockId===k.id).length}</td>
                    <td style={s.td}><button style={s.btn} onClick={()=>setKbs(kbs.filter((x)=>x.id!==k.id))}>Xóa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {}
        {tab === "subjects" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <h2 style={{ margin:0, fontSize:"1.1rem" }}>Môn Học</h2>
              <button style={s.btnPrimary} onClick={() => setShowSub(true)}>+ Thêm</button>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["Mã môn","Tên môn học","Tín chỉ","Số câu",""].map((h)=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.id}>
                    <td style={s.td}><code>{sub.code}</code></td>
                    <td style={s.td}>{sub.name}</td>
                    <td style={s.td}>{sub.credits}</td>
                    <td style={s.td}>{questions.filter((q)=>q.subjectId===sub.id).length}</td>
                    <td style={s.td}><button style={s.btn} onClick={()=>setSubjects(subjects.filter((x)=>x.id!==sub.id))}>Xóa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {}
        {tab === "questions" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <h2 style={{ margin:0, fontSize:"1.1rem" }}>Câu Hỏi</h2>
              <button style={s.btnPrimary} onClick={() => setShowQ(true)}>+ Thêm</button>
            </div>

            {}
            <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1rem", flexWrap:"wrap" }}>
              <select style={{ ...s.inp, width:"auto" }} value={fSub} onChange={(e)=>setFSub(e.target.value)}>
                <option value="">Tất cả môn</option>
                {subjects.map((sub)=><option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
              <select style={{ ...s.inp, width:"auto" }} value={fDiff} onChange={(e)=>setFDiff(e.target.value)}>
                <option value="">Tất cả mức độ</option>
                {DIFFICULTIES.map((d)=><option key={d} value={d}>{d}</option>)}
              </select>
              <select style={{ ...s.inp, width:"auto" }} value={fKb} onChange={(e)=>setFKb(e.target.value)}>
                <option value="">Tất cả khối KT</option>
                {kbs.map((k)=><option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <input style={{ ...s.inp, width:200 }} placeholder="Tìm kiếm..." value={fSearch} onChange={(e)=>setFSearch(e.target.value)} />
            </div>

            <div style={{ fontSize:"0.82rem", color:"#666", marginBottom:"0.75rem" }}>
              {filteredQ.length} câu hỏi
            </div>

            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["Mã","Nội dung","Môn học","Mức độ","Khối KT",""].map((h)=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filteredQ.map((q)=>(
                  <tr key={q.id}>
                    <td style={s.td}><code>{q.code}</code></td>
                    <td style={{ ...s.td, maxWidth:280 }}>{q.content}</td>
                    <td style={s.td}>{getSub(q.subjectId)?.name}</td>
                    <td style={s.td}>{q.difficulty}</td>
                    <td style={s.td}>{getKb(q.knowledgeBlockId)?.name}</td>
                    <td style={s.td}><button style={s.btn} onClick={()=>setQuestions(questions.filter((x)=>x.id!==q.id))}>Xóa</button></td>
                  </tr>
                ))}
                {filteredQ.length === 0 && (
                  <tr><td colSpan={6} style={{ ...s.td, textAlign:"center", color:"#999", padding:"1.5rem" }}>Không tìm thấy</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {}
        {tab === "exams" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <h2 style={{ margin:0, fontSize:"1.1rem" }}>Đề Thi</h2>
              <button style={s.btnPrimary} onClick={() => setShowExam(true)}>+ Tạo đề thi</button>
            </div>

            {savedStructures.length > 0 && (
              <div style={{ marginBottom:"1.25rem" }}>
                <div style={{ fontSize:"0.8rem", fontWeight:700, marginBottom:"0.4rem" }}>Cấu trúc đã lưu:</div>
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                  {savedStructures.map((ss)=>(
                    <span key={ss.id} style={{ border:"1px solid #ccc", borderRadius:3, padding:"0.2rem 0.6rem", fontSize:"0.82rem" }}>
                      {ss.name} ({getSub(ss.subjectId)?.name})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {exams.length === 0 ? (
              <p style={{ color:"#999" }}>Chưa có đề thi nào.</p>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Tên đề thi","Môn học","Số câu","Ngày tạo",""].map((h)=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {exams.map((ex)=>(
                    <tr key={ex.id}>
                      <td style={s.td}><strong>{ex.name}</strong></td>
                      <td style={s.td}>{getSub(ex.subjectId)?.name}</td>
                      <td style={s.td}>{ex.questionIds.length}</td>
                      <td style={s.td}>{ex.createdAt}</td>
                      <td style={s.td}><button style={s.btn} onClick={()=>setExamDetail(ex)}>Xem</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      {showKb && (
        <Modal title="Thêm Khối Kiến Thức" onClose={()=>setShowKb(false)}>
          <MF label="Tên khối kiến thức">
            <input style={s.inp} placeholder="VD: Tổng quan" value={kbForm.name} onChange={(e)=>setKbForm({name:e.target.value})} />
          </MF>
          <button style={s.btnPrimary} onClick={addKb}>Thêm</button>
        </Modal>
      )}

      {showSub && (
        <Modal title="Thêm Môn Học" onClose={()=>setShowSub(false)}>
          {[{l:"Mã môn",k:"code",p:"CS101"},{l:"Tên môn học",k:"name",p:"Lập trình cơ bản"},{l:"Số tín chỉ",k:"credits",p:"3"}].map((f)=>(
            <MF key={f.k} label={f.l}>
              <input style={s.inp} placeholder={f.p} type={f.k==="credits"?"number":"text"} value={(subForm as any)[f.k]} onChange={(e)=>setSubForm({...subForm,[f.k]:e.target.value})} />
            </MF>
          ))}
          <button style={s.btnPrimary} onClick={addSub}>Thêm</button>
        </Modal>
      )}

      {showQ && (
        <Modal title="Thêm Câu Hỏi" onClose={()=>setShowQ(false)}>
          <MF label="Mã câu hỏi"><input style={s.inp} placeholder="Q011" value={qForm.code} onChange={(e)=>setQForm({...qForm,code:e.target.value})} /></MF>
          <MF label="Nội dung câu hỏi"><input style={s.inp} placeholder="Nhập nội dung..." value={qForm.content} onChange={(e)=>setQForm({...qForm,content:e.target.value})} /></MF>
          <MF label="Môn học">
            <select style={s.inp} value={qForm.subjectId} onChange={(e)=>setQForm({...qForm,subjectId:e.target.value})}>
              <option value="">-- Chọn --</option>
              {subjects.map((sub)=><option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </MF>
          <MF label="Khối kiến thức">
            <select style={s.inp} value={qForm.knowledgeBlockId} onChange={(e)=>setQForm({...qForm,knowledgeBlockId:e.target.value})}>
              <option value="">-- Chọn --</option>
              {kbs.map((k)=><option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </MF>
          <MF label="Mức độ khó">
            <select style={s.inp} value={qForm.difficulty} onChange={(e)=>setQForm({...qForm,difficulty:e.target.value as Difficulty})}>
              {DIFFICULTIES.map((d)=><option key={d} value={d}>{d}</option>)}
            </select>
          </MF>
          <button style={s.btnPrimary} onClick={addQ}>Thêm</button>
        </Modal>
      )}

      {showExam && (
        <Modal title="Tạo Đề Thi" onClose={()=>setShowExam(false)}>
          <MF label="Tên đề thi"><input style={s.inp} placeholder="Đề thi giữa kỳ CS101" value={examForm.name} onChange={(e)=>setExamForm({...examForm,name:e.target.value})} /></MF>
          <MF label="Môn học">
            <select style={s.inp} value={examForm.subjectId} onChange={(e)=>setExamForm({...examForm,subjectId:e.target.value})}>
              <option value="">-- Chọn --</option>
              {subjects.map((sub)=><option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </MF>
          <div style={{ marginBottom:"0.85rem" }}>
            <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, marginBottom:"0.5rem" }}>Cấu trúc câu hỏi</label>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.82rem" }}>
              <thead><tr><th style={{ ...s.th, padding:"4px 6px" }}>Mức độ</th><th style={{ ...s.th, padding:"4px 6px" }}>Khối KT</th><th style={{ ...s.th, padding:"4px 6px" }}>Số câu</th></tr></thead>
              <tbody>
                {examForm.reqs.map((r,i)=>(
                  <tr key={r.difficulty}>
                    <td style={{ ...s.td, padding:"4px 6px" }}>{r.difficulty}</td>
                    <td style={{ ...s.td, padding:"4px 6px" }}>
                      <select style={{ ...s.inp, padding:"0.25rem 0.4rem" }} value={r.knowledgeBlockId}
                        onChange={(e)=>{ const nr=[...examForm.reqs]; nr[i].knowledgeBlockId=e.target.value; setExamForm({...examForm,reqs:nr}); }}>
                        <option value="">--</option>
                        {kbs.map((k)=><option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                    </td>
                    <td style={{ ...s.td, padding:"4px 6px" }}>
                      <input type="number" min={0} style={{ ...s.inp, width:60, padding:"0.25rem 0.4rem" }} value={r.count||""}
                        onChange={(e)=>{ const nr=[...examForm.reqs]; nr[i].count=parseInt(e.target.value)||0; setExamForm({...examForm,reqs:nr}); }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <MF label="Lưu tên cấu trúc (tùy chọn)"><input style={s.inp} placeholder="Đề chuẩn giữa kỳ" value={examForm.structureName} onChange={(e)=>setExamForm({...examForm,structureName:e.target.value})} /></MF>
          {examErr && <p style={{ color:"red", fontSize:"0.82rem", marginBottom:"0.75rem" }}>{examErr}</p>}
          <button style={s.btnPrimary} onClick={createExam}>Tạo đề thi</button>
        </Modal>
      )}

      {examDetail && (
        <Modal title={examDetail.name} onClose={()=>setExamDetail(null)}>
          <p style={{ fontSize:"0.82rem", color:"#666", marginTop:0 }}>{getSub(examDetail.subjectId)?.name} · {examDetail.questionIds.length} câu · {examDetail.createdAt}</p>
          {examDetail.questionIds.map((qid,i)=>{
            const q = questions.find((x)=>x.id===qid); if (!q) return null;
            return (
              <div key={qid} style={{ borderBottom:"1px solid #eee", paddingBottom:"0.6rem", marginBottom:"0.6rem" }}>
                <div style={{ fontSize:"0.75rem", color:"#666", marginBottom:"0.2rem" }}>Câu {i+1} · {q.code} · {q.difficulty}</div>
                <div style={{ fontSize:"0.9rem" }}>{q.content}</div>
              </div>
            );
          })}
        </Modal>
      )}
    </div>
  );
}