"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Book, Bookmark, Languages, Sparkles, History, X } from 'lucide-react';
import Typography from './Typography';
import { Button } from './button';
import { Input } from './input';

const DB_NAME = 'SomaBoxDictionary_v2';
const DB_VERSION = 1;
const STORES = {
    INDEX: 'word_index',     // Cache for entries-[letter].json
    DEFINITIONS: 'synsets',    // Cache for synset definitions
    HISTORY: 'history'        // User search history
};

const LEX_FILE_MAP = {
    '00': 'adj.all', '01': 'adj.pert', '02': 'adv.all', '03': 'noun.Tops',
    '04': 'noun.act', '05': 'noun.animal', '06': 'noun.artifact', '07': 'noun.attribute',
    '08': 'noun.body', '09': 'noun.cognition', '10': 'noun.communication', '11': 'noun.event',
    '12': 'noun.feeling', '13': 'noun.food', '14': 'noun.group', '15': 'noun.location',
    '16': 'noun.motive', '17': 'noun.object', '18': 'noun.person', '19': 'noun.phenomenon',
    '20': 'noun.plant', '21': 'noun.possession', '22': 'noun.process', '23': 'noun.quantity',
    '24': 'noun.relation', '25': 'noun.shape', '26': 'noun.state', '27': 'noun.substance',
    '28': 'noun.time', '29': 'verb.body', '30': 'verb.change', '31': 'verb.cognition',
    '32': 'verb.communication', '33': 'verb.competition', '34': 'verb.consumption', '35': 'verb.contact',
    '36': 'verb.creation', '37': 'verb.emotion', '38': 'verb.motion', '39': 'verb.perception',
    '40': 'verb.possession', '41': 'verb.social', '42': 'verb.stative', '43': 'verb.weather',
    '44': 'adj.ppl'
};

export default function AmericanEnglishDictionary() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDbReady, setIsDbReady] = useState(false);
    const [history, setHistory] = useState([]);
    const [db, setDb] = useState(null);

    // Initialize IndexedDB
    useEffect(() => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            Object.values(STORES).forEach(store => {
                if (!db.objectStoreNames.contains(store)) {
                    db.createObjectStore(store);
                }
            });
        };
        request.onsuccess = (e) => {
            setDb(e.target.result);
            setIsDbReady(true);
        };

        const savedHistory = localStorage.getItem('dict_v2_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    const saveHistory = (word) => {
        if (!word) return;
        const newHistory = [word, ...history.filter(h => h !== word)].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('dict_v2_history', JSON.stringify(newHistory));
    };

    const getLexFile = (senseId) => {
        const match = senseId.match(/%(\d):(\d{2}):/);
        if (match) return LEX_FILE_MAP[match[2]];
        return null;
    };

    const fetchDefinitions = async (senses) => {
        if (!db) return [];

        const enrichedSenses = await Promise.all(senses.map(async (sense) => {
            const { id: senseId, synset: synsetId } = sense;
            const lexFile = getLexFile(senseId);
            if (!lexFile) return sense;

            // Check Cache
            const tx = db.transaction(STORES.DEFINITIONS, 'readonly');
            const cached = await new Promise(r => {
                const req = tx.objectStore(STORES.DEFINITIONS).get(synsetId);
                req.onsuccess = () => r(req.result);
            });

            if (cached) return { ...sense, ...cached };

            // Fetch File
            try {
                const res = await fetch(`/data/dictionary/${lexFile}.json`);
                const data = await res.json();
                const synsetData = data[synsetId];

                if (synsetData) {
                    const writeTx = db.transaction(STORES.DEFINITIONS, 'readwrite');
                    writeTx.objectStore(STORES.DEFINITIONS).put(synsetData, synsetId);
                    return { ...sense, ...synsetData };
                }
            } catch (e) {
                console.error(`Failed to fetch lex file ${lexFile}:`, e);
            }
            return sense;
        }));

        return enrichedSenses;
    };

    const searchWord = useCallback(async (term) => {
        if (!term || term.length < 2 || !db) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        const letter = term[0].toLowerCase();
        const indexKey = `entries-${letter}`;

        try {
            // Get Index
            let index = null;
            const tx = db.transaction(STORES.INDEX, 'readonly');
            const cachedIdx = await new Promise(r => {
                const req = tx.objectStore(STORES.INDEX).get(indexKey);
                req.onsuccess = () => r(req.result);
            });

            if (cachedIdx) {
                index = cachedIdx;
            } else {
                const res = await fetch(`/data/dictionary/${indexKey}.json`);
                index = await res.json();
                const writeTx = db.transaction(STORES.INDEX, 'readwrite');
                writeTx.objectStore(STORES.INDEX).put(index, indexKey);
            }

            // Filter matches
            const matches = Object.entries(index)
                .filter(([word]) => word.toLowerCase().startsWith(term.toLowerCase()))
                .slice(0, 10);

            const enrichedResults = await Promise.all(matches.map(async ([word, posData]) => {
                const poses = await Promise.all(Object.entries(posData).map(async ([pos, data]) => {
                    const enrichedSenses = await fetchDefinitions(data.sense || []);
                    return { pos, ...data, sense: enrichedSenses };
                }));
                return { word, poses };
            }));

            setResults(enrichedResults);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [db]);

    useEffect(() => {
        const delay = setTimeout(() => {
            searchWord(searchTerm);
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm, searchWord]);

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Search Header */}
            <div className="relative p-10 md:p-14 rounded-[3rem] border border-white shadow-2xl flex flex-col items-center text-center gap-8 overflow-hidden group min-h-[450px] justify-center">
                {/* Banner Background */}
                <div
                    className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-110"
                    style={{
                        backgroundImage: 'url("/images/dictionary_banner.jpeg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                {/* Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#00274c]/90 via-[#00274c]/60 to-[#00274c]/90 z-0" />

                <div className="bg-[#ffcc33] text-[#00274c] p-5 rounded-3xl shadow-2xl shadow-[#ffcc33]/20 mb-2 relative z-10">
                    <Book size={32} strokeWidth={2.5} />
                </div>

                <div className="space-y-4 max-w-2xl relative z-10">
                    <Typography variant="h2" className="text-white text-4xl md:text-5xl font-black tracking-tighter uppercase italic drop-shadow-2xl">
                        American English <span className="text-[#ffcc33]">Dictionary</span>
                    </Typography>
                    <Typography variant="body" className="text-white/80 text-lg font-medium">
                        Search among 150,000+ words fully offline.
                    </Typography>
                </div>

                <div className="w-full max-w-2xl relative group z-10">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="text-slate-300 group-focus-within:text-[#bf1e2e] transition-colors" size={24} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Type a word to look up..."
                        className="w-full h-20 pl-16 pr-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none text-xl font-bold placeholder:text-slate-300 focus:border-[#bf1e2e]/30 focus:bg-white transition-all shadow-inner"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-6 flex items-center text-slate-300 hover:text-slate-500"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {history.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 relative z-10">
                        <Typography size="xs" color="muted" className="w-full mb-1 font-black uppercase tracking-widest opacity-40">Recent Searches</Typography>
                        {history.map((word, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setSearchTerm(word); searchWord(word); }}
                                className="px-5 py-2 bg-slate-100/50 hover:bg-white rounded-full text-xs font-bold text-slate-500 hover:text-[#00274c] transition-all border border-transparent hover:border-slate-200"
                            >
                                {word}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Results Area */}
            <div className="space-y-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
                        <div className="w-12 h-12 border-4 border-[#00274c] border-t-transparent rounded-full animate-spin" />
                        <Typography variant="muted" className="uppercase font-black tracking-widest text-xs">Searching Dictionary Database...</Typography>
                    </div>
                ) : searchTerm && searchTerm.length >= 2 && results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white dashed-2 text-slate-400 gap-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center opacity-30">
                            <Bookmark size={48} />
                        </div>
                        <Typography variant="body" className="text-center font-bold uppercase tracking-widest text-xs opacity-60">
                            No matching words found for "{searchTerm}"
                        </Typography>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-10">
                        {results.map((item, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                                <Button
                                    variant="ghost"
                                    className="absolute top-10 right-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => saveHistory(item.word)}
                                >
                                    <Bookmark size={20} />
                                </Button>

                                <Typography variant="h2" className="text-[#00274c] text-5xl font-black tracking-tighter leading-none group-hover:text-[#bf1e2e] transition-colors mb-12">
                                    {item.word}
                                </Typography>

                                <div className="space-y-12">
                                    {item.poses.map((posBlock, pIdx) => (
                                        <div key={pIdx} className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="px-4 py-1.5 bg-[#ffcc33]/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#00274c]">
                                                    {posBlock.pos === 'n' ? 'Noun' : posBlock.pos === 'v' ? 'Verb' : posBlock.pos === 'a' ? 'Adjective' : 'Adverb'}
                                                </div>
                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>

                                            <div className="space-y-8 pl-4">
                                                {posBlock.sense.map((s, sIdx) => (
                                                    <div key={sIdx} className="space-y-4">
                                                        <div className="flex gap-4">
                                                            <span className="text-slate-300 font-bold text-xl">{sIdx + 1}.</span>
                                                            <div className="space-y-3">
                                                                <Typography variant="body" className="text-slate-600 text-xl leading-relaxed font-semibold">
                                                                    {s.definition ? s.definition[0] : <span className="text-slate-300 italic">No definition available</span>}
                                                                </Typography>

                                                                {s.example && s.example.length > 0 && (
                                                                    <Typography variant="body" className="text-slate-400 italic text-lg border-l-4 border-slate-100 pl-4 py-1">
                                                                        "{s.example[0]}"
                                                                    </Typography>
                                                                )}

                                                                {s.members && s.members.length > 1 && (
                                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                                        {s.members.filter(m => m !== item.word).map((m, mIdx) => (
                                                                            <span key={mIdx} className="text-xs font-bold text-[#bf1e2e]/60 bg-[#bf1e2e]/5 px-3 py-1 rounded-lg">
                                                                                {m}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6 opacity-60">
                        <div className="bg-white/40 p-10 rounded-[2.5rem] border border-white dashed-2 flex flex-col items-center text-center gap-4">
                            <Languages className="text-[#00274c]/20" size={40} />
                            <Typography variant="muted" className="text-[10px] font-black uppercase tracking-widest">Global Vocabulary</Typography>
                        </div>
                        <div className="bg-white/40 p-10 rounded-[2.5rem] border border-white dashed-2 flex flex-col items-center text-center gap-4">
                            <Book className="text-[#00274c]/20" size={40} />
                            <Typography variant="muted" className="text-[10px] font-black uppercase tracking-widest">Semantic Search</Typography>
                        </div>
                        <div className="bg-white/40 p-10 rounded-[2.5rem] border border-white dashed-2 flex flex-col items-center text-center gap-4">
                            <Sparkles className="text-[#00274c]/20" size={40} />
                            <Typography variant="muted" className="text-[10px] font-black uppercase tracking-widest">Enhanced Learning</Typography>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
