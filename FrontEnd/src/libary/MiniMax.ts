
// Hàm đánh giá bàn cờ
const evaluateBoard=(board: string[], depth: number): number =>{
    const winner = calculateWinner(board);
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    return 0;
  }
  
// Thuật toán Minimax cập nhật
const minimax = (
    board: string[],
    depth: number,
    isMaximizing: boolean,
    alpha: number = -Infinity,
    beta: number = Infinity
  ): { score: number; move?: [number, number] } => {
    const score = evaluateBoard(board, depth);
    if (score !== 0 || depth === 0) {
      return { score }; // Trả về điểm số nếu có người chiến thắng hoặc đạt độ sâu tối đa
    }
  
    const emptyCells = getEmptyCells(board);
    if (emptyCells.length === 0) {
      return { score: 0 }; // Bàn cờ đầy, không có chiến thắng
    }
  
    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove: [number, number] | undefined;
  
      for (const [i, j] of emptyCells) {
        board[i * 10 + j] = "O"; // "O" là người chơi tối ưu
        const { score } = minimax(board, depth - 1, false, alpha, beta); // Gọi Minimax cho đối thủ (X)
        board[i * 10 + j] = ""; // Hoàn tác bước đi
  
        if (score > bestScore) {
          bestScore = score;
          bestMove = [i, j];
        }
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break; // Cắt tỉa Alpha-Beta
      }
  
      return { score: bestScore, move: bestMove };
    } else {
      let bestScore = Infinity;
      let bestMove: [number, number] | undefined;
  
      for (const [i, j] of emptyCells) {
        board[i * 10 + j] = "X"; // "X" là đối thủ
        const { score } = minimax(board, depth - 1, true, alpha, beta); // Gọi Minimax cho bạn (O)
        board[i * 10 + j] = ""; // Hoàn tác bước đi
  
        if (score < bestScore) {
          bestScore = score;
          bestMove = [i, j];
        }
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break; // Cắt tỉa Alpha-Beta
      }
  
      return { score: bestScore, move: bestMove };
    }
  }
  // Hàm lấy các ô trống
  const getEmptyCells=(board: string[]): [number, number][]=> {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (!board[i * 10 + j]) {
          emptyCells.push([i, j]);
        }
      }
    }
    return emptyCells;
  }
  
  // Hàm kiểm tra chiến thắng
  const calculateWinner=(board: (string | null)[]): string | null=> {
    const size = 10;
    const winLength = 5;
    const lines = [];
  
    for (let row = 0; row < size; row++) {
      for (let col = 0; col <= size - winLength; col++) {
        lines.push(
          Array.from({ length: winLength }, (_, i) => row * size + col + i)
        );
      }
    }
  
    for (let col = 0; col < size; col++) {
      for (let row = 0; row <= size - winLength; row++) {
        lines.push(
          Array.from({ length: winLength }, (_, i) => (row + i) * size + col)
        );
      }
    }
  
    for (let row = 0; row <= size - winLength; row++) {
      for (let col = 0; col <= size - winLength; col++) {
        lines.push(
          Array.from({ length: winLength }, (_, i) => (row + i) * size + col + i)
        );
      }
    }
  
    for (let row = 0; row <= size - winLength; row++) {
      for (let col = winLength - 1; col < size; col++) {
        lines.push(
          Array.from({ length: winLength }, (_, i) => (row + i) * size + col - i)
        );
      }
    }
  
    for (const line of lines) {
      const [a, b, c, d, e] = line.map((index) => board[index]);
      if (a && a === b && a === c && a === d && a === e) {
        return a;
      }
    }
  
    return null;
  }
  export type Board = string[][];

  const  getWinningLines=(board: Board): string[][] =>{
    const lines: string[][] = [];
    const size = board.length;
  
    // Check rows and columns
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - 5; j++) {
        // Horizontal (rows)
        lines.push(board[i].slice(j, j + 5));
  
        // Vertical (columns)
        lines.push([0, 1, 2, 3, 4].map(k => board[j + k][i]));
      }
    }
  
    // Check diagonals
    for (let i = 0; i <= size - 5; i++) {
      for (let j = 0; j <= size - 5; j++) {
        // Diagonal down-right
        lines.push([0, 1, 2, 3, 4].map(k => board[i + k][j + k]));
  
        // Diagonal up-right
        if (i >= 4) {
          lines.push([0, 1, 2, 3, 4].map(k => board[i - k][j + k]));
        }
      }
    }
  
    return lines;
  }
  
  const predictOpponentMove = (board: string[]): boolean => {
    const emptyCells = getEmptyCells(board);
    for (const [i, j] of emptyCells) {
      // Simulate opponent's move
      const newBoard = [...board];
      newBoard[i * 10 + j] = "X"; // Assuming opponent is 'X'
      if (calculateWinner(newBoard) === "X") {
        return true; // Opponent can win by placing at (i, j)
      }
    }
    return false;
  };
  
export default { 
  minimax, 
  getEmptyCells, 
  evaluateBoard, 
  getWinningLines,
  calculateWinner 
};