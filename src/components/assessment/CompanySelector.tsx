'use client';

type CompanyOption = {
  name: string;
  focus: string;
  short: string;
};

interface CompanySelectorProps {
  selectedCompany: string;
  onChange: (company: string) => void;
  error?: string;
  disabled?: boolean;
}

const companies: CompanyOption[] = [
  {
    name: 'Google',
    focus: 'Product systems & scale',
    short: 'G',
  },
  {
    name: 'Amazon',
    focus: 'Ownership & delivery',
    short: 'A',
  },
  {
    name: 'Meta',
    focus: 'Product engineering',
    short: 'M',
  },
  {
    name: 'Microsoft',
    focus: 'Platform depth',
    short: 'MS',
  },
  {
    name: 'Stripe',
    focus: 'API design & rigor',
    short: 'S',
  },
  {
    name: 'Netflix',
    focus: 'Systems thinking',
    short: 'N',
  },
];

export default function CompanySelector({
  selectedCompany,
  onChange,
  error,
  disabled = false,
}: CompanySelectorProps) {
  return (
    <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40 p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/80">
            Company Target
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">
            Choose a company to mirror
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            The quiz preview is aligned to the selected company profile and expectations.
          </p>
        </div>

        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200">
          {selectedCompany}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {companies.map((company) => {
          const active = company.name === selectedCompany;

          return (
            <button
              key={company.name}
              type="button"
              onClick={() => onChange(company.name)}
              disabled={disabled}
              aria-pressed={active}
              className={[
                'rounded-xl border p-4 text-left transition-all duration-300',
                active
                  ? 'border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                  : 'border-gray-700/50 bg-white/5 hover:border-gray-600/70 hover:bg-white/10',
                disabled ? 'cursor-not-allowed opacity-75' : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-white">
                  {company.short}
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    {company.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {company.focus}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
