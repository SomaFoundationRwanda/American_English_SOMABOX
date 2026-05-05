"use client"
import {
  User,
  BarChart3,
  Library
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from '@/context/LanguageContext';
import Typography from "../ui/Typography";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from 'next/navigation';

export default function SomaboxNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname === '/setup' || pathname === '/') return null;

  const navItems = [
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      icon: BarChart3,
      location: "/dashboard"
    },
    {
      id: "library",
      label: t("nav.library"),
      icon: Library,
      location: "/library"
    },
    {
      id: "account2",
      label: t("nav.account"),
      icon: User,
      location: "/manage/auth"
    },
  ];

  const navItemsSmall = [
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      icon: BarChart3,
      location: "/dashboard"
    },
    {
      id: "library",
      label: t("nav.library"),
      icon: Library,
      location: "/library"
    },
  ];

  return (
    <section>
      {/* the navigation for computers */}
      <nav className="w-fit max-w-22 fixed hidden bg-accent-dark min-h-screen md:flex flex-col items-center py-6">
        {/* Strategic Partners Logos */}
        <Link href="/" className="mb-4 flex flex-col items-center gap-4 px-2 hover:opacity-80 transition-opacity">
          <div className="bg-white/10 rounded-xl p-2 flex flex-col items-center gap-3">
            <Image width={60} height={60} className="min-w-[60px] object-contain" src="/images/SFR/Soma-Foundation-logo.png" alt="Soma Foundation" />
            <div className="w-full h-px bg-white/10" />
            <Image width={50} height={50} className="min-w-[50px] object-contain" src="/images/US/RELO-LOGO-Color-01-1131x800.png" alt="RELO Logo" />
            <Image width={50} height={50} className="min-w-[50px] object-contain" src="/images/US/logo-igire.png" alt="Igire Logo" />
            <Image width={50} height={50} className="min-w-[50px] object-contain" src="/images/US/logo-US-Embassy.png" alt="US Embassy Logo" />
          </div>
          <Typography color="white" size="xs" weight="bold" className="opacity-40 uppercase tracking-widest text-[8px] text-center">
            Strategic Partners
          </Typography>
        </Link>

        {/* Navigation Items */}
        <div className="flex flex-col mt-3 flex-1 w-full">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.location;
            return (
              <Link key={item.id} href={item.location}>
                <div
                  className={`flex rounded-md flex-col items-center justify-center gap-2 cursor-pointer group transition-all duration-200 aspect-square ${isActive
                    ? "text-white bg-white/20"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <IconComponent className="w-6 h-6" />
                  <Typography color={`white`} size="sm" weight={`bold`}>
                    {item.label}
                  </Typography>
                </div>
              </Link>
            );
          })}
        </div>
        <Link href="/" className="w-full hover:opacity-80 transition-opacity">
          <img className="w-full" src="/somabox-logo-1.png" alt="this is the logo" />
        </Link>
      </nav>

      {/* the navigation for small screens */}
      <nav className="fixed md:hidden z-[1000] bottom-0 w-[100%] flex items-center justify-center pb-[safe-area-inset-bottom]">
        <div className="flex justify-evenly h-[6rem] items-center bg-accent-dark gap-6 flex-1">
          {navItemsSmall.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.location;
            return (
              <Link key={item.id} href={item.location}>
                <div
                  className={`flex flex-col items-center cursor-pointer group transition-all duration-200 ${isActive
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                    }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${isActive
                    ? "bg-white/20"
                    : "group-hover:bg-white/10"
                    }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-center font-medium leading-tight max-w-[60px]">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </section>
  );
}
