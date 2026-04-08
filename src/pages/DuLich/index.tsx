import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  ResponsiveContainer, Legend
} from "recharts";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const DESTINATIONS_INIT = [
  { id: 1, name: "Hội An", type: "thành phố", location: "Quảng Nam", rating: 4.8, price: 1500000, description: "Phố cổ UNESCO với đèn lồng rực rỡ và kiến trúc độc đáo", visitTime: 2, foodCost: 300000, hotelCost: 500000, transportCost: 200000, popularity: 120 },
  { id: 2, name: "Đà Lạt", type: "núi", location: "Lâm Đồng", rating: 4.6, price: 2000000, description: "Thành phố ngàn hoa với khí hậu mát mẻ quanh năm", visitTime: 3, foodCost: 250000, hotelCost: 600000, transportCost: 300000, popularity: 98 },
  { id: 3, name: "Phú Quốc", type: "biển", location: "Kiên Giang", rating: 4.7, price: 3000000, description: "Đảo ngọc với bãi biển trong xanh và hải sản tươi ngon", visitTime: 4, foodCost: 400000, hotelCost: 800000, transportCost: 500000, popularity: 150 },
  { id: 4, name: "Sapa", type: "núi", location: "Lào Cai", rating: 4.5, price: 2500000, description: "Cao nguyên mờ sương với ruộng bậc thang kỳ vĩ", visitTime: 3, foodCost: 200000, hotelCost: 550000, transportCost: 400000, popularity: 85 },
  { id: 5, name: "Nha Trang", type: "biển", location: "Khánh Hòa", rating: 4.4, price: 2200000, description: "Bờ biển đẹp với các hòn đảo hoang sơ và lặn biển", visitTime: 3, foodCost: 350000, hotelCost: 650000, transportCost: 300000, popularity: 110 },
  { id: 6, name: "Hà Nội", type: "thành phố", location: "Hà Nội", rating: 4.3, price: 1800000, description: "Thủ đô nghìn năm văn hiến với ẩm thực đặc sắc", visitTime: 2, foodCost: 280000, hotelCost: 700000, transportCost: 100000, popularity: 200 },
  { id: 7, name: "Hạ Long", type: "biển", location: "Quảng Ninh", rating: 4.9, price: 3500000, description: "Vịnh đá vôi kỳ quan thiên nhiên thế giới", visitTime: 3, foodCost: 350000, hotelCost: 900000, transportCost: 400000, popularity: 180 },
  { id: 8, name: "Mù Cang Chải", type: "núi", location: "Yên Bái", rating: 4.4, price: 2000000, description: "Ruộng bậc thang đẹp nhất Việt Nam mùa lúa chín", visitTime: 2, foodCost: 180000, hotelCost: 400000, transportCost: 350000, popularity: 60 },
];

const MONTHLY_STATS = [
  { month: "T1", count: 45, revenue: 67500000 },
  { month: "T2", count: 52, revenue: 78000000 },
  { month: "T3", count: 61, revenue: 91500000 },
  { month: "T4", count: 78, revenue: 117000000 },
  { month: "T5", count: 95, revenue: 142500000 },
  { month: "T6", count: 120, revenue: 180000000 },
];

const TYPES = ["Tất cả", "biển", "núi", "thành phố"];
const BG_SHADES = ["#f5f5f5","#ebebeb","#e0e0e0","#d5d5d5","#cacaca","#bfbfbf","#b4b4b4","#aaaaaa"];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";
const stars = (r) => "★".repeat(Math.floor(r)) + (r % 1 >= 0.5 ? "☆" : "");

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  app: { fontFamily: "'Georgia', serif", color: "#000", background: "#fff", minHeight: "100vh" },
  header: { borderBottom: "2px solid #000", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, position: "sticky", top: 0, background: "#fff", zIndex: 100 },
  logo: { fontSize: 18, fontWeight: "bold", letterSpacing: 3, flexShrink: 0 },
  nav: { display: "flex", gap: 4, flexWrap: "wrap" },
  navBtn: (a) => ({ padding: "6px 14px", border: "1px solid #000", background: a ? "#000" : "#fff", color: a ? "#fff" : "#000", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }),
  page: { padding: "20px", maxWidth: 1200, margin: "0 auto" },
  h1: { fontSize: 22, fontWeight: "bold", marginBottom: 16, borderBottom: "2px solid #000", paddingBottom: 8 },
  h2: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  card: { border: "1px solid #000", overflow: "hidden", display: "flex", flexDirection: "column" },
  cardImg: (i) => ({ background: BG_SHADES[i % BG_SHADES.length], height: 130, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#444", letterSpacing: 1 }),
  cardBody: { padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 },
  btn: { padding: "6px 14px", border: "1px solid #000", background: "#000", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  btnOut: { padding: "6px 14px", border: "1px solid #000", background: "#fff", color: "#000", cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  btnSm: { padding: "3px 10px", border: "1px solid #000", background: "#000", color: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  btnSmOut: { padding: "3px 10px", border: "1px solid #000", background: "#fff", color: "#000", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  input: { border: "1px solid #000", padding: "6px 10px", fontSize: 13, fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none" },
  select: { border: "1px solid #000", padding: "6px 10px", fontSize: 13, background: "#fff", fontFamily: "inherit", outline: "none" },
  label: { fontSize: 12, fontWeight: "bold", display: "block", marginBottom: 3 },
  filterBar: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20, padding: "12px 16px", border: "1px solid #000", alignItems: "flex-end" },
  tag: { fontSize: 11, border: "1px solid #000", padding: "2px 6px", display: "inline-block" },
  tagFilled: { fontSize: 11, border: "1px solid #000", padding: "2px 6px", display: "inline-block", background: "#000", color: "#fff" },
  row: { display: "flex", gap: 16, flexWrap: "wrap" },
  statCard: { border: "2px solid #000", padding: "16px 20px", textAlign: "center", flex: 1, minWidth: 130 },
  alertWarn: { border: "2px solid #000", background: "#000", color: "#fff", padding: "12px 16px", marginBottom: 12, fontSize: 14 },
  alertOk: { border: "2px solid #000", background: "#fff", color: "#000", padding: "12px 16px", marginBottom: 12, fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { border: "1px solid #000", padding: "8px 10px", background: "#000", color: "#fff", textAlign: "left", fontWeight: "bold" },
  td: { border: "1px solid #000", padding: "8px 10px", verticalAlign: "top" },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modalBox: { background: "#fff", border: "2px solid #000", padding: 24, maxWidth: 500, width: "92%", maxHeight: "85vh", overflowY: "auto" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function HomePage({ destinations, onAdd }) {
  const [filterType, setFilterType] = useState("Tất cả");
  const [filterRating, setFilterRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sortBy, setSortBy] = useState("rating");

  const filtered = useMemo(() => {
    return destinations
      .filter(d => filterType === "Tất cả" || d.type === filterType)
      .filter(d => d.rating >= filterRating)
      .filter(d => d.price <= maxPrice)
      .sort((a, b) => sortBy === "rating" ? b.rating - a.rating : sortBy === "price_asc" ? a.price - b.price : b.price - a.price);
  }, [destinations, filterType, filterRating, maxPrice, sortBy]);

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Khám Phá Điểm Đến</h1>

      <div style={S.filterBar}>
        <div>
          <label style={S.label}>Loại hình</label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {TYPES.map(t => (
              <button key={t} style={S.navBtn(filterType === t)} onClick={() => setFilterType(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={S.label}>Rating tối thiểu</label>
          <select style={S.select} value={filterRating} onChange={e => setFilterRating(+e.target.value)}>
            <option value={0}>Tất cả</option>
            <option value={4}>≥ 4★</option>
            <option value={4.5}>≥ 4.5★</option>
          </select>
        </div>
        <div>
          <label style={S.label}>Giá tối đa: {fmt(maxPrice)}</label>
          <input type="range" min={500000} max={5000000} step={500000} value={maxPrice}
            onChange={e => setMaxPrice(+e.target.value)} style={{ width: 140 }} />
        </div>
        <div>
          <label style={S.label}>Sắp xếp</label>
          <select style={S.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="rating">Rating cao nhất</option>
            <option value="price_asc">Giá thấp → cao</option>
            <option value="price_desc">Giá cao → thấp</option>
          </select>
        </div>
      </div>

      <p style={{ fontSize: 13, marginBottom: 14 }}>Tìm thấy <strong>{filtered.length}</strong> điểm đến</p>

      <div style={S.grid}>
        {filtered.map((d, i) => (
          <div key={d.id} style={S.card}>
            <div style={S.cardImg(i)}>[ {d.name.toUpperCase()} ]</div>
            <div style={S.cardBody}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <strong style={{ fontSize: 15 }}>{d.name}</strong>
                <span style={S.tag}>{d.type}</span>
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>📍 {d.location}</div>
              <div style={{ fontSize: 13 }}>{stars(d.rating)} {d.rating}</div>
              <div style={{ fontSize: 12, lineHeight: 1.4, flex: 1 }}>{d.description}</div>
              <div style={{ fontSize: 13, fontWeight: "bold" }}>{fmt(d.price)} / người</div>
              <div style={{ fontSize: 12 }}>⏱ {d.visitTime} ngày tham quan</div>
              <button style={{ ...S.btn, marginTop: 4 }} onClick={() => onAdd(d)}>+ Thêm vào lịch trình</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ITINERARY PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function ItineraryPage({ destinations, itinerary, setItinerary }) {
  const [dayIdx, setDayIdx] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const addDay = () => {
    const day = { id: Date.now(), date: `Ngày ${itinerary.days.length + 1}`, destinations: [] };
    setItinerary(p => ({ ...p, days: [...p.days, day] }));
    setDayIdx(itinerary.days.length);
  };

  const removeDay = (id) => {
    const newDays = itinerary.days.filter(d => d.id !== id);
    setItinerary(p => ({ ...p, days: newDays }));
    setDayIdx(prev => Math.min(prev, newDays.length - 1));
  };

  const addDest = (dest) => {
    setItinerary(p => ({
      ...p,
      days: p.days.map((d, i) => i === dayIdx ? { ...d, destinations: [...d.destinations, { ...dest, uid: Date.now() + Math.random() }] } : d)
    }));
    setShowPicker(false);
  };

  const removeDest = (dayId, uid) => {
    setItinerary(p => ({
      ...p,
      days: p.days.map(d => d.id === dayId ? { ...d, destinations: d.destinations.filter(x => x.uid !== uid) } : d)
    }));
  };

  const totalCost = itinerary.days.reduce((s, d) => s + d.destinations.reduce((ss, x) => ss + x.foodCost + x.hotelCost + x.transportCost, 0), 0);
  const totalDests = itinerary.days.reduce((s, d) => s + d.destinations.length, 0);
  const currentDay = itinerary.days[dayIdx];

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Lịch Trình Du Lịch</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Số ngày", value: itinerary.days.length },
          { label: "Điểm đến", value: totalDests },
          { label: "Ước tính", value: fmt(totalCost) },
        ].map(x => (
          <div key={x.label} style={S.statCard}>
            <div style={{ fontSize: 22, fontWeight: "bold" }}>{x.value}</div>
            <div style={{ fontSize: 12 }}>{x.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Day list */}
        <div style={{ minWidth: 170, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Các ngày</strong>
            <button style={S.btnSm} onClick={addDay}>+ Ngày</button>
          </div>
          {itinerary.days.length === 0 && <p style={{ fontSize: 12, color: "#666" }}>Chưa có ngày nào.</p>}
          {itinerary.days.map((day, i) => (
            <div key={day.id} style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              <button style={{ ...S.navBtn(dayIdx === i), flex: 1, textAlign: "left" }} onClick={() => setDayIdx(i)}>
                {day.date} ({day.destinations.length})
              </button>
              <button style={S.btnSmOut} onClick={() => removeDay(day.id)}>✕</button>
            </div>
          ))}
        </div>

        {/* Day content */}
        <div style={{ flex: 1, minWidth: 260 }}>
          {!currentDay ? (
            <div style={{ border: "1px solid #000", padding: 32, textAlign: "center" }}>
              <p style={{ marginBottom: 12 }}>Chưa có ngày nào. Hãy thêm ngày để bắt đầu lập lịch!</p>
              <button style={S.btn} onClick={addDay}>+ Thêm ngày đầu tiên</button>
            </div>
          ) : (
            <div style={{ border: "1px solid #000", padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: 16 }}>{currentDay.date}</strong>
                <button style={S.btn} onClick={() => setShowPicker(true)}>+ Thêm điểm đến</button>
              </div>

              {currentDay.destinations.length === 0 && (
                <p style={{ fontSize: 13, color: "#666" }}>Chưa có điểm đến nào. Nhấn "+ Thêm điểm đến".</p>
              )}

              {currentDay.destinations.map((dest, idx) => (
                <div key={dest.uid} style={{ border: "1px solid #000", padding: "10px 12px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <strong>{idx + 1}. {dest.name}</strong>
                      <span style={{ ...S.tag, marginLeft: 8 }}>{dest.type}</span>
                      <div style={{ fontSize: 12, marginTop: 4 }}>📍 {dest.location} &nbsp;|&nbsp; ⏱ {dest.visitTime} ngày</div>
                      <div style={{ fontSize: 12, marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span>🍜 {fmt(dest.foodCost)}</span>
                        <span>🏨 {fmt(dest.hotelCost)}</span>
                        <span>🚌 {fmt(dest.transportCost)}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: "bold", marginTop: 4 }}>
                        Tổng: {fmt(dest.foodCost + dest.hotelCost + dest.transportCost)}
                      </div>
                    </div>
                    <button style={S.btnSmOut} onClick={() => removeDest(currentDay.id, dest.uid)}>Xóa</button>
                  </div>
                </div>
              ))}

              {currentDay.destinations.length > 1 && (
                <div style={{ border: "1px dashed #000", padding: "8px 12px", fontSize: 12, marginTop: 8 }}>
                  ⏱ Di chuyển ước tính giữa {currentDay.destinations.length} điểm: ~{(currentDay.destinations.length - 1) * 2} giờ
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Picker modal */}
      {showPicker && currentDay && (
        <div style={S.modal} onClick={() => setShowPicker(false)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={S.h2}>Chọn điểm đến cho {currentDay.date}</h2>
            {destinations.map(d => (
              <div key={d.id} style={{ border: "1px solid #000", padding: "10px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>
                  <strong>{d.name}</strong>
                  <span style={{ ...S.tag, marginLeft: 6 }}>{d.type}</span>
                  <div style={{ fontSize: 12 }}>{d.location} · {d.rating}★ · {fmt(d.price)}/người</div>
                </div>
                <button style={S.btnSm} onClick={() => addDest(d)}>Thêm</button>
              </div>
            ))}
            <button style={{ ...S.btnOut, marginTop: 12 }} onClick={() => setShowPicker(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function BudgetPage({ itinerary }) {
  const [budget, setBudget] = useState(15000000);

  const allDests = itinerary.days.flatMap(d => d.destinations);
  const food = allDests.reduce((s, d) => s + d.foodCost, 0);
  const hotel = allDests.reduce((s, d) => s + d.hotelCost, 0);
  const transport = allDests.reduce((s, d) => s + d.transportCost, 0);
  const total = food + hotel + transport;
  const over = total > budget;
  const pct = budget ? Math.min(Math.round(total / budget * 100), 999) : 0;

  const pieData = [
    { name: "Ăn uống", value: food },
    { name: "Lưu trú", value: hotel },
    { name: "Di chuyển", value: transport },
  ].filter(d => d.value > 0);

  const barData = itinerary.days.map(day => ({
    name: day.date,
    "Ăn uống": day.destinations.reduce((s, d) => s + d.foodCost, 0),
    "Lưu trú": day.destinations.reduce((s, d) => s + d.hotelCost, 0),
    "Di chuyển": day.destinations.reduce((s, d) => s + d.transportCost, 0),
  }));

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Quản Lý Ngân Sách</h1>

      <div style={{ marginBottom: 20, maxWidth: 340 }}>
        <label style={S.label}>Ngân sách tổng (VNĐ)</label>
        <input type="number" style={S.input} value={budget}
          onChange={e => setBudget(+e.target.value)} step={1000000} />
      </div>

      {over && (
        <div style={S.alertWarn}>
          ⚠ CẢNH BÁO VƯỢT NGÂN SÁCH — Vượt: {fmt(total - budget)} &nbsp;|&nbsp; Dự kiến: {fmt(total)} &nbsp;|&nbsp; Ngân sách: {fmt(budget)}
        </div>
      )}
      {!over && total > 0 && (
        <div style={S.alertOk}>
          ✓ Trong ngân sách — Đã dùng {pct}% &nbsp;|&nbsp; Còn lại: {fmt(budget - total)}
        </div>
      )}

      {/* Budget bar */}
      {budget > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span>0</span><span>{fmt(budget)}</span>
          </div>
          <div style={{ height: 16, border: "1px solid #000", position: "relative" }}>
            <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: over ? "#000" : "#555", transition: "width 0.3s" }} />
            {over && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: "bold" }}>VƯỢT {pct}%</div>}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ ...S.row, marginBottom: 24 }}>
        {[
          { label: "Ăn uống", value: food, pct: total ? Math.round(food / total * 100) : 0, icon: "🍜" },
          { label: "Lưu trú", value: hotel, pct: total ? Math.round(hotel / total * 100) : 0, icon: "🏨" },
          { label: "Di chuyển", value: transport, pct: total ? Math.round(transport / total * 100) : 0, icon: "🚌" },
          { label: "Tổng chi phí", value: total, pct, icon: "💰" },
        ].map(x => (
          <div key={x.label} style={{ ...S.statCard, background: x.label === "Tổng chi phí" && over ? "#000" : "#fff", color: x.label === "Tổng chi phí" && over ? "#fff" : "#000" }}>
            <div style={{ fontSize: 18 }}>{x.icon}</div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{fmt(x.value)}</div>
            <div style={{ fontSize: 12 }}>{x.label}</div>
            <div style={{ fontSize: 12 }}>{x.pct}% {x.label === "Tổng chi phí" ? "ngân sách" : "tổng"}</div>
          </div>
        ))}
      </div>

      {pieData.length > 0 ? (
        <div style={S.row}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2 style={S.h2}>Phân bổ chi phí</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine>
                  {pieData.map((_, i) => <Cell key={i} fill={["#000", "#555", "#999"][i % 3]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {barData.length > 0 && (
            <div style={{ flex: 1, minWidth: 260 }}>
              <h2 style={S.h2}>Chi phí theo ngày</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => fmt(v)} />
                  <Legend />
                  <Bar dataKey="Ăn uống" fill="#000" />
                  <Bar dataKey="Lưu trú" fill="#555" />
                  <Bar dataKey="Di chuyển" fill="#aaa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <div style={{ border: "1px solid #000", padding: 32, textAlign: "center" }}>
          Chưa có dữ liệu. Hãy thêm điểm đến vào lịch trình để xem phân tích ngân sách.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const EMPTY_FORM = { name: "", type: "biển", location: "", rating: 4.0, price: 1000000, description: "", visitTime: 1, foodCost: 200000, hotelCost: 500000, transportCost: 200000, popularity: 0 };

function AdminPage({ destinations, setDestinations }) {
  const [tab, setTab] = useState("list");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const filtered = destinations.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (d) => { setForm({ ...d }); setModal("edit"); };
  const save = () => {
    if (modal === "add") setDestinations(p => [...p, { ...form, id: Date.now() }]);
    else setDestinations(p => p.map(d => d.id === form.id ? { ...form } : d));
    setModal(null);
  };
  const del = (id) => { if (window.confirm("Xóa điểm đến này?")) setDestinations(p => p.filter(d => d.id !== id)); };
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const popularData = [...destinations].sort((a, b) => b.popularity - a.popularity).slice(0, 6).map(d => ({ name: d.name, value: d.popularity }));
  const typeData = TYPES.slice(1).map(t => ({ name: t, value: destinations.filter(d => d.type === t).length }));

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Trang Quản Trị</h1>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {[["list", "Danh sách điểm đến"], ["stats", "Thống kê"]].map(([k, l]) => (
          <button key={k} style={S.navBtn(tab === k)} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── LIST TAB ── */}
      {tab === "list" && (
        <>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap" }}>
            <input style={{ ...S.input, width: "auto", flex: 1, maxWidth: 280 }} placeholder="Tìm kiếm theo tên, địa điểm..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <button style={S.btn} onClick={openAdd}>+ Thêm điểm đến</button>
          </div>
          <p style={{ fontSize: 13, marginBottom: 12 }}>Hiển thị {filtered.length}/{destinations.length} điểm đến</p>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>{["Tên / Mô tả", "Loại", "Địa điểm", "Rating", "Giá", "Ăn uống", "Lưu trú", "Di chuyển", "Thao tác"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td style={S.td}>
                      <strong>{d.name}</strong>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{d.description?.slice(0, 50)}{d.description?.length > 50 ? "…" : ""}</div>
                    </td>
                    <td style={S.td}><span style={S.tag}>{d.type}</span></td>
                    <td style={S.td}>{d.location}</td>
                    <td style={S.td}>{stars(d.rating)} {d.rating}</td>
                    <td style={S.td} nowrap="true">{fmt(d.price)}</td>
                    <td style={S.td} nowrap="true">{fmt(d.foodCost)}</td>
                    <td style={S.td} nowrap="true">{fmt(d.hotelCost)}</td>
                    <td style={S.td} nowrap="true">{fmt(d.transportCost)}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={S.btnSm} onClick={() => openEdit(d)}>Sửa</button>
                        <button style={S.btnSmOut} onClick={() => del(d.id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── STATS TAB ── */}
      {tab === "stats" && (
        <>
          <div style={{ ...S.row, marginBottom: 24 }}>
            {[
              { label: "Tổng điểm đến", value: destinations.length },
              { label: "Lịch trình tháng 6", value: 120 },
              { label: "Doanh thu T6", value: fmt(180000000) },
              { label: "Tổng doanh thu", value: fmt(MONTHLY_STATS.reduce((s, m) => s + m.revenue, 0)) },
            ].map(x => (
              <div key={x.label} style={S.statCard}>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>{x.value}</div>
                <div style={{ fontSize: 12 }}>{x.label}</div>
              </div>
            ))}
          </div>

          <div style={S.row}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h2 style={S.h2}>Lịch trình được tạo theo tháng</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_STATS}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#000" name="Lịch trình" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h2 style={S.h2}>Điểm đến phổ biến (lượt chọn)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={popularData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#000" name="Lượt chọn" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...S.row, marginTop: 20 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h2 style={S.h2}>Doanh thu theo tháng (VNĐ)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_STATS}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `${v / 1000000}tr`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => fmt(v)} />
                  <Bar dataKey="revenue" fill="#555" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h2 style={S.h2}>Phân bổ loại hình điểm đến</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}>
                    {typeData.map((_, i) => <Cell key={i} fill={["#000", "#555", "#999"][i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div style={S.modal} onClick={() => setModal(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={S.h2}>{modal === "add" ? "Thêm điểm đến mới" : `Sửa: ${form.name}`}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
              {[
                ["name", "Tên điểm đến", "text"], ["location", "Địa điểm", "text"],
                ["price", "Giá (VNĐ/người)", "number"], ["rating", "Rating (1–5)", "number"],
                ["visitTime", "Thời gian tham quan (ngày)", "number"], ["popularity", "Độ phổ biến (lượt)", "number"],
                ["foodCost", "Chi phí ăn uống/ngày (VNĐ)", "number"], ["hotelCost", "Chi phí lưu trú/ngày (VNĐ)", "number"],
                ["transportCost", "Chi phí di chuyển (VNĐ)", "number"],
              ].map(([k, l, t]) => (
                <div key={k}>
                  <label style={S.label}>{l}</label>
                  <input type={t} style={S.input} value={form[k] ?? ""} step={t === "number" ? 50000 : undefined}
                    onChange={e => setF(k, t === "number" ? +e.target.value : e.target.value)} />
                </div>
              ))}
              <div>
                <label style={S.label}>Loại hình</label>
                <select style={S.select} value={form.type} onChange={e => setF("type", e.target.value)}>
                  {["biển", "núi", "thành phố"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={S.label}>Mô tả</label>
              <textarea style={{ ...S.input, height: 70, resize: "vertical" }} value={form.description ?? ""}
                onChange={e => setF("description", e.target.value)} />
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
              * Upload hình ảnh: (Demo — tính năng upload sẽ tích hợp backend)
              <div style={{ border: "1px dashed #000", padding: "12px", textAlign: "center", marginTop: 6 }}>
                Kéo ảnh vào đây hoặc <u style={{ cursor: "pointer" }}>chọn file</u>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={S.btn} onClick={save}>Lưu</button>
              <button style={S.btnOut} onClick={() => setModal(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  const [destinations, setDestinations] = useState(DESTINATIONS_INIT);
  const [itinerary, setItinerary] = useState({ days: [] });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToItinerary = (dest) => {
    if (itinerary.days.length === 0) {
      const day = { id: Date.now(), date: "Ngày 1", destinations: [{ ...dest, uid: Date.now() + 1 }] };
      setItinerary({ days: [day] });
    } else {
      setItinerary(p => ({
        ...p,
        days: p.days.map((d, i) => i === 0 ? { ...d, destinations: [...d.destinations, { ...dest, uid: Date.now() }] } : d)
      }));
    }
    showToast(`Đã thêm "${dest.name}" vào lịch trình!`);
  };

  const PAGES = [
    ["home", "Khám Phá"],
    ["itinerary", "Lịch Trình"],
    ["budget", "Ngân Sách"],
    ["admin", "Quản Trị"],
  ];

  return (
    <div style={S.app}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#000", color: "#fff", padding: "10px 16px", fontSize: 13, zIndex: 300, border: "1px solid #000" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>TRAVEL PLANNER</div>
        <nav style={S.nav}>
          {PAGES.map(([k, l]) => (
            <button key={k} style={S.navBtn(page === k)} onClick={() => setPage(k)}>{l}</button>
          ))}
        </nav>
      </header>

      {/* Pages */}
      {page === "home" && <HomePage destinations={destinations} onAdd={addToItinerary} />}
      {page === "itinerary" && <ItineraryPage destinations={destinations} itinerary={itinerary} setItinerary={setItinerary} />}
      {page === "budget" && <BudgetPage itinerary={itinerary} />}
      {page === "admin" && <AdminPage destinations={destinations} setDestinations={setDestinations} />}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #000", padding: "12px 20px", fontSize: 11, textAlign: "center", color: "#555" }}>
        Travel Planner © 2025 — Ứng dụng lập kế hoạch du lịch
      </footer>
    </div>
  );
}