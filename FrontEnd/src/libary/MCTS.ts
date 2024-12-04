class MCTSNode {
    board: Array<string | null>;
    player: "X" | "O";
    move: number | null;
    visits: number;
    wins: number;
    children: MCTSNode[];
  
    constructor(board: Array<string | null>, player: "X" | "O", move: number | null) {
      this.board = board;
      this.player = player;
      this.move = move;
      this.visits = 0;
      this.wins = 0;
      this.children = [];
    }
  
    isFullyExpanded(): boolean {
      return this.children.length === this.getLegalMoves().length;
    }
  
    getLegalMoves(): number[] {
      return this.board
        .map((cell, index) => (cell === null ? index : -1))
        .filter((index) => index !== -1);
    }
  
    bestChild(c: number = Math.sqrt(2)): MCTSNode {
      return this.children.reduce((best, child) => {
        const ucb = (child.wins / (child.visits || 1)) + c * Math.sqrt(Math.log(this.visits + 1) / (child.visits || 1));
        return ucb > (best.wins / (best.visits || 1)) ? child : best;
      });
    }
  }
  
  export const mctsCore = (
    board: Array<string | null>,
    currentPlayer: "X" | "O",
    iterations: number = 1000
  ): number => {
    const root = new MCTSNode(board, currentPlayer, null);
  
    for (let i = 0; i < iterations; i++) {
      let node = root;
      const path: MCTSNode[] = [node];
  
      // Selection: Chọn node chưa mở rộng hoặc tốt nhất theo UCB
      while (node.isFullyExpanded() && node.children.length > 0) {
        node = node.bestChild();
        path.push(node);
      }
  
      // Expansion: Thêm một node con nếu có nước đi hợp lệ
      if (!node.isFullyExpanded()) {
        const moves = node.getLegalMoves();
        for (const move of moves) {
          const newBoard = [...node.board];
          newBoard[move] = node.player;
          const childNode = new MCTSNode(newBoard, node.player === "X" ? "O" : "X", move);
          node.children.push(childNode);
          path.push(childNode);
          break;
        }
      }
  
      // Simulation: Mô phỏng ngẫu nhiên từ trạng thái hiện tại
      const currentBoard = path[path.length - 1].board;
      let currentPlayer = path[path.length - 1].player;
      while (!calculateWinner(currentBoard) && currentBoard.includes(null)) {
        const moves = currentBoard
          .map((cell, index) => (cell === null ? index : -1))
          .filter((index) => index !== -1);
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        currentBoard[randomMove] = currentPlayer;
        currentPlayer = currentPlayer === "X" ? "O" : "X";
      }
  
      // Backpropagation: Cập nhật thông tin thắng thua
      const winner = calculateWinner(currentBoard);
      for (const n of path) {
        n.visits++;
        if (winner === n.player) {
          n.wins++;
        }
      }
    }
  
    // Chọn nước đi tốt nhất
    const bestChild = root.bestChild(0); // Không sử dụng UCB khi chọn nước đi cuối cùng.
    return bestChild.move!;
  };
  
  const calculateWinner = (board: Array<string | null>): string | null => {
    const lines = 10;
    const directions = [
      { dx: 1, dy: 0 }, // Horizontal
      { dx: 0, dy: 1 }, // Vertical
      { dx: 1, dy: 1 }, // Diagonal down-right
      { dx: 1, dy: -1 }, // Diagonal up-right
    ];
  
    for (let x = 0; x < lines; x++) {
      for (let y = 0; y < lines; y++) {
        const index = x * lines + y;
        if (board[index]) {
          for (const { dx, dy } of directions) {
            let count = 1;
            for (let step = 1; step < 5; step++) {
              const nx = x + step * dx;
              const ny = y + step * dy;
              if (nx >= 0 && ny >= 0 && nx < lines && ny < lines) {
                const nIndex = nx * lines + ny;
                if (board[nIndex] === board[index]) count++;
                else break;
              } else break;
            }
            if (count === 5) return board[index];
          }
        }
      }
    }
    return null;
  };