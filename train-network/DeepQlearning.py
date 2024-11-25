import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
import random

class DQN(nn.Module):
    def __init__(self):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(18, 128)  # 9 cells * 2 (one-hot encoding for X and O)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 9)    # 9 possible actions
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

class TicTacToe:
    def __init__(self):
        self.board = [[0, 0, 0] for _ in range(3)]
        self.current_player = 1  # 1 for X, -1 for O
        
    def make_move(self, row, col):
        if self.board[row][col] == 0:
            self.board[row][col] = self.current_player
            self.current_player *= -1
            return True
        return False
    
    def get_valid_moves(self):
        moves = []
        for i in range(3):
            for j in range(3):
                if self.board[i][j] == 0:
                    moves.append((i, j))
        return moves
    
    def check_winner(self):
        # Check rows
        for row in self.board:
            if sum(row) == 3: return 1
            if sum(row) == -3: return -1
            
        # Check columns
        for col in range(3):
            if sum(row[col] for row in self.board) == 3: return 1
            if sum(row[col] for row in self.board) == -3: return -1
            
        # Check diagonals
        diag1 = sum(self.board[i][i] for i in range(3))
        diag2 = sum(self.board[i][2-i] for i in range(3))
        if diag1 == 3 or diag2 == 3: return 1
        if diag1 == -3 or diag2 == -3: return -1
        
        # Check for draw
        if len(self.get_valid_moves()) == 0:
            return 0
            
        return None

def minimax(board, depth, alpha, beta, maximizing_player, agent, max_depth=3):
    # Limit depth
    if depth > max_depth:
        return evaluate_board(board, agent)  # Use agent's DQN network to evaluate the board

    result = board.check_winner()
    if result is not None:
        return result
    
    if maximizing_player:
        max_eval = float('-inf')
        for move in board.get_valid_moves():
            board.make_move(move[0], move[1])
            eval = minimax(board, depth + 1, alpha, beta, False, agent, max_depth)
            board.board[move[0]][move[1]] = 0
            board.current_player *= -1
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = float('inf')
        for move in board.get_valid_moves():
            board.make_move(move[0], move[1])
            eval = minimax(board, depth + 1, alpha, beta, True, agent, max_depth)
            board.board[move[0]][move[1]] = 0
            board.current_player *= -1
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return min_eval

def evaluate_board(board, agent):
    """Evaluate the board using the trained DQN network."""
    state = agent.get_state(board.board).unsqueeze(0).to(agent.device)
    with torch.no_grad():
        q_values = agent.policy_net(state)
    return q_values.max().item()  # Use the max Q-value as the evaluation score



class DQLAgent:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.policy_net = DQN().to(self.device)
        self.target_net = DQN().to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        
        self.optimizer = optim.Adam(self.policy_net.parameters())
        self.memory = deque(maxlen=10000)
        
        self.batch_size = 64
        self.gamma = 0.99
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.target_update = 10
        self.steps = 0
        
    def get_state(self, board):
        # Convert board to one-hot encoding
        state = []
        for row in board:
            for cell in row:
                if cell == 1:
                    state.extend([1, 0])
                elif cell == -1:
                    state.extend([0, 1])
                else:
                    state.extend([0, 0])
        return torch.FloatTensor(state).to(self.device)
    
    def select_action(self, state, valid_moves):
        if random.random() < self.epsilon:
            return random.choice(valid_moves)
        
        with torch.no_grad():
            q_values = self.policy_net(state)
            
        # Mask invalid moves with large negative values
        valid_moves_mask = torch.ones(9) * float('-inf')
        for move in valid_moves:
            valid_moves_mask[move[0] * 3 + move[1]] = 0
        
        q_values = q_values + valid_moves_mask.to(self.device)
        action_idx = q_values.max(0)[1].item()
        return (action_idx // 3, action_idx % 3)
    
    def store_transition(self, state, action, next_state, reward):
        self.memory.append((state, action, next_state, reward))
        
    def optimize(self):
        if len(self.memory) < self.batch_size:
            return
        
        transitions = random.sample(self.memory, self.batch_size)
        batch = list(zip(*transitions))
        
        state_batch = torch.stack(batch[0])
        action_batch = torch.tensor([(x[0] * 3 + x[1]) for x in batch[1]], 
                                  device=self.device)
        next_state_batch = torch.stack(batch[2])
        reward_batch = torch.tensor(batch[3], device=self.device)
        
        current_q = self.policy_net(state_batch).gather(1, 
                                action_batch.unsqueeze(1))
        next_q = self.target_net(next_state_batch).max(1)[0].detach()
        expected_q = reward_batch + self.gamma * next_q
        
        loss = nn.MSELoss()(current_q.squeeze(), expected_q)
        
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
            
        self.steps += 1
        if self.steps % self.target_update == 0:
            self.target_net.load_state_dict(self.policy_net.state_dict())

def train(episodes=3000):
    agent = DQLAgent()
    wins = 0
    losses = 0
    draws = 0
    
    for episode in range(episodes):
        game = TicTacToe()
        done = False
        
        while not done:
            # DQL Agent's turn
            state = agent.get_state(game.board)
            valid_moves = game.get_valid_moves()
            action = agent.select_action(state, valid_moves)
            
            game.make_move(action[0], action[1])
            result = game.check_winner()
            
            if result is not None:
                if result == 1:  # Agent won
                    reward = 1.0
                    wins += 1
                elif result == -1:  # Agent lost
                    reward = -1.0
                    losses += 1
                else:  # Draw
                    reward = 0.5
                    draws += 1
                done = True
            else:
                # Minimax player's turn
                best_score = float('inf')
                best_move = None
                
                for move in game.get_valid_moves():
                    game.make_move(move[0], move[1])
                    score = minimax(game, 0, float('-inf'), float('inf'), True,agent,max_depth=3)
                    game.board[move[0]][move[1]] = 0
                    game.current_player *= -1
                    
                    if score < best_score:
                        best_score = score
                        best_move = move
                
                game.make_move(best_move[0], best_move[1])
                result = game.check_winner()
                
                if result is not None:
                    if result == 1:  # Agent won
                        reward = 1.0
                        wins += 1
                    elif result == -1:  # Agent lost
                        reward = -1.0
                        losses += 1
                    else:  # Draw
                        reward = 0.5
                        draws += 1
                    done = True
                else:
                    reward = 0.0
            
            next_state = agent.get_state(game.board)
            agent.store_transition(state, action, next_state, reward)
            agent.optimize()
        
        if (episode + 1) % 100 == 0:
            print(f"Episode: {episode + 1}")
            print(f"Wins: {wins}, Losses: {losses}, Draws: {draws}")
            print(f"Win Rate: {wins/(wins+losses+draws):.2%}")
            print(f"Epsilon: {agent.epsilon:.3f}")
            print("-" * 30)
    
    return agent

# Train the agent
# agent = train()

# torch.save(agent.policy_net.state_dict(), 'tictactoe_dql.pth')




# ... (Your existing DQN, TicTacToe, and DQLAgent classes) ...
import torch
import torch.nn as nn
import numpy as np
import random


# ... (Your existing DQN, TicTacToe, and DQLAgent classes) ...

def test_agent(agent):
    """Tests the trained DQN agent against a human player."""
    game = TicTacToe()

    # Máy đánh trước
    state = agent.get_state(game.board)
    valid_moves = game.get_valid_moves()
    action = agent.select_action(state, valid_moves)
    game.make_move(action[0], action[1])
    print("Agent's first move:")
    print(np.array(game.board))

    while True:
        # Hiển thị bảng chơi
        print(np.array(game.board))
        state = agent.get_state(game.board)
        valid_moves = game.get_valid_moves()

        if not valid_moves:
            print("Game Over (no valid moves).")
            break
        
        try:
            # Nhập lượt chơi từ người chơi
            human_move_str = input("Enter your move (row, column): ").split(",")
            row = int(human_move_str[0])
            col = int(human_move_str[1])
            if (row, col) in valid_moves:
                game.make_move(row, col)
            else:
                print("Invalid move. Try again.")
                continue

        except (ValueError, IndexError):
            print("Invalid input. Please enter row and column as integers separated by a comma.")
            continue
        
        # Kiểm tra kết quả sau khi người chơi đi
        result = game.check_winner()
        if result is not None:
            if result == 1:
                print("Agent wins!")
            elif result == -1:
                print("Agent loses!")
            else:
                print("Draw!")
            break

        # Lượt của máy
        action = agent.select_action(state, game.get_valid_moves())
        game.make_move(action[0], action[1])

        # Kiểm tra kết quả sau khi máy đi
        result = game.check_winner()
        if result is not None:
            if result == 1:
                print("Agent wins!")
            elif result == -1:
                print("Agent loses!")
            else:
                print("Draw!")
            break


if __name__ == "__main__":
    agent = DQLAgent()
    agent.policy_net.load_state_dict(torch.load('tictactoe_save_27-8.pkl'))
    agent.policy_net.eval()
    test_agent(agent)

    