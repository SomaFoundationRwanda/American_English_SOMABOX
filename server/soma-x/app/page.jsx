"use client"
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, Lock, Shield, Zap, BookOpen, Mic, MonitorPlay } from 'lucide-react';
import Typography from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

export default function LandingPage() {
    const contentSources = [
        "American English Website", "VOA Learning English", "Trace Effects",
        "American English MOOCs", "English Teaching Forum", "Teacher’s Corner",
        "Webinars for Teachers", "Activated Resources", "Picture This",
        "Music & Rhythm", "Board Games", "Classroom Posters",
        "Professional Development", "English for STEM", "Cultural Resources"
    ];

    // Grouping into 5 rows of 3
    const groupedSources = [];
    for (let i = 0; i < contentSources.length; i += 3) {
        groupedSources.push(contentSources.slice(i, i + 3));
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <OnboardingModal />
            {/* Top Bar - Institutional Style */}
            <div className="bg-[#00274c] text-white py-2 px-8 flex justify-between items-center text-[11px] font-bold tracking-widest uppercase border-b border-white/10">
                <div className="flex gap-4">
                    <span>United States Department of State</span>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="opacity-60">ECA</span>
                    <span className="opacity-60">Alumni</span>
                    <span className="text-[#ffcc33]">American English</span>
                </div>
            </div>

            {/* Header Section */}
            <header className="py-4 px-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-50">
                <div className="flex items-center gap-6">
                    <img src="/images/SFR/Soma-Foundation-logo.png" alt="Soma Logo" className="h-14 w-auto object-contain" />
                    <div className="h-10 w-[1px] bg-slate-200 mx-1" />
                    <div className="flex items-center gap-4">
                        <img src="/images/US/logo-US-Embassy.png" alt="US Embassy" className="h-12 w-auto object-contain" />
                        <img src="/images/US/logo-igire.png" alt="Igire" className="h-10 w-auto object-contain" />
                        <img src="/images/US/RELO-LOGO-Color-01-1131x800.png" alt="RELO" className="h-10 w-auto object-contain" />
                    </div>
                </div>
                <div className="hidden lg:flex gap-8 items-center">
                    <Link href="#features" className="text-[13px] font-bold text-[#00274c] hover:text-[#bf1e2e] transition-colors uppercase tracking-wider">Features</Link>
                    <Link href="#sources" className="text-[13px] font-bold text-[#00274c] hover:text-[#bf1e2e] transition-colors uppercase tracking-wider">Resources</Link>
                    <Link href="/dashboard">
                        <Button className="bg-[#ffcc33] hover:bg-[#e6b82e] text-[#00274c] font-black uppercase text-xs tracking-widest px-8 py-6 rounded-none shadow-lg border-b-4 border-[#ccaa22]">
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[#00274c] text-white py-24 px-8 min-h-[75vh] flex items-center">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <img src="/images/US/regional English languages.jpg" alt="Background pattern" className="w-full h-full object-cover grayscale mix-blend-overlay" />
                </div>

                <div className="max-w-4xl relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <img src="/images/US/RELO-LOGO-Color-01-1131x800.png" alt="RELO Logo" className="h-12 w-auto brightness-0 invert opacity-80" />
                        <div className="h-8 w-[1px] bg-white/20" />
                        <span className="text-[#ffcc33] font-black uppercase tracking-[0.3em] text-xs">Offline Learning Experience</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.85] tracking-tighter">
                        AMERICAN <br />
                        <span className="text-[#ffcc33]">ENGLISH</span> <br />
                        <span className="text-white/40 italic">Resource Hub</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mb-12 font-medium leading-[1.6]">
                        World-class educational materials from the United States Department of State, delivered completely offline to support teachers and learners in any environment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <Link href="/dashboard">
                            <Button className="bg-[#ffcc33] hover:bg-[#e6b82e] text-[#00274c] font-black uppercase text-md tracking-[0.2em] py-10 px-16 rounded-none shadow-2xl transition-all hover:scale-105 active:scale-95 group">
                                Go to Dashboard
                                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Strategic Partners Banner */}
            <div className="bg-white py-16 px-8 border-b border-slate-100 flex flex-col items-center">
                <Typography weight="bold" className="text-slate-400 uppercase tracking-[0.4em] text-[10px] mb-12">A Collaboration Between</Typography>
                <div className="max-w-6xl w-full flex flex-wrap justify-center gap-16 items-center grayscale hover:grayscale-0 transition-all duration-700 opacity-70 hover:opacity-100">
                    <div className="flex flex-col items-center gap-3">
                        <img src="/images/US/logo-US-Embassy.png" alt="U.S. Embassy" className="h-16 w-auto" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">U.S. Embassy</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <img src="/images/US/logo-igire.png" alt="Igire" className="h-16 w-auto" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Igire</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <img src="/images/US/RELO-LOGO-Color-01-1131x800.png" alt="RELO" className="h-14 w-auto" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RELO</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <img src="/images/SFR/Soma-Foundation-logo.png" alt="Soma Foundation" className="h-16 w-auto" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Soma Foundation</span>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-20">
                    <div>
                        <Typography variant="h2" className="text-[#00274c] text-5xl font-black mb-8 leading-tight tracking-tighter">
                            Bridging the Digital <br />
                            <span className="text-slate-300">Divide.</span>
                        </Typography>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                            SomaBox provides high-quality American English materials to classrooms, libraries, and communities where internet connectivity is a barrier to learning.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-6 items-start">
                                <div className="bg-[#00274c] text-[#ffcc33] p-4 rounded-2xl shadow-xl">
                                    <Zap size={28} />
                                </div>
                                <div>
                                    <Typography weight="black" className="text-[#00274c] text-xl uppercase tracking-wider mb-2">100% Offline</Typography>
                                    <Typography className="text-slate-500 leading-relaxed">Access everything without an internet connection. No data costs, no lag.</Typography>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="bg-[#00274c] text-[#ffcc33] p-4 rounded-2xl shadow-xl">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <Typography weight="black" className="text-[#00274c] text-xl uppercase tracking-wider mb-2">Official Content</Typography>
                                    <Typography className="text-slate-500 leading-relaxed">Curated and approved by the Regional English Language Office specialists.</Typography>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-12 border-2 border-slate-100 relative group">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#ffcc33] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <Typography variant="h3" className="text-[#00274c] mb-12 font-black uppercase tracking-tighter text-3xl italic">Interactive Learning</Typography>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { icon: <BookOpen />, label: "Academic Resources", desc: "Teacher Guides & Student Books" },
                                { icon: <Mic />, label: "Audio Materials", desc: "Podcasts & Interactive Listening" },
                                { icon: <MonitorPlay />, label: "Video Content", desc: "Visual Learning & Demonstrations" }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-8 shadow-md flex items-center gap-8 border-l-8 border-[#00274c] hover:border-[#ffcc33] hover:-translate-y-1 transition-all cursor-default">
                                    <div className="text-[#00274c]">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <Typography weight="black" className="text-[#00274c] uppercase tracking-widest">{item.label}</Typography>
                                        <Typography size="xs" color="muted" className="mt-1 font-bold">{item.desc}</Typography>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/dashboard" className="mt-12 block">
                            <Button variant="outline" className="w-full py-10 border-4 border-[#00274c] text-[#00274c] h-auto font-black uppercase tracking-widest hover:bg-[#00274c] hover:text-white transition-all text-lg">
                                Open Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sources Grid Section */}
            <section id="sources" className="bg-[#00274c] text-white py-24 px-8 relative overflow-hidden">
                <img src="/images/US/regional English languages.jpg" alt="pattern" className="absolute top-0 left-0 w-full h-full object-cover opacity-5 pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-[#ffcc33] uppercase font-black tracking-[0.6em] text-xs mb-6 block">The Digital Library</span>
                        <Typography variant="h2" color="white" className="text-5xl md:text-7xl font-black tracking-tighter italic">RESOURCES <span className="text-white/20">ARCHIVE</span></Typography>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {groupedSources.map((row, rowIdx) => (rowIdx % 2 === 0 ? (
                            <div key={rowIdx} className="grid md:grid-cols-3 gap-4">
                                {row.map((source, idx) => (
                                    <div key={idx} className="bg-white/5 backdrop-blur-sm p-8 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between group">
                                        <Typography weight="bold" className="text-slate-100 text-lg uppercase tracking-wider">{source}</Typography>
                                        <ArrowRight className="text-white/20 group-hover:text-[#ffcc33] transition-colors" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div key={rowIdx} className="grid md:grid-cols-2 gap-4">
                                {row.concat([row[0]]).slice(0, 2).map((source, idx) => (
                                    <div key={idx} className="bg-[#ffcc33] p-8 flex items-center justify-between group cursor-default">
                                        <Typography weight="black" className="text-[#00274c] text-xl uppercase tracking-[0.2em]">{source}</Typography>
                                        <div className="w-10 h-1 bg-[#00274c]/20" />
                                    </div>
                                ))}
                            </div>
                        )))}
                    </div>

                    <div className="mt-20 text-center">
                        <Link href="/dashboard">
                            <Button className="bg-white text-[#00274c] hover:bg-[#ffcc33] font-black uppercase text-lg tracking-[0.3em] py-12 px-24 rounded-none shadow-2xl transition-all active:scale-95">
                                Enter Library
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#050a0f] text-white py-24 px-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between gap-20 pb-16 border-b border-white/10">
                        <div className="max-w-sm">
                            <img src="/images/SFR/Soma-Foundation-logo.png" alt="Soma Foundation" className="h-16 mb-8 brightness-0 invert" />
                            <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                                Building the infrastructure for a more equitable digital future, one offline server at a time.
                            </p>
                            <div className="flex gap-4 items-center">
                                <img src="/images/US/logo-US-Embassy.png" alt="Embassy" className="h-10 opacity-50 grayscale hover:grayscale-0 transition-all" />
                                <img src="/images/US/logo-igire.png" alt="Igire" className="h-10 opacity-50 grayscale hover:grayscale-0 transition-all" />
                                <img src="/images/US/RELO-LOGO-Color-01-1131x800.png" alt="RELO" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 gap-16">
                            <div>
                                <Typography weight="bold" className="mb-8 text-[#ffcc33] uppercase tracking-[0.4em] text-xs">Mission</Typography>
                                <ul className="space-y-4 text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                                    <li><Link href="#" className="hover:text-white transition-colors">Digital Literacy</Link></li>
                                    <li><Link href="#" className="hover:text-white transition-colors">Offline Access</Link></li>
                                    <li><Link href="#" className="hover:text-white transition-colors">Impact Reports</Link></li>
                                </ul>
                            </div>
                            <div>
                                <Typography weight="bold" className="mb-8 text-[#ffcc33] uppercase tracking-[0.4em] text-xs">Access</Typography>
                                <ul className="space-y-4 text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                                    <li><Link href="/dashboard" className="hover:text-white transition-colors">Library Portal</Link></li>
                                    <li><Link href="/manage/auth" className="hover:text-white transition-colors">Administrator</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <Typography size="xs" color="muted" className="tracking-[0.2em] font-black uppercase opacity-40">
                                Powered by SOMABOX TECHNOLOGY
                            </Typography>
                            <Typography size="xs" color="muted" className="tracking-widest">
                                A Project of Soma Foundation Rwanda
                            </Typography>
                        </div>
                        <div className="flex gap-10 text-slate-700">
                            <Globe size={24} className="hover:text-[#ffcc33] transition-colors cursor-pointer" />
                            <Zap size={24} className="hover:text-[#ffcc33] transition-colors cursor-pointer" />
                            <Shield size={24} className="hover:text-[#ffcc33] transition-colors cursor-pointer" />
                        </div>
                        <Typography size="xs" color="muted" className="font-bold opacity-30">
                            © {new Date().getFullYear()} SOMA FOUNDATION. ALL RIGHTS RESERVED.
                        </Typography>
                    </div>
                </div>
            </footer>
        </div>
    );
}
