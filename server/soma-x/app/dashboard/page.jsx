'use client'
import { ChevronDown, ChevronRight, ChevronLeft, Search, Filter, X } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import HeaderSection from '@/components/ui/HeaderSection';
import ContentCard from '@/components/ui/ContentCard';
import AEResourceCard from '@/components/ui/AEResourceCard';
import React, { useContext, useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import DataContext from "@/context/DataContext";
import Link from "next/link";
import { useLanguage } from '@/context/LanguageContext';
import Typography from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";
import { BookOutlined, Layers } from "@mui/icons-material";
import UniversalPlayerModal from "@/components/ui/UniversalPlayerModal";
import AmericanEnglishDictionary from "@/components/ui/AmericanEnglishDictionary";

import { Suspense } from "react";

export default function SomaboxHomepage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Typography variant="h3" className="text-[#00274c] animate-pulse uppercase font-black">
          Loading SomaBox...
        </Typography>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { mainCategories, customContentSummary, summaryData } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState(null);
  const [currentPath, setCurrentPath] = useState(null); // For nested custom/school navigation
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const filteredCategory = searchParams.get('category');

  // --- AE Categories Definition ---
  const aeCategories = [
    { title: "Teacher Development", tag: "Teacher Development", color: "bg-[#00274c]", keywords: ["teacher", "professional development", "pedagogy"] },
    { title: "Student Resources", tag: "Student Resources", color: "bg-[#bf1e2e]", keywords: ["student", "learner", "curriculum", "grade"] },
    { title: "Multimedia Library", tag: "Multimedia Library", color: "bg-[#005a9c]", keywords: ["video", "audio", "multimedia", "media"] },
    { title: "Leadership", tag: "Leadership", color: "bg-[#ffcc33]", keywords: ["leadership", "management", "admin"] },
    { title: "Community", tag: "Community", color: "bg-[#2c3e50]", keywords: ["community", "outreach", "social"] },
    { title: "Resources", tag: "Other Resources", color: "bg-[#95a5a6]", keywords: [] },
  ];

  const sidebarItems = useMemo(() => {
    if (!mainCategories || mainCategories.length === 0) {
      return Array.from({ length: 4 }).map((_, i) => ({
        title: t("loading"),
        slug: `loading-${i}`
      }));
    }
    return mainCategories.map(category => ({
      title: t(`categories.${category.slug}`) || category.title,
      slug: category.slug,
    }));
  }, [mainCategories, t]);

  const allItems = useMemo(() => {
    const items = [];

    // 1. Managed Content items
    if (summaryData) {
      Object.values(summaryData).forEach(cat => {
        if (cat.content) items.push(...cat.content);
      });
    }

    // 2. Custom Content items
    if (customContentSummary) {
      Object.values(customContentSummary).forEach(cat => {
        if (cat.content) items.push(...cat.content);
      });
    }

    return items;
  }, [summaryData, customContentSummary]);

  const groupedItems = useMemo(() => {
    if (!activeTab) return {};

    // If we're on a specific category, we might want to group its items by tags
    const category = mainCategories?.find((cat) => cat.slug === activeTab);
    let specificContent = summaryData?.[activeTab]?.content || [];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      specificContent = specificContent.filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.url?.toLowerCase().includes(term) ||
        item.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    const groups = {};
    aeCategories.forEach(cat => {
      groups[cat.title] = specificContent.filter(item => {
        const itemText = (item.title + " " + (item.url || "") + " " + (item.tags || "")).toLowerCase();
        return cat.keywords.some(k => itemText.includes(k.toLowerCase())) ||
          item.tags?.some(tag => tag.toLowerCase() === cat.tag.toLowerCase());
      });
    });

    // Also collect items that don't match any AE category if we are in an AE-specific view
    const matchedItems = Object.values(groups).flat();
    groups["Other Resources"] = specificContent.filter(item => !matchedItems.some(matched => matched.id === item.id));

    return groups;
  }, [activeTab, mainCategories, summaryData, searchTerm]);

  const itemsToDisplay = useMemo(() => {
    if (!activeTab) return [];

    let items = [];
    if (activeTab === 'custom-content') {
      const path = currentPath || activeTab;
      const source = customContentSummary?.[path];
      items = source?.content || source?.items || [];
    } else if (mainCategories) {
      const category = mainCategories.find((cat) => cat.slug === activeTab);
      items = category?.items || [];
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return items.filter(item =>
        item.title?.toLowerCase().includes(term) ||
        (item.slug && item.slug.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    return items;
  }, [activeTab, mainCategories, customContentSummary, currentPath, searchTerm]);

  const currentLevelData = useMemo(() => {
    if (activeTab === 'custom-content' || activeTab === 'school-content') {
      const path = currentPath || activeTab;
      const data = customContentSummary?.[path] || null;

      if (data && searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return {
          ...data,
          items: data.items?.filter(item => item.title?.toLowerCase().includes(term)),
          content: data.content?.filter(item =>
            item.title?.toLowerCase().includes(term) ||
            item.url?.toLowerCase().includes(term) ||
            item.tags?.some(tag => tag.toLowerCase().includes(term))
          )
        };
      }
      return data;
    }
    return null;
  }, [activeTab, currentPath, customContentSummary, searchTerm]);

  // Set default active category if nothing is selected
  useEffect(() => {
    if (!filteredCategory && !activeTab) {
      router.replace(`/dashboard?category=${aeCategories[0].tag}`);
    }
  }, [filteredCategory, activeTab, router]);

  // When clicking an AE category, clear the activeTab
  const handleAECategoryClick = (tag) => {
    setActiveTab(null);
    router.push(`/dashboard?category=${tag}`);
  };

  // When clicking a Main category tab, clear the filteredCategory
  const handleTabClick = (slug) => {
    setActiveTab(slug);
    setCurrentPath(null);
    setSearchTerm("");
    router.push('/dashboard');
  };

  // Reset sub-path when changing main tabs
  useEffect(() => {
    setCurrentPath(null);
  }, [activeTab]);

  const handlePlay = (item) => {
    setSelectedMedia(item);
    setIsModalOpen(true);
  };

  const handleOpenResource = (item) => {
    // If it's a paired resource or has a pdf_url, open in modal as a PDF/Book
    if (item.pdf_url || item.type === 'book' || item.type === 'pdf') {
      setSelectedMedia({
        ...item,
        type: 'pdf' // Force PDF view in the universal player
      });
      setIsModalOpen(true);
    } else {
      // Fallback or external links
      window.open(item.url, '_blank');
    }
  };

  const isAEView = activeTab === 'american-english' || activeTab === 'rwandan-education' || !!filteredCategory;

  const showSearchBar = activeTab !== 'rwandan-education' && filteredCategory !== 'Multimedia Library';

  const aeFilteredItems = useMemo(() => {
    if (!filteredCategory || !allItems) return [];

    // Find the category definition to get its keywords
    const currentCat = aeCategories.find(c => c.tag === filteredCategory);

    if (filteredCategory === "Other Resources") {
      // Collect all items that match OTHER categories first
      const allMatched = allItems.filter(item => {
        const itemText = (item.title + " " + (item.url || "") + " " + (item.tags || "")).toLowerCase();
        return aeCategories.slice(0, 5).some(cat =>
          cat.keywords.some(k => itemText.includes(k.toLowerCase())) ||
          item.tags?.some(tag => tag.toLowerCase() === cat.tag.toLowerCase())
        );
      });
      // Return those that ARE NOT in any defined category
      return allItems.filter(item => !allMatched.some(m => m.id === item.id));
    }

    return allItems.filter(item => {
      const itemText = (item.title + " " + (item.url || "") + " " + (item.tags || "")).toLowerCase();
      const hasKeyword = currentCat?.keywords?.some(k => itemText.includes(k.toLowerCase()));
      const hasTag = item.tags?.some(tag => tag.toLowerCase() === filteredCategory.toLowerCase());

      const userSearchMatch = !searchTerm.trim() ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      return (hasKeyword || hasTag) && userSearchMatch;
    });
  }, [filteredCategory, allItems, aeCategories, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 md:bg-transparent pb-20">
      <UniversalPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mediaItem={selectedMedia}
      />

      <HeaderSection
        title={filteredCategory ? filteredCategory.toUpperCase() : t("homeTitle")}
        subtitle={filteredCategory ? "All tagged resources across the platform" : t("homeSubtitle")}
        buttonText={t("howToUse")}
      />

      <div className="flex flex-col md:flex-row gap-8 px-4 md:px-0">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-72 shrink-0 rounded-[2.5rem] bg-white/60 backdrop-blur-3xl border border-white shadow-2xl p-6 self-start sticky top-6">
          <div className="space-y-6">
            <div className="px-4">
              <Typography variant="label" className="opacity-40 uppercase tracking-[0.2em] text-[10px] font-black">
                Content Library
              </Typography>
            </div>

            <nav className="space-y-2">
              {aeCategories.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleAECategoryClick(item.tag)}
                  className={`flex items-center justify-between py-4 px-6 rounded-2xl transition-all duration-500 cursor-pointer group ${filteredCategory === item.tag
                    ? 'bg-[#00274c] text-white shadow-2xl shadow-[#00274c]/30 scale-[1.02]'
                    : 'hover:bg-white text-slate-500 hover:text-[#00274c]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Typography weight="black" color={filteredCategory === item.tag ? "white" : "default"} className="text-sm uppercase tracking-wider">
                      {item.title}
                    </Typography>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-all duration-500 ${filteredCategory === item.tag ? '-rotate-90 text-[#ffcc33]' : 'opacity-0 group-hover:opacity-100'}`} />
                </div>
              ))}
            </nav>

            <nav className="space-y-4 pt-6 border-t border-slate-100">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(item.slug)}
                  className={`w-full flex items-center justify-between py-4 px-6 rounded-2xl transition-all duration-500 cursor-pointer group ${activeTab === item.slug && !filteredCategory
                    ? 'bg-white shadow-xl shadow-slate-200 text-[#00274c] translate-x-1'
                    : 'text-slate-500 hover:text-[#00274c] hover:bg-white/50'
                    }`}
                >
                  <Typography weight="black" className="text-sm uppercase tracking-wider">
                    {item.title}
                  </Typography>
                  <ChevronRight className={`w-4 h-4 transition-all duration-500 ${activeTab === item.slug && !filteredCategory ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </nav>

            <div className="pt-6 border-t border-slate-100 px-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <Typography size="xs" color="muted" className="font-bold leading-relaxed">
                  Access official U.S. Department of State resources offline.
                </Typography>
              </div>
            </div>
          </div>
        </aside>

        {/* Categories Switches (Mobile) */}
        <div className="md:hidden overflow-x-auto flex gap-3 pb-4 -mx-4 px-4 sticky top-0 z-40 bg-slate-50/90 backdrop-blur-xl py-4 border-b border-slate-200">
          {aeCategories.map((item, index) => (
            <Button
              key={index}
              onClick={() => handleAECategoryClick(item.tag)}
              className={`rounded-full px-8 h-12 text-xs font-black uppercase tracking-widest transition-all ${filteredCategory === item.tag
                ? "bg-[#00274c] text-white shadow-xl shadow-[#00274c]/20"
                : "bg-white text-slate-500 border border-slate-100"
                }`}
            >
              {item.title}
            </Button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1">
          {showSearchBar && (
            <div className="mb-10 relative group max-w-md">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="text-slate-300 group-focus-within:text-[#00274c] transition-colors" size={18} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in this section..."
                className="w-full h-14 pl-12 pr-12 bg-white/60 backdrop-blur-xl border border-white rounded-2xl outline-none text-sm font-bold placeholder:text-slate-300 focus:border-[#00274c]/20 focus:bg-white transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-slate-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {filteredCategory ? (
            <div className="space-y-12">
              <section className="space-y-8">

                {aeFilteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8">
                    {aeFilteredItems.map((item, i) => (
                      <AEResourceCard
                        key={i}
                        item={item}
                        onPlay={handlePlay}
                        onOpenResource={handleOpenResource}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white dashed-2 mx-auto max-w-2xl text-slate-400 gap-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center opacity-30">
                      <Layers size={48} />
                    </div>
                    <Typography variant="body" className="text-center font-bold uppercase tracking-widest text-xs opacity-60">
                      No resources found for "{filteredCategory}"
                    </Typography>
                  </div>
                )}
              </section>
            </div>
          ) : (activeTab === 'custom-content' || activeTab === 'school-content') ? (
            <div className="space-y-12 pb-32">
              {/* Breadcrumbs for custom content */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                <button onClick={() => setCurrentPath(activeTab)} className="hover:text-[#00274c]">ROOT</button>
                {currentPath && currentPath !== activeTab && currentPath.split('/').slice(1).map((part, idx, arr) => (
                  <React.Fragment key={idx}>
                    <ChevronRight size={12} />
                    <button
                      onClick={() => setCurrentPath(currentPath.split('/').slice(0, idx + 2).join('/'))}
                      className={idx === arr.length - 1 ? "text-[#00274c]" : "hover:text-[#00274c]"}
                    >
                      {part.replace(/-/g, ' ')}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {currentLevelData?.body && (
                <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-xl shadow-slate-200/50">
                  {(() => {
                    try {
                      const blocks = JSON.parse(currentLevelData.body);
                      if (!Array.isArray(blocks)) throw new Error();
                      return (
                        <div className="space-y-6">
                          {blocks.map(block => {
                            if (block.type === 'heading') return <Typography key={block.id} variant="h3" className="text-[#00274c] font-black">{block.content}</Typography>;
                            if (block.type === 'quote') return (
                              <blockquote key={block.id} className="border-l-4 border-[#bf1e2e] pl-6 italic text-slate-600 my-8">
                                <Typography variant="body" className="text-xl font-serif">{block.content}</Typography>
                              </blockquote>
                            );
                            if (block.type === 'list') return (
                              <ul key={block.id} className="space-y-2 list-disc list-inside text-slate-600">
                                {block.content.split('\n').map((li, i) => li.trim() && <li key={i} className="text-lg">{li}</li>)}
                              </ul>
                            );
                            return <Typography key={block.id} variant="body" className="text-lg leading-relaxed text-slate-600">{block.content}</Typography>;
                          })}
                        </div>
                      );
                    } catch (e) {
                      return <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: currentLevelData.body.replace(/\n/g, '<br/>') }} />;
                    }
                  })()}
                </div>
              )}

              {/* Subfolders Grid */}
              {currentLevelData?.items?.length > 0 && (
                <section className="space-y-6">
                  <Typography variant="label" className="text-slate-400 uppercase tracking-[0.2em] text-[10px]">Sub-Categories</Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentLevelData.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPath(item.slug)}
                        className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 hover:border-[#00274c]/20 hover:shadow-xl hover:shadow-[#00274c]/5 transition-all text-left group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#00274c] group-hover:bg-[#00274c] group-hover:text-white transition-colors">
                          <Layers size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Typography className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">{item.title}</Typography>
                          <Typography size="xs" color="muted">View resources</Typography>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Content Items */}
              {currentLevelData?.content?.length > 0 && (
                <section className="space-y-6">
                  <Typography variant="label" className="text-slate-400 uppercase tracking-[0.2em] text-[10px]">Resources</Typography>
                  <div className="grid grid-cols-1 gap-8">
                    {currentLevelData.content.map((item, i) => (
                      <AEResourceCard
                        key={i}
                        item={item}
                        onPlay={handlePlay}
                        onOpenResource={handleOpenResource}
                      />
                    ))}
                  </div>
                </section>
              )}

              {(!currentLevelData?.items?.length && !currentLevelData?.content?.length) && (
                <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                  <Layers size={48} className="mb-4 opacity-20" />
                  <Typography variant="muted" className="text-xs uppercase font-black tracking-widest">No resources here yet</Typography>
                </div>
              )}
            </div>
          ) : activeTab === 'rwandan-education' ? (
            <AmericanEnglishDictionary />
          ) : activeTab && (
            <div className="space-y-12">
              {/* Grouped AE View if applicable */}
              {Object.keys(groupedItems).some(k => groupedItems[k].length > 0) ? (
                <div className="space-y-16">
                  {aeCategories.map((group, idx) => groupedItems[group.title]?.length > 0 && (
                    <section key={idx} className="space-y-8">
                      <div className="flex items-center gap-6">
                        <div className={`h-12 w-1.5 ${group.color} rounded-full`} />
                        <div className="flex flex-col">
                          <Typography variant="h2" className="text-[#00274c] text-3xl font-black tracking-tighter uppercase italic">
                            {group.title}
                          </Typography>
                          <Typography variant="muted" size="xs" className="uppercase font-bold tracking-[0.3em] mt-1">
                            Selected American English Resources
                          </Typography>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                        {groupedItems[group.title].map((item, i) => (
                          <AEResourceCard
                            key={i}
                            item={item}
                            onPlay={handlePlay}
                            onOpenResource={handleOpenResource}
                          />
                        ))}
                      </div>
                    </section>
                  ))}

                  {groupedItems["Other Resources"]?.length > 0 && (
                    <section className="space-y-8">
                      <div className="flex items-center gap-6 opacity-40">
                        <div className="h-12 w-1.5 bg-slate-400 rounded-full" />
                        <Typography variant="h2" className="text-slate-600 text-2xl font-black tracking-tighter uppercase italic">
                          General Resources
                        </Typography>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedItems["Other Resources"].map((course, index) => (
                          <Link href={`/${course.slug}`} key={index} className="block transition-transform active:scale-95">
                            <ContentCard
                              title={course.title}
                              image='/imageFallback.png'
                              colorClass="bg-slate-400"
                            />
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                /* Fallback to Standard Grid if no tagged items found */
                itemsToDisplay.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white dashed-2 mx-auto max-w-2xl text-slate-400 gap-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center opacity-30">
                      <Layers size={48} />
                    </div>
                    <Typography variant="body" className="text-center font-bold uppercase tracking-widest text-xs opacity-60">
                      No resources found in this category
                    </Typography>
                  </div>
                ) : (
                  <div className={activeTab === 'international-education'
                    ? "grid grid-cols-1 gap-6"
                    : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-8"
                  }>
                    {itemsToDisplay.map((course, index) => (
                      activeTab === "international-education" ? (
                        <a
                          key={index}
                          href={`/frame?slug=${course.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block"
                        >
                          <div className="bg-white hover:bg-[#00274c] rounded-[2rem] p-8 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-slate-100 flex items-center gap-8">
                            <div className={`p-5 rounded-2xl shadow-inner ${course.colorClass || 'bg-slate-50'} group-hover:bg-white/10 transition-colors`}>
                              <img src={`/images/${course.slug}.png`} className="w-14 h-14 object-contain" alt="" />
                            </div>
                            <div className="flex-1">
                              <Typography variant="h4" className="group-hover:text-white transition-colors mb-2 font-black uppercase tracking-tight">
                                {t(`platforms.${course.slug}.title`) || course.title}
                              </Typography>
                              <Typography variant="muted" className="group-hover:text-white/60 line-clamp-2 text-sm">
                                {t(`platforms.${course.slug}.description`) || course.description}
                              </Typography>
                            </div>
                          </div>
                        </a>
                      ) : (
                        <Link href={`/${course.slug}`} key={index} className="block transition-all hover:-translate-y-2">
                          <ContentCard
                            title={activeTab === 'custom-content' || activeTab === 'school-content'
                              ? course.title
                              : (t(`educationLevels.${course.slug}`) || course.title)}
                            image='/imageFallback.png'
                            colorClass={course.colorClass || 'bg-[#00274c]'}
                          />
                        </Link>
                      )
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}