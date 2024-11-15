const aiEasy = (board: (string | null)[]): number => {
    const emptyCells = board
        .map((value, index) => value === null ? index : -1)
        .filter(index => index !== -1);

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};
const aiMedium = (board: (string | null)[], symbol: string): number => {
    const opponentSymbol = symbol === "X" ? "O" : "X";

    // Chặn đối thủ nếu có thể thắng
    const blockOpponent = (board: (string | null)[], symbol: string) => {
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = symbol;
                if (calculateWinner(board) === symbol) {
                    board[i] = null;
                    return i;
                }
                board[i] = null;
            }
        }
        return -1;
    };

    // Kiểm tra nếu có thể thắng và tạo nước đi chiến thắng
    const winMove = (board: (string | null)[], symbol: string) => {
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = symbol;
                if (calculateWinner(board) === symbol) {
                    board[i] = null;
                    return i;
                }
                board[i] = null;
            }
        }
        return -1;
    };

    // Kiểm tra thắng trước
    const winningMove = winMove(board, symbol);
    if (winningMove !== -1) return winningMove;

    // Nếu không thể thắng, chặn đối thủ
    const blockMove = blockOpponent(board, opponentSymbol);
    if (blockMove !== -1) return blockMove;

    // Nếu không có nước đi chiến thắng hay chặn, chọn ngẫu nhiên
    return aiEasy(board);
};

const aiHard = (board: (string | null)[], symbol: string): number => {
    const opponentSymbol = symbol === "X" ? "O" : "X";

    // Đánh giá bàn cờ và trả về điểm
    const evaluate = (board: (string | null)[], symbol: string): number => {
        const winner = calculateWinner(board);
        if (winner === symbol) return 1;
        if (winner === opponentSymbol) return -1;
        return 0;
    };

    // Thuật toán Minimax
    const minimax = (board: (string | null)[], depth: number, isMaximizingPlayer: boolean, symbol: string): number => {
        const score = evaluate(board, symbol);
        if (score === 1) return score;
        if (score === -1) return score;
        if (board.every(cell => cell !== null)) return 0; // Tie

        let best = isMaximizingPlayer ? -Infinity : Infinity;

        // Duyệt qua tất cả các ô trống và thử các nước đi
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = isMaximizingPlayer ? symbol : opponentSymbol;
                const value = minimax(board, depth + 1, !isMaximizingPlayer, symbol);
                best = isMaximizingPlayer
                    ? Math.max(best, value)
                    : Math.min(best, value);
                board[i] = null;
            }
        }
        return best;
    };

    // Tìm nước đi tối ưu
    const findBestMove = (board: (string | null)[], symbol: string): number => {
        let bestVal = -Infinity;
        let bestMove = -1;

        // Duyệt qua tất cả các ô trống và tính toán giá trị của từng nước đi
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = symbol;
                const moveVal = minimax(board, 0, false, symbol);
                if (moveVal > bestVal) {
                    bestMove = i;
                    bestVal = moveVal;
                }
                board[i] = null;
            }
        }

        return bestMove;
    };

    return findBestMove(board, symbol);
};

const handleAIMove = (board: (string | null)[], symbol: string,difficulty:string) => {
    let aiMove: number;

    // Chọn AI dựa trên mức độ khó
    switch (difficulty) {
        case "easy":
            aiMove = aiEasy(board);
            break;
        case "medium":
            aiMove = aiMedium(board, symbol);
            break;
        case "hard":
            aiMove = aiHard(board, symbol);
            break;
        default:
            aiMove = aiEasy(board);
            break;
    }

    // Thực hiện nước đi của AI
    board[aiMove] = symbol;
    return board;
};
const calculateWinner = (board: (string | null)[]): string | null => {
    const size = 10;
    const winLength = 5;
    const lines = [];
  
    // Check rows, columns, and diagonals
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
  
    // Check lines for winner
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [a, b, c, d, e] = line.map((index) => board[index]);
      if (a && a === b && a === c && a === d && a === e) {
        return a;
      }
    }
  
    return null;
  };
  