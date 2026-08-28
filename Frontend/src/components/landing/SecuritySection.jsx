import { FadeUp, StaggerContainer, StaggerItem } from './ScrollAnimations';
import { Lock, Shield, Server, UserCheck, KeyRound, Eye } from 'lucide-react';

const securityItems = [
  {
    icon: KeyRound,
    title: 'JWT Authentication',
    desc: 'Secure 30-day tokens signed with a private secret. Every authenticated request is verified server-side.',
    color: '#4f6ef7',
  },
  {
    icon: Lock,
    title: 'Password Hashing',
    desc: 'Passwords are hashed using bcrypt with a salt factor of 10 before storage. Plain-text passwords are never saved.',
    color: '#a78bfa',
  },
  {
    icon: Server,
    title: 'Server-Side Authorization',
    desc: 'Every note operation verifies the requesting user owns the resource. There are no frontend-only guards.',
    color: '#34d399',
  },
  {
    icon: UserCheck,
    title: 'Protected Routes',
    desc: 'Unauthenticated requests to protected API endpoints return 401 Unauthorized — access is denied server-side.',
    color: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Resource Isolation',
    desc: 'Notes are scoped to their owner. User A cannot read, edit, or delete notes belonging to User B.',
    color: '#f97316',
  },
  {
    icon: Eye,
    title: 'No Secret Exposure',
    desc: 'API keys, JWT secrets, and database credentials are managed through environment variables, not code.',
    color: '#ec4899',
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 bg-snap-surface/30 border-y border-snap-border">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-sm text-green-400 mb-6">
            <Shield className="w-3.5 h-3.5" />
            Security
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Designed with security in mind
          </h2>
          <p className="text-white-muted max-w-xl mx-auto text-base">
            SnapNote applies security best practices at every layer — from authentication to database queries.
            We don't claim perfection, but we take it seriously.
          </p>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.07}>
          {securityItems.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title}>
                <div className="flex items-start gap-4 bg-snap-card border border-snap-border rounded-2xl p-5 h-full">
                  <div
                    className="flex-shrink-0 p-2.5 rounded-xl mt-0.5"
                    style={{ background: item.color + '15' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
                    <p className="text-xs text-white-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
