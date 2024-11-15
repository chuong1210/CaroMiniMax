"use client";
import Link from "next/link";

const Home = () => {
  return (
    <div className="h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 flex justify-center items-center">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
          Welcome to the Caro Game!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Choose your opponent and start playing!
        </p>

        <div className="space-y-6">
          {/* Button to play with user */}
          <Link href="/play/user">
            <button className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-md text-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105">
              Play with Another Player
            </button>
          </Link>

          {/* Button to play with AI */}
          <Link href="/play/ai">
            <button className="w-full py-3 px-6 bg-green-600 text-white font-bold rounded-md text-lg hover:bg-green-700 transition duration-300 transform hover:scale-105">
              Play with AI
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
