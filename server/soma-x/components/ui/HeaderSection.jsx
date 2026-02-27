'use client';

import { Search, Globe, ChevronDown, Hamburger, MenuIcon, User, ChevronRight } from 'lucide-react';
import { Close, OpenInNew, Person2 } from '@mui/icons-material';
import { Menu } from '@mui/material';
import { useContext, useState } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { useLanguage } from '@/context/LanguageContext';
import DataContext from '@/context/DataContext';
import Typography from './Typography';
import { Select } from './select';
import Input from './input';
import { Button } from './button';

const HeaderSection = ({
  title,
  subtitle,
  buttonText = "Logout",
  breadcrumbs,
  onBreadcrumbClick
}) => {
  const { isSidebarOpen, handleSideBar } = useSidebar(false);
  const { t, lang, setLang } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { logout } = useContext(DataContext)

  const { authenticated } = useContext(DataContext)

  const languages = ["en", "fr", "rw", "sw", "es"];

  return (
    <div>
      {/* Main header section */}
      <header className={`relative min-h-[12rem] md:h-[15rem] py-6 md:py-[2%] flex flex-col justify-center text-white px-4 md:px-8 mt-2 rounded-2xl mb-4 shadow-lg overflow-hidden`}>
        {/* Background Texture with Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url('/images/US/regional English languages.jpg')` }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-accent-dark/95 via-accent-dark/80 to-transparent backdrop-blur-[1px]" />

        {/* Decorative background element for premium feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none z-[2]" />

        {/* Breadcrumbs section */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="relative z-10 text-white/80 rounded-t-xl flex items-center mb-4 md:mb-2 overflow-x-auto scrollbar-hide pb-1">
            <nav className="flex items-center whitespace-nowrap">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center shrink-0">
                  <Typography variant="titleInv" className="text-sm md:text-base">
                    <Button
                      variant="ghost"
                      onClick={() => onBreadcrumbClick?.(crumb.path)}
                      className="cursor-pointer hover:text-white p-0 h-auto font-bold underline-offset-4 hover:underline transition-all ring-0 focus:ring-0 opacity-90 hover:opacity-100"
                    >
                      {crumb.name}
                    </Button>
                  </Typography>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="mx-1 md:mx-2 w-4 h-4 text-white/40 shrink-0" />
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
          {/* Left section: Title, subtitle, button */}
          <div className="flex-1">
            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="h2" color="white" className="text-xl md:text-4xl leading-tight">
                  {title}
                </Typography>
                <Typography variant="caption" color="white" className="opacity-80 mt-1 max-w-2xl block text-xs md:text-sm">
                  {subtitle}
                </Typography>
              </div>

              {authenticated && (
                <Button
                  onClick={logout}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/10 w-full md:w-fit px-8 h-12 gap-2 rounded-xl transition-all shadow-md group"
                >
                  <Typography variant="body" color="white" weight="bold">
                    Logout
                  </Typography>
                  <OpenInNew className="text-white w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>

          {/* Right section: Language selector */}
          <div className="shrink-0 w-full md:w-fit">
            <Input
              prefix={<Globe className="w-4 h-4 mr-2" />}
              value={lang}
              id="language-select"
              variant="select"
              options={languages.map((l) => ({ value: l, label: l.toUpperCase() }))}
              onChange={(value) => setLang(value)}
              className="bg-white/90 backdrop-blur-md text-black border-none shadow-xl h-12 w-full md:min-w-[120px] rounded-xl font-bold"
            />
          </div>
        </div>
      </header>

    </div>
  );
};

export default HeaderSection;
