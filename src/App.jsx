import React, { useState, useEffect } from 'react';

const CrosswordBuilder = () => {
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [grid, setGrid] = useState([]);
  const [mode, setMode] = useState('black');
  const [nextNumber, setNextNumber] = useState(1);

  // Initialize grid
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CROSSWORD BUILDER
            </h1>
            <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mt-1">Grid Editor Pro</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'black', label: '黒マス', icon: '■', color: 'bg-slate-700' },
              { id: 'double', label: '二重マス', icon: '◎', color: 'bg-blue-600' },
              { id: 'number', label: '番号', icon: '①', color: 'bg-emerald-600' },
              { id: 'text', label: '文字', icon: 'A', color: 'bg-indigo-600' },
            ].map(m => (
              <button
                key={m.id} onClick={() => setMode(m.id)}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${mode === m.id ? `${m.color} text-white shadow-xl` : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <span>{m.icon}</span><span>{m.label}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="space-y-6">
            <section className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-xl">
              <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 text-slate-500">Dimensions</h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Rows: {rows}</label>
                  <input type="range" min="3" max="50" value={rows} onChange={e => setRows(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Cols: {cols}</label>
                  <input type="range" min="3" max="50" value={cols} onChange={e => setCols(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
              </div>
            </section>
          </aside>

          <main className="lg:col-span-3 flex justify-center">
            <div className="bg-slate-900/20 p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
              <div
                className="grid gap-0 bg-slate-700 border-4 border-slate-950 rounded shadow-2xl"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))`, width: 'fit-content' }}
              >
                {grid.map((row, r) => row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => mode !== 'text' && handleCellClick(r, c)}
                    className={`
                      w-10 h-10 md:w-14 md:h-14 relative flex items-center justify-center cursor-pointer border-[0.5px] border-slate-800/50
                      ${cell.type === 'black' ? 'bg-slate-950' : 'bg-white text-slate-950'}
                    `}
                  >
                    {cell.isDouble && cell.type === 'white' && <div className="absolute inset-1.5 border-2 border-blue-400/20 rounded-full pointer-events-none"></div>}
                    {cell.number && <span className="absolute top-0.5 left-1 text-[8px] font-black text-blue-600/60 leading-none">{cell.number}</span>}
                    {mode === 'text' && cell.type === 'white' ? (
                      <input id={`cell-${r}-${c}`} type="text" value={cell.text} autoComplete="off" onChange={e => handleTextChange(r, c, e.target.value)} className="w-full h-full bg-transparent text-center text-xl font-black outline-none focus:bg-blue-500/5" maxLength={1} />
                    ) : (
                      <span className="text-xl font-black">{cell.text}</span>
                    )}
                  </div>
                )))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CrosswordBuilder;
