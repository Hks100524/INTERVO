'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SessionDataItem {
  question: string;
  answer: string;
  userAnswer?: string;
  feedback?: string;
  isCorrectEnough?: boolean;
}

interface SessionHistoryItem {
  id: string;
  user_id: string;
  topic: string;
  session_data: SessionDataItem[];
  created_at: string;
}

interface SessionsApiResponse {
  success?: boolean;
  sessions?: SessionHistoryItem[];
  error?: string;
}

function isAttemptedQuestion(item: SessionDataItem) {
  return Boolean(
    item.userAnswer?.trim() ||
      item.feedback?.trim()
  );
}

function calculateSessionScore(
  sessionData: SessionDataItem[]
) {
  const attemptedQuestions =
    sessionData.filter(isAttemptedQuestion);

  if (!attemptedQuestions.length) {
    return 0;
  }

  const correctQuestions =
    attemptedQuestions.filter(
      (item) => item.isCorrectEnough
    ).length;

  return Math.round(
    (correctQuestions / attemptedQuestions.length) * 100
  );
}

function calculateAverageScore(sessions: SessionHistoryItem[]) {
  let totalAttemptedQuestions = 0;
  let totalCorrectAnswers = 0;

  for (const session of sessions) {
    const attemptedQuestions =
      session.session_data.filter(isAttemptedQuestion);

    totalAttemptedQuestions += attemptedQuestions.length;
    totalCorrectAnswers += attemptedQuestions.filter(
      (item) => item.isCorrectEnough
    ).length;
  }

  if (!totalAttemptedQuestions) {
    return 0;
  }

  return Math.round(
    (totalCorrectAnswers / totalAttemptedQuestions) * 100
  );
}

function getPerformanceLevel(averageScore: number) {
  if (averageScore <= 40) {
    return 'Beginner';
  }

  if (averageScore <= 70) {
    return 'Intermediate';
  }

  return 'Advanced';
}

function formatSessionDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<
    SessionHistoryItem[]
  >([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSessions() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          '/api/sessions',
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }
        );

        const data =
          (await response
            .json()
            .catch(() => null)) as
            | SessionsApiResponse
            | null;

        if (
          !response.ok ||
          !data?.success ||
          !Array.isArray(data.sessions)
        ) {
          throw new Error(
            data?.error ||
              'Failed to load sessions'
          );
        }

        const sortedSessions =
          [...data.sessions].sort((left, right) => {
            return (
              new Date(
                right.created_at
              ).getTime() -
              new Date(left.created_at).getTime()
            );
          });

        if (isMounted) {
          setSessions(sortedSessions);
        }
      } catch (fetchError) {
        console.error(
          'Failed to load dashboard sessions:',
          fetchError
        );

        if (isMounted) {
          setSessions([]);
          setError(
            'Unable to load session history right now.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalSessions = sessions.length;
  const averageScore =
    calculateAverageScore(sessions);
  const performanceLevel =
    getPerformanceLevel(averageScore);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="relative flex flex-col items-center p-6 min-h-screen">
        <div className="w-full max-w-6xl mt-10">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Dashboard
              </h1>

              <p className="text-gray-400 mt-2">
                Welcome to INTERVO Dashboard
              </p>
            </div>

            <Link
              href="/practice"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
            >
              New Practice
            </Link>

          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <div className="bg-black/30 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-400 text-sm">
                Total Sessions
              </h3>

              <p className="text-3xl font-bold text-white mt-2">
                {totalSessions}
              </p>
            </div>

            <div className="bg-black/30 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-400 text-sm">
                Average Score
              </h3>

              <p className="text-3xl font-bold text-white mt-2">
                {averageScore}%
              </p>
            </div>

            <div className="bg-black/30 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-400 text-sm">
                Performance
              </h3>

              <p className="text-3xl font-bold text-green-400 mt-2">
                {performanceLevel}
              </p>
            </div>

          </div>

          {/* Session History */}
          <div className="bg-black/30 border border-gray-800 rounded-2xl p-6">

            <h2 className="text-2xl font-bold text-white mb-4">
              Session History
            </h2>

            {isLoading ? (
              <div className="text-center py-16">
                <p className="text-gray-400">
                  Loading session history...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-gray-400">
                  {error}
                </p>

                <Link
                  href="/practice"
                  className="inline-block mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Start Your First Interview
                </Link>

              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-16">

                <p className="text-gray-400">
                  No interview sessions found yet.
                </p>

                <Link
                  href="/practice"
                  className="inline-block mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Start Your First Interview
                </Link>

              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const questionCount =
                    session.session_data.length;
                  const score =
                    calculateSessionScore(
                      session.session_data
                    );

                  return (
                    <div
                      key={session.id}
                      className="bg-black/30 border border-gray-800 rounded-2xl p-6"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {session.topic}
                          </h3>

                          <p className="text-gray-400 mt-2">
                            {questionCount} Questions
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-3xl font-bold text-white">
                            {score}%
                          </p>

                          <p className="text-gray-400 mt-2">
                            {formatSessionDate(
                              session.created_at
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}
