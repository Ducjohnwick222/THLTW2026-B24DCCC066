import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Club = {
  id: number; avatar: string; name: string; foundedDate: string;
  description: string; director: string; active: boolean;
};
type HistoryEntry = { action: "Approved" | "Rejected"; at: string; reason?: string };
type Registration = {
  id: number; name: string; email: string; phone: string;
  gender: "Nam" | "Nữ" | "Khác"; address: string; skills: string;
  clubId: number; reason: string; status: "Pending" | "Approved" | "Rejected";
  note: string; history: HistoryEntry[];
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const CLUBS0: Club[] = [
  { id: 1, avatar: "🎵", name: "CLB Âm nhạc", foundedDate: "2020-01-15", description: "<b>Dành cho</b> người yêu nhạc", director: "Nguyễn Văn A", active: true },
  { id: 2, avatar: "📸", name: "CLB Nhiếp ảnh", foundedDate: "2019-06-01", description: "Nghệ thuật ảnh", director: "Trần Thị B", active: true },
  { id: 3, avatar: "🏸", name: "CLB Cầu lông", foundedDate: "2021-03-10", description: "Rèn luyện sức khoẻ", director: "Lê Văn C", active: false },
];

const REGS0: Registration[] = [
  { id: 1, name: "Phạm Minh Đức", email: "duc@mail.com", phone: "0901234567", gender: "Nam", address: "Hà Nội", skills: "Guitar", clubId: 1, reason: "Yêu âm nhạc", status: "Pending", note: "", history: [] },
  { id: 2, name: "Nguyễn Thu Hà", email: "ha@mail.com", phone: "0912345678", gender: "Nữ", address: "HCM", skills: "Chụp ảnh", clubId: 2, reason: "Thích nhiếp ảnh", status: "Approved", note: "", history: [{ action: "Approved", at: "2025-04-01 09:00" }] },
  { id: 3, name: "Trần Quốc Bảo", email: "bao@mail.com", phone: "0923456789", gender: "Nam", address: "Đà Nẵng", skills: "Cầu lông", clubId: 3, reason: "Muốn khoẻ", status: "Rejected", note: "CLB tạm ngừng", history: [{ action: "Rejected", at: "2025-04-02 14:30", reason: "CLB tạm ngừng" }] },
  { id: 4, name: "Lê Thị Mai", email: "mai@mail.com", phone: "0934567890", gender: "Nữ", address: "Hải Phòng", skills: "Violin", clubId: 1, reason: "Học nhạc", status: "Pending", note: "", history: [] },
  { id: 5, name: "Võ Thanh Tùng", email: "tung@mail.com", phone: "0945678901", gender: "Nam", address: "Cần Thơ", skills: "Portrait", clubId: 2, reason: "Đam mê ảnh", status: "Pending", note: "", history: [] },
];

const nowStr = () => new Date().toLocaleString("vi-VN");
const cname = (clubs: Club[], id: number) => clubs.find(c => c.id === id)?.name || "—";

// ─── Inline styles ────────────────────────────────────────────────────────────
const S = {
  page: { padding: 8 } as React.CSSProperties,
  h2: { fontSize: 15, marginBottom: 6 } as React.CSSProperties,
  toolbar: { display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" as const },
  input: { fontSize: 12, border: "1px solid #999", padding: "2px 4px" } as React.CSSProperties,
  btn: { fontSize: 12, padding: "2px 8px", cursor: "pointer" } as React.CSSProperties,
  link: { color: "blue", textDecoration: "underline", cursor: "pointer", fontSize: 12, marginRight: 6, background: "none", border: "none" } as React.CSSProperties,
  table: { borderCollapse: "collapse" as const, width: "100%" },
  th: { border: "1px solid #888", padding: "3px 6px", background: "#ddd", whiteSpace: "nowrap" as const },
  td: { border: "1px solid #888", padding: "3px 6px", whiteSpace: "nowrap" as const },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center" },
  popup: { background: "#fff", border: "1px solid #888", padding: 10, minWidth: 320, maxHeight: "90vh", overflowY: "auto" as const },
  row: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } as React.CSSProperties,
  label: { width: 110, flexShrink: 0 } as React.CSSProperties,
  statBox: { border: "1px solid #888", padding: "6px 12px" } as React.CSSProperties,
};

// ─── Popup ────────────────────────────────────────────────────────────────────
function Popup({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.popup}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <b>{title}</b>
          <button style={S.btn} onClick={onClose}>X</button>
        </div>
        <hr style={{ marginBottom: 8 }} />
        {children}
      </div>
    </div>
  );
}

// ─── Club Tab ─────────────────────────────────────────────────────────────────
function ClubTab({ clubs, setClubs, goMembers }: { clubs: Club[]; setClubs: (c: Club[]) => void; goMembers: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<keyof Club>("name");
  const [form, setForm] = useState<Partial<Club> | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const list = useMemo(() =>
    clubs.filter(c => c.name.includes(search) || c.director.includes(search))
         .sort((a, b) => String(a[sort]).localeCompare(String(b[sort])))
  , [clubs, search, sort]);

  const openAdd = () => { setForm({ active: true, avatar: "", name: "", foundedDate: "", description: "", director: "" }); setEditId(null); };
  const openEdit = (c: Club) => { setForm({ ...c }); setEditId(c.id); };
  const save = () => {
    if (!form?.name) return alert("Nhập tên CLB");
    if (editId) setClubs(clubs.map(c => c.id === editId ? { ...c, ...form } as Club : c));
    else setClubs([...clubs, { ...form, id: Date.now() } as Club]);
    setForm(null);
  };
  const del = (id: number) => { if (window.confirm("Xóa CLB?")) setClubs(clubs.filter(c => c.id !== id)); };

  return (
    <div style={S.page}>
      <h2 style={S.h2}>Danh sách Câu lạc bộ</h2>
      <div style={S.toolbar}>
        <input style={{ ...S.input, width: 200 }} placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={S.input} value={sort} onChange={e => setSort(e.target.value as keyof Club)}>
          <option value="name">Sort: Tên</option>
          <option value="foundedDate">Sort: Ngày thành lập</option>
          <option value="director">Sort: Chủ nhiệm</option>
        </select>
        <button style={S.btn} onClick={openAdd}>Thêm mới</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr>{["Ảnh", "Tên CLB", "Ngày TL", "Mô tả", "Chủ nhiệm", "Hoạt động", "Thao tác"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id}>
                <td style={S.td}>{c.avatar}</td>
                <td style={S.td}>{c.name}</td>
                <td style={S.td}>{c.foundedDate}</td>
                <td style={{ ...S.td, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} dangerouslySetInnerHTML={{ __html: c.description }} />
                <td style={S.td}>{c.director}</td>
                <td style={S.td}>{c.active ? "Có" : "Không"}</td>
                <td style={S.td}>
                  <button style={S.link} onClick={() => openEdit(c)}>Sửa</button>
                  <button style={S.link} onClick={() => del(c.id)}>Xóa</button>
                  <button style={S.link} onClick={() => goMembers(c.id)}>Thành viên</button>
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={7} style={{ ...S.td, textAlign: "center" }}>Không có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <Popup title={editId ? "Sửa CLB" : "Thêm CLB"} onClose={() => setForm(null)}>
          {([["Ảnh (emoji)", "avatar"], ["Tên CLB", "name"], ["Chủ nhiệm", "director"], ["Ngày thành lập", "foundedDate"]] as [string, keyof Club][]).map(([lbl, k]) => (
            <div style={S.row} key={k}>
              <label style={S.label}>{lbl}</label>
              <input style={{ ...S.input, flex: 1 }} type={k === "foundedDate" ? "date" : "text"} value={(form as any)[k] || ""} onChange={e => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <div style={S.row}>
            <label style={S.label}>Mô tả (HTML)</label>
            <textarea style={{ ...S.input, flex: 1 }} rows={3} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={S.row}>
            <label style={S.label}>Hoạt động</label>
            <input type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button style={S.btn} onClick={save}>Lưu</button>
            <button style={S.btn} onClick={() => setForm(null)}>Hủy</button>
          </div>
        </Popup>
      )}
    </div>
  );
}

// ─── Registration Tab ─────────────────────────────────────────────────────────
function RegTab({ regs, setRegs, clubs }: { regs: Registration[]; setRegs: (r: Registration[]) => void; clubs: Club[] }) {
  const [sel, setSel] = useState<number[]>([]);
  const [form, setForm] = useState<Partial<Registration> | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Registration | null>(null);
  const [rejectFor, setRejectFor] = useState<number[] | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [histFor, setHistFor] = useState<Registration | null>(null);
  const [fs, setFs] = useState("all");

  const list = regs.filter(r => fs === "all" || r.status === fs);
  const toggleSel = (id: number) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSel(sel.length === list.length ? [] : list.map(r => r.id));

  const approve = (ids: number[]) => {
    setRegs(regs.map(r => ids.includes(r.id) ? { ...r, status: "Approved", history: [...r.history, { action: "Approved", at: nowStr() }] } : r));
    setSel([]);
  };
  const openReject = (ids: number[]) => { setRejectReason(""); setRejectFor(ids); };
  const doReject = () => {
    if (!rejectReason.trim()) return alert("Nhập lý do");
    setRegs(regs.map(r => rejectFor!.includes(r.id) ? { ...r, status: "Rejected", note: rejectReason, history: [...r.history, { action: "Rejected", at: nowStr(), reason: rejectReason }] } : r));
    setSel([]); setRejectFor(null);
  };
  const openAdd = () => { setForm({ gender: "Nam", status: "Pending", name: "", email: "", phone: "", address: "", skills: "", reason: "", clubId: undefined, note: "" }); setEditId(null); };
  const openEdit = (r: Registration) => { setForm({ ...r }); setEditId(r.id); };
  const save = () => {
    if (!form?.name || !form?.email) return alert("Nhập tên và email");
    if (editId) setRegs(regs.map(r => r.id === editId ? { ...r, ...form } as Registration : r));
    else setRegs([...regs, { ...form, id: Date.now(), history: [] } as Registration]);
    setForm(null);
  };
  const del = (id: number) => { if (window.confirm("Xóa?")) setRegs(regs.filter(r => r.id !== id)); };

  return (
    <div style={S.page}>
      <h2 style={S.h2}>Quản lý đơn đăng ký</h2>
      <div style={S.toolbar}>
        <select style={S.input} value={fs} onChange={e => setFs(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        {sel.length > 0 && <>
          <button style={S.btn} onClick={() => approve(sel)}>Duyệt {sel.length} đơn</button>
          <button style={S.btn} onClick={() => openReject(sel)}>Từ chối {sel.length} đơn</button>
        </>}
        <button style={S.btn} onClick={openAdd}>Thêm mới</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}><input type="checkbox" onChange={toggleAll} checked={sel.length === list.length && list.length > 0} /></th>
              {["Họ tên", "Email", "SĐT", "Giới tính", "CLB", "Trạng thái", "Ghi chú", "Thao tác"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td style={S.td}><input type="checkbox" checked={sel.includes(r.id)} onChange={() => toggleSel(r.id)} /></td>
                <td style={S.td}>{r.name}</td>
                <td style={S.td}>{r.email}</td>
                <td style={S.td}>{r.phone}</td>
                <td style={S.td}>{r.gender}</td>
                <td style={S.td}>{cname(clubs, r.clubId)}</td>
                <td style={S.td}>{r.status}</td>
                <td style={S.td}>{r.note}</td>
                <td style={S.td}>
                  <button style={S.link} onClick={() => setDetail(r)}>Chi tiết</button>
                  <button style={S.link} onClick={() => openEdit(r)}>Sửa</button>
                  <button style={S.link} onClick={() => del(r.id)}>Xóa</button>
                  {r.status === "Pending" && <>
                    <button style={S.link} onClick={() => approve([r.id])}>Duyệt</button>
                    <button style={S.link} onClick={() => openReject([r.id])}>Từ chối</button>
                  </>}
                  <button style={S.link} onClick={() => setHistFor(r)}>Lịch sử</button>
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={9} style={{ ...S.td, textAlign: "center" }}>Không có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>

      {detail && (
        <Popup title="Chi tiết" onClose={() => setDetail(null)}>
          <table style={S.table}>
            {([["Họ tên", detail.name], ["Email", detail.email], ["SĐT", detail.phone], ["Giới tính", detail.gender],
              ["Địa chỉ", detail.address], ["Sở trường", detail.skills], ["CLB", cname(clubs, detail.clubId)],
              ["Lý do", detail.reason], ["Trạng thái", detail.status], ["Ghi chú", detail.note]] as [string, string][]).map(([k, v]) => (
              <tr key={k}><td style={{ ...S.td, fontWeight: "bold", width: 90 }}>{k}</td><td style={S.td}>{v}</td></tr>
            ))}
          </table>
        </Popup>
      )}

      {histFor && (
        <Popup title={`Lịch sử: ${histFor.name}`} onClose={() => setHistFor(null)}>
          {!histFor.history.length ? <p>Chưa có lịch sử.</p> :
            histFor.history.map((h, i) => (
              <div key={i} style={{ borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 4 }}>
                Admin đã <b>{h.action}</b> vào {h.at}{h.reason && <span> — Lý do: {h.reason}</span>}
              </div>
            ))
          }
        </Popup>
      )}

      {rejectFor && (
        <Popup title="Từ chối đơn" onClose={() => setRejectFor(null)}>
          <p style={{ marginBottom: 6 }}>Lý do từ chối (bắt buộc):</p>
          <textarea style={{ ...S.input, width: "100%" }} rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
            <button style={S.btn} onClick={doReject}>Xác nhận</button>
            <button style={S.btn} onClick={() => setRejectFor(null)}>Hủy</button>
          </div>
        </Popup>
      )}

      {form && (
        <Popup title={editId ? "Sửa đơn" : "Thêm đơn"} onClose={() => setForm(null)}>
          {([["Họ tên", "name"], ["Email", "email"], ["SĐT", "phone"], ["Địa chỉ", "address"], ["Sở trường", "skills"], ["Lý do", "reason"]] as [string, keyof Registration][]).map(([lbl, k]) => (
            <div style={S.row} key={k}>
              <label style={S.label}>{lbl}</label>
              <input style={{ ...S.input, flex: 1 }} value={(form as any)[k] || ""} onChange={e => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <div style={S.row}>
            <label style={S.label}>Giới tính</label>
            <select style={{ ...S.input, flex: 1 }} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as any })}>
              {["Nam", "Nữ", "Khác"].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div style={S.row}>
            <label style={S.label}>CLB</label>
            <select style={{ ...S.input, flex: 1 }} value={form.clubId || ""} onChange={e => setForm({ ...form, clubId: Number(e.target.value) })}>
              <option value="">-- Chọn --</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={S.row}>
            <label style={S.label}>Trạng thái</label>
            <select style={{ ...S.input, flex: 1 }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
              {["Pending", "Approved", "Rejected"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button style={S.btn} onClick={save}>Lưu</button>
            <button style={S.btn} onClick={() => setForm(null)}>Hủy</button>
          </div>
        </Popup>
      )}
    </div>
  );
}

// ─── Member Tab ───────────────────────────────────────────────────────────────
function MemberTab({ regs, setRegs, clubs, initClub }: { regs: Registration[]; setRegs: (r: Registration[]) => void; clubs: Club[]; initClub: number | null }) {
  const [fc, setFc] = useState<number | "all">(initClub || "all");
  const [sel, setSel] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [target, setTarget] = useState<number | "">("");

  const members = regs.filter(r => r.status === "Approved" && (fc === "all" || r.clubId === fc));
  const toggleSel = (id: number) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSel(sel.length === members.length ? [] : members.map(m => m.id));
  const doChange = () => {
    if (!target) return alert("Chọn CLB");
    setRegs(regs.map(r => sel.includes(r.id) ? { ...r, clubId: Number(target) } : r));
    setSel([]); setShowModal(false);
  };

  return (
    <div style={S.page}>
      <h2 style={S.h2}>Danh sách thành viên</h2>
      <div style={S.toolbar}>
        <select style={S.input} value={fc} onChange={e => setFc(e.target.value === "all" ? "all" : Number(e.target.value))}>
          <option value="all">Tất cả CLB</option>
          {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {sel.length > 0 && <button style={S.btn} onClick={() => setShowModal(true)}>Đổi CLB ({sel.length} người)</button>}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}><input type="checkbox" onChange={toggleAll} checked={sel.length === members.length && members.length > 0} /></th>
              {["Họ tên", "Email", "SĐT", "Giới tính", "Địa chỉ", "Sở trường", "CLB"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td style={S.td}><input type="checkbox" checked={sel.includes(m.id)} onChange={() => toggleSel(m.id)} /></td>
                <td style={S.td}>{m.name}</td>
                <td style={S.td}>{m.email}</td>
                <td style={S.td}>{m.phone}</td>
                <td style={S.td}>{m.gender}</td>
                <td style={S.td}>{m.address}</td>
                <td style={S.td}>{m.skills}</td>
                <td style={S.td}>{cname(clubs, m.clubId)}</td>
              </tr>
            ))}
            {!members.length && <tr><td colSpan={8} style={{ ...S.td, textAlign: "center" }}>Không có thành viên</td></tr>}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Popup title={`Đổi CLB cho ${sel.length} thành viên`} onClose={() => setShowModal(false)}>
          <div style={S.row}>
            <label style={S.label}>CLB mới</label>
            <select style={{ ...S.input, flex: 1 }} value={target} onChange={e => setTarget(Number(e.target.value))}>
              <option value="">-- Chọn --</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button style={S.btn} onClick={doChange}>Xác nhận</button>
            <button style={S.btn} onClick={() => setShowModal(false)}>Hủy</button>
          </div>
        </Popup>
      )}
    </div>
  );
}

// ─── Report Tab ───────────────────────────────────────────────────────────────
function ReportTab({ regs, clubs }: { regs: Registration[]; clubs: Club[] }) {
  const stats = {
    total: clubs.length,
    pending: regs.filter(r => r.status === "Pending").length,
    approved: regs.filter(r => r.status === "Approved").length,
    rejected: regs.filter(r => r.status === "Rejected").length,
  };
  const chartData = clubs.map(c => ({
    name: c.name,
    Pending: regs.filter(r => r.clubId === c.id && r.status === "Pending").length,
    Approved: regs.filter(r => r.clubId === c.id && r.status === "Approved").length,
    Rejected: regs.filter(r => r.clubId === c.id && r.status === "Rejected").length,
  }));

  return (
    <div style={S.page}>
      <h2 style={S.h2}>Báo cáo thống kê</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={S.statBox}><b>Số CLB:</b> {stats.total}</div>
        <div style={S.statBox}><b>Pending:</b> {stats.pending}</div>
        <div style={S.statBox}><b>Approved:</b> {stats.approved}</div>
        <div style={S.statBox}><b>Rejected:</b> {stats.rejected}</div>
      </div>
      <p style={{ marginBottom: 6 }}><b>Số đơn theo từng CLB:</b></p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Pending" fill="#aaa" />
          <Bar dataKey="Approved" fill="#555" />
          <Bar dataKey="Rejected" fill="#222" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
const TABS = ["Câu lạc bộ", "Đơn đăng ký", "Thành viên", "Báo cáo"];

export default function App() {
  const [tab, setTab] = useState(0);
  const [clubs, setClubs] = useState<Club[]>(CLUBS0);
  const [regs, setRegs] = useState<Registration[]>(REGS0);
  const [memberClub, setMemberClub] = useState<number | null>(null);

  const goMembers = (id: number) => { setMemberClub(id); setTab(2); };

  return (
    <div style={{ padding: 8, fontFamily: "Arial, sans-serif", fontSize: 13 }}>
      <div style={{ borderBottom: "2px solid #000", paddingBottom: 4, marginBottom: 8 }}>
        <b style={{ fontSize: 15 }}>🏫 Quản lý Câu lạc bộ</b>
      </div>
      <div style={{ display: "flex", gap: 0, marginBottom: 8 }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            style={{ border: "1px solid #888", background: tab === i ? "#fff" : "#eee", padding: "3px 10px", marginRight: 2, cursor: "pointer", fontWeight: tab === i ? "bold" : "normal", fontSize: 13 }}>
            {t}
          </button>
        ))}
      </div>
      {tab === 0 && <ClubTab clubs={clubs} setClubs={setClubs} goMembers={goMembers} />}
      {tab === 1 && <RegTab regs={regs} setRegs={setRegs} clubs={clubs} />}
      {tab === 2 && <MemberTab regs={regs} setRegs={setRegs} clubs={clubs} initClub={memberClub} />}
      {tab === 3 && <ReportTab regs={regs} clubs={clubs} />}
    </div>
  );
}