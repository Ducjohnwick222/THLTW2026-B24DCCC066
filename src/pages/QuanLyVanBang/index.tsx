import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SoVanBang { id: number; nam: number; ten: string }
interface QuyetDinh { id: number; soQD: string; ngay: string; trichYeu: string; soId: number; luot: number }
interface TruongCauHinh { id: number; ten: string; kieu: "text" | "number" | "date" }
interface VanBang { id: number; soVaoSo: number; soHieu: string; maSV: string; hoTen: string; ngaySinh: string; qdId: number; extra: Record<string, string> }

// ── Dữ liệu mẫu ────────────────────────────────────────────────────────────────
const mauSo: SoVanBang[] = [{ id: 1, nam: 2025, ten: "Sổ VB 2025" }];
const mauQD: QuyetDinh[] = [
  { id: 1, soQD: "QĐ-01/2025", ngay: "2025-03-15", trichYeu: "TN đợt 1/2025", soId: 1, luot: 3 },
  { id: 2, soQD: "QĐ-02/2025", ngay: "2025-08-20", trichYeu: "TN đợt 2/2025", soId: 1, luot: 1 },
];
const mauTruong: TruongCauHinh[] = [
  { id: 1, ten: "Dân tộc", kieu: "text" },
  { id: 2, ten: "Điểm TB", kieu: "number" },
  { id: 3, ten: "Xếp hạng", kieu: "text" },
];
const mauVB: VanBang[] = [
  { id: 1, soVaoSo: 1, soHieu: "VB-001", maSV: "SV001", hoTen: "Nguyễn Văn An", ngaySinh: "2002-05-10", qdId: 1, extra: { "Dân tộc": "Kinh", "Điểm TB": "3.5", "Xếp hạng": "Giỏi" } },
  { id: 2, soVaoSo: 2, soHieu: "VB-002", maSV: "SV002", hoTen: "Trần Thị Bình", ngaySinh: "2001-11-22", qdId: 1, extra: { "Dân tộc": "Kinh", "Điểm TB": "3.8", "Xếp hạng": "Xuất sắc" } },
];

const nextId = (arr: { id: number }[]) => (arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1);

// ── Helpers UI ─────────────────────────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>{label}</div>
    {children}
  </div>
);
const inp: React.CSSProperties = { border: "1px solid #ccc", borderRadius: 3, padding: "5px 8px", fontSize: 13, width: "100%", boxSizing: "border-box" };
const btn = (color = "#333"): React.CSSProperties => ({ background: color, color: "#fff", border: "none", borderRadius: 3, padding: "5px 12px", cursor: "pointer", fontSize: 13 });
const card: React.CSSProperties = { border: "1px solid #ddd", borderRadius: 6, padding: 14, marginBottom: 14 };
const TH = ({ children }: { children?: React.ReactNode }) => <th style={{ textAlign: "left", padding: "6px 10px", background: "#f5f5f5", fontSize: 12 }}>{children}</th>;
const TD = ({ children }: { children?: React.ReactNode }) => <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>{children}</td>;

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);
  const [soList, setSoList] = useState(mauSo);
  const [qdList, setQdList] = useState(mauQD);
  const [truongList, setTruongList] = useState(mauTruong);
  const [vbList, setVbList] = useState(mauVB);

  const tabs = ["Sổ Văn Bằng", "Quyết Định", "Cấu Hình", "Văn Bằng", "Tra Cứu"];

  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 14, padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>🎓 Quản Lý Văn Bằng Tốt Nghiệp</h2>
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "2px solid #ddd" }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding: "6px 14px", border: "none", cursor: "pointer", background: "none",
            fontWeight: tab === i ? 700 : 400,
            borderBottom: tab === i ? "3px solid #333" : "3px solid transparent",
            fontSize: 13,
          }}>{t}</button>
        ))}
      </div>
      {tab === 0 && <TabSo soList={soList} setSoList={setSoList} />}
      {tab === 1 && <TabQD qdList={qdList} setQdList={setQdList} soList={soList} vbList={vbList} />}
      {tab === 2 && <TabCauHinh truongList={truongList} setTruongList={setTruongList} />}
      {tab === 3 && <TabVanBang vbList={vbList} setVbList={setVbList} qdList={qdList} truongList={truongList} />}
      {tab === 4 && <TabTraCuu vbList={vbList} qdList={qdList} setQdList={setQdList} soList={soList} />}
    </div>
  );
}

// ── Tab: Sổ Văn Bằng ──────────────────────────────────────────────────────────
function TabSo({ soList, setSoList }: { soList: SoVanBang[]; setSoList: (v: SoVanBang[]) => void }) {
  const [nam, setNam] = useState(String(new Date().getFullYear()));
  const [ten, setTen] = useState("");
  const [err, setErr] = useState("");

  const them = () => {
    if (!ten.trim()) return setErr("Nhập tên sổ");
    if (soList.find(s => s.nam === +nam)) return setErr("Năm đã có sổ");
    setSoList([...soList, { id: nextId(soList), nam: +nam, ten }]);
    setTen(""); setErr("");
  };

  return (
    <div>
      <div style={card}>
        <b>Thêm sổ mới</b>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <div style={{ width: 80 }}><Field label="Năm"><input style={inp} type="number" value={nam} onChange={e => setNam(e.target.value)} /></Field></div>
          <div style={{ flex: 1, minWidth: 180 }}><Field label="Tên sổ"><input style={inp} value={ten} onChange={e => setTen(e.target.value)} placeholder="Sổ VB năm..." /></Field></div>
          <div style={{ paddingTop: 20 }}><button style={btn()} onClick={them}>Thêm</button></div>
        </div>
        {err && <div style={{ color: "red", fontSize: 12 }}>{err}</div>}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><TH>Năm</TH><TH>Tên sổ</TH><TH></TH></tr></thead>
        <tbody>{soList.map(s => (
          <tr key={s.id}>
            <TD><b>{s.nam}</b></TD>
            <TD>{s.ten}</TD>
            <TD><button style={btn("#c0392b")} onClick={() => setSoList(soList.filter(x => x.id !== s.id))}>Xóa</button></TD>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ── Tab: Quyết Định ────────────────────────────────────────────────────────────
function TabQD({ qdList, setQdList, soList, vbList }: { qdList: QuyetDinh[]; setQdList: (v: QuyetDinh[]) => void; soList: SoVanBang[]; vbList: VanBang[] }) {
  const empty = { soQD: "", ngay: "", trichYeu: "", soId: soList[0]?.id ?? 0 };
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");

  const them = () => {
    if (!form.soQD || !form.ngay || !form.trichYeu) return setErr("Điền đầy đủ thông tin");
    setQdList([...qdList, { id: nextId(qdList), ...form, luot: 0 }]);
    setForm(empty); setErr("");
  };
  const xoa = (id: number) => {
    if (vbList.some(v => v.qdId === id)) return alert("Còn văn bằng thuộc quyết định này!");
    setQdList(qdList.filter(q => q.id !== id));
  };

  return (
    <div>
      <div style={card}>
        <b>Thêm quyết định</b>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <div style={{ width: 130 }}><Field label="Số QĐ"><input style={inp} value={form.soQD} onChange={e => setForm({ ...form, soQD: e.target.value })} placeholder="QĐ-01/2025" /></Field></div>
          <div style={{ width: 140 }}><Field label="Ngày ban hành"><input style={inp} type="date" value={form.ngay} onChange={e => setForm({ ...form, ngay: e.target.value })} /></Field></div>
          <div style={{ flex: 1, minWidth: 180 }}><Field label="Trích yếu"><input style={inp} value={form.trichYeu} onChange={e => setForm({ ...form, trichYeu: e.target.value })} /></Field></div>
          <div style={{ width: 150 }}><Field label="Sổ văn bằng">
            <select style={inp} value={form.soId} onChange={e => setForm({ ...form, soId: +e.target.value })}>
              {soList.map(s => <option key={s.id} value={s.id}>{s.ten}</option>)}
            </select>
          </Field></div>
          <div style={{ paddingTop: 20 }}><button style={btn()} onClick={them}>Thêm</button></div>
        </div>
        {err && <div style={{ color: "red", fontSize: 12 }}>{err}</div>}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><TH>Số QĐ</TH><TH>Ngày</TH><TH>Trích yếu</TH><TH>Sổ VB</TH><TH>Lượt TC</TH><TH></TH></tr></thead>
        <tbody>{qdList.map(q => (
          <tr key={q.id}>
            <TD><b>{q.soQD}</b></TD>
            <TD>{q.ngay}</TD>
            <TD>{q.trichYeu}</TD>
            <TD>{soList.find(s => s.id === q.soId)?.ten}</TD>
            <TD>{q.luot}</TD>
            <TD><button style={btn("#c0392b")} onClick={() => xoa(q.id)}>Xóa</button></TD>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ── Tab: Cấu Hình ──────────────────────────────────────────────────────────────
function TabCauHinh({ truongList, setTruongList }: { truongList: TruongCauHinh[]; setTruongList: (v: TruongCauHinh[]) => void }) {
  const [ten, setTen] = useState("");
  const [kieu, setKieu] = useState<TruongCauHinh["kieu"]>("text");
  const [err, setErr] = useState("");

  const them = () => {
    if (!ten.trim()) return setErr("Nhập tên trường");
    if (truongList.find(t => t.ten.toLowerCase() === ten.toLowerCase())) return setErr("Tên đã tồn tại");
    setTruongList([...truongList, { id: nextId(truongList), ten, kieu }]);
    setTen(""); setErr("");
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        Các trường mặc định (Số vào sổ, Số hiệu VB, Mã SV, Họ tên, Ngày sinh) không cần cấu hình ở đây.
      </div>
      <div style={card}>
        <b>Thêm trường thông tin bổ sung</b>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}><Field label="Tên trường"><input style={inp} value={ten} onChange={e => setTen(e.target.value)} placeholder="Dân tộc, Điểm TB..." /></Field></div>
          <div style={{ width: 170 }}><Field label="Kiểu dữ liệu">
            <select style={inp} value={kieu} onChange={e => setKieu(e.target.value as TruongCauHinh["kieu"])}>
              <option value="text">String (Văn bản)</option>
              <option value="number">Number (Số)</option>
              <option value="date">Date (Ngày)</option>
            </select>
          </Field></div>
          <div style={{ paddingTop: 20 }}><button style={btn()} onClick={them}>Thêm</button></div>
        </div>
        {err && <div style={{ color: "red", fontSize: 12 }}>{err}</div>}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><TH>#</TH><TH>Tên trường</TH><TH>Kiểu</TH><TH></TH></tr></thead>
        <tbody>{truongList.map((t, i) => (
          <tr key={t.id}>
            <TD>{i + 1}</TD>
            <TD>{t.ten}</TD>
            <TD>{t.kieu}</TD>
            <TD><button style={btn("#c0392b")} onClick={() => setTruongList(truongList.filter(x => x.id !== t.id))}>Xóa</button></TD>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ── Tab: Văn Bằng ──────────────────────────────────────────────────────────────
function TabVanBang({ vbList, setVbList, qdList, truongList }: { vbList: VanBang[]; setVbList: (v: VanBang[]) => void; qdList: QuyetDinh[]; truongList: TruongCauHinh[] }) {
  const mkEmpty = (): Omit<VanBang, "id" | "soVaoSo"> => ({ soHieu: "", maSV: "", hoTen: "", ngaySinh: "", qdId: qdList[0]?.id ?? 0, extra: {} });
  const [form, setForm] = useState(mkEmpty);
  const [show, setShow] = useState(false);
  const [detail, setDetail] = useState<VanBang | null>(null);
  const [err, setErr] = useState("");

  const nextSoVaoSo = (qdId: number) => {
    const qd = qdList.find(q => q.id === qdId);
    const same = vbList.filter(v => qdList.find(q => q.id === v.qdId)?.soId === qd?.soId);
    return same.length + 1;
  };

  const them = () => {
    if (!form.soHieu || !form.maSV || !form.hoTen || !form.ngaySinh) return setErr("Điền đủ các trường (*)");
    if (vbList.find(v => v.soHieu === form.soHieu)) return setErr("Số hiệu đã tồn tại");
    setVbList([...vbList, { id: nextId(vbList), soVaoSo: nextSoVaoSo(form.qdId), ...form }]);
    setForm(mkEmpty()); setShow(false); setErr("");
  };

  return (
    <div>
      <button style={{ ...btn(), marginBottom: 12 }} onClick={() => setShow(!show)}>
        {show ? "✕ Đóng" : "+ Thêm văn bằng"}
      </button>

      {show && (
        <div style={card}>
          <b>Thêm văn bằng mới</b>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <div style={{ width: 120 }}><Field label="Số hiệu VB *"><input style={inp} value={form.soHieu} onChange={e => setForm({ ...form, soHieu: e.target.value })} placeholder="VB-003" /></Field></div>
            <div style={{ width: 100 }}><Field label="Mã SV *"><input style={inp} value={form.maSV} onChange={e => setForm({ ...form, maSV: e.target.value })} /></Field></div>
            <div style={{ flex: 1, minWidth: 160 }}><Field label="Họ tên *"><input style={inp} value={form.hoTen} onChange={e => setForm({ ...form, hoTen: e.target.value })} /></Field></div>
            <div style={{ width: 140 }}><Field label="Ngày sinh *"><input style={inp} type="date" value={form.ngaySinh} onChange={e => setForm({ ...form, ngaySinh: e.target.value })} /></Field></div>
            <div style={{ width: 150 }}><Field label="Quyết định">
              <select style={inp} value={form.qdId} onChange={e => setForm({ ...form, qdId: +e.target.value })}>
                {qdList.map(q => <option key={q.id} value={q.id}>{q.soQD}</option>)}
              </select>
            </Field></div>
          </div>
          {truongList.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {truongList.map(t => (
                <div key={t.id} style={{ width: 140 }}>
                  <Field label={t.ten}>
                    <input style={inp} type={t.kieu} value={form.extra[t.ten] ?? ""} onChange={e => setForm({ ...form, extra: { ...form.extra, [t.ten]: e.target.value } })} />
                  </Field>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button style={btn()} onClick={them}>Lưu</button>
            <button style={btn("#888")} onClick={() => { setShow(false); setErr(""); }}>Hủy</button>
          </div>
          {err && <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>{err}</div>}
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><TH>Số vào sổ</TH><TH>Số hiệu</TH><TH>Mã SV</TH><TH>Họ tên</TH><TH>Ngày sinh</TH><TH>QĐ</TH><TH></TH></tr></thead>
        <tbody>{vbList.map(vb => (
          <tr key={vb.id}>
            <TD>{vb.soVaoSo}</TD>
            <TD>{vb.soHieu}</TD>
            <TD>{vb.maSV}</TD>
            <TD>{vb.hoTen}</TD>
            <TD>{vb.ngaySinh}</TD>
            <TD>{qdList.find(q => q.id === vb.qdId)?.soQD}</TD>
            <TD>
              <span style={{ display: "flex", gap: 4 }}>
                <button style={btn("#555")} onClick={() => setDetail(vb)}>Chi tiết</button>
                <button style={btn("#c0392b")} onClick={() => setVbList(vbList.filter(v => v.id !== vb.id))}>Xóa</button>
              </span>
            </TD>
          </tr>
        ))}</tbody>
      </table>

      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
          <div style={{ ...card, width: 440, maxHeight: "80vh", overflowY: "auto", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <b>Chi tiết: {detail.hoTen}</b>
              <button style={btn("#888")} onClick={() => setDetail(null)}>✕</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {([["Số vào sổ", detail.soVaoSo], ["Số hiệu VB", detail.soHieu], ["Mã SV", detail.maSV], ["Họ tên", detail.hoTen], ["Ngày sinh", detail.ngaySinh], ["QĐ", qdList.find(q => q.id === detail.qdId)?.soQD], ...Object.entries(detail.extra)] as [string, unknown][]).map(([k, v], i) => (
                  <tr key={i}>
                    <td style={{ padding: "5px 8px", fontWeight: 600, color: "#555", width: 150, borderBottom: "1px solid #eee" }}>{k}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #eee" }}>{String(v ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Tra Cứu ───────────────────────────────────────────────────────────────
function TabTraCuu({ vbList, qdList, setQdList, soList }: { vbList: VanBang[]; qdList: QuyetDinh[]; setQdList: (v: QuyetDinh[]) => void; soList: SoVanBang[] }) {
  const [p, setP] = useState({ soHieu: "", soVaoSo: "", maSV: "", hoTen: "", ngaySinh: "" });
  const [results, setResults] = useState<VanBang[] | null>(null);
  const [detail, setDetail] = useState<VanBang | null>(null);
  const [err, setErr] = useState("");

  const soTham = Object.values(p).filter(v => v.trim()).length;

  const timKiem = () => {
    if (soTham < 2) return setErr("Nhập ít nhất 2 tham số");
    setErr("");
    const res = vbList.filter(vb => {
      if (p.soHieu && !vb.soHieu.toLowerCase().includes(p.soHieu.toLowerCase())) return false;
      if (p.soVaoSo && vb.soVaoSo !== +p.soVaoSo) return false;
      if (p.maSV && !vb.maSV.toLowerCase().includes(p.maSV.toLowerCase())) return false;
      if (p.hoTen && !vb.hoTen.toLowerCase().includes(p.hoTen.toLowerCase())) return false;
      if (p.ngaySinh && vb.ngaySinh !== p.ngaySinh) return false;
      return true;
    });
    setResults(res);
    const qdIds = [...new Set(res.map(v => v.qdId))];
    setQdList(qdList.map(q => qdIds.includes(q.id) ? { ...q, luot: q.luot + 1 } : q));
  };

  const qd = (id: number) => qdList.find(q => q.id === id);
  const so = (qdId: number) => soList.find(s => s.id === qd(qdId)?.soId);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16 }}>
      <div>
        <div style={card}>
          <b>Tìm kiếm văn bằng</b>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Nhập ít nhất 2 trong 5 tham số</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ width: 130 }}><Field label="Số hiệu VB"><input style={inp} value={p.soHieu} onChange={e => setP({ ...p, soHieu: e.target.value })} /></Field></div>
            <div style={{ width: 90 }}><Field label="Số vào sổ"><input style={inp} type="number" value={p.soVaoSo} onChange={e => setP({ ...p, soVaoSo: e.target.value })} /></Field></div>
            <div style={{ width: 100 }}><Field label="Mã SV"><input style={inp} value={p.maSV} onChange={e => setP({ ...p, maSV: e.target.value })} /></Field></div>
            <div style={{ flex: 1, minWidth: 150 }}><Field label="Họ tên"><input style={inp} value={p.hoTen} onChange={e => setP({ ...p, hoTen: e.target.value })} /></Field></div>
            <div style={{ width: 140 }}><Field label="Ngày sinh"><input style={inp} type="date" value={p.ngaySinh} onChange={e => setP({ ...p, ngaySinh: e.target.value })} /></Field></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <button style={btn()} onClick={timKiem}>Tìm kiếm</button>
            <button style={btn("#888")} onClick={() => { setP({ soHieu: "", soVaoSo: "", maSV: "", hoTen: "", ngaySinh: "" }); setResults(null); setErr(""); }}>Xóa</button>
            <span style={{ fontSize: 12, color: soTham >= 2 ? "green" : "orange" }}>{soTham}/5 tham số</span>
          </div>
          {err && <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>{err}</div>}
        </div>

        {results !== null && (
          <div style={card}>
            <b>Kết quả: {results.length} văn bằng</b>
            {results.length === 0
              ? <div style={{ color: "#888", marginTop: 8, fontSize: 13 }}>Không tìm thấy.</div>
              : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                  <thead><tr><TH>Số vào sổ</TH><TH>Số hiệu</TH><TH>Mã SV</TH><TH>Họ tên</TH><TH>QĐ</TH><TH></TH></tr></thead>
                  <tbody>{results.map(vb => (
                    <tr key={vb.id}>
                      <TD>{vb.soVaoSo}</TD><TD>{vb.soHieu}</TD><TD>{vb.maSV}</TD><TD>{vb.hoTen}</TD>
                      <TD>{qd(vb.qdId)?.soQD}</TD>
                      <TD><button style={btn("#555")} onClick={() => setDetail(vb)}>Chi tiết</button></TD>
                    </tr>
                  ))}</tbody>
                </table>
              )}
          </div>
        )}
      </div>

      <div style={card}>
        <b>Lượt tra cứu / QĐ</b>
        <div style={{ marginTop: 10 }}>
          {qdList.map(q => {
            const max = Math.max(...qdList.map(x => x.luot), 1);
            return (
              <div key={q.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{q.soQD}</div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>{q.trichYeu}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, background: "#eee", borderRadius: 3, height: 6 }}>
                    <div style={{ width: `${(q.luot / max) * 100}%`, background: "#333", height: "100%", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16 }}>{q.luot}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
          <div style={{ ...card, width: 440, maxHeight: "80vh", overflowY: "auto", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <b>Chi tiết: {detail.hoTen}</b>
              <button style={btn("#888")} onClick={() => setDetail(null)}>✕</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {([
                  ["Số vào sổ", detail.soVaoSo],
                  ["Số hiệu VB", detail.soHieu],
                  ["Mã SV", detail.maSV],
                  ["Họ tên", detail.hoTen],
                  ["Ngày sinh", detail.ngaySinh],
                  ["Quyết định TN", qd(detail.qdId)?.soQD],
                  ["Ngày ban hành", qd(detail.qdId)?.ngay],
                  ["Trích yếu", qd(detail.qdId)?.trichYeu],
                  ["Sổ văn bằng", so(detail.qdId)?.ten],
                  ...Object.entries(detail.extra).filter(([, v]) => v),
                ] as [string, unknown][]).map(([k, v], i) => (
                  <tr key={i}>
                    <td style={{ padding: "5px 8px", fontWeight: 600, color: "#555", width: 150, borderBottom: "1px solid #eee" }}>{k}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #eee" }}>{String(v ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}