import AssessmentWizard from '@/components/assessment/AssessmentWizard';

const featureCards = [
  {
    title: 'Resume or Topic',
    description:
      'Begin from a resume upload or a topic-first entry point, just like the rest of INTERVO’s guided flows.',
  },
  {
    title: 'Company Standard',
    description:
      'Preview company-specific assessment behavior with a polished, production-style interface.',
  },
  {
    title: 'Navigation Ready',
    description:
      'The assessment experience connects cleanly to attempt, result, and history previews.',
  },
];

export default function AssessmentPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="w-full animate-fadeIn">
          <div className="mb-8 text-center sm:mb-10">
            <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
              AI Readiness Test
            </div>

            <h1 className="mt-5 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 sm:text-4xl lg:text-5xl">
              Assessment Landing
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
              Preview a company-style assessment experience that fits naturally into INTERVO’s existing visual system.
            </p>
          </div>

          <AssessmentWizard />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featureCards.map((card, index) => (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-700/50 bg-black/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                  {index + 1}
                </div>
                <h2 className="mt-4 text-lg font-bold text-white">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
