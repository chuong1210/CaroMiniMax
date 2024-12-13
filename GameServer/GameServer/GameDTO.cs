public class Game
{
    public string[] Board { get; set; }
    public bool IsXNext { get; set; }
    public bool HasStarted { get; set; } = false;
    public string PlayerXConnectionId { get; set; }
    public string PlayerOConnectionId { get; set; }
}