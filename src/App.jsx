import React, { useState, useEffect } from 'react';

const CrosswordBuilder = () => {
  const [rows, setRows] = useState(() => Number(localStorage.getItem('crossword-rows')) || 10);
  const [cols, setCols] = useState(() => Number(localStorage.getItem('crossword-cols')) || 10);
  const [grid, setGrid] = useState(() => {
    const saved = localStorage.getItem('crossword-grid');
    return saved ? JSON.parse(saved) : [];
  });
  const [mode, setMode] = useState('black');
  const [nextNumber, setNextNumber] = useState(() => Number(localStorage.getItem('crossword-nextNumber')) || 1);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedLength, setSelectedLength] = useState(null);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [searchPattern, setSearchPattern] = useState([]); // 文字検索用パターン
  const [cluesAcross, setCluesAcross] = useState(() => {
    const saved = localStorage.getItem('crossword-clues-across');
    return saved ? JSON.parse(saved) : {};
  });
  const [cluesDown, setCluesDown] = useState(() => {
    const saved = localStorage.getItem('crossword-clues-down');
    return saved ? JSON.parse(saved) : {};
  });
  const [showCluePanel, setShowCluePanel] = useState(false);

  // CSVファイルの読み込み
  useEffect(() => {
    fetch('/051_crossword/questions.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n').slice(1); // ヘッダーをスキップ
        const parsed = lines.map(line => {
          const [length, genre, difficulty, word, clue] = line.split(',');
          return { length: Number(length), genre, difficulty, word, clue };
        });
        setQuestions(parsed);
      })
      .catch(err => console.error('CSV読み込みエラー:', err));
  }, []);

  // 永続化（保存）
  useEffect(() => {
    if (grid.length > 0) {
      localStorage.setItem('crossword-grid', JSON.stringify(grid));
      localStorage.setItem('crossword-rows', rows);
      localStorage.setItem('crossword-cols', cols);
      localStorage.setItem('crossword-nextNumber', nextNumber);
      localStorage.setItem('crossword-clues-across', JSON.stringify(cluesAcross));
      localStorage.setItem('crossword-clues-down', JSON.stringify(cluesDown));
    }
  }, [grid, rows, cols, nextNumber, cluesAcross, cluesDown]);

  // グリッド初期化（データがない場合のみ、またはサイズ変更時）
  useEffect(() => {
    if (grid.length === 0 || grid.length !== rows || grid[0]?.length !== cols) {
      // 既存のデータを可能な限り保持しつつリサイズ
      const newGrid = Array(rows).fill().map((_, r) =>
        Array(cols).fill().map((_, c) => {
          if (grid[r] && grid[r][c]) return grid[r][c];
          return {
            type: 'white',
            isDouble: false,
            text: '',
            number: null,
            autoCount: null
          };
        })
      );
      setGrid(newGrid);
    }
  }, [rows, cols]);

  // マス目の自動カウント計算
  useEffect(() => {
    if (grid.length === 0) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell, autoCount: null })));

    // 各セルについて、縦横のカウントを計算
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].type === 'black') continue;
        if (!newGrid[r][c].number) continue;

        // 横方向のカウント
        let hCount = 0;
        for (let cc = c; cc < cols && newGrid[r][cc].type !== 'black'; cc++) {
          hCount++;
        }

        // 縦方向のカウント
        let vCount = 0;
        for (let rr = r; rr < rows && newGrid[rr][c].type !== 'black'; rr++) {
          vCount++;
        }

        newGrid[r][c].autoCount = { h: hCount > 1 ? hCount : null, v: vCount > 1 ? vCount : null };
      }
    }

    setGrid(newGrid);
  }, [grid.map(row => row.map(cell => `${cell.type}${cell.number}`).join('')).join('|')]);

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

  const handleTextChange = (r, c, val, isComposing) => {
    if (mode !== 'text') return;
    const newGrid = [...grid.map(row => [...row])];
    newGrid[r][c].text = val;
    setGrid(newGrid);

    // IME入力中でない場合のみ次のマスへ移動
    if (!isComposing && val && c < cols - 1 && newGrid[r][c + 1].type !== 'black') {
      setTimeout(() => {
        document.getElementById(`cell-${r}-${c + 1}`)?.focus();
      }, 10);
    }
  };

  const handleQuestionSelect = (question) => {
    alert(`選択した問題:\n言葉: ${question.word}\n鍵: ${question.clue}\n文字数: ${question.length}`);
    setShowQuestionPanel(false);
  };

  const handleLengthFilter = (length) => {
    setSelectedLength(length);
    setSearchPattern(Array(length).fill(''));
    setShowQuestionPanel(true);
  };

  const handlePatternChange = (index, val) => {
    const newPattern = [...searchPattern];
    newPattern[index] = val.slice(-1); // 1文字だけ受け付ける
    setSearchPattern(newPattern);
  };

  // 実際に表示する問題のフィルタリング
  const displayedQuestions = questions.filter(q => {
    if (q.length !== selectedLength) return false;
    return searchPattern.every((char, index) => {
      if (!char) return true;
      return q.word[index] === char;
    });
  });

  // 盤面からカギ情報を抽出（番号と入力済みの単語）
  const getClueData = () => {
    const across = [];
    const down = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell.type === 'white' && cell.number) {
          // 横のカギ抽出
          if (c === 0 || grid[r][c - 1].type === 'black') {
            let word = '';
            for (let cc = c; cc < cols && grid[r][cc].type !== 'black'; cc++) {
              word += grid[r][cc].text || '□';
            }
            if (word.length > 1) {
              across.push({ number: cell.number, word, length: word.length });
            }
          }
          // 縦のカギ抽出
          if (r === 0 || grid[r - 1][c].type === 'black') {
            let word = '';
            for (let rr = r; rr < rows && grid[rr][c].type !== 'black'; rr++) {
              word += grid[rr][c].text || '□';
            }
            if (word.length > 1) {
              down.push({ number: cell.number, word, length: word.length });
            }
          }
        }
      }
    }
    return { across: across.sort((a, b) => a.number - b.number), down: down.sort((a, b) => a.number - b.number) };
  };

  const currentClueData = getClueData();

  // ヒントのCSVエクスポート
  const exportHintsToCSV = () => {
    let csv = 'Type,Number,Clue\n';
    Object.keys(cluesAcross).forEach(num => {
      csv += `Across,${num},"${cluesAcross[num].replace(/"/g, '""')}"\n`;
    });
    Object.keys(cluesDown).forEach(num => {
      csv += `Down,${num},"${cluesDown[num].replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'crossword_hints.csv';
    link.click();
  };

  // ヒントのCSVインポート
  const importHintsFromCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.trim().split('\n').slice(1);
      const newAcross = { ...cluesAcross };
      const newDown = { ...cluesDown };

      lines.forEach(line => {
        // カンマ区切りだが、ダブルクォート内のカンマを考慮
        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (parts && parts.length >= 3) {
          const type = parts[0].trim();
          const num = parts[1].trim();
          const clue = parts[2].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
          if (type === 'Across') newAcross[num] = clue;
          if (type === 'Down') newDown[num] = clue;
        }
      });

      setCluesAcross(newAcross);
      setCluesDown(newDown);
      alert('ヒントをインポートしました');
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8 font-sans print:p-0 print:bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
          .bg-white { box-shadow: none !important; border: none !important; }
        }
        .print-only { display: none; }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 no-print">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 tracking-tight">
                CROSSWORD BUILDER PRO
              </h1>
              <p className="text-gray-500 font-bold text-xs mt-1 uppercase tracking-widest">Premium Puzzle Creator</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl shadow-lg border border-blue-50">
              <button
                onClick={() => setShowCluePanel(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-sm font-black shadow-md hover:scale-105 transition-transform"
              >
                ヒントの作成
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-black shadow-md hover:scale-105 transition-transform"
              >
                印刷
              </button>
              <div className="h-8 w-px bg-gray-100 mx-1"></div>
              {[
                { id: 'black', label: '黒マス', icon: '⬛' },
                { id: 'double', label: '二重マス', icon: '🔵' },
                { id: 'number', label: '番号', icon: '🔢' },
                { id: 'text', label: '文字', icon: '✍️' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-black transition-all ${mode === m.id
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg scale-105'
                    : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  <span className="mr-1">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* サイドバー */}
          <aside className="lg:col-span-1 space-y-4">
            {/* サイズ設定 */}
            <section className="bg-white p-5 rounded-xl shadow-md border border-blue-100">
              <h2 className="text-sm font-bold text-gray-700 mb-4">グリッドサイズ</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-2">
                    行数: <span className="text-blue-600 font-bold">{rows}</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={rows}
                    onChange={e => setRows(Number(e.target.value))}
                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-2">
                    列数: <span className="text-blue-600 font-bold">{cols}</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={cols}
                    onChange={e => setCols(Number(e.target.value))}
                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </section>

            {/* 文字数フィルター */}
            <section className="bg-white p-5 rounded-xl shadow-md border border-blue-100">
              <h2 className="text-sm font-bold text-gray-700 mb-3">文字数で問題検索</h2>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(len => {
                  const count = questions.filter(q => q.length === len).length;
                  return (
                    <button
                      key={len}
                      onClick={() => handleLengthFilter(len)}
                      disabled={count === 0}
                      className={`p-2 rounded-lg text-sm font-bold transition-all ${count > 0
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:scale-105 shadow-md'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      {len}文字
                      {count > 0 && <div className="text-[10px] opacity-80">{count}問</div>}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 次の番号表示 */}
            <section className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-xl shadow-md text-white">
              <h2 className="text-sm font-bold mb-2">次の番号</h2>
              <input
                type="number"
                min="1"
                value={nextNumber}
                onChange={e => setNextNumber(Math.max(1, Number(e.target.value)))}
                className="w-full bg-transparent text-4xl font-black outline-none border-b-2 border-white/20 focus:border-white/50 transition-colors"
              />
            </section>
          </aside>

          {/* メイングリッド */}
          <main className="lg:col-span-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
              <div
                className="grid gap-0 border-4 border-gray-800 shadow-2xl mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(45px, 1fr))`,
                  width: 'fit-content'
                }}
              >
                {grid.map((row, r) => row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => mode !== 'text' && handleCellClick(r, c)}
                    className={`
                      w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center cursor-pointer border border-gray-300
                      ${cell.type === 'black' ? 'bg-gray-900' : 'bg-white hover:bg-blue-50'}
                      transition-colors
                    `}
                  >
                    {/* 二重マス */}
                    {cell.isDouble && cell.type === 'white' && (
                      <div className="absolute inset-2 border-2 border-blue-400 rounded-full pointer-events-none"></div>
                    )}

                    {/* 番号 */}
                    {cell.number && (
                      <span className="absolute top-0.5 left-1 text-[10px] font-black text-blue-600 leading-none">
                        {cell.number}
                      </span>
                    )}

                    {/* 自動カウント表示 */}
                    {cell.autoCount && cell.type === 'white' && (
                      <div className="absolute top-0.5 right-1 text-[9px] font-bold text-gray-400 leading-none">
                        {cell.autoCount.h && <div>→{cell.autoCount.h}</div>}
                        {cell.autoCount.v && <div>↓{cell.autoCount.v}</div>}
                      </div>
                    )}

                    {/* 文字入力 */}
                    {mode === 'text' && cell.type === 'white' ? (
                      <input
                        id={`cell-${r}-${c}`}
                        type="text"
                        value={cell.text}
                        autoComplete="off"
                        onChange={e => handleTextChange(r, c, e.target.value, e.nativeEvent.isComposing)}
                        onCompositionEnd={e => handleTextChange(r, c, e.target.value, false)}
                        className="w-full h-full bg-transparent text-center text-2xl font-black text-gray-900 outline-none focus:bg-yellow-50"
                        style={{ imeMode: 'active' }}
                      />
                    ) : (
                      <span className="text-2xl font-black text-gray-900">{cell.text}</span>
                    )}
                  </div>
                )))}
              </div>
            </div>
          </main>
        </div>

        {/* 問題選択パネル */}
        {showQuestionPanel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 no-print">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black">{selectedLength}文字の問題一覧</h2>
                    <p className="text-blue-100 text-sm mt-1">{displayedQuestions.length}個見つかりました</p>
                  </div>
                  <button
                    onClick={() => setShowQuestionPanel(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* パターン検索UI */}
              <div className="bg-blue-50 p-4 border-b border-blue-100 flex flex-wrap justify-center gap-2">
                {searchPattern.map((char, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <input
                      type="text"
                      value={char}
                      onChange={e => handlePatternChange(i, e.target.value)}
                      className="w-10 h-10 md:w-12 md:h-12 text-center text-xl font-black border-2 border-blue-200 rounded-xl focus:border-blue-500 bg-white shadow-inner outline-none text-blue-700"
                      placeholder="□"
                    />
                    <span className="text-[10px] font-bold text-blue-400 mt-1">{i + 1}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-3">
                  {displayedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuestionSelect(q)}
                      className="w-full text-left p-4 bg-white hover:bg-blue-50 rounded-xl transition-all border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-black text-xl text-gray-900 group-hover:text-blue-600">{q.word}</div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg uppercase">{q.difficulty}</span>
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">{q.clue}</div>
                      <div className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">
                        {q.genre} | {q.length}文字
                      </div>
                    </button>
                  ))}
                  {displayedQuestions.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-4xl mb-4">🔍</div>
                      <p>条件に合う問題が見つかりませんでした</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ヒント作成パネル */}
        {showCluePanel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 no-print">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black">ヒントの作成</h2>
                    <p className="text-blue-100 text-sm mt-1">パズルの鍵（ヒント）を入力・管理します</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={exportHintsToCSV}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-xs font-black transition-colors flex items-center gap-1"
                    >
                      <span>📥</span> CSVを書き出す
                    </button>
                    <label className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-black transition-colors flex items-center gap-1 cursor-pointer">
                      <span>📤</span> CSVを読み込む
                      <input type="file" accept=".csv" onChange={importHintsFromCSV} className="hidden" />
                    </label>
                    <button
                      onClick={() => setShowCluePanel(false)}
                      className="text-white hover:bg-white/20 rounded-full p-2 transition-colors ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 横のカギ */}
                  <section>
                    <h3 className="text-lg font-black text-blue-800 mb-4 flex items-center">
                      <span className="mr-2">➡️</span> 横のカギ
                    </h3>
                    <div className="space-y-4">
                      {currentClueData.across.map(clue => (
                        <div key={`across-${clue.number}`} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-black">{clue.number}</span>
                            <span className="font-black text-gray-800">{clue.word}</span>
                            <span className="text-gray-400 text-xs">({clue.length}文字)</span>
                          </div>
                          <textarea
                            value={cluesAcross[clue.number] || ''}
                            onChange={e => setCluesAcross({ ...cluesAcross, [clue.number]: e.target.value })}
                            placeholder="ヒントを入力してください..."
                            className="w-full p-2 text-sm border-2 border-gray-100 rounded-lg focus:border-blue-300 outline-none resize-none h-16"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                  {/* 縦のカギ */}
                  <section>
                    <h3 className="text-lg font-black text-indigo-800 mb-4 flex items-center">
                      <span className="mr-2">⬇️</span> 縦のカギ
                    </h3>
                    <div className="space-y-4">
                      {currentClueData.down.map(clue => (
                        <div key={`down-${clue.number}`} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-black">{clue.number}</span>
                            <span className="font-black text-gray-800">{clue.word}</span>
                            <span className="text-gray-400 text-xs">({clue.length}文字)</span>
                          </div>
                          <textarea
                            value={cluesDown[clue.number] || ''}
                            onChange={e => setCluesDown({ ...cluesDown, [clue.number]: e.target.value })}
                            placeholder="ヒントを入力してください..."
                            className="w-full p-2 text-sm border-2 border-gray-100 rounded-lg focus:border-indigo-300 outline-none resize-none h-16"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
              <div className="p-4 bg-gray-100 border-t flex justify-end">
                <button
                  onClick={() => setShowCluePanel(false)}
                  className="px-8 py-2 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
                >
                  保存して閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 印刷専用セクション */}
        <div className="print-only p-8">
          <h1 className="text-2xl font-black mb-8 border-b-4 border-black pb-2">CROSSWORD PUZZLE</h1>
          <div className="mb-12 flex justify-center">
            {/* 盤面（印刷用：入力欄なし） */}
            <div
              className="grid gap-0 border-4 border-black"
              style={{
                gridTemplateColumns: `repeat(${cols}, 40px)`,
                width: 'fit-content'
              }}
            >
              {grid.map((row, r) => row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`
                    w-[40px] h-[40px] relative flex items-center justify-center border border-black
                    ${cell.type === 'black' ? 'bg-black' : 'bg-white'}
                  `}
                >
                  {cell.number && (
                    <span className="absolute top-0.5 left-1 text-[8px] font-black leading-none">
                      {cell.number}
                    </span>
                  )}
                  {cell.isDouble && cell.type === 'white' && (
                    <div className="absolute inset-1 border border-black rounded-full"></div>
                  )}
                </div>
              )))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 text-sm">
            <div>
              <h2 className="font-black border-b-2 border-black mb-4">＜横のカギ＞</h2>
              <ul className="space-y-2">
                {currentClueData.across.map(clue => (
                  <li key={`print-across-${clue.number}`} className="flex gap-2">
                    <span className="font-black min-w-[20px]">{clue.number}</span>
                    <span className="flex-1">{cluesAcross[clue.number] || '（ヒント未入力）'}</span>
                    <span className="text-[10px] text-gray-400">[{clue.length}字]</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-black border-b-2 border-black mb-4">＜縦のカギ＞</h2>
              <ul className="space-y-2">
                {currentClueData.down.map(clue => (
                  <li key={`print-down-${clue.number}`} className="flex gap-2">
                    <span className="font-black min-w-[20px]">{clue.number}</span>
                    <span className="flex-1">{cluesDown[clue.number] || '（ヒント未入力）'}</span>
                    <span className="text-[10px] text-gray-400">[{clue.length}字]</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CrosswordBuilder;
