import { SocketContext } from "@/app/play/page";
import { useState, useContext } from "react";

const Joinroom = () => {
  const socket = useContext(SocketContext);

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showRooms, setShowRooms] = useState(false);
  const [rooms, setRooms] = useState([]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Tic Tac Toe
            </h1>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Your Name
              </label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // handleJoin();
                  }
                }}
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="room"
              >
                Room Name
              </label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="room"
                type="text"
                placeholder="Enter room name"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // handleJoin();
                  }
                }}
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="button"
              //   onClick={handleJoin}
            >
              Join Room
            </button>
            <button
              className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="button"
              onClick={() => {
                setShowRooms((prev) => !prev);
                if (rooms.length === 0) {
                  //   socket.emit("list-rooms");
                }
              }}
            >
              Show Available Rooms
            </button>
          </div>
          {showRooms && (
            <>
              {rooms.length > 0 ? (
                <div className="mt-6 max-h-64 overflow-y-auto">
                  <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
                    Available Rooms
                  </h2>
                  {rooms.map((room, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 p-4 rounded flex items-center justify-between mb-4"
                    >
                      <div className="text-gray-700 font-bold">
                        {/* {room.room} */}
                      </div>
                      <div className="text-gray-500">
                        {/* {room.players} players */}
                      </div>
                      {1 < 2 ? (
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          type="button"
                          onClick={() => {
                            if (username === "") {
                              Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: "Please fill in all fields",
                              });

                              return;
                            }
                          }}
                        >
                          Join
                        </button>
                      ) : (
                        <button
                          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          type="button"
                          disabled
                        >
                          Full
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
                    No Available Rooms
                  </h2>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Joinroom;
