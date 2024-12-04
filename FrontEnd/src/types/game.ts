export type Player = 'X' | 'O' | null;
export type Board = Player[][];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'Draw' | null;
}

export interface Move {
  row: number;
  col: number;
  score: number;
}

