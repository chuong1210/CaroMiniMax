import React from "react";

interface CircularCountdownProps {
  timeLeft: number;
  maxTime: number;
}

const CircularCountdown: React.FC<CircularCountdownProps> = ({
  timeLeft,
  maxTime,
}) => {
  const radius = 50; // Bán kính vòng tròn
  const strokeWidth = 8; // Độ dày nét
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (timeLeft / maxTime) * circumference;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="mx-auto"
      style={{ display: "block" }}
    >
      {/* Vòng tròn nền */}
      <circle
        stroke="#e0e0e0"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Vòng tròn đếm ngược */}
      <circle
        stroke="#3b82f6" // Màu của thanh đếm ngược
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Số hiển thị */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="1.5em"
        fill="#000"
      >
        {timeLeft}
      </text>
    </svg>
  );
};

export default CircularCountdown;
