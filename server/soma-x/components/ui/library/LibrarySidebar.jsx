import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Book, Filter, X, BookOpen } from 'lucide-react';
import { Checkbox } from '../checkbox';
import { cn } from "@/lib/utils";

const LibrarySidebar = ({ selectedFilters, setSelectedFilters }) => {
    const [expandedSections, setExpandedSections] = useState({
        level: true,
        languages: true,
        subjects: true
    });
    const [categories, setCategories] = useState([]);
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch(`${SERVER_URL}/library/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        }
        fetchCategories();
    }, [SERVER_URL]);

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleFilterChange = (type, value) => {
        setSelectedFilters(prev => {
            const current = prev[type] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];

            return {
                ...prev,
                [type]: updated
            };
        });
    };

    const clearAllFilters = () => {
        setSelectedFilters({});
    };

    const activeFiltersCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);

    const FilterSection = ({ title, isExpanded, onToggle, children }) => (
        <div className="mb-6">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full text-left text-gray-800 font-bold text-xs uppercase tracking-widest hover:text-primary-600 transition-colors duration-200"
            >
                <span>{title}</span>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="mt-4 space-y-1">
                    {children}
                </div>
            </div>
        </div>
    );

    const CheckboxItem = ({ id, label, type }) => {
        const isActive = selectedFilters[type]?.includes(id);
        return (
            <label
                className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 group border border-transparent",
                    isActive
                        ? "bg-primary-50 border-primary-100 text-primary-700"
                        : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                )}
            >
                <div className="flex items-center space-x-3 w-full">
                    <div className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
                        isActive
                            ? "bg-primary-600 border-primary-600 shadow-sm shadow-primary-200"
                            : "border-gray-300 group-hover:border-primary-400 bg-white"
                    )}>
                        {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm font-medium flex-1">{label}</span>
                    {isActive && <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />}
                </div>
                <input
                    type="checkbox"
                    className="hidden"
                    checked={isActive}
                    onChange={() => handleFilterChange(type, id)}
                />
            </label>
        );
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-2xl z-40 hover:bg-primary-700 transition-all hover:scale-110 active:scale-95"
            >
                <Filter className="w-6 h-6" />
                {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white
                transform transition-all duration-300 ease-in-out lg:transform-none
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                overflow-y-auto border-r border-gray-100 lg:border-none
            `)}>
                <div className="p-6 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary-50 rounded-lg">
                                <Filter className="w-4 h-4 text-primary-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                        </div>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Book Categories */}
                    <FilterSection
                        title="Categories"
                        isExpanded={expandedSections.subjects}
                        onToggle={() => toggleSection('subjects')}
                    >
                        <div className="grid gap-1">
                            {categories.map(cat => (
                                <CheckboxItem
                                    key={cat}
                                    id={cat}
                                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    type="subjects"
                                />
                            ))}
                            {categories.length === 0 && (
                                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <Book className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-400 font-medium">No categories found</p>
                                </div>
                            )}
                        </div>
                    </FilterSection>
                </div>
            </div>
        </>
    );
};

export default LibrarySidebar;