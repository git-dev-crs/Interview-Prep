import React, { useEffect, useRef } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import {
    FaCode, FaFileAlt, FaVideo, FaArrowRight,
    FaBrain, FaRocket, FaChartLine, FaStar, FaUserGraduate
} from "react-icons/fa";

/* ─────────────────────────────────────────────
   3D TILT CARD - Mouse-following perspective
   ───────────────────────────────────────────── */
const Tilt3DCard = ({ children, className = "", intensity = 15 }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -intensity;
        const rotateY = ((x - centerX) / centerX) * intensity;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (card) {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
    };

    return (
        <div
            ref={cardRef}
            className={`transition-transform duration-300 ease-out ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {children}
        </div>
    );
};

/* ─────────────────────────────────────────────
   FLOATING ORB - Animated background element
   ───────────────────────────────────────────── */
const FloatingOrb = ({ size, color, top, left, delay = 0 }) => (
    <div
        className="absolute rounded-full pointer-events-none blur-3xl opacity-30"
        style={{
            width: size, height: size, top, left,
            background: color,
            animation: `float-slow ${8 + delay}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
        }}
    />
);

/* ─────────────────────────────────────────────
   STAT COUNTER - Animated count-up
   ───────────────────────────────────────────── */
const StatCounter = ({ value, label, suffix = "" }) => {
    const ref = useRef(null);
    const [count, setCount] = React.useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const end = parseInt(value);
                    const duration = 2000;
                    const increment = end / (duration / 16);
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            setCount(end);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 16);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <div ref={ref} className="text-center group">
            <div className="text-4xl md:text-5xl font-black text-shimmer mb-2">
                {count}{suffix}
            </div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   HERO SECTION - 3D immersive landing
   ───────────────────────────────────────────── */
const HeroSection = () => (
    <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-36 overflow-hidden bg-mesh-hero min-h-[95vh] flex items-center">
        {/* Background Elements */}
        <FloatingOrb size="400px" color="rgba(139, 92, 246, 0.2)" top="-100px" left="-100px" delay={0} />
        <FloatingOrb size="300px" color="rgba(168, 85, 247, 0.15)" top="60%" left="70%" delay={2} />
        <FloatingOrb size="200px" color="rgba(99, 102, 241, 0.12)" top="30%" left="50%" delay={4} />

        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />

        {/* Animated Gradient Ring */}
        <div className="absolute top-20 right-20 w-96 h-96 opacity-10 animate-spin-slow hidden lg:block">
            <div className="w-full h-full rounded-full border-2 border-dashed border-primary/50" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                {/* Left Content */}
                <div className="lg:w-1/2 space-y-8 animate-in slide-in-from-left duration-700">
                    <div className="inline-flex items-center px-4 py-2 rounded-full glass border-gradient text-primary text-sm font-semibold gap-2 animate-pulse-glow">
                        <FaRocket className="w-4 h-4" />
                        The #1 Coding Interview Platform
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
                        Empowering{" "}
                        <span className="relative inline-block">
                            <span className="text-shimmer">Coders</span>
                        </span>
                        ,<br />
                        Enabling{" "}
                        <span className="relative inline-block">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-primary">
                                Dreams
                            </span>
                            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-pink-500 rounded-full opacity-60" />
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                        Master DSA, System Design, and Core Subjects with our curated paths. AI-powered mock interviews to supercharge your preparation.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link
                            to="/generate-list-parameter"
                            className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white rounded-xl transition-all duration-300 relative overflow-hidden glow-primary hover:glow-primary-lg"
                            style={{ background: 'linear-gradient(135deg, hsl(263.4, 70%, 50.4%), #a855f7)' }}
                        >
                            <span className="relative z-10 flex items-center">
                                Explore DSA
                                <FaArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                        <Link
                            to="/mock-interview/setup"
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-foreground glass rounded-xl hover:bg-white/10 transition-all duration-300 border-gradient group"
                        >
                            <FaBrain className="mr-2 w-4 h-4 text-primary" />
                            AI Mock Interview
                        </Link>
                    </div>
                </div>

                {/* Right: 3D Hero Card Stack */}
                <div className="lg:w-1/2 relative animate-in slide-in-from-right duration-700 perspective-1500 flex justify-center">
                    <Tilt3DCard className="relative z-20 max-w-md lg:max-w-lg w-full" intensity={8}>
                        <div className="rounded-2xl overflow-hidden glass-strong glow-primary border border-primary/20">
                            <img
                                src="https://img.freepik.com/free-vector/programmer-working-web-development-code-engineer-programming-python-php-java-script-computer_90220-251.jpg"
                                alt="Coding"
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

                            {/* Floating badge on the card */}
                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full glass text-xs font-bold text-primary flex items-center gap-1.5 animate-float">
                                <FaStar className="w-3 h-3 text-yellow-400" /> AI Powered
                            </div>
                        </div>
                    </Tilt3DCard>

                    {/* Background 3D layers */}
                    <div className="absolute top-8 -right-4 w-full h-full rounded-2xl bg-primary/10 border border-primary/10 -z-10 transform rotate-3 scale-95" />
                    <div className="absolute top-16 -right-8 w-full h-full rounded-2xl bg-purple-500/5 border border-purple-500/10 -z-20 transform rotate-6 scale-90" />
                </div>
            </div>
        </div>
    </section>
);

/* ─────────────────────────────────────────────
   FEATURES SECTION - 3D hover cards
   ───────────────────────────────────────────── */
const FeatureCard = ({ icon, title, description, link, gradient, index }) => (
    <div className="perspective-1000" style={{ animationDelay: `${index * 100}ms` }}>
        <Tilt3DCard intensity={10}>
            <div className="relative p-6 rounded-2xl glass-strong border-gradient group overflow-hidden h-full">
                {/* Gradient background glow */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full ${gradient} opacity-0 group-hover:opacity-20 transition-all duration-500 blur-3xl`} />

                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `linear-gradient(135deg, ${gradient === 'bg-blue-500' ? '#3b82f6, #2563eb' : gradient === 'bg-purple-500' ? '#a855f7, #7c3aed' : gradient === 'bg-emerald-500' ? '#10b981, #059669' : '#f59e0b, #d97706'})`, transform: 'translateZ(20px)' }}
                >
                    {icon}
                </div>

                <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors" style={{ transform: 'translateZ(10px)' }}>
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>

                {link ? (
                    <Link to={link} className="inline-flex items-center text-sm font-semibold text-primary hover:underline group/link">
                        Explore <FaArrowRight className="ml-1.5 w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                ) : (
                    <span className="inline-flex items-center text-sm font-medium text-muted-foreground/60">Coming Soon</span>
                )}
            </div>
        </Tilt3DCard>
    </div>
);

/* ─────────────────────────────────────────────
   COMPANY LOGO - 3D floating logos
   ───────────────────────────────────────────── */
const CompanyLogo = ({ src, alt }) => (
    <Tilt3DCard intensity={12}>
        <div className="glass-strong p-5 rounded-2xl w-40 h-20 flex items-center justify-center group hover:glow-primary transition-all duration-300 border-gradient">
            <img
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain transition-all duration-300 brightness-0 invert opacity-50 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0"
            />
        </div>
    </Tilt3DCard>
);

/* ─────────────────────────────────────────────
   WHY CHOOSE US - 3D feature steps
   ───────────────────────────────────────────── */
const WhyChooseUsItem = ({ text, index }) => (
    <div
        className="group flex items-center gap-4 p-4 rounded-xl glass hover:glass-strong transition-all duration-300 border-gradient card-3d-up"
        style={{ animationDelay: `${index * 80}ms` }}
    >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform">
            {index + 1}
        </div>
        <span className="text-foreground/90 font-medium">{text}</span>
    </div>
);

/* ─────────────────────────────────────────────
   MAIN HOME COMPONENT
   ───────────────────────────────────────────── */
const Home = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans overflow-x-hidden">
            <Nav />

            <HeroSection />

            {/* Stats Section */}
            <section className="py-16 bg-mesh-section relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="glass-strong rounded-3xl p-10 border-gradient">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <StatCounter value="500" suffix="+" label="Questions" />
                            <StatCounter value="6" suffix="" label="Core Subjects" />
                            <StatCounter value="10" suffix="+" label="Company Targets" />
                            <StatCounter value="100" suffix="%" label="Free Forever" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-mesh-section relative overflow-hidden">
                <FloatingOrb size="250px" color="rgba(139, 92, 246, 0.1)" top="20%" left="5%" delay={1} />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full glass text-primary text-xs font-semibold uppercase tracking-wider">
                            ✦ Features
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black">
                            Everything you need to{" "}
                            <span className="text-shimmer">crack it</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            From DSA sheets to AI mock interviews, we have curated everything in one place.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={<FaCode className="w-6 h-6" />}
                            title="Interview Questions"
                            description="Curated top questions from FAANG and product companies."
                            link="/top-interview-questions/dsa"
                            gradient="bg-blue-500"
                            index={0}
                        />
                        <FeatureCard
                            icon={<FaFileAlt className="w-6 h-6" />}
                            title="DSA Sheets"
                            description="Structured problem sets based on your skill level."
                            link="/generate-list-parameter"
                            gradient="bg-purple-500"
                            index={1}
                        />
                        <FeatureCard
                            icon={<FaVideo className="w-6 h-6" />}
                            title="Video Tutorials"
                            description="High-quality resources and video guides."
                            link="/resource"
                            gradient="bg-emerald-500"
                            index={2}
                        />
                        <FeatureCard
                            icon={<FaBrain className="w-6 h-6" />}
                            title="AI Mock Interview"
                            description="Real-time AI-powered interview simulation with scoring."
                            link="/mock-interview/setup"
                            gradient="bg-amber-500"
                            index={3}
                        />
                    </div>
                </div>
            </section>

            {/* Companies Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="container mx-auto px-4 text-center space-y-12 relative z-10">
                    <div className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-bold">
                            Trusted by candidates targeting{" "}
                            <span className="text-shimmer">top companies</span>
                        </h2>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/amazon" alt="Amazon" />
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/microsoft" alt="Microsoft" />
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/uber" alt="Uber" />
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/atlassian" alt="Atlassian" />
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/adobe" alt="Adobe" />
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/salesforce" alt="Salesforce" />
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/oracle" alt="Oracle" />
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/samsung" alt="Samsung" />
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/paytm" alt="Paytm" />
                        <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/americanExpress" alt="Amex" />
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-24 bg-mesh-section relative overflow-hidden">
                <FloatingOrb size="300px" color="rgba(16, 185, 129, 0.1)" top="10%" left="80%" delay={3} />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* 3D Image Stack */}
                        <div className="lg:w-1/2 perspective-1500 relative">
                            <Tilt3DCard intensity={6} className="relative z-10">
                                <div className="rounded-2xl overflow-hidden glass-strong border-gradient glow-primary">
                                    <img
                                        src="https://img.freepik.com/free-vector/open-knowledge-concept-template-banner-flyer-with-isometric-style-vector_82472-734.jpg"
                                        alt="Process"
                                        className="w-full h-auto object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                                </div>
                            </Tilt3DCard>
                            {/* Floating indicators */}
                            <div className="absolute -top-4 -left-4 z-20 glass-strong rounded-xl p-3 flex items-center gap-2 animate-float shadow-lg">
                                <FaChartLine className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm font-bold text-foreground">95% Success</span>
                            </div>
                            <div className="absolute -bottom-4 -right-4 z-20 glass-strong rounded-xl p-3 flex items-center gap-2 animate-float-reverse shadow-lg">
                                <FaUserGraduate className="w-5 h-5 text-primary" />
                                <span className="text-sm font-bold text-foreground">AI Guided</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:w-1/2 space-y-8">
                            <div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full glass text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                                    ✦ Why Us
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black">
                                    Built for{" "}
                                    <span className="text-shimmer">your success</span>
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    "Top Interview Questions on CS Core Subjects",
                                    "Generate DSA Sheet based on your Level",
                                    "AI-Powered Mock Interviews with Live Scoring",
                                    "Performance Dashboard & Analytics",
                                    "High Quality Resources & Tutorials",
                                ].map((item, index) => (
                                    <WhyChooseUsItem key={index} text={item} index={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-600/10" />
                <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Tilt3DCard intensity={4}>
                        <div className="glass-strong rounded-3xl p-12 md:p-16 border-gradient max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-black mb-6">
                                Ready to{" "}
                                <span className="text-shimmer">ace your next interview?</span>
                            </h2>
                            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                                Start practicing with our AI-powered platform today. No credit card required.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    to="/mock-interview/setup"
                                    className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white rounded-xl transition-all duration-300 glow-primary hover:glow-primary-lg"
                                    style={{ background: 'linear-gradient(135deg, hsl(263.4, 70%, 50.4%), #a855f7)' }}
                                >
                                    Start Mock Interview
                                    <FaArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-foreground glass rounded-xl hover:bg-white/10 transition-all duration-300 border-gradient"
                                >
                                    Create Free Account
                                </Link>
                            </div>
                        </div>
                    </Tilt3DCard>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
