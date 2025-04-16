import React, { useState } from "react";
import {
  BookOpen, Code2, Database, Cpu, Globe2,
  ShieldCheck, Cloud, GitBranch
} from "lucide-react";

const concepts = [
  { title: "C", description: "A powerful procedural programming language.", link: "https://www.geeksforgeeks.org/c-programming-language/", icon: <Code2 className="text-blue-500 w-6 h-6" /> },
  { title: "C++", description: "An extension of C with OOP features.", link: "https://www.geeksforgeeks.org/c-plus-plus/", icon: <Code2 className="text-purple-500 w-6 h-6" /> },
  { title: "Java", description: "A versatile OOP language widely used for web & mobile apps.", link: "https://www.geeksforgeeks.org/java/", icon: <Code2 className="text-orange-500 w-6 h-6" /> },
  { title: "Python", description: "A popular, easy-to-learn language with vast applications.", link: "https://www.geeksforgeeks.org/python-programming-language/", icon: <Code2 className="text-green-500 w-6 h-6" /> },
  { title: "JavaScript", description: "The language of the web for interactive frontend experiences.", link: "https://www.geeksforgeeks.org/javascript/", icon: <Code2 className="text-yellow-500 w-6 h-6" /> },
  { title: "React", description: "A powerful library for building dynamic UI components.", link: "https://www.geeksforgeeks.org/reactjs-tutorials/", icon: <Code2 className="text-cyan-500 w-6 h-6" /> },
  { title: "MySQL", description: "A widely used relational database management system.", link: "https://www.geeksforgeeks.org/mysql-tutorials/", icon: <Database className="text-teal-600 w-6 h-6" /> },
  { title: "MongoDB", description: "A NoSQL database known for its flexibility and scalability.", link: "https://www.geeksforgeeks.org/mongodb/", icon: <Database className="text-green-700 w-6 h-6" /> },
  { title: "Spring Boot", description: "A Java framework for building enterprise applications.", link: "https://www.geeksforgeeks.org/spring-boot/", icon: <Code2 className="text-red-500 w-6 h-6" /> },
  { title: "Git & GitHub", description: "Version control system and collaboration platform.", link: "https://www.geeksforgeeks.org/ultimate-guide-git-github/", icon: <GitBranch className="text-gray-700 w-6 h-6" /> },
  { title: "DSA", description: "Essential for problem solving and coding interviews.", link: "https://www.geeksforgeeks.org/data-structures/", icon: <BookOpen className="text-pink-600 w-6 h-6" /> },
  { title: "Operating Systems", description: "Understand memory management, scheduling, and processes.", link: "https://www.geeksforgeeks.org/operating-systems/", icon: <Cpu className="text-indigo-600 w-6 h-6" /> },
  { title: "Computer Networks", description: "Study of how data travels across the internet.", link: "https://www.geeksforgeeks.org/computer-network-tutorials/", icon: <Globe2 className="text-blue-600 w-6 h-6" /> },
  { title: "DBMS", description: "Learn about relational databases and SQL queries.", link: "https://www.geeksforgeeks.org/dbms/", icon: <Database className="text-purple-700 w-6 h-6" /> },
  { title: "Cloud Computing", description: "Delivery of computing services over the internet.", link: "https://www.geeksforgeeks.org/cloud-computing/", icon: <Cloud className="text-sky-600 w-6 h-6" /> },
  { title: "Machine Learning", description: "Algorithms that enable systems to learn from data.", link: "https://www.geeksforgeeks.org/machine-learning/", icon: <Cpu className="text-lime-600 w-6 h-6" /> },
  { title: "Cybersecurity", description: "Protect systems and data from cyber threats.", link: "https://www.geeksforgeeks.org/cyber-security-tutorial/", icon: <ShieldCheck className="text-red-600 w-6 h-6" /> },
];

const ConceptPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConcepts = concepts.filter((concept) =>
    concept.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    concept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-pink-500 text-transparent bg-clip-text mb-4">
          CSE Concepts and Resources
        </h1>
        <p className="text-gray-600 text-lg mb-10">
          Explore essential technologies and subjects every CSE student should master.
        </p>

        <input
          type="text"
          placeholder="🔍 Search for a topic..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-12 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {filteredConcepts.length > 0 ? (
          filteredConcepts.map((concept, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col items-start"
            >
              <div className="mb-4">{concept.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800">{concept.title}</h2>
              <p className="text-gray-600 text-sm my-2">{concept.description}</p>
              <a
                href={concept.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline mt-auto text-sm font-medium"
              >
                Explore more →
              </a>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No results found. Try a different keyword.</p>
        )}
      </div>
    </div>
  );
};

export default ConceptPage;
