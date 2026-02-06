import React from 'react';
import { Search, Moon, Sun, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
              X
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">
              Xpiano
            </span>
          </a>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-300">
            {['Mua đàn', 'Mượn đàn', 'Học đàn', 'Đối tác', 'Về chúng tôi'].map((item) => (
              <a key={item} href="#" className="hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-1 lg:flex-none justify-end">
            <div className="relative hidden md:block w-64">
              <input
                type="text"
                placeholder="Tìm kiếm......"
                className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-primary cursor-pointer hover:text-cyan-600" />
            </div>
            
            <button className="md:hidden text-slate-600 dark:text-slate-300">
              <Search className="w-6 h-6" />
            </button>

            <button className="bg-primary hover:bg-cyan-800 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all transform active:scale-95">
              Login
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className="lg:hidden p-2 text-slate-600 dark:text-slate-300">
                <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
