import { Board, Player, Move } from '../types/game';

const BOARD_SIZE = 10; // Kích thước bàn cờ
const WIN_CONDITION = 5; // Số quân cờ liên tiếp cần để thắng
//Tạo một bàn cờ trống: Tạo một mảng 2D kích thước BOARD_SIZE x BOARD_SIZE với tất cả các ô ban đầu được gán giá trị null.
export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}
// Kiểm tra người chiến thắng. Trả về:
// Player nếu có người thắng ('X' hoặc 'O').
// 'Draw' nếu hòa.
// null nếu chưa kết thúc trận đấu.

export function checkWinner(board: Board, lastRow: number, lastCol: number): Player | 'Draw' | null {
// Nếu lastRow và lastCol là -1, điều đó có nghĩa là chúng ta đang kiểm tra toàn bộ bảng
  if (lastRow === -1 && lastCol === -1) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const result = checkWinnerForCell(board, row, col);
        if (result) return result;
      }
    }
  } else {
    // Chỉ kiểm tra nước đi cuối cùng
    return checkWinnerForCell(board, lastRow, lastCol);
  }

  // Check cho trường hợp hòa
  if (board.every(row => row.every(cell => cell !== null))) return 'Draw';

  return null;
}

//Kiểm tra ô tại (row, col) xem có quân cờ không. Nếu không có (null), thoát hàm.
function checkWinnerForCell(board: Board, row: number, col: number): Player | null {
  const player = board[row][col];
  // console.log(player)

  if (!player) return null;

  if (checkLine(board, row, col, 0, 1)) return player; // Ngang
  if (checkLine(board, row, col, 1, 0)) return player; // Dọc
  if (checkLine(board, row, col, 1, 1)) return player; // Chéo từ trên trái xuống dưới phải
  if (checkLine(board, row, col, 1, -1)) return player; // Chéo từ trên phải xuống dưới trái
//Gọi checkLine để kiểm tra từng hướng có đủ WIN_CONDITION quân cờ liên tiếp hay không.

  return null;
}
// Kiểm tra một hàng theo hướng (dRow, dCol).
function checkLine(board: Board, row: number, col: number, dRow: number, dCol: number): boolean {
  const player = board[row][col];
  let count = 1;
//count: Đếm số quân cờ liên tiếp.
//Duyệt về phía trước theo hướng (dRow, dCol) và tăng count nếu ô tiếp theo có cùng quân cờ.
//Kiểm tra hướng dương
  for (let i = 1; i < WIN_CONDITION; i++) {
    const newRow = row + i * dRow;
    const newCol = col + i * dCol;
    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
    if (board[newRow][newCol] === player) count++;
    else break;
  }
//Kiểm tra hướng âm
  for (let i = 1; i < WIN_CONDITION; i++) {
    const newRow = row - i * dRow;
    const newCol = col - i * dCol;
    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
    if (board[newRow][newCol] === player) count++;
    else break;
  }
//Duyệt ngược lại và tăng count nếu ô tiếp theo có cùng quân cờ.
//Trả về true nếu count lớn hơn hoặc bằng WIN_CONDITION.
  return count >= WIN_CONDITION;
}

//Đánh giá bàn cờ và trả về điểm số:
// Cộng điểm nếu quân 'O'.
// Trừ điểm nếu quân 'X'.
export function evaluateBoard(board: Board): number {
  let score = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 'O') score += evaluatePosition(board, row, col, 'O');
      else if (board[row][col] === 'X') score -= evaluatePosition(board, row, col, 'X');
    }
  }
  return score;
}
// Mục đích: Đánh giá điểm số cho một vị trí (row, col) cụ thể của một người chơi (player).
// directions: Mảng các hướng để kiểm tra gồm ngang [0, 1], dọc [1, 0], chéo [1, 1] và chéo ngược [1, -1].
function evaluatePosition(board: Board, row: number, col: number, player: Player): number {
  let score = 0;
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    let empty = 0;
//  count: Đếm số quân cờ liên tiếp.
// empty: Đếm số ô trống có thể mở rộng.
//Kiểm tra hướng dương
//Duyệt về phía trước để đếm số quân cờ và ô trống.
    for (let i = 1; i < WIN_CONDITION; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
      if (board[newRow][newCol] === player) count++;
      else if (board[newRow][newCol] === null) empty++;
      else break;
    }
    //Kiểm tra hướng âm
    for (let i = 1; i < WIN_CONDITION; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;
      if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
      if (board[newRow][newCol] === player) count++;
      else if (board[newRow][newCol] === null) empty++;
      else break;
    }
    score += calculateScore(count, empty);
  }
//Tính điểm dựa trên count và empty thông qua hàm calculateScore.
  return score;
}

function calculateScore(count: number, empty: number): number {
  if (count >= WIN_CONDITION) return 10000; // Thắng chắc chắn
  if (count === WIN_CONDITION - 1 && empty > 0) return 1000; // Gần thắng
  if (count === WIN_CONDITION - 2 && empty > 1) return 100; // Có cơ hội thắng
  return count; // Điểm cơ bản bằng số quân cờ liên tiếp
}

// Mục đích: Thực hiện thuật toán Alpha-Beta Pruning để tìm nước đi tốt nhất cho AI.
// Tham số:
// board: Bàn cờ hiện tại.
// depth: Độ sâu tối đa của thuật toán.
// alpha: Giá trị tốt nhất mà người chơi tối đa có thể đảm bảo.
// beta: Giá trị tốt nhất mà người chơi tối thiểu có thể đảm bảo.
// maximizingPlayer: true nếu AI là người chơi tối đa hóa ('O').
function alphaBeta(board: Board, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): Move {
  // Kiểm tra điều kiện dừng: đạt độ sâu tối đa hoặc trò chơi kết thúc
  const winner = checkWinner(board, -1, -1);
  
  if (depth === 0 || winner !== null) {
    return { row: -1, col: -1, score: evaluateBoard(board) };
  }
//Tạo bestMove khởi đầu và duyệt qua tất cả các ô trống.
  let bestMove: Move = { row: -1, col: -1, score: maximizingPlayer ? -Infinity : Infinity };

  // Duyệt qua tất cả các nước đi có thể
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        // Thử nước đi
        board[row][col] = maximizingPlayer ? 'O' : 'X';
        const { score } = alphaBeta(board, depth - 1, alpha, beta, !maximizingPlayer);
        board[row][col] = null; // Hoàn tác nước đi
//Đặt quân cờ, gọi đệ quy và sau đó hoàn tác nước đi.
        // Cập nhật nước đi tốt nhất
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
//Cập nhật bestMove, alpha, và beta tùy theo lượt chơi.
        // Cắt tỉa Alpha-Beta
        if (beta <= alpha) {
          break;
        }
      }
    }
  }

  return bestMove;
}
//Trả về nước đi tốt nhất cho AI bằng cách gọi alphaBeta với độ sâu là 3.
export function getAIMove(board: Board): Move {
  // Gọi hàm Alpha-Beta với độ sâu 3
  return alphaBeta(board, 3, -Infinity, Infinity, true);
}

// Các hàm hỗ trợ cho Q-learning
//  Trả về danh sách các ô trống để thực hiện nước đi.
export function getAvailableMoves(board: Board): Move[] {
  // Lấy danh sách các nước đi có thể
  const moves: Move[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        moves.push({ row, col, score: 0 });
      }
    }
  }
  return moves;
}
// Thực hiện nước đi và trả về bàn cờ mới.
export function makeMove(board: Board, move: Move, player: Player): Board {
  const newBoard = board.map(row => [...row]);
  newBoard[move.row][move.col] = player;
  return newBoard;
}

export function getBoardState(board: Board): string {
  // Chuyển đổi trạng thái bàn cờ thành chuỗi
  return board.map(row => row.map(cell => cell || '-').join('')).join('');
}

export function getReward(board: Board, player: Player): number {
  // Tính toán phần thưởng cho nước đi
  const winner = checkWinner(board, -1, -1);

  if (winner === player) 
  {

  return 1; // Thắng

    
  }
  if (winner === 'Draw') return 0.5; // Hòa
  if (winner) 
    {

      return -1; // Thua
    }
    // if (winner === "X") 
    //   {
  
    //     return -1; // Thua
    //   }
  return 0; // Chưa kết thúc
}

