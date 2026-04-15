import { useState } from "react";

const NGUOI_PHU_TRACH = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D"];
const LOAI_PHONG = ["Lý thuyết", "Thực hành", "Hội trường"];

const initialData = [
  { maPhong: "P101", tenPhong: "Phòng 101", soChoNgoi: 40, loaiPhong: "Lý thuyết", nguoiPhuTrach: "Nguyễn Văn A" },
  { maPhong: "P102", tenPhong: "Phòng 102", soChoNgoi: 25, loaiPhong: "Thực hành", nguoiPhuTrach: "Trần Thị B" },
  { maPhong: "P201", tenPhong: "Hội trường lớn", soChoNgoi: 150, loaiPhong: "Hội trường", nguoiPhuTrach: "Lê Văn C" },
  { maPhong: "P103", tenPhong: "Phòng máy tính", soChoNgoi: 20, loaiPhong: "Thực hành", nguoiPhuTrach: "Phạm Thị D" },
  { maPhong: "P202", tenPhong: "Phòng 202", soChoNgoi: 15, loaiPhong: "Lý thuyết", nguoiPhuTrach: "Nguyễn Văn A" },
];

const emptyForm = { maPhong: "", tenPhong: "", soChoNgoi: "", loaiPhong: "", nguoiPhuTrach: "" };

export default function QuanLyPhongHoc() {
  const [danhSach, setDanhSach] = useState(initialData);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editMa, setEditMa] = useState(null); // null = thêm mới, string = đang sửa
  const [showForm, setShowForm] = useState(false);
  const [xoaPhong, setXoaPhong] = useState(null); // phòng đang chờ xác nhận xóa

  // Bộ lọc & sắp xếp
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState("");
  const [filterNguoi, setFilterNguoi] = useState("");
  const [sortAsc, setSortAsc] = useState(null); // null, true, false

  // ---- Lọc + tìm kiếm + sắp xếp ----
  let hienThi = danhSach.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.maPhong.toLowerCase().includes(q) || p.tenPhong.toLowerCase().includes(q);
    const matchLoai = filterLoai ? p.loaiPhong === filterLoai : true;
    const matchNguoi = filterNguoi ? p.nguoiPhuTrach === filterNguoi : true;
    return matchSearch && matchLoai && matchNguoi;
  });
  if (sortAsc === true) hienThi = [...hienThi].sort((a, b) => a.soChoNgoi - b.soChoNgoi);
  if (sortAsc === false) hienThi = [...hienThi].sort((a, b) => b.soChoNgoi - a.soChoNgoi);

  // ---- Validate ----
  function validate(f, currentMa) {
    const e = {};
    if (!f.maPhong.trim()) e.maPhong = "Không được để trống";
    else if (f.maPhong.length > 10) e.maPhong = "Tối đa 10 ký tự";
    else if (danhSach.some((p) => p.maPhong === f.maPhong.trim() && p.maPhong !== currentMa))
      e.maPhong = "Mã phòng đã tồn tại";

    if (!f.tenPhong.trim()) e.tenPhong = "Không được để trống";
    else if (f.tenPhong.length > 50) e.tenPhong = "Tối đa 50 ký tự";
    else if (danhSach.some((p) => p.tenPhong === f.tenPhong.trim() && p.maPhong !== currentMa))
      e.tenPhong = "Tên phòng đã tồn tại";

    if (!f.nguoiPhuTrach) e.nguoiPhuTrach = "Không được để trống";
    if (!f.loaiPhong) e.loaiPhong = "Không được để trống";

    const so = Number(f.soChoNgoi);
    if (!f.soChoNgoi) e.soChoNgoi = "Không được để trống";
    else if (isNaN(so) || !Number.isInteger(so)) e.soChoNgoi = "Phải là số nguyên";
    else if (so < 10) e.soChoNgoi = "Tối thiểu 10 chỗ";
    else if (so > 200) e.soChoNgoi = "Tối đa 200 chỗ";

    return e;
  }

  // ---- Mở form thêm ----
  function moFormThem() {
    setForm(emptyForm);
    setErrors({});
    setEditMa(null);
    setShowForm(true);
  }

  // ---- Mở form sửa ----
  function moFormSua(phong) {
    setForm({ ...phong, soChoNgoi: String(phong.soChoNgoi) });
    setErrors({});
    setEditMa(phong.maPhong);
    setShowForm(true);
  }

  // ---- Lưu ----
  function luuPhong() {
    const e = validate(form, editMa);
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const phongMoi = { ...form, soChoNgoi: Number(form.soChoNgoi) };
    if (editMa === null) {
      setDanhSach([...danhSach, phongMoi]);
    } else {
      setDanhSach(danhSach.map((p) => (p.maPhong === editMa ? phongMoi : p)));
    }
    setShowForm(false);
  }

  // ---- Xóa ----
  function yeuCauXoa(phong) {
    if (phong.soChoNgoi >= 30) {
      alert("Chỉ được xóa phòng có dưới 30 chỗ ngồi.");
      return;
    }
    setXoaPhong(phong);
  }

  function xacNhanXoa() {
    setDanhSach(danhSach.filter((p) => p.maPhong !== xoaPhong.maPhong));
    setXoaPhong(null);
  }

  // ---- UI ----
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 16 }}>Quản Lý Phòng Học</h2>

      {/* Thanh công cụ */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          placeholder="Tìm mã / tên phòng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 160, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 4 }}
        />
        <select value={filterLoai} onChange={(e) => setFilterLoai(e.target.value)}
          style={{ padding: "6px 8px", border: "1px solid #ccc", borderRadius: 4 }}>
          <option value="">-- Loại phòng --</option>
          {LOAI_PHONG.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select value={filterNguoi} onChange={(e) => setFilterNguoi(e.target.value)}
          style={{ padding: "6px 8px", border: "1px solid #ccc", borderRadius: 4 }}>
          <option value="">-- Người phụ trách --</option>
          {NGUOI_PHU_TRACH.map((n) => <option key={n}>{n}</option>)}
        </select>
        <button onClick={moFormThem}
          style={{ padding: "6px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          + Thêm phòng
        </button>
      </div>

      {/* Bảng danh sách */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            <th style={th}>Mã phòng</th>
            <th style={th}>Tên phòng</th>
            <th style={{ ...th, cursor: "pointer" }}
              onClick={() => setSortAsc(sortAsc === true ? false : true)}>
              Số chỗ {sortAsc === true ? "▲" : sortAsc === false ? "▼" : "⇅"}
            </th>
            <th style={th}>Loại phòng</th>
            <th style={th}>Người phụ trách</th>
            <th style={th}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {hienThi.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: "center", padding: 16, color: "#888" }}>Không có dữ liệu</td></tr>
          )}
          {hienThi.map((p) => (
            <tr key={p.maPhong} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={td}>{p.maPhong}</td>
              <td style={td}>{p.tenPhong}</td>
              <td style={td}>{p.soChoNgoi}</td>
              <td style={td}>{p.loaiPhong}</td>
              <td style={td}>{p.nguoiPhuTrach}</td>
              <td style={td}>
                <button onClick={() => moFormSua(p)}
                  style={{ marginRight: 6, padding: "3px 10px", border: "1px solid #2563eb", background: "#fff", color: "#2563eb", borderRadius: 4, cursor: "pointer" }}>
                  Sửa
                </button>
                <button onClick={() => yeuCauXoa(p)}
                  style={{ padding: "3px 10px", border: "1px solid #dc2626", background: "#fff", color: "#dc2626", borderRadius: 4, cursor: "pointer" }}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form thêm/sửa */}
      {showForm && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>{editMa === null ? "Thêm phòng học" : "Chỉnh sửa phòng học"}</h3>

            <Field label="Mã phòng" error={errors.maPhong}>
              <input value={form.maPhong} maxLength={10}
                onChange={(e) => setForm({ ...form, maPhong: e.target.value })}
                style={input(errors.maPhong)} disabled={editMa !== null} />
            </Field>

            <Field label="Tên phòng" error={errors.tenPhong}>
              <input value={form.tenPhong} maxLength={50}
                onChange={(e) => setForm({ ...form, tenPhong: e.target.value })}
                style={input(errors.tenPhong)} />
            </Field>

            <Field label="Số chỗ ngồi" error={errors.soChoNgoi}>
              <input type="number" value={form.soChoNgoi} min={10} max={200}
                onChange={(e) => setForm({ ...form, soChoNgoi: e.target.value })}
                style={input(errors.soChoNgoi)} />
            </Field>

            <Field label="Loại phòng" error={errors.loaiPhong}>
              <select value={form.loaiPhong}
                onChange={(e) => setForm({ ...form, loaiPhong: e.target.value })}
                style={input(errors.loaiPhong)}>
                <option value="">-- Chọn loại --</option>
                {LOAI_PHONG.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>

            <Field label="Người phụ trách" error={errors.nguoiPhuTrach}>
              <select value={form.nguoiPhuTrach}
                onChange={(e) => setForm({ ...form, nguoiPhuTrach: e.target.value })}
                style={input(errors.nguoiPhuTrach)}>
                <option value="">-- Chọn người --</option>
                {NGUOI_PHU_TRACH.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowForm(false)}
                style={{ padding: "6px 16px", border: "1px solid #ccc", background: "#fff", borderRadius: 4, cursor: "pointer" }}>
                Hủy
              </button>
              <button onClick={luuPhong}
                style={{ padding: "6px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Xác nhận xóa */}
      {xoaPhong && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth: 360 }}>
            <h3 style={{ marginTop: 0 }}>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa phòng <strong>{xoaPhong.tenPhong}</strong> ({xoaPhong.soChoNgoi} chỗ)?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setXoaPhong(null)}
                style={{ padding: "6px 16px", border: "1px solid #ccc", background: "#fff", borderRadius: 4, cursor: "pointer" }}>
                Hủy
              </button>
              <button onClick={xacNhanXoa}
                style={{ padding: "6px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Helper components & styles ----
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>{label}</label>
      {children}
      {error && <span style={{ color: "#dc2626", fontSize: 12 }}>{error}</span>}
    </div>
  );
}

const th = { padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 13 };
const td = { padding: "8px 10px" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 };
const modal = { background: "#fff", borderRadius: 8, padding: 24, width: "100%", maxWidth: 460 };
const input = (err) => ({ width: "100%", padding: "6px 8px", border: `1px solid ${err ? "#dc2626" : "#ccc"}`, borderRadius: 4, boxSizing: "border-box", fontSize: 14 });