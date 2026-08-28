import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, LogIn } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { BlurReveal } from './ScrollAnimations';

export default function FinalCTA() {
  const { user } = useContext(AuthContext);
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-snap-accent/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-snap-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative text-center">
        <BlurReveal>
          <div className="bg-snap-card border border-snap-border rounded-3xl p-10 sm:p-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Ready to capture your{' '}
              <span className="text-gradient-accent">next idea?</span>
            </h2>
            <p className="text-white-muted text-base sm:text-lg max-w-md mx-auto mb-8">
              Start organizing your thoughts with SnapNote — fast, private, and always available.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={user ? '/dashboard' : '/register'}
                  className="flex items-center gap-2 bg-snap-accent hover:bg-snap-accent-hover text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm shadow-lg shadow-snap-accent/25"
                >
                  Start Writing
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {!user && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-white-muted hover:text-white border border-snap-border hover:border-snap-subtle px-8 py-3.5 rounded-xl transition-all text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </BlurReveal>
      </div>
    </section>
  );
}
