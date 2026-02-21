import React, { useState, useEffect } from 'react';

const CrosswordBuilder = () => {
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [grid, setGrid] = useState([]);
  const [mode, setMode] = useState('black');
  const [nextNumber, setNextNumber] = useState(1);

  useEffect(() => {
    const newGrid = Array(rows).fill().map(() =>
      Array(cols).fill().map(() => ({
        type: 'white',
        isDouble: false,
        text: '',
        number: null
      }))
    );
    setGrid(newGrid);
  }, [rows, cols]);

  const handleCellClick = (r, c) => {
    const newGrid = [...grid.map(row => [...row])];
    const cell = newGrid[r][c];
    if (mode === 'black') {
      cell.type = cell.type === 'black' ? 'white' : 'black';
      if (cell.type === 'black') {
        cell.text = ''; cell.number = null; cell.isDouble = false;
      }
    } else if (mode === 'double') {
      if (cell.type === 'white') cell.isDouble = !cell.isDouble;
    } else if (mode === 'number') {
      if (cell.type === 'white') {
        if (!cell.number) {
          cell.number = nextNumber;
          setNextNumber(prev => prev + 1);
        } else {
          cell.number = null;
        }
      }
    }
    setGrid(newGrid);
  };

  const handleTextChange = (r, c, val) => {
    if (mode !== 'text') return;
    const newGrid = [...grid.map(row => [...row])];
    const char = val.slice(-1);
    newGrid[r][c].text = char;
    setGrid(newGrid);
    if (char && c < cols - 1) {
      setTimeout(() => {
        document.getElementById(`cell-${r}-${c + 1}`)?.focus();
      }, 10);
    }
  };

  const handleKeyDown = (e, r, c) => {
    if (mode !== 'text') return;
    if (e.key === 'Backspace' && !grid[r][c].text && c > 0) {
      document.getElementById(`cell-${r}-${c - 1}`)?.focus();
    } else if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      const moves = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] };
      const [dr, dc] = moves[e.key];
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        document.getElementById(`cell-${nr}-${nc}`)?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-10 font-sans selection:bg-blue-500/20">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center bg-slate-900 shadow-2xl p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CROSSWORD BUILDER
            </h1>
            <p className="text-slate-500 text-[9px] font-black tracking-[0.4em] uppercase mt-2">Professional Grid Architect</p>
          </div>

          <div className="mt-8 md:mt-0 flex flex-wrap justify-center gap-2 relative z-10">
            {[
              { id: 'black', label: '黒マス', icon: '■', color: 'bg-slate-700' },
              { id: 'double', label: '二重マス', icon: '◎', color: 'bg-blue-600' },
              { id: 'number', label: '番号', icon: '①', color: 'bg-emerald-600' },
              { id: 'text', label: '文字', icon: 'A', color: 'bg-indigo-600' },
            ].map(m => (
              <button
                key={m.id} onClick={() => setMode(m.id)}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${mode === m.id ? `${m.color} text-white shadow-xl scale-105` : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <span>{m.icon}</span><span>{m.label}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          <aside className="space-y-8">
            <section className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-xl">
              <h2 className="text-[9px] font-black uppercase tracking-[0.2em] mb-6 text-slate-600">Grid Controls</h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Row Density: {rows}</label>
                  <input type="range" min="3" max="50" value={rows} onChange={e => setRows(Number(e.target.value))} className="w-full accent-blue-500 bg-slate-800 rounded-lg h-1" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Col Density: {cols}</label>
                  <input type="range" min="3" max="50" value={cols} onChange={e => setCols(Number(e.target.value))} className="w-full accent-blue-500 bg-slate-800 rounded-lg h-1" />
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-[9px] font-black text-blue-500/80 mb-6 uppercase tracking-[0.2em]">Usage Tips</h3>
              <div className="space-y-6">
                {[
                  "番号モード: クリックするだけで自動採番。効率的に盤面を構築。",
                  "文字モード: 自動フォーカス移動により、止まることなく入力可能。",
                  "ナビゲーション: 十字キーでセル間を高速移動。細かな修正もスムーズ。"
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-blue-500 font-black text-[10px] mt-0.5">{i + 1}</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <main className="lg:col-span-3 flex flex-col items-center">
            <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 shadow-inner backdrop-blur-sm">
              <div
                className="grid bg-slate-700 border-8 border-slate-950 rounded-lg shadow-2xl overflow-hidden"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))`, width: 'fit-content' }}
              >
                {grid.map((row, r) => row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => mode !== 'text' && handleCellClick(r, c)}
                    className={`
                      w-10 h-10 md:w-14 md:h-14 relative flex items-center justify-center cursor-pointer border-[0.5px] border-slate-800/50 transition-all font-sans
                      ${cell.type === 'black' ? 'bg-slate-950' : 'bg-white text-slate-900'}
                      ${cell.isDouble ? 'bg-blue-50/80' : ''}
                      ${mode === 'text' && cell.type === 'white' ? 'hover:bg-blue-50' : ''}
                    `}
                  >
                    {cell.isDouble && cell.type === 'white' && <div className="absolute inset-1.5 border-2 border-blue-400/20 rounded-full pointer-events-none"></div>}
                    {cell.number && <span className="absolute top-1 left-1.5 text-[8px] font-black text-blue-600/60 leading-none">{cell.number}</span>}
                    {mode === 'text' && cell.type === 'white' ? (
                      <input id={`cell-${r}-${c}`} type="text" value={cell.text} autoComplete="off" onChange={e => handleTextChange(r, c, e.target.value)} onKeyDown={e => handleKeyDown(e, r, c)} className="w-full h-full bg-transparent text-center text-xl font-black outline-none focus:bg-blue-500/5" maxLength={1} />
                    ) : (
                      <span className="text-xl font-black select-none pointer-events-none">{cell.text}</span>
                    )}
                  </div>
                )))}
              </div>
            </div>
            <div className="mt-8 flex items-center gap-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>System Online</span>
              <span>•</span>
              <span>Production Build v4.2</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CrosswordBuilder;
