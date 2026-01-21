import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import { CiWarning } from "react-icons/ci";
import { FaArrowLeft } from "react-icons/fa";

const QuestionList = () => {
  const { rating } = useParams();
  const [problemList, setProblemList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [solvedQuestions, setSolvedQuestions] = useState([]);

  useEffect(() => {
    const getProblemList = async () => {
      //check user is logged in or not
      if (localStorage.getItem("email") !== null) {
        setIsLogin(true);
      }
      try {
        const data = {
          email: localStorage.getItem("email"),
          rating: rating,
        };
        const url = "http://localhost:3001/documents";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
          },
          body: JSON.stringify(data), // Convert the data object to a JSON string
        });

        const jsonData = await response.json();
        if (jsonData) {
          localStorage.setItem("rating", rating);
          setSolvedQuestions(jsonData.solvedQuestions);
          setProblemList(jsonData.questionsList);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getProblemList();
  }, [rating]);

  const changeQuestionStatus = async (e, id) => {
    if (e === "add") {
      try {
        const data = {
          email: localStorage.getItem("email"),
          questionId: id,
        };
        const url = "http://localhost:3001/update-completed-questions";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
          },
          body: JSON.stringify(data), // Convert the data object to a JSON string
        });

        const jsonData = await response.json();
        setSolvedQuestions(jsonData);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const newQes = solvedQuestions.filter((item) => item !== id);
        setSolvedQuestions(newQes);
        const data = {
          email: localStorage.getItem("email"),
          questionId: id,
        };
        const url = "http://localhost:3001/remove-completed-questions";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
          },
          body: JSON.stringify(data), // Convert the data object to a JSON string
        });

        const jsonData = await response.json();
        setSolvedQuestions(jsonData);
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <>
      <Nav />
      <div className=" max-w-4xl mx-auto px-4">
        <div className="py-8">
          <Link
            to="/generate-list-parameter"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Parameters</span>
          </Link>
          <h1 className="text-[#004b3c] text-3xl font-bold">
            <span className="border-b-4 border-emerald-500 pb-1">Questions List</span>
          </h1>
        </div>
        {!isLogin && (
          <div className=" bg-red-100 p-2 mb-5 flex items-center space-x-2 border border-gray-300 rounded">
            <div className="font-semibold">
              <CiWarning size={18} />
            </div>
            <div className=" font-semibold text-sm">
              Currently you are not logged in, If you want to track progress
              please login or signup.
            </div>
          </div>
        )}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">Loading personalized plan...</div>
          ) : (
            <div className="grid gap-4">
              {problemList &&
                problemList.map((item, index) => {
                  return (
                    <div
                      className="group flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                      key={index}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                      </div>

                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Solve Problem
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeQuestionStatus(solvedQuestions.includes(item._id) ? "remove" : "add", item._id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${solvedQuestions.includes(item._id)
                            ? "bg-green-500/20 text-green-500 border border-green-500/50"
                            : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary"
                            }`}
                        >
                          {solvedQuestions.includes(item._id) ? "✓" : "+"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionList;
