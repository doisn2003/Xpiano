import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-light dark:bg-surface-dark py-8 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          © 2026 Xpiano. Power by Sake team!
        </p>
      </div>
    </footer>
  );
};
