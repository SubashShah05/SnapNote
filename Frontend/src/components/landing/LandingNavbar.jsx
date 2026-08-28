import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { PenLine, Menu, X, ChevronRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'FAQ',      href: '#faq' },
];

export default function LandingNavbar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = () => {
    navigate(user ? '/dashboard' : '/register');
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background: scrolled ? 'rgba(10,10,15,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(30,30,46,0.8)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" aria-label="SnapNote home">
              <div className="p-1.5 bg-snap-accent rounded-lg transition-transform group-hover:scale-110">
                <PenLine className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SnapNote</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="px-4 py-2 text-sm text-white-muted hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="text-sm text-white-muted hover:text-white transition px-4 py-2"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-sm text-white-muted hover:text-white transition px-4 py-2"
                >
                  Log in
                </Link>
              )}
              <button
                onClick={handleCTA}
                className="flex items-center gap-1.5 bg-snap-accent hover:bg-snap-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
              >
                {user ? 'Go to Notes' : 'Start Writing'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white-muted hover:text-white hover:bg-white/5 rounded-lg transition"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="fixed top-16 left-0 right-0 z-40 bg-snap-bg/95 backdrop-blur-xl border-b border-snap-border md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition text-sm"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-snap-border mt-2 pt-3 flex flex-col gap-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-gray-300 hover:text-white text-sm"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-gray-300 hover:text-white text-sm"
                  >
                    Log in
                  </Link>
                )}
                <button
                  onClick={handleCTA}
                  className="mx-4 bg-snap-accent text-white text-sm font-medium py-2.5 rounded-lg text-center transition hover:bg-snap-accent-hover"
                >
                  {user ? 'Go to Notes' : 'Start Writing'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
