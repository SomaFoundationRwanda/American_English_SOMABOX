"use client"
import HeaderSection from "@/components/ui/HeaderSection";
import Input from "@/components/ui/input";
import BooksPage from "@/components/ui/library/books";
import LibrarySidebar from "@/components/ui/library/LibrarySidebar";
import { useLanguage } from '@/context/LanguageContext';
import { useState } from "react";

const Library = () => {
    const { t } = useLanguage();
    const [selectedFilters, setSelectedFilters] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <section className="min-h-screen bg-slate-50 md:bg-transparent overflow-hidden">
            <HeaderSection
                title={t("nav.library")}
                subtitle={t("librarySubtitle")}
                buttonText={t("howToUse")}
            />

            <div className="flex flex-col md:flex-row gap-4 px-3 md:px-0 mt-4">
                <LibrarySidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                />
                <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-white/50 backdrop-blur-sm p-3 md:p-2 rounded-xl border border-white/20 shadow-sm">
                        <Input
                            id="search-books"
                            placeholder="Search books..."
                            className="h-12 bg-white w-full"
                            value={searchQuery}
                            onChange={(value) => setSearchQuery(value)}
                        />
                    </div>
                    <div className="bg-accent-light-3/20 backdrop-blur-md rounded-2xl p-4 min-h-[60vh] shadow-inner">
                        <BooksPage selectedFilters={selectedFilters} searchQuery={searchQuery} />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Library;
