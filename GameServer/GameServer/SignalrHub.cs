using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GameServer.Hubs
{
    public class GameHub : Hub
    {
        // Lưu danh sách các phòng trò chơi và kết nối
        private static readonly Dictionary<string, List<string>> GameRooms = new Dictionary<string, List<string>>();

        // Khi người chơi ngắt kết nối
        public async Task NewMessage(string user, string message)
        {
            await Clients.All.SendAsync("messageReceived", user, message);
        }


 

            public override Task OnDisconnectedAsync(Exception exception)
            {
                foreach (var room in GameRooms)
                {
                    if (room.Value.Contains(Context.ConnectionId))
                    {
                        room.Value.Remove(Context.ConnectionId);
                        if (room.Value.Count == 0)
                        {
                            GameRooms.Remove(room.Key);
                        }
                        Clients.Group(room.Key).SendAsync("userDisconnected", new { userId = Context.ConnectionId });
                        break;
                    }
                }
                Console.WriteLine("A user disconnected");
                return base.OnDisconnectedAsync(exception);
            }

            public async Task CreateGame()
            {
                string gameNumber = GenerateUniqueGameNumber();
                await Groups.AddToGroupAsync(Context.ConnectionId, gameNumber);
                GameRooms[gameNumber] = new List<string> { Context.ConnectionId };
                await Clients.Caller.SendAsync("gameCreated", new { gameNumber });
                Console.WriteLine($"Game created with number: {gameNumber}");
            }

            public async Task JoinGame(string gameNumber)
            {
                if (GameRooms.ContainsKey(gameNumber))
                {
                    if (GameRooms[gameNumber].Count == 2)
                    {
                        await Clients.Caller.SendAsync("error", "Game is already full");
                    }
                    else
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, gameNumber);
                        GameRooms[gameNumber].Add(Context.ConnectionId);
                        await Clients.Caller.SendAsync("gameJoined", new { gameNumber });
                        await Clients.Group(gameNumber).SendAsync("userJoined", new { userId = Context.ConnectionId });
                        Console.WriteLine($"User joined game number: {gameNumber}");
                    }
                }
                else
                {
                    await Clients.Caller.SendAsync("error", "Invalid game number");
                }
            }

            public async Task Move(string gameNumber, int index, string symbol)
            {
                if (GameRooms.ContainsKey(gameNumber))
                {
                    await Clients.Group(gameNumber).SendAsync("move", new { gameNumber, index, symbol });
                    Console.WriteLine($"Move in game {gameNumber}: {index} {symbol}");
                }
                else
                {
                    await Clients.Caller.SendAsync("error", "Invalid game number");
                }
            }

            public async Task ResetGame(string gameNumber)
            {
                if (GameRooms.ContainsKey(gameNumber))
                {
                    await Clients.Group(gameNumber).SendAsync("resetGame");
                    Console.WriteLine($"Reset game number: {gameNumber}");
                }
                else
                {
                    await Clients.Caller.SendAsync("error", "Invalid game number");
                }
            }

            private static string GenerateUniqueGameNumber()
            {
                return Guid.NewGuid().ToString("N").Substring(0, 7);
            }
        }
    }



