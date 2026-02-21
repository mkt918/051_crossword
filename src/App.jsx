import React, { useState, useEffect } from 'react';

const CrosswordBuilder = () => {
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [grid, setGrid] = useState([]);
  const [mode, setMode] = useState('black'); // black, double, text, number
  const [nextNumber, setNextNumber] = useState(1);

  // Initialize grid
  useEffect(() => {
    const newGrid = Array(rows).fill().map(() =>
      Array(cols).fill().map(() => ({
        type: 'white', // white, black
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
        cell.text = '';
        cell.number = null;
        cell.isDouble = false;
      }
    } else if (mode === 'double') {
      if (cell.type === 'white') {
        cell.isDouble = !cell.isDouble;
      }
    } else if (mode === 'number') {
      if (cell.type === 'white') {
        if (cell.number === null) {
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

    // Auto-move to next cell
    if (char && c < cols - 1) {
      setTimeout(() => {
        const nextInput = document.getElementById(`cell-${r}-${c + 1}`);
        if (nextInput) nextInput.focus();
      }, 10);
    }
  };

  const handleKeyDown = (e, r, c) => {
    if (mode !== 'text') return;
    if (e.key === 'Backspace' && !grid[r][c].text && c > 0) {
      const prevInput = document.getElementById(`cell-${r}-${c - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowRight' && c < cols - 1) {
      document.getElementById(`cell-${r}-${c + 1}`)?.focus();
    } else if (e.key === 'ArrowLeft' && c > 0) {
      document.getElementById(`cell-${r}-${c - 1}`)?.focus();
    } else if (e.key === 'ArrowDown' && r < rows - 1) {
      document.getElementById(`cell-${r + 1}-${c}`)?.focus();
    } else if (e.key === 'ArrowUp' && r > 0) {
      document.getElementById(`cell-${r - 1}-${c}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-10 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-center bg-slate-900/60 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] -ml-32 -mb-32"></div>

          <div className="mb-8 lg:mb-0 text-center lg:text-left relative z-10">
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-400 to-indigo-600 tracking-tighter mb-3">
              CROSSWORD BUILDER
            </h1>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <span className="h-px w-8 bg-blue-500/50"></span>
              <p className="text-blue-400/80 text-xs font-black tracking-[0.3em] uppercase">Advanced Board Architect</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <div className="flex bg-black/40 p-2 rounded-[1.5rem] border border-white/5 shadow-2xl">
              {[
                { id: 'black', label: '黒マス', icon: '■', activeClass: 'bg-slate-700 shadow-slate-900/50' },
                { id: 'double', label: '二重マス', icon: '◎', activeClass: 'bg-blue-600 shadow-blue-900/50' },
                { id: 'number', label: '番号', icon: '①', activeClass: 'bg-emerald-600 shadow-emerald-900/50' },
                { id: 'text', label: '文字', icon: 'A', activeClass: 'bg-indigo-600 shadow-indigo-900/50' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`
                    px-6 py-3 rounded-2xl transition-all duration-500 flex items-center gap-3 text-sm font-bold tracking-tight
                    ${mode === m.id ? `${m.activeClass} text-white shadow-xl scale-110 -translate-y-1` : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
                  `}
                >
                  <span className="text-xl leading-none">{m.icon}</span>
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>

            {mode === 'number' && (
              <div className="flex items-center gap-4 bg-slate-900/80 px-6 py-3 rounded-2xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Coming Next</span>
                  <span className="text-3xl font-mono font-black text-blue-400 leading-none">{nextNumber}</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
                  <button onClick={() => setNextNumber(n => n + 1)} className="hover:text-blue-400 text-slate-600 transition-colors text-xs">▲</button>
                  <button onClick={() => setNextNumber(n => Math.max(1, n - 1))} className="hover:text-blue-400 text-slate-600 transition-colors text-xs">▼</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
          <aside className="xl:col-span-3 space-y-8 h-full">
            <section className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 shadow-2xl relative group overflow-hidden">
              <div className="absolute -right-10 -top-10 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all duration-700"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-500 flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                Board Layout
              </h2>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows</label>
                    <span className="text-xs font-mono text-blue-400 font-bold">{rows}</span>
                  </div>
                  <input
                    type="range" min="3" max="50" value={rows} onChange={e => setRows(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number" value={rows} onChange={e => setRows(Number(e.target.value))}
                    className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono font-bold text-center"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cols</label>
                    <span className="text-xs font-mono text-blue-400 font-bold">{cols}</span>
                  </div>
                  <input
                    type="range" min="3" max="50" value={cols} onChange={e => setCols(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number" value={cols} onChange={e => setCols(Number(e.target.value))}
                    className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono font-bold text-center"
                  />
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden transition-all hover:scale-[1.02] duration-500">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)] transition-opacity opacity-50 group-hover:opacity-100"></div>
              <h3 className="text-[10px] font-black text-blue-300 mb-6 flex items-center gap-3 uppercase tracking-widest">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                Pro Tips
              </h3>
              <div className="space-y-5">
                {[
                  { id: "1", text: "番号モードで白マスを叩くだけ。1から順に高速で埋まります。" },
                  { id: "2", text: "文字入力は自動フォーカス移動。流れるように打ち込めます。" },
                  { id: "3", text: "十字キーで盤面を縦横無尽に移動して編集効率アップ。" },
                ].map(tip => (
                  <div key={tip.id} className="flex gap-4">
                    <span className="text-blue-500/50 font-black italic text-xs leading-none mt-0.5">{tip.id}</span>
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <main className="xl:col-span-9 flex flex-col items-center group">
            <div className="bg-slate-900/30 p-8 md:p-14 rounded-[4rem] border border-white/5 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm overflow-auto max-w-full transition-shadow hover:shadow-[inset_0_2px_40px_rgba(59,130,246,0.05)]">
              <div
                className="grid gap-0 bg-slate-400 border-[10px] border-[#0a0f1d] rounded-xl shadow-[0_30px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(42px, 1fr))`,
                  width: 'fit-content'
                }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => mode !== 'text' && handleCellClick(r, c)}
                      className={`
                        w-11 h-11 md:w-16 md:h-16 relative flex items-center justify-center cursor-pointer border-[0.5px] border-slate-700 transition-all duration-300
                        ${cell.type === 'black' ? 'bg-[#0a0f1d]' : 'bg-white text-slate-900'}
                        ${cell.isDouble ? 'bg-blue-50/70' : ''}
                        ${mode === 'text' && cell.type === 'white' ? 'hover:bg-blue-100' : ''}
                      `}
                    >
                      {cell.isDouble && cell.type === 'white' && (
                        <div className="absolute inset-1.5 border-[4px] border-blue-400/20 rounded-full pointer-events-none ring-1 ring-blue-500/10"></div>
                      )}

                      {cell.number && (
                        <span className="absolute top-1 left-2 text-[10px] font-black leading-none select-none text-blue-500/60 tracking-tighter">
                          {cell.number}
                        </span>
                      )}

                      {mode === 'text' && cell.type === 'white' ? (
                        <input
                          id={`cell-${r}-${c}`}
                          type="text"
                          value={cell.text}
                          autoComplete="off"
                          onChange={(e) => handleTextChange(r, c, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, r, c)}
                          onFocus={() => { if (mode === 'text') handleCellClick(r, c); }}
                          className="w-full h-full bg-transparent text-center text-2xl font-black outline-none focus:bg-blue-500/10 transition-colors caret-blue-500 flex items-center justify-center"
                          maxLength={1}
                        />
                      ) : (
                        <span className="text-2xl font-black select-none tracking-tight leading-none mb-1">{cell.text}</span>
                      )}

                      {cell.type === 'black' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 pointer-events-none"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-12 flex gap-8 items-center text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] animate-pulse">
              <span>Ready to publish</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              <span>All changes saved</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CrosswordBuilder;
