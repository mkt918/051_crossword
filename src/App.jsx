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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-center bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/5">
          <div className="mb-6 lg:mb-0 text-center lg:text-left">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 tracking-tighter">
              CROSSWORD BUILDER
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-bold tracking-widest uppercase">Precision Grid Editor</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
              {[
                { id: 'black', label: '黒マス', icon: '■', color: 'bg-slate-700' },
                { id: 'double', label: '二重マス', icon: '◎', color: 'bg-blue-500' },
                { id: 'number', label: '番号', icon: '①', color: 'bg-emerald-500' },
                { id: 'text', label: '文字', icon: 'A', color: 'bg-indigo-500' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`
                    px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-black
                    ${mode === m.id ? `${m.color} text-white shadow-lg scale-105` : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                  `}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>
            {mode === 'number' && (
              <div className="flex items-center gap-3 bg-slate-900 px-5 py-2 rounded-2xl border border-white/5 animate-in fade-in zoom-in duration-300">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next</span>
                <span className="text-2xl font-mono font-black text-cyan-400">{nextNumber}</span>
                <div className="flex flex-col gap-1">
                  <button onClick={() => setNextNumber(n => n + 1)} className="hover:text-white text-slate-600 text-[10px]">▲</button>
                  <button onClick={() => setNextNumber(n => Math.max(1, n - 1))} className="hover:text-white text-slate-600 text-[10px]">▼</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6">
            <section className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 shadow-xl">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                Dimensions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Rows</label>
                  <input
                    type="number" value={rows} onChange={e => setRows(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Cols</label>
                  <input
                    type="number" value={cols} onChange={e => setCols(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-lg"
                  />
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
              <h3 className="text-xs font-black text-indigo-400 mb-5 flex items-center gap-2 uppercase tracking-widest">
                Shortcut Guide
              </h3>
              <ul className="text-[11px] text-slate-400 space-y-4 font-bold">
                <li className="flex items-start gap-3">
                  <span className="bg-white/10 w-5 h-5 rounded flex items-center justify-center text-xs text-indigo-300">1</span>
                  <p>番号モードでクリックすると高速で自動採番されます。</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-white/10 w-5 h-5 rounded flex items-center justify-center text-xs text-indigo-300">2</span>
                  <p>文字入力後は自動で次のマスに移動します。</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-white/10 w-5 h-5 rounded flex items-center justify-center text-xs text-indigo-300">3</span>
                  <p>矢印キーで四方に移動して素早く編集可能です。</p>
                </li>
              </ul>
            </section>
          </aside>

          <main className="lg:col-span-9 flex flex-col items-center">
            <div className="bg-slate-900/30 p-4 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl backdrop-blur-sm overflow-auto max-w-full">
              <div
                className="grid gap-0 bg-slate-800 border-[8px] border-slate-900 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))`,
                  width: 'fit-content'
                }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => mode !== 'text' && handleCellClick(r, c)}
                      className={`
                        w-10 h-10 md:w-14 md:h-14 relative flex items-center justify-center cursor-pointer border-[0.5px] border-slate-700 transition-all duration-300
                        ${cell.type === 'black' ? 'bg-slate-950' : 'bg-white text-slate-900'}
                        ${cell.isDouble ? 'bg-blue-50/50' : ''}
                        ${mode === 'text' && cell.type === 'white' ? 'hover:bg-blue-50' : ''}
                      `}
                    >
                      {cell.isDouble && cell.type === 'white' && (
                        <div className="absolute inset-1.5 border-[3px] border-blue-400/30 rounded-full pointer-events-none ring-1 ring-blue-500/20"></div>
                      )}

                      {cell.number && (
                        <span className="absolute top-1 left-1.5 text-[10px] font-black leading-none select-none text-slate-400 tracking-tighter">
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
                          className="w-full h-full bg-transparent text-center text-xl font-black outline-none focus:bg-blue-500/10 transition-colors caret-blue-500"
                          maxLength={1}
                        />
                      ) : (
                        <span className="text-xl font-black select-none tracking-tight">{cell.text}</span>
                      )}

                      {cell.type === 'black' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30 pointer-events-none"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CrosswordBuilder;
