import { BlurReveal, FadeUp } from './ScrollAnimations';
import { Sparkles, Clock } from 'lucide-react';

export default function AISection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <FadeUp className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Coming Next
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            AI-powered productivity
          </h2>
          <p className="text-white-muted max-w-lg mx-auto text-base">
            Intelligent note summarization, smart search, and AI-assisted writing are actively in development.
          </p>
        </FadeUp>

        <BlurReveal delay={0.2}>
          <div className="border border-purple-500/15 rounded-2xl bg-snap-card p-8 sm:p-10 text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-9 h-9 text-purple-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <Clock className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                { title: 'Smart Summarize',  desc: 'Condense long notes into key points automatically.',      status: 'Planned' },
                { title: 'AI Search',         desc: 'Ask questions about your notes in natural language.',      status: 'Planned' },
                { title: 'Writing Assistant', desc: 'Get suggestions to expand and improve your notes.',        status: 'Planned' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-snap-surface rounded-xl p-4 border border-snap-border opacity-70"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{item.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </BlurReveal>
      </div>
    </section>
  );
}
