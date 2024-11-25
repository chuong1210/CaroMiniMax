// class MCTSNode {
//     state: (string | null)[];
//     parent: MCTSNode | null;
//     children: MCTSNode[];
//     wins: number;
//     visits: number;
//     untriedMoves: number[];
//     playerSymbol: string;

//     constructor(state: (string | null)[], parent: MCTSNode | null, playerSymbol: string) {
//         this.state = [...state];
//         this.parent = parent;
//         this.children = [];
//         this.wins = 0;
//         this.visits = 0;
//         this.playerSymbol = playerSymbol;
//         this.untriedMoves = this.getEmptyCells(state);
//     }

//     getEmptyCells(board: (string | null)[]): number[] {
//         return board
//             .map((cell, index) => cell === null ? index : -1)
//             .filter(index => index !== -1);
//     }

//     // UCT = exploitation + exploration
//     getUCT(parentVisits: number): number {
//         const exploitation = this.wins / this.visits;
//         const exploration = Math.sqrt(2 * Math.log(parentVisits) / this.visits);
//         return exploitation + exploration;
//     }

//     // Chọn node con tốt nhất dựa trên UCT
//     selectChild(): MCTSNode {
//         const parentVisits = this.visits;
//         return this.children.reduce((bestChild, child) => {
//             const childUCT = child.getUCT(parentVisits);
//             const bestUCT = bestChild.getUCT(parentVisits);
//             return childUCT > bestUCT ? child : bestChild;
//         });
//     }
// }

// class MCTS {
//     private readonly maxIterations: number;
//     private readonly timeLimit: number;
    
//     constructor(maxIterations: number = 1000, timeLimit: number = 1000) {
//         this.maxIterations = maxIterations;
//         this.timeLimit = timeLimit;
//     }

//     getBestMove(board: (string | null)[], playerSymbol: string): number {
//         const rootNode = new MCTSNode(board, null, playerSymbol);
//         const startTime = Date.now();

//         for (let i = 0; i < this.maxIterations; i++) {
//             if (Date.now() - startTime > this.timeLimit) break;

//             // 1. Selection
//             let node = this.select(rootNode);

//             // 2. Expansion
//             if (node.untriedMoves.length > 0 && !this.isTerminal(node.state)) {
//                 node = this.expand(node);
//             }

//             // 3. Simulation
//             const winner = this.simulate(node);

//             // 4. Backpropagation
//             this.backpropagate(node, winner);
//         }

//         // Chọn nước đi tốt nhất từ root node
//         const bestChild = rootNode.children.reduce((best, child) => {
//             return child.visits > best.visits ? child : best;
//         });

//         // Tìm nước đi đã thực hiện để đến best child
//         const move = this.findMoveBetweenStates(rootNode.state, bestChild.state);
//         return move;
//     }

//     private select(node: MCTSNode): MCTSNode {
//         while (node.untriedMoves.length === 0 && node.children.length > 0) {
//             if (this.isTerminal(node.state)) return node;
//             node = node.selectChild();
//         }
//         return node;
//     }

//     private expand(node: MCTSNode): MCTSNode {
//         const moveIndex = Math.floor(Math.random() * node.untriedMoves.length);
//         const move = node.untriedMoves[moveIndex];
//         node.untriedMoves.splice(moveIndex, 1);

//         const nextState = [...node.state];
//         nextState[move] = node.playerSymbol;

//         const childNode = new MCTSNode(
//             nextState,
//             node,
//             node.playerSymbol === 'X' ? 'O' : 'X'
//         );
//         node.children.push(childNode);
//         return childNode;
//     }

//     private simulate(node: MCTSNode): string | null {
//         const state = [...node.state];
//         let currentPlayer = node.playerSymbol;

//         while (!this.isTerminal(state)) {
//             const emptyCells = this.getEmptyCells(state);
//             if (emptyCells.length === 0) break;

//             const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
//             state[randomMove] = currentPlayer;
//             currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
//         }

//         return this.calculateWinner(state);
//     }

//     private backpropagate(node: MCTSNode | null, winner: string | null) {
//         while (node !== null) {
//             node.visits++;
//             if (winner === node.playerSymbol) {
//                 node.wins++;
//             }
//             node = node.parent;
//         }
//     }

//     private isTerminal(state: (string | null)[]): boolean {
//         return this.calculateWinner(state) !== null || this.getEmptyCells(state).length === 0;
//     }

//     private getEmptyCells(board: (string | null)[]): number[] {
//         return board
//             .map((cell, index) => cell === null ? index : -1)
//             .filter(index => index !== -1);
//     }

//     private findMoveBetweenStates(parentState: (string | null)[], childState: (string | null)[]): number {
//         for (let i = 0; i < parentState.length; i++) {
//             if (parentState[i] !== childState[i]) {
//                 return i;
//             }
//         }
//         return -1;
//     }

//     private calculateWinner(board: (string | null)[]): string | null {
//         const size = 5;
//         const winLength = 5;
//         const lines: number[][] = [];

//         // Check rows
//         for (let row = 0; row < size; row++) {
//             for (let col = 0; col <= size - winLength; col++) {
//                 lines.push(Array.from({ length: winLength }, (_, i) => row * size + col + i));
//             }
//         }

//         // Check columns
//         for (let col = 0; col < size; col++) {
//             for (let row = 0; row <= size - winLength; row++) {
//                 lines.push(Array.from({ length: winLength }, (_, i) => (row + i) * size + col));
//             }
//         }

//         // Check diagonals
//         for (let row = 0; row <= size - winLength; row++) {
//             for (let col = 0; col <= size - winLength; col++) {
//                 lines.push(Array.from({ length: winLength }, (_, i) => (row + i) * size + col + i));
//             }
//         }

//         // Check reverse diagonals
//         for (let row = 0; row <= size - winLength; row++) {
//             for (let col = winLength - 1; col < size; col++) {
//                 lines.push(Array.from({ length: winLength }, (_, i) => (row + i) * size + col - i));
//             }
//         }

//         for (const line of lines) {
//             const [a, b, c, d, e] = line.map(index => board[index]);
//             if (a && a === b && a === c && a === d && a === e) {
//                 return a;
//             }
//         }

//         return null;
//     }
// }

// // Sử dụng MCTS trong hàm handleAIMove
// const handleAIMoveMCTS = (board: (string | null)[], symbol: string): (string | null)[] => {
//     const mcts = new MCTS(1000, 1000); // 1000 iterations, 1 second time limit
//     const move = mcts.getBestMove(board, symbol);
//     const newBoard = [...board];
//     newBoard[move] = symbol;
//     return newBoard;
// };
// export default handleAIMoveMCTS


import MiniMax from "./MiniMax";
const { calculateWinner } = MiniMax; // Destructure to get calculateWinner
class MCTSNode {
  state: string[];
  parent: MCTSNode | null;
  children: MCTSNode[];
  visits: number;
  score: number;
  untriedMoves: number[];

  constructor(state: string[], parent: MCTSNode | null = null) {
    this.state = state;
    this.parent = parent;
    this.children = [];
    this.visits = 0;
    this.score = 0;
    this.untriedMoves = this.getValidMoves();
  }

  getValidMoves(): number[] {
    return this.state.reduce((moves: number[], cell, index) => {
      if (cell === "") moves.push(index);
      return moves;
    }, []);
  }

  isTerminal(): boolean {
    return !!calculateWinner(this.state) || this.getValidMoves().length === 0;
  }

  isFullyExpanded(): boolean {
    return this.untriedMoves.length === 0;
  }

  bestChild(explorationConstant: number): MCTSNode {
    return this.children.reduce((best, child) => {
      const exploitation = child.score / child.visits;
      const exploration = Math.sqrt((2 * Math.log(this.visits)) / child.visits);
      const uct = exploitation + explorationConstant * exploration;
      return uct > best.uct ? { node: child, uct } : best;
    }, { node: this.children[0], uct: -Infinity }).node;
  }
}

export function mcts(rootState: string[], iterations: number = 1000): number {
  const rootNode = new MCTSNode(rootState);

  for (let i = 0; i < iterations; i++) {
    let node = rootNode;
    
    // Selection
    while (!node.isTerminal() && node.isFullyExpanded()) {
      node = node.bestChild(Math.sqrt(2));
    }

    // Expansion
    if (!node.isTerminal() && !node.isFullyExpanded()) {
      const move = node.untriedMoves.pop()!;
      const newState = [...node.state];
      newState[move] = node.state.filter(Boolean).length % 2 === 0 ? "X" : "O";
      node = new MCTSNode(newState, node);
      node.parent!.children.push(node);
    }

    // Simulation
    const result = simulate(node.state);

    // Backpropagation
    while (node) {
      node.visits++;
      node.score += result;
      node = node.parent!;
    }
  }

  return rootNode.bestChild(0).state.findIndex((cell, index) => cell !== rootState[index]);
}

function simulate(state: string[]): number {
  let currentState = [...state];
  let currentPlayer = currentState.filter(Boolean).length % 2 === 0 ? "X" : "O";

  while (!calculateWinner(currentState) && currentState.includes("")) {
    const validMoves = currentState.reduce((moves: number[], cell, index) => {
      if (cell === "") moves.push(index);
      return moves;
    }, []);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    currentState[randomMove] = currentPlayer;
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  }

  const winner = calculateWinner(currentState);
  if (!winner) return 0.5;
  return winner === "O" ? 1 : 0;
}

