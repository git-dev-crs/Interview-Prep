import React from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { FaArrowRight, FaDatabase, FaNetworkWired, FaLaptopCode, FaCogs, FaServer, FaCode } from "react-icons/fa";

const SubjectCard = ({ title, description, image, link, icon }) => (
  <Link
    to={link}
    className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
  >
    <div className="h-48 overflow-hidden relative">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
      <div className="absolute bottom-4 left-4 w-10 h-10 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center text-primary shadow-sm">
        {icon}
      </div>
    </div>
    <div className="flex-1 p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{title}</h2>
      <p className="text-muted-foreground text-sm mb-6 flex-1 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center text-sm font-medium text-primary mt-auto group/link">
        Explore {title}
        <FaArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
      </div>
    </div>
  </Link>
);

const CSCoreSubjects = () => {
  const subjects = [
    {
      title: "Operating System",
      description: "Master process management, memory handling, and concurrency. Essential for backend roles.",
      image: "https://images.unsplash.com/photo-1642176849879-92f85770f212?q=80&w=2070&auto=format&fit=crop",
      link: "/top-interview-questions/os",
      icon: <FaCogs />
    },
    {
      title: "DBMS",
      description: "Deep dive into SQL, NoSQL, indexing, and transactions. A must for data-heavy applications.",
      image: "https://plus.unsplash.com/premium_photo-1682145174729-52ebed03f4b0?q=80&w=2070&auto=format&fit=crop",
      link: "/top-interview-questions/dbms",
      icon: <FaDatabase />
    },
    {
      title: "Computer Networks",
      description: "Understand OSI model, TCP/IP, and network security. Critical for distributed systems.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
      link: "/top-interview-questions/cn",
      icon: <FaNetworkWired />
    },
    {
      title: "OOPS",
      description: "Grasp the four pillars of Object-Oriented Programming. Foundational for software design.",
      image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=2070&auto=format&fit=crop",
      link: "/top-interview-questions/oops",
      icon: <FaLaptopCode />
    },
    {
      title: "DS & Algo",
      description: "The heart of coding interviews. Arrays, Trees, Graphs, and Dynamic Programming.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      link: "/top-interview-questions/dsa",
      icon: <FaCode />
    },
    {
      title: "SQL (RDBMS)",
      description: "Master detailed queries, joins, and database design patterns.",
      image: "https://images.unsplash.com/photo-1622549037543-49cf1ca0babc?q=80&w=2070&auto=format&fit=crop",
      link: "/top-interview-questions/sql",
      icon: <FaServer />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Nav />
      <main className="flex-1 py-12 pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Top Interview Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Curated questions from top product-based companies to help you crack the core rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject, index) => (
              <SubjectCard key={index} {...subject} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CSCoreSubjects;
