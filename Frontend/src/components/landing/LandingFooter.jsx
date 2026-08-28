import { Link } from 'react-router-dom';
import { PenLine, Github } from 'lucide-react';

const links = {
  Product:   [{ label: 'Features', href: '#features' }, { label: 'Security', href: '#security' }, { label: 'FAQ', href: '#faq' }],
  Account:   [{ label: 'Sign Up', to: '/register' }, { label: 'Log In', to: '/login' }],
  Resources: [{ label: 'GitHub', href: 'https://github.com', external: true }],
};

export default function LandingFooter() {
  const scrollTo = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-snap-border bg-snap-surface/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-snap-accent rounded-lg">
                <PenLine className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">SnapNote</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
              Capture ideas, organize knowledge, and find exactly what you need.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-white-muted uppercase tracking-widest mb-4">{category}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition"
                      >
                        <Github className="w-3.5 h-3.5" />
                        {item.label}
                      </a>
                    ) : item.to ? (
                      <Link to={item.to} className="text-sm text-gray-500 hover:text-white transition">
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => scrollTo(item.href)}
                        className="text-sm text-gray-500 hover:text-white transition text-left"
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-snap-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} SnapNote. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with React, Node.js, Express &amp; MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}
