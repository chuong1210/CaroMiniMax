import React, { useState, useEffect } from 'react';

interface TimerProps {
  isRunning: boolean;
  onReset: () => void;
}

const Timer: React.FC<TimerProps> = ({ isRunning, onReset }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="text-2xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 rounded-lg shadow-md">
        {formatTime(time)}
      </div>
      <button
        onClick={() => {
          setTime(0);
          onReset();
        }}
        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
      >
        Reset Timer
      </button>
    </div>
  );
};

export default Timer;

