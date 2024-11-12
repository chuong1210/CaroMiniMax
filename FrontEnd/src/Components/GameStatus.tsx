import useSocket from "@/useHooks/useSocket";

const GameStatus = () => {
  const { isConnected, serverError } = useSocket();

  return (
    <div>
      {serverError && <p>Server connection error</p>}
      {isConnected ? (
        <p>Connected to server</p>
      ) : (
        <p>Disconnected from server</p>
      )}
    </div>
  );
};

export default GameStatus;
