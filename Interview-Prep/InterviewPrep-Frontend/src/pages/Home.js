import React from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { FaCode, FaFileAlt, FaVideo, FaQuestionCircle, FaArrowRight } from "react-icons/fa";

const HeroSection = () => (
  <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-background min-h-[90vh] flex items-center">
    <div className="container mx-auto px-4 relative z-10">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-8 animate-in slide-in-from-left duration-700">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium">
            🚀 The #1 Coding Interview Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Empowering Coders, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              Enabling Dreams
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Unveil the essence of InterviewPrep: a community-driven platform dedicated to empowering coders of all levels. Master DSA, System Design, and Core Subjects with our curated paths.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/generate-list-parameter"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
            >
              Explore DSA
              <FaArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              to="/core-subject"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-all"
            >
              CS Core Subjects
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 relative animate-in slide-in-from-right duration-700 group perspective-1000 flex justify-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card/50 transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-primary/25 max-w-md lg:max-w-lg w-full">
            <img
              src="https://img.freepik.com/free-vector/programmer-working-web-development-code-engineer-programming-python-php-java-script-computer_90220-251.jpg"
              alt="Coding"
              className="w-full h-auto object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl transition-all duration-500 group-hover:bg-primary/30 group-hover:scale-110" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl transition-all duration-500 group-hover:bg-purple-500/30 group-hover:scale-110" />
        </div>
      </div>
    </div>
  </section>
);

const FeatureCard = ({ icon, title, link }) => (
  <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
    {link ? (
      <Link to={link} className="text-sm text-primary font-medium hover:underline inline-flex items-center">
        Explore <FaArrowRight className="ml-1 w-3 h-3" />
      </Link>
    ) : (
      <span className="text-sm text-muted-foreground">Coming Soon</span>
    )}
  </div>
);

const CompanyLogo = ({ src, alt }) => (
  <div className="bg-white p-4 rounded-xl shadow-lg border border-white/10 hover:shadow-primary/20 hover:scale-105 transition-all duration-300 w-40 h-20 flex items-center justify-center group bg-opacity-95 backdrop-blur-sm">
    <img
      src={src}
      alt={alt}
      className="max-w-full max-h-full object-contain transition-transform duration-300"
    />
  </div>
);

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Nav />

      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to crack it</h2>
            <p className="text-muted-foreground">From DSA sheets to System Design guides, we have curated everything in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<FaCode className="w-6 h-6" />}
              title="Interview Questions"
              link="/top-interview-questions/dsa"
            />
            <FeatureCard
              icon={<FaFileAlt className="w-6 h-6" />}
              title="DSA Sheets"
              link="/generate-list-parameter"
            />
            <FeatureCard
              icon={<FaVideo className="w-6 h-6" />}
              title="Video Tutorials"
              link="/resouce"
            />
            <FeatureCard
              icon={<FaQuestionCircle className="w-6 h-6" />}
              title="Mock Interviews"
            // No link, acts as placeholder
            />
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-20 border-y border-border/50">
        <div className="container mx-auto px-4 text-center space-y-12">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Placement Targets
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/amazon" alt="Amazon" />
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/microsoft" alt="Microsoft" />
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/uber" alt="Uber" />
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/atlassian" alt="Atlassian" />
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/adobe" alt="Adobe" />
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/salesforce" alt="Salesforce" />
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/oracle" alt="Oracle" />
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/samsung" alt="Samsung" />
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/paytm" alt="Paytm" />
            <CompanyLogo src="https://res.cloudinary.com/dbepo4xrw/image/upload/w_256,q_100,c_limit,f_auto/americanExpress" alt="Amex" />
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 order-2 md:order-1 relative group perspective-1000">
              <div className="relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-primary/25 max-w-md mx-auto">
                <img
                  src="https://img.freepik.com/free-vector/open-knowledge-concept-template-banner-flyer-with-isometric-style-vector_82472-734.jpg"
                  alt="Process"
                  className="w-full h-auto object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
              </div>
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>
            <div className="md:w-1/2 order-1 md:order-2 space-y-6">
              <h2 className="text-3xl font-bold">Why Choose Us?</h2>
              <ul className="space-y-4">
                {[
                  "Top Interview Questions on CS Core",
                  "Generate DSA Sheet based on your Level",
                  "Structured DSA path for Targeted Firms",
                  "Access High Quality Resources",
                  "Regular POTD based on your skill"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
