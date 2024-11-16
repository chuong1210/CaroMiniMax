using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System.Collections.Generic;

public class GameHub : Hub
{
    // Danh sách các game và trạng thái trò chơi
    private static Dictionary<string, Game> games = new Dictionary<string, Game>();

    // Phương thức gọi khi người chơi di chuyển
    public async Task Move(string gameNumber, int index, string symbol)
    {
        if (!games.ContainsKey(gameNumber))
        {
            await Clients.Caller.SendAsync("error", "Game not found!");
            return;
        }

        var game = games[gameNumber];

        if (game.Board[index] != null)
        {
            await Clients.Caller.SendAsync("error", "Cell already occupied!");
            return;
        }

        if (game.IsXNext && symbol != "X" || !game.IsXNext && symbol != "O")
        {
            await Clients.Caller.SendAsync("error", "It's not your turn!");
            return;
        }

        // Cập nhật trạng thái game
        game.Board[index] = symbol;
        game.IsXNext = !game.IsXNext;

        // Kiểm tra kết quả của lượt đi
        string winner = CheckWinner(game.Board);
        if (winner != null)
        {
            await Clients.All.SendAsync("move", new { gameNumber, index, symbol });
            await Clients.All.SendAsync("gameEnded", winner);
        }
        else
        {
            await Clients.All.SendAsync("move", new { gameNumber, index, symbol });
        }
    }

    // Kiểm tra người thắng
    private string CheckWinner(string[] board)
    {
        // Định nghĩa chiều dài của dòng thắng
        int winLength = 5;
        int size = 10;

        // Kiểm tra các hàng
        for (int row = 0; row < size; row++)
        {
            for (int col = 0; col <= size - winLength; col++)
            {
                if (CheckLine(board, row * size + col, 1, size, winLength))
                    return board[row * size + col];
            }
        }

        // Kiểm tra các cột
        for (int col = 0; col < size; col++)
        {
            for (int row = 0; row <= size - winLength; row++)
            {
                if (CheckLine(board, row * size + col, size, 1, winLength))
                    return board[row * size + col];
            }
        }

        // Kiểm tra chéo
        for (int row = 0; row <= size - winLength; row++)
        {
            for (int col = 0; col <= size - winLength; col++)
            {
                if (CheckLine(board, row * size + col, size + 1, size, winLength))
                    return board[row * size + col];
                if (CheckLine(board, row * size + col + (winLength - 1), size - 1, size, winLength))
                    return board[row * size + col];
            }
        }

        return null;
    }

    // Kiểm tra một dòng có cùng ký hiệu không
    private bool CheckLine(string[] board, int startIndex, int step, int size, int winLength)
    {
        string firstCell = board[startIndex];
        if (string.IsNullOrEmpty(firstCell)) return false;

        for (int i = 1; i < winLength; i++)
        {
            if (board[startIndex + i * step] != firstCell)
            {
                return false;
            }
        }

        return true;
    }

    // Phương thức gọi khi người chơi tạo game
    public async Task CreateGame()
    {
        string gameNumber = GenerateGameNumber();
        var game = new Game
        {
            Board = new string[100],
            IsXNext = true
        };

        games[gameNumber] = game;

        await Clients.Caller.SendAsync("gameCreated", new { gameNumber });
    }

    // Phương thức gọi khi người chơi tham gia game
    public async Task JoinGame(string gameNumber)
    {
        if (!games.ContainsKey(gameNumber))
        {
            await Clients.Caller.SendAsync("error", "Game not found!");
            return;
        }

        var game = games[gameNumber];
        await Clients.Caller.SendAsync("gameJoined", new { gameNumber });
        await Clients.All.SendAsync("userJoined", new { userId = Context.ConnectionId });
    }

    // Tạo số game ngẫu nhiên
    private string GenerateGameNumber()
    {
        return Guid.NewGuid().ToString().Substring(0, 6);
    }

    // Phương thức gọi khi người chơi yêu cầu reset game
    public async Task ResetGame(string gameNumber)
    {
        if (!games.ContainsKey(gameNumber))
        {
            await Clients.Caller.SendAsync("error", "Game not found!");
            return;
        }

        var game = games[gameNumber];
        game.Board = new string[100];
        game.IsXNext = true;

        await Clients.All.SendAsync("resetGame");
    }
    public async Task Timeout(string gameNumber, string symbol)
    {
        if (!games.ContainsKey(gameNumber))
        {
            await Clients.Caller.SendAsync("error", "Game not found!");
            return;
        }

        var game = games[gameNumber];

        // Kiểm tra xem đó có phải lượt của người chơi hết thời gian không
        if ((game.IsXNext && symbol == "X") || (!game.IsXNext && symbol == "O"))
        {
            // Chuyển lượt sang đối thủ
            game.IsXNext = !game.IsXNext;

            // Gửi thông báo tới tất cả các client
            await Clients.All.SendAsync("timeout", new
            {
                gameNumber,
                currentSymbol = game.IsXNext ? "X" : "O",
                message = $"Player {symbol} ran out of time!"
            });
        }
    }




    // Lớp đại diện cho trạng thái của một game

}
