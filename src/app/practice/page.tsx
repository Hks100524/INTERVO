"use client";

import React, { useState } from "react";
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import Link from "next/link";

interface QAPair {
  question: string;
  answer: string;
  userAnswer?: string;
  feedback?: string;
  is_correct_enough?: boolean;
}

function QACard({ qa, index, onFeedbackReceived }: { qa: QAPair; index: number; onFeedbackReceived: (index: number, userAnswer: string, feedback: string, isCorrectEnough: boolean) => void }) {
  const { isAuthenticated } = useAuth();
  const { openSignin } = useAuthModal();

  const [userAnswer, setUserAnswer] = useState(qa.userAnswer || "");
  const [feedback, setFeedback] = useState(qa.feedback || "");
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleFeedback = async () => {
    if (!isAuthenticated) {
      openSignin();
      return;
    }
    if (!userAnswer.trim()) {
      setFeedback("Error: Please write your answer first.");
      return;
    }

    setIsGettingFeedback(true);
    setFeedback("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: qa.question,
          correctAnswer: qa.answer,
          userAnswer: userAnswer,
        }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setFeedback(data.feedback);
      
      // Update parent state with user answer, feedback, and correctness
      onFeedbackReceived(index, userAnswer, data.feedback, data.is_correct_enough ?? false);
    } catch {
      setFeedback("Error: Failed to get feedback. Please try again.");
    } finally {
      setIsGettingFeedback(false);
    }
  };

  return (
    <div className="group bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-900/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 animate-fadeIn space-y-4">
      {/* Question Number Badge */}
      <div className="flex items-start gap-2 sm:gap-4">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3 leading-relaxed break-words">
            {qa.question}
          </h3>
        </div>
      </div>

      {/* Answer Section with Toggle */}
      <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-700/30">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center justify-between w-full text-left group/answer"
        >
          <span className="text-sm font-semibold text-gray-300 group-hover/answer:text-blue-400 transition-colors">
            {showAnswer ? "Hide" : "Show"} Expected Answer
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              showAnswer ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showAnswer && (
          <p className="mt-3 text-gray-300 text-sm sm:text-base leading-relaxed animate-fadeIn">
            {qa.answer}
          </p>
        )}
      </div>

      {/* Practice Area */}
      <div className="space-y-3 pt-2">
        <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Your Answer:
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer here and get instant AI feedback..."
          className="w-full p-4 rounded-xl bg-gray-900/60 text-white placeholder-gray-500 border border-gray-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base resize-none outline-none"
          rows={4}
          disabled={isGettingFeedback}
        />
        <button
          onClick={handleFeedback}
          disabled={isGettingFeedback || !userAnswer.trim()}
          className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-700 hover:to-green-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          {isGettingFeedback ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Get AI Feedback</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Display */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm sm:text-base animate-fadeIn ${
            feedback.startsWith("Error:")
              ? "bg-red-900/30 border border-red-500/50 backdrop-blur-sm"
              : "bg-gradient-to-br from-emerald-900/30 to-green-900/20 border border-emerald-500/30 backdrop-blur-sm"
          }`}
        >
          <div className="flex items-start gap-3">
            {feedback.startsWith("Error:") ? (
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <div className="flex-1">
              <h4
                className={`font-semibold mb-2 ${
                  feedback.startsWith("Error:") ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {feedback.startsWith("Error:") ? "Error" : "AI Feedback"}
              </h4>
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {feedback.replace("Error: ", "")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { openSignin } = useAuthModal();
  const [topic, setTopic] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loadMoreButtonRef = React.useRef<HTMLDivElement>(null);

  // Handle feedback received and save session
  const handleFeedbackReceived = async (index: number, userAnswer: string, feedback: string, isCorrectEnough: boolean) => {
    try {
      // Update the qaPairs state with user answer, feedback, and correctness
      const updatedQaPairs = [...qaPairs];
      updatedQaPairs[index] = {
        ...updatedQaPairs[index],
        userAnswer,
        feedback,
        is_correct_enough: isCorrectEnough,
      };
      setQaPairs(updatedQaPairs);

      // Save session to backend only for authenticated users
      if (!isAuthenticated) {
        // Prompt sign-in and skip saving for anonymous users
        openSignin();
        return;
      }

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          sessionData: updatedQaPairs.map(qa => ({
            question: qa.question,
            answer: qa.answer,
            user_answer: qa.userAnswer,
            ai_feedback: {
              feedback: qa.feedback,
              is_correct_enough: qa.is_correct_enough ?? false,
            },
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save session');
      }

      const result = await response.json();
      console.log('Session saved successfully:', result);
    } catch (error: any) {
      console.error('Failed to save session to database:', error);
      // Optionally show error to user
      // setError('Failed to save your progress. Your data is still available in this session.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openSignin();
      return;
    }

    setIsLoading(true);
    setQaPairs([]);
    setError(null);
    setCurrentTopic(topic);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setQaPairs(data);
    } catch {
      setError("Error generating questions. Try again after 10–15 seconds.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!isAuthenticated) {
      openSignin();
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    // Store current position before loading more
    const scrollPosition = loadMoreButtonRef.current?.offsetTop || 0;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: currentTopic }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setQaPairs([...qaPairs, ...data]);
      
      // Scroll to where new questions start (just after the button position)
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition - 100, // Slight offset for better view
          behavior: "smooth",
        });
      }, 100);
    } catch {
      setError("Error generating more questions. Try again after 10–15 seconds.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="relative flex flex-col items-center p-4 sm:p-6 lg:p-8 min-h-screen pb-20 md:pb-8">
        {/* Header Section */}
        <div className="w-full max-w-5xl mb-8 sm:mb-12 mt-4 sm:mt-8 lg:mt-12 text-center space-y-4 sm:space-y-6 animate-fadeIn">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight px-2">
              AI Interview Prep
            </h1>
          </div>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
            Master your interview skills with AI-powered questions and instant feedback.
            <span className="block mt-2 text-sm sm:text-base text-gray-400">Practice makes perfect! 🚀</span>
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-8 sm:mb-12 space-y-4 animate-slideIn px-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700/50">
              <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3">
                What topic would you like to practice?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., React.js, JavaScript..."
                  className="w-full p-3 sm:p-4 pr-10 sm:pr-12 rounded-xl bg-gray-900/60 text-white placeholder-gray-500 border border-gray-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base outline-none"
                  required
                  disabled={isLoading}
                />
                <svg className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 sm:mt-4 w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm sm:text-base md:text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 sm:gap-3 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">Generate Interview Questions</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/50 backdrop-blur-sm text-white animate-fadeIn flex items-start gap-3">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-300">Error</h4>
              <p className="text-sm text-gray-200 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && qaPairs.length === 0 && (
          <div className="flex flex-col items-center mt-8 animate-fadeIn">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-300 text-lg mt-6 font-medium">Crafting your questions...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
          </div>
        )}

        {/* Questions Section */}
        {qaPairs.length > 0 && (
          <section className="w-full max-w-4xl space-y-4 sm:space-y-6 pb-20 md:pb-16 px-2">
            <div className="text-center mb-6 sm:mb-8 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 px-2">
                Your {currentTopic} Interview Questions
              </h2>
              <p className="text-sm sm:text-base text-gray-400 px-4">Practice each question and get instant AI feedback</p>
            </div>

            {qaPairs.map((qa, index) => (
              <QACard 
                key={`${currentTopic}-${index}`} 
                qa={qa} 
                index={index}
                onFeedbackReceived={handleFeedbackReceived}
              />
            ))}

            {/* Load More Button */}
            <div ref={loadMoreButtonRef} className="mt-8 sm:mt-12 p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 backdrop-blur-sm text-center animate-fadeIn">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-blue-300 mb-2 px-2">Want More Practice?</h3>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 px-4">Load more questions on {currentTopic} to continue improving!</p>
              
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm sm:text-base md:text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 sm:gap-3 mx-auto group w-full sm:w-auto max-w-md"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Loading More...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm sm:text-base">Load More Questions</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Completion Message */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-emerald-500/30 backdrop-blur-sm text-center animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-emerald-300 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold">You've completed {qaPairs.length} questions!</h3>
              </div>
              <p className="text-gray-400 text-sm">Keep practicing to master your skills 🚀</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
