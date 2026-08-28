import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { FadeUp } from './ScrollAnimations';

const faqs = [
  {
    q: 'What is SnapNote?',
    a: 'SnapNote is a modern note-taking application that lets you capture ideas, organize your thoughts, and find notes instantly. It\'s built with React, Node.js, Express, and MongoDB.',
  },
  {
    q: 'Is SnapNote free?',
    a: 'SnapNote is currently free to use during the beta period. You can register an account and start writing right away — no credit card required.',
  },
  {
    q: 'Can I access my notes on mobile?',
    a: 'Yes. SnapNote is fully responsive and works on phones, tablets, laptops, and desktops. The layout adapts to any screen size.',
  },
  {
    q: 'Are my notes private?',
    a: 'Yes. Your notes are protected by JWT authentication and server-side authorization. No other user can access, edit, or delete your notes. Your data is yours alone.',
  },
  {
    q: 'Can I search my notes?',
    a: 'Yes. SnapNote includes real-time search that filters across both note titles and content as you type, so you can find what you\'re looking for instantly.',
  },
  {
    q: 'Do my notes persist between sessions?',
    a: 'Yes. All notes are saved to MongoDB. As long as you\'re logged in, your notes are available whenever you return — from any device.',
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-snap-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-snap-surface transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-white">{item.q}</span>
        <div className="flex-shrink-0 p-1 rounded-md bg-snap-surface">
          {isOpen
            ? <Minus className="w-4 h-4 text-snap-accent" />
            : <Plus  className="w-4 h-4 text-white-muted" />
          }
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="px-5 pb-4 text-sm text-white-muted leading-relaxed border-t border-snap-border pt-4">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <FadeUp className="text-center mb-12">
          <p className="text-sm text-snap-accent uppercase tracking-widest font-medium mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Common questions
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="flex flex-col gap-3" role="list">
            {faqs.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
