"use client";

import {
    SiTypescript,
    SiReact,
    SiNextdotjs,
    SiTailwindcss,
    SiFlask,
    SiSqlite,
    SiSqlalchemy,
} from "react-icons/si";

const Dashboard = () => {
    return (
        <div className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4 gap-8">
            <h1 className="text-4xl sm:text-6xl font-bold text-center">
                Welcome to the Orchestrix!
            </h1>
            <h2 className="text-lg sm:text-xl text-center">
                Made with love by{" "}
                <a
                    href="https://github.com/kangwijen"
                    target="_blank"
                    className="text-blue-500"
                >
                    kangwijen
                </a>{" "}
                using:
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                <div className="flex flex-col items-center gap-2 transition-transform hover:scale-110">
                    <SiTypescript className="w-12 h-12 text-blue-600" />
                    <span className="text-sm">TypeScript</span>
                </div>
                <div className="flex flex-col items-center gap-2 transition-transform hover:scale-110">
                    <SiReact className="w-12 h-12 text-blue-400" />
                    <span className="text-sm">React</span>
                </div>
                <div className="flex flex-col items-center gap-2 transition-transform hover:scale-110">
                    <SiNextdotjs className="w-12 h-12" />
                    <span className="text-sm">Next.js</span>
                </div>
                <div className="flex flex-col items-center gap-2 transition-transform hover:scale-110">
                    <SiTailwindcss className="w-12 h-12 text-cyan-400" />
                    <span className="text-sm">Tailwind CSS</span>
                </div>
                <div className="flex flex-col items-center gap-2 transition-transform hover:scale-110">
                    <SiFlask className="w-12 h-12 text-white" />
                    <span className="text-sm">Flask</span>
                </div>
                <div className="flex flex-col items-center gap-2 transition-transform hover:scale-110">
                    <SiSqlite className="w-12 h-12 text-blue-500" />
                    <span className="text-sm">SQLite</span>
                </div>
                <div className="flex flex-col items-center gap-2 transition-transform hover:scale-110">
                    <SiSqlalchemy className="w-12 h-12" />
                    <span className="text-sm">SQLAlchemy</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
