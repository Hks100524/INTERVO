import AssessmentWizard from '@/components/assessment/AssessmentWizard';



export default function AssessmentPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="w-full space-y-12">
          {/* Section 1: Header */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              AI Readiness
            </h1>

            <p className="max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
              Take a company-standard assessment powered by AI. Get evaluated on real interview questions and receive personalized feedback.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="inline-flex items-center rounded-full border border-gray-700/50 bg-gray-900/40 px-3 py-1.5 text-xs font-semibold text-gray-300">
                ~10 min
              </div>
              <div className="inline-flex items-center rounded-full border border-gray-700/50 bg-gray-900/40 px-3 py-1.5 text-xs font-semibold text-gray-300">
                5 Questions
              </div>
              <div className="inline-flex items-center rounded-full border border-gray-700/50 bg-gray-900/40 px-3 py-1.5 text-xs font-semibold text-gray-300">
                AI Evaluation
              </div>
            </div>
          </div>

          {/* Section 2: Assessment Builder */}
          <AssessmentWizard />

          {/* Section 3: What You'll Get */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">
              What You'll Get
            </h2>

            <div className="space-y-4">
              {[
                {
                  icon: '✓',
                  text: 'Company-specific questions tailored to your target role',
                },
                {
                  icon: '✓',
                  text: 'AI-powered evaluation of your answers',
                },
                {
                  icon: '✓',
                  text: 'Personalized feedback and improvement areas',
                },
                {
                  icon: '✓',
                  text: 'Performance report and readiness score',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm text-gray-300 sm:text-base"
                >
                  <span className="shrink-0 text-blue-400 font-bold">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
