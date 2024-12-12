import { Board, Move } from '@/types/game';
import { evaluateBoard,checkWinner } from './GameLogic';
const BOARD_SIZE = 10; // Kích thước bàn cờ

function alphaBeta(board: Board, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): Move {
  const winner = checkWinner(board, -1, -1);
  if (depth === 0 || winner !== null) {
    return { row: -1, col: -1, score: evaluateBoard(board) };
  }

  let bestMove: Move = { row: -1, col: -1, score: maximizingPlayer ? -Infinity : Infinity };

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        board[row][col] = maximizingPlayer ? 'O' : 'X';
        const { score } = alphaBeta(board, depth - 1, alpha, beta, !maximizingPlayer);
        board[row][col] = null;

        if (maximizingPlayer) {
          if (score > bestMove.score) {
            bestMove = { row, col, score };
          }
          alpha = Math.max(alpha, score);
        } else {
          if (score < bestMove.score) {
            bestMove = { row, col, score };
          }
          beta = Math.min(beta, score);
        }

        if (beta <= alpha) {
          break;
        }
      }
    }
  }

  return bestMove;
}
function minimax(board: Board, depth: number, maximizingPlayer: boolean): Move {
  // Kiểm tra điều kiện kết thúc (có người thắng hoặc hết nước đi)
  const winner = checkWinner(board, -1, -1);
  if (depth === 0 || winner !== null) {
    return { row: -1, col: -1, score: evaluateBoard(board) };
  }

  // Khởi tạo nước đi tốt nhất cho MAX hoặc MIN
  let bestMove: Move = { row: -1, col: -1, score: maximizingPlayer ? -Infinity : Infinity };

  // Duyệt qua từng ô trên bàn cờ
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        // Thực hiện nước đi tạm thời
        board[row][col] = maximizingPlayer ? 'O' : 'X';

        // Gọi đệ quy Minimax cho nước đi tiếp theo
        const { score } = minimax(board, depth - 1, !maximizingPlayer);

        // Hoàn tác nước đi
        board[row][col] = null;

        // Cập nhật nước đi tốt nhất cho MAX hoặc MIN
        if (maximizingPlayer) {
          if (score > bestMove.score) {
            bestMove = { row, col, score };
          }
        } else {
          if (score < bestMove.score) {
            bestMove = { row, col, score };
          }
        }
      }
    }
  }

  return bestMove;
}


export function getAIMove(board: Board): Move {
  return alphaBeta(board, 3, -Infinity, Infinity, true);
}
export function getAIMoveMinimax(board: Board): Move {
  return minimax(board, 3, true);
}
