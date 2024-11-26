"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Roboto, Montserrat } from "next/font/google";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["vietnamese"],
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["700", "800"],
  subsets: ["vietnamese"],
  display: "swap",
});

const FloatingShape = ({ className }: { className: string }) => (
  <motion.div
    className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 ${className}`}
    animate={{
      scale: [1, 2, 2, 1, 1],
      rotate: [0, 0, 270, 270, 0],
      borderRadius: ["20%", "20%", "50%", "50%", "20%"],
    }}
    transition={{
      duration: 12,
      ease: "easeInOut",
      times: [0, 0.2, 0.5, 0.8, 1],
      repeat: Infinity,
      repeatType: "reverse",
    }}
  />
);

const ButtonLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href}>
    <motion.button
      className="w-full py-4 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg text-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 relative overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ mixBlendMode: "overlay" }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  </Link>
);

const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col justify-between relative overflow-hidden ${roboto.className}`}
    >
      <FloatingShape className="w-72 h-72 bg-blue-300 top-0 -left-20" />
      <FloatingShape className="w-96 h-96 bg-purple-300 bottom-0 right-0" />
      <FloatingShape className="w-64 h-64 bg-pink-300 bottom-1/4 left-1/3" />

      <header className="w-full p-4 flex justify-between items-center z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-white text-2xl font-bold"
        >
          Caro Game
        </motion.div>
        <nav>
          <motion.ul
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex space-x-4"
          >
            <li>
              <a
                href="#"
                className="text-white hover:text-indigo-300 transition"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-white hover:text-indigo-300 transition"
              >
                Rules
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-white hover:text-indigo-300 transition"
              >
                Contact
              </a>
            </li>
          </motion.ul>
        </nav>
      </header>

      <main className="flex-grow flex justify-center items-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-10 bg-white bg-opacity-10 rounded-3xl shadow-2xl backdrop-filter backdrop-blur-lg max-w-3xl w-full"
        >
          <motion.h1
            className={`text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 mb-6 ${montserrat.className}`}
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Chào mừng đến với Trò Chơi Caro!
          </motion.h1>
          <motion.p
            className="text-lg text-gray-300 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Trải nghiệm sự hấp dẫn của lối chơi chiến lược. Chọn đối thủ của bạn
            và bắt đầu hành trình trở thành bậc thầy Caro!
          </motion.p>

          <motion.div
            className="flex flex-col space-y-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ButtonLink href="/play/user">
              <span className="relative z-10">Chơi với Người Chơi Khác</span>
            </ButtonLink>
            <ButtonLink href="/play/ai">
              <span className="relative z-10">Chơi với AI</span>
            </ButtonLink>
          </motion.div>

          <motion.div
            className="mt-12 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              className="text-indigo-300 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              Hover to see game stats
            </motion.div>
            <motion.div
              className="absolute top-full left-0 right-0 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4 mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white">Games Played: 1,234</p>
              <p className="text-white">Active Players: 567</p>
              <p className="text-white">Highest Score: 9,876</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="w-full p-6 text-center text-gray-400 z-10 bg-black bg-opacity-30">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-sm"
        >
          © 2024 Võ Ngọc Nguyên Chương - 204226229. Bảo lưu mọi quyền.
        </motion.p>
      </footer>
    </div>
  );
};

export default Home;
