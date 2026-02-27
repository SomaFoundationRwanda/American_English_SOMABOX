'use client'
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Layout,
    Search,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/Typography';
import AEResourceCard from '@/components/ui/AEResourceCard';
import { toast } from 'sonner';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const SectionEditor = () => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Student Resources");

    const AE_CATEGORIES = [
        "Teacher Development",
        "Student Resources",
        "Multimedia Library",
        "Leadership",
        "Community"
    ];

    useEffect(() => {
        fetchContent();
    }, [selectedCategory]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            // Fetch all items from the custom-content path
            const res = await fetch(`${SERVER_URL}/content/manager/list?path=custom-content`);
            const data = await res.json();

            // Filter items that have the selectedCategory in their tags
            const filtered = (data.items || []).filter(item => {
                let tags = [];
                try {
                    tags = item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [];
                } catch (e) { tags = []; }
                return Array.isArray(tags) && tags.includes(selectedCategory);
            });

            setItems(filtered);
        } catch (e) {
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/content/manager/upsert-item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category_id: 1, // Default to Custom Content root
                    title: "New American English Resource",
                    subtitle: "Brief description for the card...",
                    type: "video",
                    tags: JSON.stringify([selectedCategory]),
                    body: "[]"
                })
            });
            if (res.ok) {
                fetchContent();
                toast.success(`New card added to ${selectedCategory}`);
            }
        } catch (e) {
            toast.error("Failed to add resource");
        }
    };

    const handleUpdateItem = async (updatedItem) => {
        try {
            const res = await fetch(`${SERVER_URL}/content/manager/upsert-item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...updatedItem,
                    category_id: 1, // Always ensure it stays in Custom Content root
                    tags: Array.isArray(updatedItem.tags) ? JSON.stringify(updatedItem.tags) : updatedItem.tags
                })
            });
            if (res.ok) {
                toast.success("Changes saved successfully");
                fetchContent();
            }
        } catch (e) {
            toast.error("Save failed");
        }
    };

    const handleDeleteItem = async (id) => {
        if (!confirm("Are you sure you want to delete this resource card?")) return;
        try {
            const res = await fetch(`${SERVER_URL}/content/manager/delete-item/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Resource removed");
                fetchContent();
            }
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    const handleFileUpload = async (item, file, type) => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);

        const tid = toast.loading(`Uploading ${type}...`);
        try {
            const res = await fetch(`${SERVER_URL}/content/manager/upload-asset`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.ok) {
                toast.success(`${type} uploaded successfully`, { id: tid });
                // Update the item in the list with the new path
                const fieldMap = {
                    thumbnail: 'thumbnail_url',
                    video: 'video_url',
                    pdf: 'pdf_url'
                };
                const field = fieldMap[type];
                const updatedItem = { ...item, [field]: data.path };
                delete updatedItem._uploadFile;
                delete updatedItem._uploadType;

                setItems(prev => prev.map(it => it.id === item.id ? updatedItem : it));
            } else {
                toast.error("Upload failed", { id: tid });
            }
        } catch (e) {
            toast.error("Network error during upload", { id: tid });
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/30">
            {/* Main Header / Toolbar */}
            <div className="bg-white p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="h-14 w-14 bg-[#00274c] rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-[#00274c]/20">
                        <Layout size={28} />
                    </div>
                    <div>
                        <Typography variant="h2" className="text-[#00274c] font-black tracking-tight text-2xl">Creative Studio</Typography>
                        <div className="flex items-center gap-2">
                            <Typography variant="body" color="muted" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Dashboard Content Authoring</Typography>
                            <div className="h-1 w-1 bg-slate-200 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bf1e2e]">Offline Mode</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-slate-100/50 p-2.5 rounded-2xl border border-slate-200/50">
                        <Typography variant="label" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Target Category:</Typography>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-white border border-slate-200/50 rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest text-[#00274c] shadow-sm outline-none focus:ring-4 focus:ring-[#00274c]/5 transition-all appearance-none pr-10 relative"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2300274c' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                        >
                            {AE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={handleAddItem}
                        className="bg-[#bf1e2e] hover:bg-[#a01825] text-white rounded-2xl px-8 h-14 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-[#bf1e2e]/30 flex items-center gap-4 transition-all active:scale-95 group"
                    >
                        <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" /> Add Content Card
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-48 gap-6">
                            <div className="h-16 w-16 border-[6px] border-slate-100 border-t-[#00274c] rounded-full animate-spin shadow-inner" />
                            <Typography variant="muted" className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Resources...</Typography>
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-cols-1 gap-16">
                            {items.map((item) => (
                                <div key={item.id} className="relative">
                                    <AEResourceCard
                                        item={item}
                                        isEditable={true}
                                        onChange={(newItem) => {
                                            if (newItem._uploadFile) {
                                                handleFileUpload(item, newItem._uploadFile, newItem._uploadType);
                                            } else {
                                                setItems(items.map(it => it.id === item.id ? newItem : it));
                                            }
                                        }}
                                        onSave={() => handleUpdateItem(item)}
                                        onDelete={() => handleDeleteItem(item.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-sm">
                            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-100 mb-8">
                                <Search size={48} strokeWidth={1} />
                            </div>
                            <Typography variant="h3" className="text-[#00274c] font-black tracking-tight mb-3">No resources in {selectedCategory}</Typography>
                            <Typography variant="muted" className="text-xs font-bold uppercase tracking-[0.2em] opacity-30 text-center max-w-sm">
                                Create your first institutional resource card using the studio toolbar above.
                            </Typography>
                        </div>
                    )}
                </div>
            </div>

            {/* Hint Footer */}
            <div className="bg-white/50 backdrop-blur-md p-4 border-t border-slate-100 flex justify-center sticky bottom-0">
                <Typography variant="muted" className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                    SomaBox Creative Studio v2.0 • Premium Content Authoring System
                </Typography>
            </div>
        </div>
    );
};

export default SectionEditor;
