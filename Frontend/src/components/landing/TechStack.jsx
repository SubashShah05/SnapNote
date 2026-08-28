import { FadeUp } from './ScrollAnimations';

const technologies = [
  { name: 'React',    color: '#61DAFB', desc: 'Frontend UI' },
  { name: 'Node.js',  color: '#68A063', desc: 'Runtime' },
  { name: 'Express',  color: '#ffffff', desc: 'API Server' },
  { name: 'MongoDB',  color: '#47A248', desc: 'Database' },
  { name: 'Mongoose', color: '#880000', desc: 'ODM' },
  { name: 'JWT',      color: '#d63aff', desc: 'Auth' },
  { name: 'Vite',     color: '#646CFF', desc: 'Build Tool' },
  { name: 'Tailwind', color: '#06B6D4', desc: 'Styling' },
];

// Duplicate for seamless marquee loop
const allTech = [...technologies, ...technologies];

export default function TechStack() {
  return (
    <section className="py-20 border-y border-snap-border overflow-hidden bg-snap-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <p className="text-center text-sm text-gray-500 uppercase tracking-widest mb-10 font-medium">
            Built with modern technology
          </p>
        </FadeUp>
      </div>

      {/* Marquee strip */}
      <div className="relative">
        {/* Gradient fades on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-snap-bg to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-snap-bg to-transparent pointer-events-none" />

        <div
          className="flex gap-4 animate-marquee"
          style={{ width: 'max-content' }}
        >
          {allTech.map((tech, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-snap-card border border-snap-border rounded-xl px-5 py-3 flex-shrink-0 select-none"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tech.color }} />
              <div>
                <div className="text-sm font-semibold text-white">{tech.name}</div>
                <div className="text-xs text-gray-500">{tech.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
