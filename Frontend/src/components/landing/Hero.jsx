import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { ChevronRight, ArrowDown, Search, FileText, Tag } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

// Hero animation variants
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const scaleIn = {
  hidden:  { opacity: 0, scale: 0.88, y: 24 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.8, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Floating note card data
const floatingNotes = [
  { title: 'Project Ideas',    snippet: 'Landing page, dashboard redesign...', color: '#4f6ef7', x: '-left-4 lg:-left-8', y: 'top-8',  delay: 0 },
  { title: 'Meeting Notes',    snippet: 'Q4 planning session recap...',         color: '#a78bfa', x: '-right-4 lg:-right-8', y: 'top-20', delay: 0.2 },
  { title: 'Quick Thought',    snippet: 'Research new API patterns...',          color: '#34d399', x: '-left-4 lg:-left-6', y: 'bottom-12', delay: 0.15 },
];

function ProductMockup() {
  return (
    <div className="bg-snap-card rounded-2xl border border-snap-border shadow-2xl overflow-hidden">
      {/* Mockup titlebar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-snap-border bg-snap-surface">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-snap-bg rounded-md px-3 py-1 text-xs text-gray-500">
            <Search className="w-3 h-3" />
            <span>snapnote.app</span>
          </div>
        </div>
      </div>
      {/* Mockup body */}
      <div className="flex h-64 sm:h-72">
        {/* Sidebar */}
        <div className="w-44 border-r border-snap-border bg-snap-surface p-3 flex flex-col gap-1 hidden sm:flex">
          {['All Notes', 'Recent', 'Favorites', 'Archive'].map((item, i) => (
            <div
              key={item}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${i === 0 ? 'bg-snap-accent/15 text-snap-accent' : 'text-gray-500'}`}
            >
              <FileText className="w-3 h-3 flex-shrink-0" />
              {item}
            </div>
          ))}
          <div className="mt-3 text-xs text-gray-600 px-2 font-medium">TAGS</div>
          {['work', 'personal', 'ideas'].map((tag) => (
            <div key={tag} className="flex items-center gap-2 px-2 py-1 text-xs text-gray-600">
              <Tag className="w-3 h-3" /> {tag}
            </div>
          ))}
        </div>
        {/* Note list */}
        <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
          {[
            { title: 'Project Architecture',  preview: 'React + Express + MongoDB...', time: '2h ago',  active: true },
            { title: 'Authentication Notes',   preview: 'JWT + secure sessions...',     time: '1d ago',  active: false },
            { title: 'API Design Patterns',    preview: 'RESTful conventions...',       time: '3d ago',  active: false },
            { title: 'Database Schema',        preview: 'Mongoose models for...',       time: '1w ago',  active: false },
          ].map((note) => (
            <div
              key={note.title}
              className={`p-2.5 rounded-lg border text-left ${
                note.active
                  ? 'bg-snap-accent/10 border-snap-accent/30'
                  : 'bg-snap-surface border-snap-border'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-white truncate">{note.title}</span>
                <span className="text-xs text-gray-600 ml-2 flex-shrink-0">{note.time}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{note.preview}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { user } = useContext(AuthContext);
  const scrollToFeatures = () => {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-snap-bg" />
      <div className="absolute inset-0 bg-grid-dark bg-grid opacity-100" />
      <div className="absolute inset-0 bg-radial-glow" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto w-full"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-snap-accent/10 border border-snap-accent/20 rounded-full px-4 py-1.5 text-sm text-snap-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-snap-accent animate-pulse-slow" />
            Now in beta — free to use
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center text-white leading-[1.08] tracking-tight mb-6 max-w-4xl mx-auto"
        >
          Your thoughts.{' '}
          <span className="text-gradient-accent">Organized</span>{' '}
          beautifully.
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="text-lg sm:text-xl text-white-muted text-center max-w-xl mx-auto mb-8 leading-relaxed"
        >
          Capture ideas, organize knowledge, and find exactly what you need with SnapNote.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            to={user ? '/dashboard' : '/register'}
            className="flex items-center gap-2 bg-snap-accent hover:bg-snap-accent-hover text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-snap-accent/20"
          >
            Start Writing
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={scrollToFeatures}
            className="flex items-center gap-2 text-white-muted hover:text-white border border-snap-border hover:border-snap-subtle px-7 py-3.5 rounded-xl transition-all text-sm"
          >
            Explore Features
          </button>
        </motion.div>

        {/* Product preview */}
        <motion.div
          variants={scaleIn}
          className="relative max-w-3xl mx-auto"
        >
          {/* Floating cards */}
          {floatingNotes.map((note, i) => (
            <motion.div
              key={i}
              className={`absolute z-20 ${note.x} ${note.y} hidden lg:block`}
              animate={{ y: [0, i % 2 === 0 ? -10 : -7, 0] }}
              transition={{ duration: i % 2 === 0 ? 5 : 4, repeat: Infinity, ease: 'easeInOut', delay: note.delay }}
            >
              <div
                className="bg-snap-card border rounded-xl p-3 shadow-xl w-44"
                style={{ borderColor: note.color + '30' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: note.color }} />
                  <span className="text-xs font-semibold text-white">{note.title}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{note.snippet}</p>
              </div>
            </motion.div>
          ))}

          {/* Glow behind mockup */}
          <div className="absolute -inset-8 bg-snap-accent/5 rounded-3xl blur-3xl" />
          <ProductMockup />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 hover:text-white-muted transition flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        aria-label="Scroll to features"
      >
        <span className="text-xs tracking-widest uppercase">Explore</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </section>
  );
}
