import { FadeUp, FadeLeft, FadeRight } from './ScrollAnimations';
import { PenLine, FolderOpen, Search } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: PenLine,
    title: 'Capture',
    desc: 'Write down your ideas the moment they come to you. No formatting required — just start typing.',
    color: '#4f6ef7',
    dir: 'left',
  },
  {
    number: '02',
    icon: FolderOpen,
    title: 'Organize',
    desc: 'Edit your notes, refine your thoughts, and keep your knowledge structured and up to date.',
    color: '#a78bfa',
    dir: 'up',
  },
  {
    number: '03',
    icon: Search,
    title: 'Find',
    desc: 'Quickly retrieve exactly what you need with real-time search across all your notes.',
    color: '#34d399',
    dir: 'right',
  },
];

const AnimWrapper = ({ dir, children, delay }) => {
  if (dir === 'left')  return <FadeLeft  delay={delay}>{children}</FadeLeft>;
  if (dir === 'right') return <FadeRight delay={delay}>{children}</FadeRight>;
  return <FadeUp delay={delay}>{children}</FadeUp>;
};

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-snap-surface/30 border-y border-snap-border">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-sm text-snap-accent uppercase tracking-widest font-medium mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Three steps to clarity
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-snap-border to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <AnimWrapper key={step.number} dir={step.dir} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center p-8 bg-snap-card border border-snap-border rounded-2xl hover:border-snap-subtle transition-colors">
                  {/* Step number */}
                  <div
                    className="text-6xl font-black mb-4 select-none"
                    style={{ color: step.color + '18' }}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className="inline-flex p-3 rounded-2xl mb-4"
                    style={{ background: step.color + '15' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-white-muted leading-relaxed">{step.desc}</p>
                </div>
              </AnimWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
