import * as signalR from "@microsoft/signalr";

const URL = process.env.HUB_ADDRESS ?? "https://localhost:5251/gameHub"; // URL backend

class Connector {
    private connection: signalR.HubConnection;
    static instance: Connector;

    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(URL)
            .withAutomaticReconnect()
            .build();

        this.connection.start()
            .then(() => console.log("Connected to SignalR Hub"))
            .catch(err => console.error("SignalR Connection Error:", err));
    }

    // Lắng nghe sự kiện từ server
    public setupEventListeners = (
        onMessageReceived: (username: string, message: string) => void,
        onGameCreated: (gameNumber: string) => void,
        onGameJoined: (gameNumber: string) => void,
        onUserJoined: (userId: string) => void,
        onMove: (index: number, symbol: string) => void,
        onResetGame: () => void,
        onError: (error: string) => void,
    ) => {
        // Nhận tin nhắn chat
        this.connection.on("messageReceived", (username, message) => {
            onMessageReceived(username, message);
        });

        // Sự kiện game được tạo
        this.connection.on("gameCreated", (data) => {
            onGameCreated(data.gameNumber);
        });

        // Sự kiện tham gia game
        this.connection.on("gameJoined", (data) => {
            onGameJoined(data.gameNumber);
        });

        // Sự kiện người dùng mới tham gia
        this.connection.on("userJoined", (data) => {
            onUserJoined(data.userId);
        });

        // Sự kiện di chuyển trong game
        this.connection.on("move", (data) => {
            onMove(data.index, data.symbol);
        });

        // Sự kiện reset game
        this.connection.on("resetGame", () => {
            onResetGame();
        });

        // Sự kiện lỗi
        this.connection.on("error", (error) => {
            onError(error);
        });
    }

    // Gửi tin nhắn mới
    public sendMessage = (username: string, message: string) => {
        this.connection.send("newMessage", username, message)
            .then(() => console.log("Message sent"))
            .catch(err => console.error("Message sending failed:", err));
    }

    // Tạo game mới
    public createGame = () => {
        this.connection.send("createGame")
            .then(() => console.log("Game creation requested"))
            .catch(err => console.error("Game creation failed:", err));
    }

    // Tham gia game
    public joinGame = (gameNumber: string) => {
        this.connection.send("joinGame", gameNumber)
            .then(() => console.log(`Joining game: ${gameNumber}`))
            .catch(err => console.error("Join game failed:", err));
    }

    // Di chuyển trong game
    public makeMove = (gameNumber: string, index: number, symbol: string) => {
        this.connection.send("move", { gameNumber, index, symbol })
            .then(() => console.log(`Move made at ${index} with symbol ${symbol}`))
            .catch(err => console.error("Move failed:", err));
    }

    // Reset game
    public resetGame = (gameNumber: string) => {
        this.connection.send("resetGame", gameNumber)
            .then(() => console.log(`Game ${gameNumber} reset`))
            .catch(err => console.error("Game reset failed:", err));
    }

    // Lấy instance của Connector (singleton)
    public static getInstance(): Connector {
        if (!Connector.instance) {
            Connector.instance = new Connector();
        }
        return Connector.instance;
    }
}

export default Connector.getInstance;
