import { motion } from 'framer-motion';
import { Search, Shield, Smartphone, FolderOpen, Zap, Lock } from 'lucide-react';
import { StaggerContainer, StaggerItem, FadeUp } from './ScrollAnimations';

const features = [
  {
    icon: Search,
    title: 'Instant Search',
    desc: 'Find any note in milliseconds. Search across titles and content with real-time filtering.',
    color: '#4f6ef7',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    desc: 'JWT-protected routes, bcrypt password hashing, and server-side authorization on every request.',
    color: '#a78bfa',
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    desc: 'Fully responsive from 320px to 4K. Write and manage notes on any device, any screen.',
    color: '#34d399',
  },
  {
    icon: FolderOpen,
    title: 'Smart Organization',
    desc: 'Keep ideas structured with an intuitive create, edit, and delete workflow.',
    color: '#f59e0b',
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    desc: 'Built on Vite and Express. The UI feels instant — no unnecessary loading or delays.',
    color: '#f97316',
  },
  {
    icon: Lock,
    title: 'Private by Default',
    desc: 'Every note is tied to your account. No one else can read, edit, or delete your data.',
    color: '#ec4899',
  },
];

function FeatureCard({ feature }) {
  const Icon = feature.icon;
  return (
    <motion.div
      className="group relative bg-snap-card border border-snap-border rounded-2xl p-6 overflow-hidden cursor-default"
      whileHover={{ y: -4, borderColor: feature.color + '40' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}08, transparent 70%)` }}
      />

      <div
        className="inline-flex p-2.5 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: feature.color + '15' }}
      >
        <Icon className="w-5 h-5" style={{ color: feature.color }} />
      </div>

      <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-white-muted leading-relaxed">{feature.desc}</p>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-sm text-snap-accent uppercase tracking-widest font-medium mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Everything you need to stay organized
          </h2>
          <p className="text-white-muted max-w-lg mx-auto text-base">
            SnapNote is built around your workflow — fast, private, and always accessible.
          </p>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.08}>
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <FeatureCard feature={feature} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
