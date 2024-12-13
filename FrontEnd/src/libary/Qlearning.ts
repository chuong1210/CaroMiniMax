import { Board, Player, Move } from '../types/game';
import { getAvailableMoves, makeMove, getBoardState, getReward, checkWinner, getAIMove } from './GameLogic';

// Định nghĩa interface QTable
interface QTable {
  [state: string]: { [action: string]: number }; // Lưu trữ giá trị Q cho mỗi cặp trạng thái-hành động
}

export class QLearningAgent {
  private qTable: QTable = {}; // Bảng Q lưu trữ giá trị Q cho mỗi cặp trạng thái-hành động
  private learningRate: number = 0.1; // Tốc độ học: kiểm soát mức độ cập nhật giá trị Q
  private discountFactor: number = 0.9; // Hệ số chiết khấu: xác định tầm quan trọng của phần thưởng trong tương lai
  private explorationRate: number = 0.3; // Tỷ lệ khám phá: xác suất chọn hành động ngẫu nhiên

  constructor(qTable?: QTable) {
    if (qTable) {
      this.qTable = qTable; // Khởi tạo bảng Q từ dữ liệu có sẵn (nếu có)
    }
  }

  private getQValue(state: string, action: string): number {
    // Lấy giá trị Q cho cặp trạng thái-hành động, tạo mới nếu chưa tồn tại
    if (!this.qTable[state]) {
      this.qTable[state] = {};
    }
    if (!(action in this.qTable[state])) {
      this.qTable[state][action] = 0;
    }
    return this.qTable[state][action];
  }

  private setQValue(state: string, action: string, value: number) {
    // Cập nhật giá trị Q cho cặp trạng thái-hành động
    if (!this.qTable[state]) {
      this.qTable[state] = {};
    }
    this.qTable[state][action] = value;
  }

  chooseAction(board: Board): Move {
    const state = getBoardState(board);
    const availableMoves = getAvailableMoves(board);

    if (Math.random() < this.explorationRate) {
      // Chọn hành động ngẫu nhiên để khám phá
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Chọn hành động tốt nhất dựa trên giá trị Q hiện tại
    let bestMove = availableMoves[0];
    let bestValue = this.getQValue(state, `${bestMove.row},${bestMove.col}`);

    for (const move of availableMoves) {
      const value = this.getQValue(state, `${move.row},${move.col}`);
      if (value > bestValue) {
        bestMove = move;
        bestValue = value;
      }
    }

    return bestMove;
  }

  learn(oldState: string, action: string, reward: number, newState: string) {
    // Cập nhật giá trị Q dựa trên phương trình Bellman
    const oldQ = this.getQValue(oldState, action);
    const newQ = reward + this.discountFactor * this.getBestQValue(newState);
    const updatedQ = oldQ + this.learningRate * (newQ - oldQ);
    this.setQValue(oldState, action, updatedQ);
    
  }

  private getBestQValue(state: string): number {
    // Lấy giá trị Q tốt nhất cho trạng thái mới
    if (!this.qTable[state]) return 0;
    return Math.max(...Object.values(this.qTable[state]));
  }

  getQTable(): QTable {
    return this.qTable; // Trả về bảng Q hiện tại
  }

  setQTable(qTable: QTable) {
    this.qTable = qTable; // Cập nhật bảng Q từ dữ liệu bên ngoài
  }
}

export async function trainAgent(
  updateProgress: (progress: number) => void,
  updateBoard: (board: Board) => void,
  stopSignal: { current: boolean }
): Promise<QTable> {
  const agent = new QLearningAgent();
  let episodeCount = 0;

  while (!stopSignal.current) {
    let board = Array(10).fill(null).map(() => Array(10).fill(null)); // Khởi tạo bàn cờ trống
    let currentPlayer: Player = 'X';

    while (!stopSignal.current) {
      const state = getBoardState(board);
      const move = currentPlayer === 'X' ? agent.chooseAction(board) : getAIMove(board); // Chọn nước đi cho người chơi hiện tại
      const action = `${move.row},${move.col}`;

      board = makeMove(board, move, currentPlayer); // Thực hiện nước đi
      updateBoard(board);
      
      await new Promise(resolve => setTimeout(resolve, 10)); // Tạo độ trễ nhỏ để cập nhật giao diện

      const reward = getReward(board, currentPlayer);
      const newState = getBoardState(board);

      if (currentPlayer === 'X') {
        // console.log(`Learning: State = ${state}, Action = ${action}, Reward = ${reward}, NewState = ${newState}`);
        agent.learn(state, action, reward, newState); // Cập nhật giá trị Q cho agent
      }

      else
      {
        // console.log(`Learning:1 State = ${state}, Action = ${action}, Reward = ${reward}, NewState = ${newState}`);

      }
      if (checkWinner(board, move.row, move.col) !== null) {
        break; // Kết thúc ván đấu nếu có người thắng hoặc hòa
      }

      currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Chuyển lượt chơi
    }


    episodeCount++;
    updateProgress(episodeCount);
    await new Promise(resolve => setTimeout(resolve, 0)); // Cho phép cập nhật giao diện
  }

  console.log(agent.getQTable())

  return agent.getQTable();
}

export function loadQTableFromFile(file: File): Promise<QTable> {
  // Đọc và phân tích dữ liệu Q-table từ file
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const qTable = JSON.parse(event.target?.result as string);
        resolve(qTable);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

