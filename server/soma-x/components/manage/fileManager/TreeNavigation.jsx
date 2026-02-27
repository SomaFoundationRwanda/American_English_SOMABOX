'use client'
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, Plus, FolderPlus } from 'lucide-react';
import InputDialog from '@/components/ui/InputDialog';
import { toast } from 'sonner';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const TreeNode = ({ node, level, onSelect, activeId, onRefresh }) => {
    const [isOpen, setIsOpen] = useState(level === 0); // Open root by default
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggle = async (e) => {
        if (e) e.stopPropagation();
        if (!isOpen && children.length === 0) {
            setLoading(true);
            try {
                const res = await fetch(`${SERVER_URL}/content/manager/list?path=${encodeURIComponent(node.path_key)}`);
                const data = await res.json();
                setChildren(data.categories || []);
            } catch (e) {
                console.error("Failed to load children", e);
            } finally {
                setLoading(false);
            }
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = () => {
        onSelect(node);
    };

    // Auto-load children for root or if it's open
    useEffect(() => {
        if (isOpen && children.length === 0) {
            toggle();
        }
    }, [isOpen]);

    return (
        <div className="select-none">
            <div
                onClick={handleSelect}
                className={`group flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer transition-colors ${activeId === node.id ? 'bg-[#00274c] text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
                <div onClick={(e) => { e.stopPropagation(); toggle(); }} className="w-4 h-4 flex items-center justify-center hover:bg-black/10 rounded">
                    {loading ? (
                        <div className="w-2 h-2 border-2 border-slate-400 border-t-transparent animate-spin rounded-full" />
                    ) : (
                        (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)
                    )}
                </div>
                <Folder size={16} className={activeId === node.id ? 'text-white/80' : 'text-slate-400 group-hover:text-[#00274c]'} />
                <span className="text-sm font-medium truncate">{node.title}</span>
            </div>

            {isOpen && (
                <div className="mt-0.5">
                    {children.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onSelect={onSelect}
                            activeId={activeId}
                            onRefresh={onRefresh}
                        />
                    ))}
                    {children.length === 0 && !loading && (
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 py-2 opacity-50" style={{ paddingLeft: `${(level + 1) * 16 + 28}px` }}>
                            Empty Folder
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const TreeNavigation = ({ onSelectCategory, activeCategory, refreshTrigger }) => {
    const [rootNode, setRootNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const activeCategoryId = activeCategory?.id;

    const fetchRoot = async () => {
        setLoading(true);
        try {
            // Root category itself
            setRootNode({
                id: 1,
                title: "Custom Content",
                path_key: "custom-content",
                is_root: true
            });
        } catch (e) {
            console.error("Failed to load root tree", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (name) => {
        if (!name) return;
        try {
            // Use active folder's path if selected, otherwise internal root
            const targetPath = activeCategory?.path_key || "custom-content";

            const res = await fetch(`${SERVER_URL}/content/manager/create-folder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, path: targetPath })
            });
            if (res.ok) {
                toast.success("Folder created");
                fetchRoot(); // Refresh root to see the new folder
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to create folder");
            }
        } catch (e) {
            toast.error("Error creating folder");
        } finally {
            setIsCreateDialogOpen(false);
        }
    };

    useEffect(() => {
        fetchRoot();
    }, [refreshTrigger]);

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 md:w-80">
            <InputDialog
                isOpen={isCreateDialogOpen}
                title="New Subfolder"
                label="Folder Name"
                placeholder="Enter name..."
                confirmText="Create"
                onConfirm={handleCreateFolder}
                onClose={() => setIsCreateDialogOpen(false)}
            />

            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Navigation</h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-[#00274c]"
                        title="New Folder"
                    >
                        <FolderPlus size={16} />
                    </button>
                    <button
                        onClick={fetchRoot}
                        className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-400"
                        title="Refresh"
                    >
                        <Plus size={16} className="rotate-45" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {loading && !rootNode ? (
                    <div className="space-y-2 p-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-50 animate-pulse rounded-lg" />)}
                    </div>
                ) : rootNode ? (
                    <TreeNode
                        node={rootNode}
                        level={0}
                        onSelect={onSelectCategory}
                        activeId={activeCategoryId}
                        onRefresh={fetchRoot}
                    />
                ) : (
                    <div className="p-4 text-xs text-slate-400 italic">
                        No root node found. Click refresh or check server.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TreeNavigation;
