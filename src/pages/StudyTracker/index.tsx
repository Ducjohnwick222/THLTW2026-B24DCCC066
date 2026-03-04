import { useState, useEffect } from 'react';


interface Session {
  id: string;
  subject: string;
  date: string;
  duration: number;
  content: string;
  note: string;
}

interface Goal {
  id: string;
  subject: string;
  month: string;
  targetMin: number;
}

type ModalType = 'subject' | 'session' | 'goal' | null;


const ACCENT = '#c0392b';
const DEFAULT_SUBJECTS: string[] = ['Toán', 'Văn', 'Anh', 'Khoa học', 'Công nghệ'];
const MONTHS: string[] = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];
const NOW        = new Date();
const THIS_MONTH = `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, '0')}`;


function uid(): string { return Math.random().toString(36).slice(2, 9); }
function fmt(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h}g ${m}p` : `${m}p`;
}
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const KEY = { subjects: 'ript_subjects', sessions: 'ript_sessions', goals: 'ript_goals' };

async function storageLoad<T>(key: string): Promise<T | null> {
  try {
    const r = await (window as any).storage.get(key);
    return r ? (JSON.parse(r.value) as T) : null;
  } catch { return null; }
}
async function storageSave(key: string, data: unknown): Promise<void> {
  try { await (window as any).storage.set(key, JSON.stringify(data)); } catch {}
}

// ════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════
const StudyTracker: React.FC = () => {
  const [tab, setTab]                     = useState<string>('progress');
  const [subjects, setSubjects]           = useState<string[]>(DEFAULT_SUBJECTS);
  const [sessions, setSessions]           = useState<Session[]>([]);
  const [goals, setGoals]                 = useState<Goal[]>([]);
  const [loading, setLoading]             = useState<boolean>(true);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [modal, setModal]                 = useState<ModalType>(null);
  const [editItem, setEditItem]           = useState<Session | Goal | null>(null);

  useEffect(() => {
    (async () => {
      const s  = await storageLoad<string[]>(KEY.subjects);
      const se = await storageLoad<Session[]>(KEY.sessions);
      const g  = await storageLoad<Goal[]>(KEY.goals);
      if (s)  setSubjects(s);
      if (se) setSessions(se);
      if (g)  setGoals(g);
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!loading) storageSave(KEY.subjects, subjects); }, [subjects, loading]);
  useEffect(() => { if (!loading) storageSave(KEY.sessions, sessions); }, [sessions, loading]);
  useEffect(() => { if (!loading) storageSave(KEY.goals,    goals);    }, [goals,    loading]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Đang tải…</div>;

  const totalMin = sessions
    .filter((s) => s.date?.startsWith(THIS_MONTH))
    .reduce((a, s) => a + (s.duration || 0), 0);

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#333', margin: 0 }}>
          Bài 2 — Study Tracker 📚
        </h2>
        <button
          onClick={() => { setEditItem(null); setModal('subject'); }}
          style={{ background: 'none', border: `1px solid ${ACCENT}`, color: ACCENT, borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + Quản lý môn học
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {([
          ['📖', subjects.length,  'Môn học'],
          ['📅', sessions.length,  'Buổi học'],
          ['⏱',  fmt(totalMin),   'Tháng này'],
        ] as [string, string | number, string][]).map(([ic, v, l]) => (
          <div key={l} style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderTop: `3px solid ${ACCENT}` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{ic}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#333' }}>{v}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e8e8e8', marginBottom: 22 }}>
        {([['progress', '📋 Tiến độ'], ['goals', '🎯 Mục tiêu']] as [string, string][]).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{ padding: '10px 24px', border: 'none', background: 'transparent', cursor: 'pointer', color: tab === k ? ACCENT : '#888', fontWeight: tab === k ? 700 : 400, fontSize: 14, borderBottom: tab === k ? `2px solid ${ACCENT}` : '2px solid transparent', marginBottom: -2 }}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'progress' && (
        <ProgressTab
          subjects={subjects}
          sessions={sessions}
          setSessions={setSessions}
          activeSubject={activeSubject}
          setActiveSubject={setActiveSubject}
          onAddSession={() => { setEditItem(null); setModal('session'); }}
          onEditSession={(s: Session) => { setEditItem(s); setModal('session'); }}
        />
      )}
      {tab === 'goals' && (
        <GoalsTab
          subjects={subjects}
          sessions={sessions}
          goals={goals}
          setGoals={setGoals}
          onAddGoal={() => { setEditItem(null); setModal('goal'); }}
          onEditGoal={(g: Goal) => { setEditItem(g); setModal('goal'); }}
        />
      )}

      {modal === 'subject' && <SubjectModal subjects={subjects} setSubjects={setSubjects} onClose={() => setModal(null)} />}
      {modal === 'session' && <SessionModal subjects={subjects} setSessions={setSessions} editItem={editItem as Session | null} onClose={() => setModal(null)} />}
      {modal === 'goal'    && <GoalModal    subjects={subjects} setGoals={setGoals}       editItem={editItem as Goal    | null} onClose={() => setModal(null)} />}
    </div>
  );
};

export default StudyTracker;


interface ProgressTabProps {
  subjects: string[];
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  activeSubject: string | null;
  setActiveSubject: (s: string | null) => void;
  onAddSession: () => void;
  onEditSession: (s: Session) => void;
}

const ProgressTab: React.FC<ProgressTabProps> = ({
  subjects, sessions, setSessions, activeSubject, setActiveSubject, onAddSession, onEditSession,
}) => {
  const list = [...(activeSubject ? sessions.filter((s) => s.subject === activeSubject) : sessions)]
    .sort((a, b) => b.date?.localeCompare(a.date));

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <Pill active={!activeSubject} onClick={() => setActiveSubject(null)}>Tất cả ({sessions.length})</Pill>
        {subjects.map((s) => (
          <Pill key={s} active={activeSubject === s} onClick={() => setActiveSubject(s)}>
            {s} ({sessions.filter((x) => x.subject === s).length})
          </Pill>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Btn onClick={onAddSession}>+ Thêm buổi học</Btn>
      </div>

      {list.length === 0 ? (
        <Empty text="Chưa có buổi học nào." />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {list.map((s) => (
            <div key={s.id} style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  <Tag color={ACCENT}>{s.subject}</Tag>
                  <Tag color="#555">{s.date}</Tag>
                  <Tag color="#27ae60">{fmt(s.duration || 0)}</Tag>
                </div>
                {s.content && <div style={{ color: '#444', fontSize: 13, marginBottom: 3 }}>📖 {s.content}</div>}
                {s.note    && <div style={{ color: '#aaa', fontSize: 12, fontStyle: 'italic' }}>💬 {s.note}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <IconBtn onClick={() => onEditSession(s)}>✏️</IconBtn>
                <IconBtn danger onClick={() => setSessions((p) => p.filter((x) => x.id !== s.id))}>🗑</IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


interface GoalsTabProps {
  subjects: string[];
  sessions: Session[];
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  onAddGoal: () => void;
  onEditGoal: (g: Goal) => void;
}

const GoalsTab: React.FC<GoalsTabProps> = ({ subjects, sessions, goals, setGoals, onAddGoal, onEditGoal }) => {
  const [month, setMonth] = useState<string>(THIS_MONTH);

  const monthGoals  = goals.filter((g) => g.month === month);
  const actual      = (subj: string) => sessions.filter((s) => s.subject === subj && s.date?.startsWith(month)).reduce((a, s) => a + (s.duration || 0), 0);
  const totalActual = sessions.filter((s) => s.date?.startsWith(month)).reduce((a, s) => a + (s.duration || 0), 0);
  const totalTarget = monthGoals.reduce((a, g) => a + (g.targetMin || 0), 0);

  const allMonths = [2024, 2025, 2026].flatMap((y) =>
    Array.from({ length: 12 }, (_, i) => ({
      val: `${y}-${String(i + 1).padStart(2, '0')}`,
      label: `${MONTHS[i]} ${y}`,
    })),
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={selectSt()}>
          {allMonths.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>
        <Btn onClick={onAddGoal}>+ Thêm mục tiêu</Btn>
      </div>

      {totalTarget > 0 && (
        <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 8, padding: '16px 18px', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#888', fontSize: 13 }}>Tổng tiến độ tháng</span>
            <span style={{ fontWeight: 700, color: totalActual >= totalTarget ? '#27ae60' : '#f39c12' }}>
              {fmt(totalActual)} / {fmt(totalTarget)} {totalActual >= totalTarget ? '✅' : ''}
            </span>
          </div>
          <ProgressBar value={totalActual} max={totalTarget} />
        </div>
      )}

      {monthGoals.length === 0 ? (
        <Empty text="Chưa có mục tiêu cho tháng này." />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {monthGoals.map((g) => {
            const act  = actual(g.subject);
            const done = act >= g.targetMin;
            return (
              <div key={g.id} style={{ background: '#fff', border: `1px solid ${done ? '#27ae60' : '#ececec'}`, borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Tag color={ACCENT}>{g.subject}</Tag>
                    <span style={{ fontSize: 13, color: done ? '#27ae60' : '#f39c12', fontWeight: 600 }}>
                      {done ? '✅ Hoàn thành' : '⏳ Chưa đạt'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <IconBtn onClick={() => onEditGoal(g)}>✏️</IconBtn>
                    <IconBtn danger onClick={() => setGoals((p) => p.filter((x) => x.id !== g.id))}>🗑</IconBtn>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 7 }}>
                  <span>Thực tế: <b style={{ color: '#333' }}>{fmt(act)}</b></span>
                  <span>Mục tiêu: <b style={{ color: '#333' }}>{fmt(g.targetMin)}</b></span>
                </div>
                <ProgressBar value={act} max={g.targetMin} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SubjectModal: React.FC<{ subjects: string[]; setSubjects: React.Dispatch<React.SetStateAction<string[]>>; onClose: () => void }> = ({ subjects, setSubjects, onClose }) => {
  const [newName, setNewName] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');

  return (
    <Modal title="Quản lý môn học" onClose={onClose}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tên môn mới…" style={inputSt()}
          onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) { setSubjects((p) => [...p, newName.trim()]); setNewName(''); } }} />
        <Btn onClick={() => { if (newName.trim()) { setSubjects((p) => [...p, newName.trim()]); setNewName(''); } }}>Thêm</Btn>
      </div>
      <div style={{ display: 'grid', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
        {subjects.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9f9f9', borderRadius: 7, padding: '8px 12px' }}>
            {editIdx === i
              ? <input value={editVal} onChange={(e) => setEditVal(e.target.value)} style={{ ...inputSt(), flex: 1, padding: '5px 8px' }} autoFocus />
              : <span style={{ flex: 1, fontSize: 14 }}>{s}</span>}
            {editIdx === i
              ? <>
                  <button onClick={() => { setSubjects((p) => p.map((x, j) => j === i ? editVal : x)); setEditIdx(null); }} style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>💾</button>
                  <button onClick={() => setEditIdx(null)} style={{ background: '#eee', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </>
              : <>
                  <IconBtn onClick={() => { setEditIdx(i); setEditVal(s); }}>✏️</IconBtn>
                  <IconBtn danger onClick={() => setSubjects((p) => p.filter((_, j) => j !== i))}>🗑</IconBtn>
                </>}
          </div>
        ))}
      </div>
    </Modal>
  );
};

const SessionModal: React.FC<{ subjects: string[]; setSessions: React.Dispatch<React.SetStateAction<Session[]>>; editItem: Session | null; onClose: () => void }> = ({ subjects, setSessions, editItem, onClose }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({ subject: editItem?.subject ?? subjects[0] ?? '', date: editItem?.date ?? today(), duration: editItem?.duration ?? 60, content: editItem?.content ?? '', note: editItem?.note ?? '' });

  const submit = () => {
    if (!form.subject || !form.date) return;
    if (isEdit) setSessions((p) => p.map((s) => s.id === editItem!.id ? { ...editItem!, ...form, duration: +form.duration } : s));
    else setSessions((p) => [...p, { id: uid(), ...form, duration: +form.duration }]);
    onClose();
  };

  return (
    <Modal title={isEdit ? 'Sửa buổi học' : 'Thêm buổi học'} onClose={onClose}>
      <div style={{ display: 'grid', gap: 13 }}>
        <Field label="Môn học"><select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={selectSt()}>{subjects.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Ngày học"><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={inputSt()} /></Field>
        <Field label="Thời lượng (phút)"><input type="number" min={1} value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))} style={inputSt()} /></Field>
        <Field label="Nội dung đã học"><input value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Vd: Chương 3…" style={inputSt()} /></Field>
        <Field label="Ghi chú"><textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} rows={2} style={{ ...inputSt(), resize: 'vertical' }} /></Field>
        <Btn onClick={submit} full>{isEdit ? '💾 Lưu thay đổi' : '✅ Thêm buổi học'}</Btn>
      </div>
    </Modal>
  );
};

const GoalModal: React.FC<{ subjects: string[]; setGoals: React.Dispatch<React.SetStateAction<Goal[]>>; editItem: Goal | null; onClose: () => void }> = ({ subjects, setGoals, editItem, onClose }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({ subject: editItem?.subject ?? subjects[0] ?? '', month: editItem?.month ?? THIS_MONTH, targetMin: editItem?.targetMin ?? 120 });
  const allMonths = [2024, 2025, 2026].flatMap((y) => Array.from({ length: 12 }, (_, i) => ({ val: `${y}-${String(i+1).padStart(2,'0')}`, label: `${MONTHS[i]} ${y}` })));

  const submit = () => {
    if (isEdit) setGoals((p) => p.map((g) => g.id === editItem!.id ? { ...editItem!, ...form, targetMin: +form.targetMin } : g));
    else setGoals((p) => [...p, { id: uid(), ...form, targetMin: +form.targetMin }]);
    onClose();
  };

  return (
    <Modal title={isEdit ? 'Sửa mục tiêu' : 'Thêm mục tiêu'} onClose={onClose}>
      <div style={{ display: 'grid', gap: 13 }}>
        <Field label="Tháng"><select value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))} style={selectSt()}>{allMonths.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}</select></Field>
        <Field label="Môn học"><select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={selectSt()}>{subjects.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label={`Mục tiêu (phút) = ${fmt(+form.targetMin)}`}><input type="number" min={1} value={form.targetMin} onChange={(e) => setForm((f) => ({ ...f, targetMin: +e.target.value }))} style={inputSt()} /></Field>
        <Btn onClick={submit} full>{isEdit ? '💾 Lưu' : '✅ Thêm mục tiêu'}</Btn>
      </div>
    </Modal>
  );
};

// ════════════════════════════════════════════
// SHARED UI PRIMITIVES
// ════════════════════════════════════════════
const Btn: React.FC<{ children: React.ReactNode; onClick: () => void; full?: boolean }> = ({ children, onClick, full }) => (
  <button onClick={onClick} style={{ background: ACCENT, color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 5, fontWeight: 700, fontSize: 14, cursor: 'pointer', width: full ? '100%' : 'auto' }}>{children}</button>
);

const Modal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({ title, children, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div style={{ background: '#fff', borderRadius: 12, padding: '24px 26px', width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div style={{ height: 8, background: '#f0f0f0', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'linear-gradient(90deg,#27ae60,#2ecc71)' : 'linear-gradient(90deg,#c0392b,#e74c3c)', borderRadius: 99, transition: 'width 0.4s' }} />
    </div>
  );
};

const Pill: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ border: `1px solid ${active ? ACCENT : '#ddd'}`, background: active ? '#fff0f0' : '#fff', color: active ? ACCENT : '#666', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: active ? 700 : 400, cursor: 'pointer' }}>{children}</button>
);

const Tag: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ background: color + '18', color, border: `1px solid ${color}33`, borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{children}</span>
);

const IconBtn: React.FC<{ children: React.ReactNode; onClick: () => void; danger?: boolean }> = ({ children, onClick, danger }) => (
  <button onClick={onClick} style={{ background: danger ? '#fff5f5' : '#f9f9f9', border: `1px solid ${danger ? '#ffcdd2' : '#e8e8e8'}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }}>{children}</button>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div style={{ color: '#888', fontSize: 11, marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    {children}
  </div>
);

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ textAlign: 'center', color: '#bbb', padding: '40px 20px', fontSize: 14 }}>{text}</div>
);

function inputSt(): React.CSSProperties {
  return { width: '100%', background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 6, padding: '9px 12px', color: '#333', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
}
function selectSt(): React.CSSProperties {
  return { width: '100%', background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 6, padding: '9px 12px', color: '#333', fontSize: 14, outline: 'none' };
}