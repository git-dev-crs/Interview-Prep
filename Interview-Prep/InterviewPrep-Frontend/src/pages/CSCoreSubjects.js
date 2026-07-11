import React, { useRef } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { FaArrowRight, FaDatabase, FaNetworkWired, FaLaptopCode, FaCogs, FaServer, FaCode } from "react-icons/fa";

/* 3D Tilt Card */
const Tilt3DCard = ({ children, className = "" }) => {
    const cardRef = useRef(null);
    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    };
    const handleMouseLeave = () => {
        if (cardRef.current) cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };
    return (
        <div ref={cardRef} className={`transition-transform duration-300 ease-out ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ transformStyle: 'preserve-3d' }}>
            {children}
        </div>
    );
};

const SubjectCard = ({ title, description, image, link, icon, gradient, index }) => (
    <div className="perspective-1000" style={{ animationDelay: `${index * 100}ms` }}>
        <Tilt3DCard>
            <Link to={link} className="group relative flex flex-col overflow-hidden rounded-2xl glass-strong border-gradient h-full">
                {/* Image with 3D depth */}
                <div className="h-52 overflow-hidden relative">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                    {/* Floating icon badge */}
                    <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl"
                        style={{ background: `linear-gradient(135deg, ${gradient})`, transform: 'translateZ(30px)' }}
                    >
                        {icon}
                    </div>

                    {/* Glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(circle at 50% 100%, ${gradient.split(',')[0]}20, transparent 60%)` }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col relative">
                    <h2 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors" style={{ transform: 'translateZ(15px)' }}>
                        {title}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6 flex-1 leading-relaxed">
                        {description}
                    </p>
                    <div className="flex items-center text-sm font-semibold text-primary group/link">
                        <span className="relative">
                            Explore {title}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                        </span>
                        <FaArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </div>
                </div>
            </Link>
        </Tilt3DCard>
    </div>
);

const CSCoreSubjects = () => {
    const subjects = [
        {
            title: "Operating System",
            description: "Master process management, memory handling, and concurrency. Essential for backend roles.",
            image: "https://images.unsplash.com/photo-1642176849879-92f85770f212?q=80&w=2070&auto=format&fit=crop",
            link: "/top-interview-questions/os",
            icon: <FaCogs className="w-5 h-5" />,
            gradient: "#f59e0b, #d97706",
        },
        {
            title: "DBMS",
            description: "Deep dive into SQL, NoSQL, indexing, and transactions. A must for data-heavy applications.",
            image: "https://plus.unsplash.com/premium_photo-1682145174729-52ebed03f4b0?q=80&w=2070&auto=format&fit=crop",
            link: "/top-interview-questions/dbms",
            icon: <FaDatabase className="w-5 h-5" />,
            gradient: "#3b82f6, #2563eb",
        },
        {
            title: "Computer Networks",
            description: "Understand OSI model, TCP/IP, and network security. Critical for distributed systems.",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
            link: "/top-interview-questions/cn",
            icon: <FaNetworkWired className="w-5 h-5" />,
            gradient: "#10b981, #059669",
        },
        {
            title: "OOPS",
            description: "Grasp the four pillars of Object-Oriented Programming. Foundational for software design.",
            image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=2070&auto=format&fit=crop",
            link: "/top-interview-questions/oops",
            icon: <FaLaptopCode className="w-5 h-5" />,
            gradient: "#a855f7, #7c3aed",
        },
        {
            title: "DS & Algo",
            description: "The heart of coding interviews. Arrays, Trees, Graphs, and Dynamic Programming.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
            link: "/top-interview-questions/dsa",
            icon: <FaCode className="w-5 h-5" />,
            gradient: "#ef4444, #dc2626",
        },
        {
            title: "SQL (RDBMS)",
            description: "Master detailed queries, joins, and database design patterns.",
            image: "https://images.unsplash.com/photo-1622549037543-49cf1ca0babc?q=80&w=2070&auto=format&fit=crop",
            link: "/top-interview-questions/sql",
            icon: <FaServer className="w-5 h-5" />,
            gradient: "#06b6d4, #0891b2",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
            <Nav />
            <main className="flex-1 py-12 pt-24 bg-mesh-section relative">
                {/* Background effects */}
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full glass text-primary text-xs font-semibold uppercase tracking-wider">
                            ✦ CS Core Fundamentals
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            Top Interview{" "}
                            <span className="text-shimmer">Questions</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Curated questions from top product-based companies to help you crack the core rounds.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subjects.map((subject, index) => (
                            <SubjectCard key={index} {...subject} index={index} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CSCoreSubjects;
