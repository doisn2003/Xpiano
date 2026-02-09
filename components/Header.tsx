import React from 'react';
import { Search, Moon, Sun, Menu, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
              <img 
                src="/logo.jpg" 
                alt="Xpiano Logo" 
                className="w-full h-full object-cover"
              />
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

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:inline">
                      {user.full_name}
                    </span>
                    {user.role === 'admin' && (
                      <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full hidden md:inline">
                        Admin
                      </span>
                    )}
                    {user.role === 'teacher' && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full hidden md:inline">
                        Teacher
                      </span>
                    )}
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => navigate('/profile')}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Tài khoản của tôi
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => navigate('/admin')}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Dashboard
                        </button>
                      )}
                      <hr className="my-2 border-slate-200 dark:border-slate-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-primary hover:bg-cyan-800 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all transform active:scale-95"
              >
                Login
              </button>
            )}

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
