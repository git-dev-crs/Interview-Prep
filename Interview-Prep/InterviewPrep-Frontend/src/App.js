import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
// import Nav from "./components/Nav"; // Removed as it is used in pages individually
import CSCoreSubjects from "./pages/CSCoreSubjects";
import GetParametersForSheet from "./pages/GetParametersForSheet";
import Home from "./pages/Home";
import Resource from "./pages/Resource";
import Login from "./components/session/Login";
import Signup from "./components/session/Signup";
import ForgotPassword from "./components/session/ForgotPassword";
import ResetPassword from "./components/session/ResetPassword";
import Cn from "./components/Top_Questions/Cn";
import Dbms from "./components/Top_Questions/Dbms";
import Oops from "./components/Top_Questions/Oops";
import OS from "./components/Top_Questions/OS";
import Sql from "./components/Top_Questions/Sql";
import Dsa from "./components/Top_Questions/Dsa";
import QuestionList from "./pages/QuestionList";
import DSARoadmap from "./pages/DSARoadmap";
import AIAssistant from "./components/AIAssistant/AIAssistant";
// ── New Feature Imports ──
import InterviewSetup from "./pages/InterviewSetup";
import MockInterview from "./pages/MockInterview";
import Dashboard from "./pages/Dashboard";
import InterviewDetail from "./pages/InterviewDetail";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/core-subject" element={<CSCoreSubjects />} />
          <Route path="/dsa" element={<DSARoadmap />} />
          <Route path="/resource" element={<Resource />} />
          <Route path="/resouce" element={<Resource />} /> {/* Legacy typo redirect */}

          <Route path="/top-interview-questions/cn" element={<Cn />} />
          <Route path="/top-interview-questions/dbms" element={<Dbms />} />
          <Route path="/top-interview-questions/dsa" element={<Dsa />} />
          <Route path="/top-interview-questions/oops" element={<Oops />} />
          <Route path="/top-interview-questions/os" element={<OS />} />
          <Route path="/top-interview-questions/sql" element={<Sql />} />

          <Route
            path="/generate-list-parameter"
            element={<GetParametersForSheet />}
          />
          <Route path="/questions-list/:rating" element={<QuestionList />} />

          {/* ── New Features: AI Mock Interview (login required) ── */}
          <Route path="/mock-interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
          <Route path="/mock-interview/session" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />

          {/* ── New Features: Dashboard & Analytics (login required) ── */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/session/:id" element={<ProtectedRoute><InterviewDetail /></ProtectedRoute>} />

          {/* Catch-all — must stay last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIAssistant />
      </Router>
    </div>
  );
}

export default App;
