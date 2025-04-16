import React from "react";
import { ExternalLink } from "lucide-react";

const aptitudeResources = [
  { title: "IndiaBix", description: "Aptitude & technical interview questions.", link: "https://www.indiabix.com/" },
  { title: "FreshersWorld", description: "Aptitude, reasoning & placement papers.", link: "https://placement.freshersworld.com/" },
  { title: "GeeksforGeeks Aptitude", description: "Aptitude and logical reasoning problems.", link: "https://www.geeksforgeeks.org/aptitude-gq/" },
  { title: "PrepInsta", description: "Placement preparation & aptitude questions.", link: "https://prepinsta.com/" },
];

const codingResources = [
  { title: "LeetCode", description: "Solve coding problems & prepare for interviews.", link: "https://leetcode.com/" },
  { title: "CodeChef", description: "Competitive programming and challenges.", link: "https://www.codechef.com/" },
  { title: "GeeksforGeeks", description: "DSA, coding problems & interview prep.", link: "https://www.geeksforgeeks.org/" },
  { title: "HackerRank", description: "Coding challenges and skill certifications.", link: "https://www.hackerrank.com/" },
  { title: "CodeForces", description: "Competitive programming contests.", link: "https://codeforces.com/" },
  { title: "InterviewBit", description: "Structured interview preparation.", link: "https://www.interviewbit.com/" },
  { title: "Exercism", description: "Improve coding with mentorship.", link: "https://exercism.org/" },
];

const ResourceCard = ({ title, description, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" className="bg-white hover:shadow-xl transition duration-300 ease-in-out border border-gray-200 p-6 rounded-2xl flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
    <div className="mt-4 text-sm text-blue-600 flex items-center gap-1">
      Visit Resource <ExternalLink size={16} />
    </div>
  </a>
);

const PracticePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">🚀 Practice Resources</h1>

        {/* Aptitude Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 border-b border-purple-300 inline-block pb-1">🧠 Aptitude Practice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {aptitudeResources.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </section>

        {/* Coding Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 border-b border-blue-300 inline-block pb-1">💻 Coding Practice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {codingResources.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PracticePage;
