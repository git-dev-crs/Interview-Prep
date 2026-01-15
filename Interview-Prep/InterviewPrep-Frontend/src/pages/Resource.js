import React from "react";
import { FaYoutube, FaGlobe, FaExternalLinkAlt, FaBookOpen } from "react-icons/fa";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Resource = () => {
  const data = [
    {
      label: "DBMS",
      fullName: "Database Management System",
      linkes: [
        { linkText: "YouTube Playlist", URL: "https://www.youtube.com/playlist?list=PLDzeHZWIZsTpukecmA2p5rhHM14bl2dHU" },
        { linkText: "Scaler Topics", URL: "https://www.scaler.com/topics/dbms/" },
        { linkText: "Javatpoint Tutorial", URL: "https://www.javatpoint.com/dbms-tutorial" },
      ],
    },
    {
      label: "OOPS",
      fullName: "Object Oriented Programming",
      linkes: [
        { linkText: "YouTube Playlist", URL: "https://www.youtube.com/playlist?list=PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk" },
        { linkText: "Javatpoint OOPS", URL: "https://www.javatpoint.com/java-oops-concepts" },
        { linkText: "GeeksforGeeks", URL: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/" },
      ],
    },
    {
      label: "SQL",
      fullName: "Structured Query Language",
      linkes: [
        { linkText: "YouTube Tutorial", URL: "https://www.youtube.com/watch?v=7S_tz1z_5bA&t=38s" },
        { linkText: "W3Schools SQL", URL: "https://www.w3schools.com/sql/" },
        { linkText: "GeeksforGeeks", URL: "https://www.geeksforgeeks.org/sql-tutorial/" },
      ],
    },
    {
      label: "DSA",
      fullName: "Data Structures & Algorithms",
      linkes: [
        { linkText: "Striver's Playlist", URL: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz" },
        { linkText: "Love Babbar Playlist", URL: "https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5XVg" }, // Replaced duplicate/generic link
        { linkText: "W3Schools DSA", URL: "https://www.w3schools.com/dsa/index.php" },
      ],
    },
    {
      label: "OS",
      fullName: "Operating System",
      linkes: [
        { linkText: "YouTube Playlist", URL: "https://www.youtube.com/playlist?list=PLDzeHZWIZsTr3nwuTegHLa2qlI81QweYG" },
        { linkText: "GeeksforGeeks", URL: "https://www.geeksforgeeks.org/operating-systems/" },
        { linkText: "Javatpoint OS", URL: "https://www.javatpoint.com/operating-system" },
      ],
    },
    {
      label: "CN",
      fullName: "Computer Networks",
      linkes: [
        { linkText: "YouTube Playlist", URL: "https://www.youtube.com/playlist?list=PLBGx66SQNZ8ZvdIoctCTWB3ApXQpQGEin" },
        { linkText: "Javatpoint CN", URL: "https://www.javatpoint.com/computer-network-tutorial" },
        { linkText: "GeeksforGeeks", URL: "https://www.geeksforgeeks.org/computer-network-tutorials/" },
      ],
    },
    {
      label: "System Design",
      fullName: "Scalable Architecture",
      linkes: [
        { linkText: "Gaurav Sen Playlist", URL: "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX" },
        { linkText: "Piyush Garg Playlist", URL: "https://www.youtube.com/watch?v=lFeYU31TnQ8&list=PLinedj3B30sBlBWRox2V2tg9QJ2zr4M3o" },
        { linkText: "GeeksforGeeks Notes", URL: "https://www.geeksforgeeks.org/system-design-tutorial/" },
      ],
    },
    {
      label: "DSA Sheets",
      fullName: "Curated Practice Lists",
      linkes: [
        { linkText: "Striver's A2Z Sheet", URL: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/" },
        { linkText: "Striver's SDE Sheet", URL: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" },
        { linkText: "DSA Cracker Sheet", URL: "https://drive.google.com/file/d/1FMdN_OCfOI0iAeDlqswCiC2DZzD4nPsb/view" },
      ],
    },
  ];

  const ResourceCard = ({ item }) => (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full">
      <div className="p-6 pb-4 border-b border-border/50 bg-secondary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
            <FaBookOpen className="text-xl" />
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            {item.label}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground font-medium pl-13 ml-13 h-5">
          {item.fullName}
        </p>
      </div>

      <div className="p-4 space-y-3 flex-1">
        {item.linkes.map((link, idx) => (
          <a
            key={idx}
            href={link.URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group/link border border-transparent hover:border-border/50"
          >
            <div className={`p-2 rounded-full ${link.linkText.toLowerCase().includes('youtube') ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
              {link.linkText.toLowerCase().includes('youtube') ? <FaYoutube /> : <FaGlobe />}
            </div>
            <span className="text-sm font-medium text-foreground group-hover/link:text-primary transition-colors flex-1">
              {link.linkText}
            </span>
            <FaExternalLinkAlt className="w-3 h-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      <Nav />
      <div className="flex-1 py-24 px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-4">
              📚 Learning Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Top-Tier <span className="text-primary">Resources</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A hand-picked collection of the best tutorials, articles, and practice sheets to master your technical interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item, index) => (
              <ResourceCard key={index} item={item} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Resource;
