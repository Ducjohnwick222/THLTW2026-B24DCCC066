

import { useState } from "react";

type Choice = "Kéo" | "Búa" | "Bao";
type Result = "Thắng" | "Thua" | "Hòa";

interface MatchRecord {
  id: number;
  playerChoice: Choice;
  computerChoice: Choice;
  result: Result;
  time: string;
}

const CHOICES: Choice[] = ["Kéo", "Búa", "Bao"];
const EMOJI: Record<Choice, string> = { Kéo: "✌️", Búa: "✊", Bao: "🖐️" };

const getResult = (player: Choice, computer: Choice): Result => {
  if (player === computer) return "Hòa";
  if (
    (player === "Kéo" && computer === "Bao") ||
    (player === "Búa" && computer === "Kéo") ||
    (player === "Bao" && computer === "Búa")
  ) return "Thắng";
  return "Thua";
};

export default function OanTuTi() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [score, setScore] = useState({ win: 0, lose: 0, draw: 0 });

  const handlePlay = (choice: Choice) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult(null);
    setTimeout(() => {
      const cpu = CHOICES[Math.floor(Math.random() * 3)];
      const res = getResult(choice, cpu);
      setComputerChoice(cpu);
      setResult(res);
      setScore((prev) => ({
        win: prev.win + (res === "Thắng" ? 1 : 0),
        lose: prev.lose + (res === "Thua" ? 1 : 0),
        draw: prev.draw + (res === "Hòa" ? 1 : 0),
      }));
      setHistory((prev) => [
        { id: Date.now(), playerChoice: choice, computerChoice: cpu, result: res, time: new Date().toLocaleTimeString("vi-VN") },
        ...prev.slice(0, 9),
      ]);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1rem", fontFamily: "sans-serif", background: "#fff", minHeight: "100vh", color: "#000" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Oẳn Tù Tì</h1>

      {}
      <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
        <span>Thắng: <strong>{score.win}</strong></span>
        <span>Thua: <strong>{score.lose}</strong></span>
        <span>Hòa: <strong>{score.draw}</strong></span>
      </div>

      {/* Choices */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {CHOICES.map((c) => (
          <button
            key={c}
            onClick={() => handlePlay(c)}
            disabled={isAnimating}
            style={{
              padding: "0.6rem 1.2rem",
              fontSize: "1rem",
              border: playerChoice === c ? "2px solid #000" : "1px solid #ccc",
              background: "#fff",
              cursor: isAnimating ? "not-allowed" : "pointer",
              borderRadius: 4,
            }}
          >
            {EMOJI[c]} {c}
          </button>
        ))}
      </div>

      {/* Result */}
      {playerChoice && (
        <div style={{ marginBottom: "1.5rem", fontSize: "1rem" }}>
          <div>Bạn: {EMOJI[playerChoice]} {playerChoice}</div>
          <div>Máy: {isAnimating ? "..." : computerChoice ? `${EMOJI[computerChoice]} ${computerChoice}` : ""}</div>
          {result && !isAnimating && (
            <div style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
              {result === "Thắng" ? "🎉 Bạn thắng!" : result === "Thua" ? "😢 Bạn thua!" : "🤝 Hòa!"}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#555" }}>Lịch sử</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 600 }}>Thời gian</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 600 }}>Bạn</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 600 }}>Máy</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 600 }}>Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "4px 8px", color: "#666" }}>{h.time}</td>
                  <td style={{ padding: "4px 8px" }}>{EMOJI[h.playerChoice]} {h.playerChoice}</td>
                  <td style={{ padding: "4px 8px" }}>{EMOJI[h.computerChoice]} {h.computerChoice}</td>
                  <td style={{ padding: "4px 8px", fontWeight: 600 }}>{h.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}