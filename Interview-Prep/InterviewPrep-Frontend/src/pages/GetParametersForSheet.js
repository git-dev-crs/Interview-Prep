import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { FaChartLine, FaCheckCircle, FaLaptopCode, FaStar, FaTrophy } from "react-icons/fa";

const parameterList = [
  { icon: <FaLaptopCode />, ques: "How many questions have you done?" },
  { icon: <FaStar />, ques: "Difficulty faced in easy questions? (0-10)" },
  { icon: <FaStar />, ques: "Difficulty faced in medium questions? (0-10)" },
  { icon: <FaStar />, ques: "Difficulty faced in hard questions? (0-10)" },
  { icon: <FaTrophy />, ques: "Target Package (in LPA)?" },
  { icon: <FaChartLine />, ques: "Highest contest rating on Codechef?" },
  { icon: <FaChartLine />, ques: "Highest contest rating on Leetcode?" },
  { icon: <FaCheckCircle />, ques: "How consistent are you? (0-10)" },
];

const GetParametersForSheet = () => {
  const navigate = useNavigate();
  // Stores the calculated ratings for the algorithm
  const [parameterInput, setParameterInput] = useState([
    0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  // Stores the raw user input values for the form
  const [rawInputs, setRawInputs] = useState(Array(8).fill(""));

  useEffect(() => {
    const getRating = localStorage.getItem("rating");
    if (getRating !== null && getRating !== "null") {
      navigate(`/questions-list/${getRating}`);
    }
  }, [navigate]);

  // Rating Logic Helpers
  const getCodeChefRating = (value) => {
    if (value === 0) return 0;
    if (value <= 1400) return 2;
    if (value <= 1599) return 3.5;
    if (value <= 1799) return 6;
    return 8.5;
  };

  const getLeetcodeRating = (value) => {
    if (value === 0) return 0;
    if (value <= 1500) return 2;
    if (value <= 1650) return 3.5;
    if (value <= 1850) return 5.5;
    return 8;
  };

  const getQuestinSolvedRating = (value) => {
    if (value <= 100) return 1.5;
    if (value <= 250) return 3.5;
    if (value <= 500) return 5.5;
    return 8;
  };

  const getPackageRating = (value) => {
    if (value <= 10) return 2.5;
    if (value <= 25) return 5.5;
    return 8;
  };

  const handleChange = (e, index) => {
    const rawValue = e.target.value;
    const value = Number(rawValue);

    // Update raw inputs state
    const newRawInputs = [...rawInputs];
    newRawInputs[index] = rawValue;
    setRawInputs(newRawInputs);

    // Update calculated ratings state
    const updatedInput = [...parameterInput];

    if (index === 5) updatedInput[index] = getCodeChefRating(value);
    else if (index === 6) updatedInput[index] = getLeetcodeRating(value);
    else if (index === 0) updatedInput[index] = getQuestinSolvedRating(value);
    else if (index === 4) updatedInput[index] = getPackageRating(value);
    else updatedInput[index] = value;

    setParameterInput(updatedInput);
  };

  const calculateRating = (e) => {
    e.preventDefault();
    const filteredNumbers = parameterInput.filter((number) => number !== 0);
    const sum = filteredNumbers.reduce((acc, number) => acc + number, 0);
    const average = filteredNumbers.length ? sum / filteredNumbers.length : 0;
    navigate(`/questions-list/${average}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Nav />
      <div className="flex-1 py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 mb-4">
              Personalized DSA Plan
            </h1>
            <p className="text-muted-foreground text-lg">
              Answer a few questions to generate a curated list of problems tailored to your skill level.
            </p>
          </div>

          <form onSubmit={calculateRating} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {parameterList.map((item, index) => (
                <div key={index} className="bg-card border border-border/50 p-6 rounded-xl shadow-lg hover:border-primary/50 transition-colors group">
                  <label className="flex items-center gap-3 text-sm font-medium text-foreground mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    {item.ques}
                  </label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:border-primary text-foreground"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={rawInputs[index]}
                    onChange={(e) => handleChange(e, index)}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="pt-8">
              <button
                type="submit"
                className="w-full md:w-auto md:px-12 mx-auto block py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
              >
                Generate My Plan 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GetParametersForSheet;
