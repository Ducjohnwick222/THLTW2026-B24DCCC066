import { useState } from 'react';

const MAX_ATTEMPTS = 10;

type MsgType = 'warn' | 'low' | 'high' | 'win' | 'lose' | '';

interface HistoryEntry {
  guess: number;
  attempt: number;
}

const MSG_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  warn: { bg: '#fff8e1', border: '#f59e0b', text: '#92400e' },
  low:  { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a5f' },
  high: { bg: '#fff1f2', border: '#f43f5e', text: '#9f1239' },
  win:  { bg: '#f0fdf4', border: '#22c55e', text: '#14532d' },
  lose: { bg: '#fdf4ff', border: '#a855f7', text: '#4a044e' },
};

const DoanSo: React.FC = () => {
  const [secret, setSecret]       = useState<number>(() => Math.floor(Math.random() * 100) + 1);
  const [input, setInput]         = useState<string>('');
  const [attempts, setAttempts]   = useState<number>(0);
  const [message, setMessage]     = useState<string>('');
  const [msgType, setMsgType]     = useState<MsgType>('');
  const [gameOver, setGameOver]   = useState<boolean>(false);
  const [history, setHistory]     = useState<HistoryEntry[]>([]);

  const handleGuess = (): void => {
    const num = parseInt(input, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      setMessage('⚠️ Vui lòng nhập số từ 1 đến 100!');
      setMsgType('warn');
      return;
    }
    const na = attempts + 1;
    setAttempts(na);
    setHistory((p) => [{ guess: num, attempt: na }, ...p]);
    setInput('');

    if (num === secret) {
      setMessage(`🎉 Chúc mừng! Bạn đã đoán đúng số ${secret}!`);
      setMsgType('win');
      setGameOver(true);
    } else if (na >= MAX_ATTEMPTS) {
      setMessage(`😢 Bạn đã hết lượt! Số đúng là [${secret}].`);
      setMsgType('lose');
      setGameOver(true);
    } else if (num < secret) {
      setMessage('📉 Bạn đoán quá thấp!');
      setMsgType('low');
    } else {
      setMessage('📈 Bạn đoán quá cao!');
      setMsgType('high');
    }
  };

  const restart = (): void => {
    setSecret(Math.floor(Math.random() * 100) + 1);
    setInput('');
    setAttempts(0);
    setMessage('');
    setMsgType('');
    setGameOver(false);
    setHistory([]);
  };

  const mc = msgType ? MSG_STYLES[msgType] : null;
  const remaining = MAX_ATTEMPTS - attempts;

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 0' }}>
      <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#333', marginBottom: 24 }}>
        Bài 1 — Đoán Số Bí Ẩn 🎯
      </h2>

      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          padding: 28,
          boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
          marginBottom: 20,
          borderTop: '4px solid #c0392b',
        }}
      >
        <p style={{ textAlign: 'center', color: '#888', fontSize: 13, margin: '0 0 20px' }}>
          Hệ thống đã chọn một số bí ẩn từ <b>1</b> đến <b>100</b>. Bạn có <b>{MAX_ATTEMPTS} lượt</b> để đoán!
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#888' }}>
              Lượt đã dùng: <b style={{ color: '#333' }}>{attempts} / {MAX_ATTEMPTS}</b>
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: remaining <= 3 ? '#c0392b' : '#27ae60' }}>
              Còn {remaining} lượt
            </span>
          </div>
          <div style={{ height: 8, background: '#f0f0f0', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(attempts / MAX_ATTEMPTS) * 100}%`,
                background:
                  remaining <= 3
                    ? 'linear-gradient(90deg,#c0392b,#e74c3c)'
                    : 'linear-gradient(90deg,#27ae60,#2ecc71)',
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Input row */}
        {!gameOver && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              type="number"
              value={input}
              min={1}
              max={100}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
              placeholder="Nhập số từ 1 – 100…"
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 700,
                outline: 'none',
                background: '#fafafa',
              }}
            />
            <button
              onClick={handleGuess}
              style={{
                background: '#c0392b',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 5,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Đoán
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            style={{
              background: mc?.bg ?? '#f9f9f9',
              border: `1px solid ${mc?.border ?? '#ddd'}`,
              borderRadius: 8,
              padding: '12px 16px',
              color: mc?.text ?? '#333',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: gameOver ? 16 : 0,
            }}
          >
            {message}
          </div>
        )}

        {}
        {gameOver && (
          <button
            onClick={restart}
            style={{
              width: '100%',
              background: '#27ae60',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: 11,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            🔄 Chơi lại
          </button>
        )}
      </div>

      {}
      {history.length > 0 && (
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            padding: '18px 20px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 11,
              color: '#bbb',
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontWeight: 700,
            }}
          >
            Lịch sử đoán
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {history.map((h) => (
              <span
                key={h.attempt}
                style={{
                  background: '#f5f5f5',
                  border: '1px solid #e8e8e8',
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#555',
                }}
              >
                #{h.attempt}: {h.guess}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoanSo;