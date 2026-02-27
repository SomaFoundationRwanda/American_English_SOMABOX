"use client"
import formatSize from "@/components/helpers/formatSize";
import Unauthorized from "@/components/sections/Unauthorized";
import DataContext from "@/context/DataContext";
import Link from "next/link";
import { useContext, useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useLanguage } from '@/context/LanguageContext';
import { Warning } from "@mui/icons-material";
import ManageTitle from "@/components/manage/ManageTitle";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
    Folder,
    FolderOpen,
    FileText,
    ChevronRight,
    GraduationCap,
    BookOpen,
    PlayCircle,
    Star,
    Users,
    Archive,
    AlertCircle,
    CloudOff,
    RefreshCw,
    WifiOff
} from "lucide-react";
import Typography from "@/components/ui/Typography";

// Recursive TreeNode
const TreeNode = ({ node, onToggle, onCheck, checked }) => {
    const [collapsed, setCollapsed] = useState(true);

    const handleFolderClick = () => setCollapsed(!collapsed);

    const getIcon = () => {
        if (node.type === "file") return <FileText className="w-4 h-4 text-blue-500" />;

        if (node.isCategory) {
            switch (node.name) {
                case "Teacher Development": return <GraduationCap className="w-4 h-4 text-indigo-500" />;
                case "Student Resources": return <BookOpen className="w-4 h-4 text-emerald-500" />;
                case "Multimedia Library": return <PlayCircle className="w-4 h-4 text-rose-500" />;
                case "Leadership": return <Star className="w-4 h-4 text-amber-500" />;
                case "Community": return <Users className="w-4 h-4 text-cyan-500" />;
                default: return <Archive className="w-4 h-4 text-slate-500" />;
            }
        }

        return collapsed
            ? <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            : <FolderOpen className="w-4 h-4 text-amber-400 fill-amber-400/20" />;
    };

    if (node.type === "folder") {
        return (
            <div className="ml-4 border-l border-slate-100 pl-4 py-1">
                <div className="flex items-center space-x-3 group">
                    <Checkbox
                        checked={!!checked[node.path]}
                        onCheckedChange={(v) => onCheck(node, v === true)}
                    />
                    <div
                        className="flex items-center gap-2 cursor-pointer transition-colors hover:text-[#00274c]"
                        onClick={handleFolderClick}
                    >
                        <div className={`transition-transform duration-200 ${collapsed ? "" : "rotate-90"}`}>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                        </div>
                        {getIcon()}
                        <span className={`text-sm tracking-tight ${node.isCategory ? "font-bold uppercase text-[11px] text-slate-400" : "font-semibold text-slate-700"}`}>
                            {node.name}
                        </span>
                        {node.isDownloaded && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium border border-emerald-100">
                                Downloaded
                            </span>
                        )}
                    </div>
                </div>
                {!collapsed && node.children && (
                    <div className="mt-1">
                        {node.children.map((child, i) => (
                            <TreeNode
                                key={i}
                                node={child}
                                onToggle={onToggle}
                                onCheck={onCheck}
                                checked={checked}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (node.type === "file") {
        return (
            <div className="ml-10 flex items-center space-x-3 py-1 group">
                <Checkbox
                    checked={!!checked[node.path]}
                    onCheckedChange={(v) => onCheck(node, v === true)}
                />
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                        {node.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                        {formatSize(node.size)}
                    </span>
                    {node.isDownloaded && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium border border-emerald-100">
                            Downloaded
                        </span>
                    )}
                </div>
            </div>
        )
    }

    return null;
}

const ManageContent = ({ auth }) => {
    const { authenticated } = useContext(DataContext)
    const [contentTree, setContentTree] = useState([])
    const [checked, setChecked] = useState({}) // path => true/false
    const [cloudUnavailable, setCloudUnavailable] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [refetch, setRefetch] = useState(false)

    // Dialog state
    const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [pendingSyncFiles, setPendingSyncFiles] = useState([]);

    // --- AE Categories Definition ---
    const aeCategories = [
        { title: "Teacher Development", keywords: ["teacher", "professional development", "pedagogy"] },
        { title: "Student Resources", keywords: ["student", "learner", "curriculum", "grade"] },
        { title: "Multimedia Library", keywords: ["video", "audio", "multimedia", "media"] },
        { title: "Leadership", keywords: ["leadership", "management", "admin"] },
        { title: "Community", keywords: ["community", "outreach", "social"] },
    ];

    const groupedTree = useMemo(() => {
        // Create the structure with hardcoded categories
        const groups = aeCategories.map(cat => ({
            name: cat.title,
            path: `category:${cat.title}`,
            type: "folder",
            isCategory: true,
            children: []
        }));

        groups.push({
            name: "General Resources",
            path: "category:General",
            type: "folder",
            isCategory: true,
            children: []
        });

        if (!contentTree || contentTree.length === 0) return groups;

        // Helper to distribute top-level items into groups based on keywords
        const distributeTopLevel = (nodes) => {
            nodes.forEach(node => {
                let matched = false;
                const nodeName = node.name.toLowerCase();

                // Check against each category's keywords
                for (let i = 0; i < aeCategories.length; i++) {
                    const cat = aeCategories[i];
                    if (cat.keywords.some(k => nodeName.includes(k.toLowerCase()))) {
                        groups[i].children.push(node);
                        matched = true;
                        break;
                    }
                }

                // If no match, put into General Resources (groups[5])
                if (!matched) {
                    groups[5].children.push(node);
                }
            });
        };

        distributeTopLevel(contentTree);
        return groups;
    }, [contentTree]);

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

    useEffect(() => {
        async function loadData() {
            setFetching(true)
            setCloudUnavailable(false)
            try {
                const res = await fetch(`${SERVER_URL}/cloud/available-content`)
                if (res.status === 503) {
                    setCloudUnavailable(true)
                    return
                }
                const data = await res.json()
                setContentTree(data)
                setCloudUnavailable(false)
            } catch (err) {
                console.error(err)
            } finally {
                setFetching(false)
            }
        }
        if (authenticated) loadData()
    }, [authenticated, refetch])

    const toggleCheckRecursive = (node, isChecked, newChecked = {}) => {
        newChecked[node.path] = isChecked;
        if (node.children) {
            node.children.forEach(child => toggleCheckRecursive(child, isChecked, newChecked));
        }
        return newChecked;
    };

    const handleCheck = (node, isChecked) => {
        setChecked(prev => {
            let updated = { ...prev };
            updated = toggleCheckRecursive(node, isChecked, updated);
            return updated;
        });
    };

    function getCheckedFiles(tree, checked) {
        let files = [];
        tree.forEach(node => {
            if (node.type === 'file' && checked[node.path]) {
                files.push(node.path);
            } else if (node.type === 'folder' && node.children) {
                files.push(...getCheckedFiles(node.children, checked));
            }
        });
        return files;
    }

    const [downloadStatus, setDownloadStatus] = useState({ status: 'init', percentage: 0, total: 0, completed: 0 });
    const [deleting, setDeleting] = useState(false);

    const performDownload = async (files) => {
        try {
            // Check if there's an active download
            let res = await fetch(`${SERVER_URL}/cloud/download-status`)
            let data0 = await res.json()
            if (data0.status === "downloading") {
                console.log("Another download in progress")
                return setDownloadStatus(data0)
            }

            setDownloadStatus({ status: "downloading", percentage: 0, total: files.length, completed: 0 })
            toast.info("Download started...");
            let response = await fetch(`${SERVER_URL}/cloud/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files })
            });
            let data = await response.json();
            console.log("responseeeee", data);
        } catch (err) {
            console.error(err);
            setDownloadStatus(prev => ({ ...prev, status: "failed" }))
            toast.error("An error occurred during download initialization.");
        }
    };

    const handleDownload = async () => {
        const selected = getCheckedFiles(contentTree, checked);
        if (selected.length === 0) {
            toast.error("Please select at least one file or folder to download.");
            return
        }

        // Check if any selected file is already downloaded
        const alreadyDownloaded = [];
        const findDownloaded = (tree, checkedPaths) => {
            tree.forEach(node => {
                if (checkedPaths.includes(node.path) && node.isDownloaded) {
                    alreadyDownloaded.push(node.name);
                }
                if (node.children) findDownloaded(node.children, checkedPaths);
            });
        };
        findDownloaded(contentTree, selected);

        if (alreadyDownloaded.length > 0) {
            setPendingSyncFiles(selected);
            setSyncConfirmOpen(true);
            return;
        }

        performDownload(selected);
    };

    const handleStopSync = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/cloud/stop-download`, { method: 'POST' });
            if (response.ok) {
                toast.success("Stopping sync...");
                setDownloadStatus(prev => ({ ...prev, status: "finished" }));
            } else {
                toast.error("Failed to stop sync.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while stopping sync.");
        }
    };

    const performDelete = async () => {
        const selectedPaths = Object.keys(checked).filter(path => checked[path] && !path.startsWith('category:'));
        setDeleting(true);
        try {
            const response = await fetch(`${SERVER_URL}/cloud/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paths: selectedPaths })
            });

            if (response.ok) {
                toast.success("Content deleted successfully");
                setChecked({});
                setRefetch(!refetch);
            } else {
                const data = await response.json();
                toast.error(`Delete failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while deleting content.");
        } finally {
            setDeleting(false);
            setDeleteConfirmOpen(false); // Close dialog after action
        }
    };

    const handleDelete = async () => {
        const selectedPaths = Object.keys(checked).filter(path => checked[path]);
        if (selectedPaths.length === 0) {
            toast.error("Please select at least one file or folder to delete.");
            return;
        }

        setDeleteConfirmOpen(true);
    };

    // Poll download status when download is in progress
    useEffect(() => {
        if (downloadStatus.status !== "downloading") return;

        const checkDownloadStatus = async () => {
            try {
                const res = await fetch(`${SERVER_URL}/cloud/download-status`);
                const data = await res.json();
                console.log("Download status check:", data.status, data.percentage);

                setDownloadStatus(data);

                if (data.status === "finished") {
                    toast.success("Download finished successfully!");
                    setRefetch(prev => !prev); // Refresh the tree to show downloaded status
                } else if (data.status === "failed") {
                    toast.error("Download failed.");
                }
            } catch (err) {
                console.error("Error checking download status:", err);
                setDownloadStatus(prev => ({ ...prev, status: "failed" }));
            }
        };

        // Check immediately, then poll every 1 second for smoother progress
        checkDownloadStatus();
        const intervalId = setInterval(checkDownloadStatus, 1000);

        return () => clearInterval(intervalId);
    }, [downloadStatus.status, SERVER_URL]);

    if (!authenticated) return <Unauthorized />

    return (
        <div>
            <ManageTitle title={"Sync content"} />

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={syncConfirmOpen}
                title="Items already downloaded"
                description="Some selected items are already downloaded and will be skipped. Do you want to proceed with the remaining items?"
                confirmText="Proceed"
                onConfirm={() => {
                    performDownload(pendingSyncFiles);
                    setSyncConfirmOpen(false);
                    setPendingSyncFiles([]);
                }}
                onClose={() => {
                    setSyncConfirmOpen(false);
                    setPendingSyncFiles([]);
                }}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                title="Delete Content"
                description={`Are you sure you want to delete ${Object.keys(checked).filter(path => checked[path] && !path.startsWith('category:')).length} items? This will remove files and database records.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={performDelete}
                onClose={() => setDeleteConfirmOpen(false)}
            />

            <div className={`flex ${(cloudUnavailable || fetching) ? "justify-center py-12" : "justify-end"}`}>
                <div className="flex flex-col gap-y-4 w-full max-w-2xl">
                    {cloudUnavailable && (
                        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <CloudOff className="w-8 h-8 text-rose-500" />
                            </div>
                            <div>
                                <Typography weight="black" className="text-rose-900 text-lg uppercase tracking-tight">
                                    Cloud Server Unreachable
                                </Typography>
                                <Typography className="text-rose-600/80 text-sm max-w-sm mx-auto">
                                    We couldn't establish a connection with the remote content server. Please ensure your internet connection is active or try again later.
                                </Typography>
                            </div>
                            <Button
                                onClick={() => setRefetch(!refetch)}
                                disabled={fetching}
                                className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-8 h-12 gap-2 shadow-lg shadow-rose-200 transition-all active:scale-95"
                            >
                                <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
                                <Typography weight="bold" className="text-sm">
                                    {fetching ? "Reconnecting..." : "Try Reconnecting"}
                                </Typography>
                            </Button>
                        </div>
                    )}

                    {fetching && !cloudUnavailable && (
                        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-sm animate-pulse">
                            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                            <Typography weight="bold" className="text-blue-900">
                                Synchronizing with Cloud...
                            </Typography>
                        </div>
                    )}

                    {downloadStatus.status !== "init" && (
                        <div className="bg-white/50 border border-gray-100 rounded-lg p-3 shadow-sm mb-2">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-sm text-gray-600 font-medium">
                                    Sync Status: <span className={`font-bold ${downloadStatus.status === "finished" ? "text-accent-lighter" : downloadStatus.status === "failed" ? "text-red-600" : "text-blue-600"}`}>
                                        {downloadStatus.status === "downloading" ? `Syncing... ${downloadStatus.percentage}%` : downloadStatus.status}
                                    </span>
                                </p>
                                {downloadStatus.status === "downloading" && (
                                    <p className="text-[10px] text-gray-400">
                                        {downloadStatus.completed} / {downloadStatus.total} files
                                    </p>
                                )}
                            </div>
                            <Progress value={downloadStatus.percentage} className="h-2 bg-gray-100" />
                        </div>
                    )
                    }
                    <div className="flex gap-x-2 justify-end">
                        {!cloudUnavailable && !fetching && (
                            <>
                                <Button
                                    onClick={handleDownload}
                                    disabled={downloadStatus.status === "downloading"}
                                    className="mt-2 mb-4 w-fit h-10 ring-0 hover:ring-0"
                                >
                                    Download content
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="mt-2 mb-4 w-fit h-10 ring-0 hover:ring-0"
                                >
                                    {deleting ? "Deleting..." : "Delete selected"}
                                </Button>
                            </>
                        )}
                        {downloadStatus.status === "downloading" && (
                            <Button
                                variant="outline"
                                onClick={handleStopSync}
                                className="mt-2 mb-4 w-fit h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                Stop syncing
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-4">
                {groupedTree.map((node, i) => (
                    <TreeNode
                        key={i}
                        node={node}
                        onCheck={handleCheck}
                        checked={checked}
                    />
                ))}
            </div>
        </div>
    )
}

export default ManageContent;
