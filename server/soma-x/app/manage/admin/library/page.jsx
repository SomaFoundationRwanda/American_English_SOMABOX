"use client"
import Unauthorized from "@/components/sections/Unauthorized";
import DataContext from "@/context/DataContext";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import ManageTitle from "@/components/manage/ManageTitle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import UploadBookModal from "@/components/ui/UploadBookModal";
import { Plus } from "lucide-react";

const ManageLibrary = () => {
    const { authenticated } = useContext(DataContext);
    const [localBooks, setLocalBooks] = useState([]);

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL
    const [fetching, setFetching] = useState(false)
    const [books, setBooks] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState({});
    const [downloadStatus, setDownloadStatus] = useState('init');

    // Dialog state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    async function loadLocalBooks() {
        try {
            const res = await fetch(`${SERVER_URL}/library/books`);
            if (res.ok) {
                const data = await res.json();
                setLocalBooks(data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        async function loadBooks() {
            setFetching(true);
            try {
                console.log(`Fetching books from: ${SERVER_URL}/library/available-books`);
                const res = await fetch(`${SERVER_URL}/library/available-books`);
                console.log(`Response status: ${res.status}`);
                if (res.ok) {
                    const data = await res.json();
                    console.log(`Received ${data.length} books`);
                    setBooks(data);
                } else {
                    const errorText = await res.text();
                    console.error(`Failed to fetch books: ${errorText}`);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setFetching(false);
            }
        }
        if (authenticated) {
            loadBooks();
            loadLocalBooks();
        }
    }, [authenticated, SERVER_URL]);

    const handleCheck = (book, isChecked) => {
        setSelectedBooks(prev => ({
            ...prev,
            [book.id]: isChecked ? book : null
        }));
    };

    const handleDownload = async () => {
        const selected = Object.values(selectedBooks).filter(Boolean);
        if (selected.length === 0) {
            toast.error("Please select at least one book to download.");
            return;
        }

        try {
            setDownloadStatus("downloading");
            toast.info("Download started. You'll be notified when it's finished.");
            await fetch(`${SERVER_URL}/library/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ books: selected })
            });
        } catch (err) {
            console.error(err);
            setDownloadStatus("failed");
            toast.error("Download failed. Please try again.");
        }
    };

    const performDelete = async () => {
        if (!pendingDeleteId) return;
        try {
            const res = await fetch(`${SERVER_URL}/library/book/${pendingDeleteId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Book deleted successfully");
                loadLocalBooks();
            } else {
                toast.error("Failed to delete book");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while deleting the book");
        } finally {
            setPendingDeleteId(null);
        }
    }

    const handleDelete = async (id) => {
        setPendingDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    useEffect(() => {
        if (downloadStatus !== "downloading") return;

        const intervalId = setInterval(async () => {
            try {
                const res = await fetch(`${SERVER_URL}/library/download-status`);
                const data = await res.json();
                if (data.status === "finished" || data.status === "failed") {
                    setDownloadStatus(data.status);
                    if (data.status === "finished") {
                        toast.success("All books downloaded successfully!");
                        loadLocalBooks();
                    } else {
                        toast.error("Download failed.");
                    }
                    clearInterval(intervalId);
                }
            } catch (err) {
                console.error(err);
            }
        }, 2000);

        return () => clearInterval(intervalId);
    }, [downloadStatus, SERVER_URL]);

    if (!authenticated) return <Unauthorized />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center">
                <ManageTitle title={"Manage Library"} />
                <Button
                    onClick={() => setUploadModalOpen(true)}
                    className="bg-[#00274c] text-white hover:bg-[#00274c]/90 ring-0 flex items-center gap-2 px-6 h-10 rounded-xl shadow-lg shadow-[#00274c]/10"
                >
                    <Plus size={18} />
                    Upload New Book
                </Button>
            </div>

            <UploadBookModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUploadSuccess={loadLocalBooks}
                SERVER_URL={SERVER_URL}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                title="Delete Book"
                description="Are you sure you want to delete this book? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={performDelete}
                onClose={() => setDeleteConfirmOpen(false)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Available Books Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Available on Cloud</h2>
                        <div className="flex flex-col items-end gap-2">
                            {downloadStatus !== "init" && (
                                <p className="text-sm font-medium">
                                    Status: <span className={downloadStatus === "finished" ? "text-green-600" : "text-blue-600"}>{downloadStatus}</span>
                                </p>
                            )}
                            <Button
                                onClick={handleDownload}
                                disabled={downloadStatus === "downloading"}
                                className="px-4 py-2 w-fit h-9 ring-0 hover:ring-0 text-sm"
                            >
                                {downloadStatus === "downloading" ? "Downloading..." : "Download Selected"}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">Select</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fetching ? (
                                        <tr><td colSpan="2" className="px-4 py-4 text-center text-sm text-gray-500">Loading books...</td></tr>
                                    ) : books.map((book) => (
                                        <tr key={book.id} className={localBooks.some(lb => lb.id === parseInt(book.id)) ? "bg-green-50" : ""}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Checkbox
                                                    disabled={localBooks.some(lb => lb.id === parseInt(book.id))}
                                                    onCheckedChange={(checked) => handleCheck(book, checked)}
                                                    checked={!!selectedBooks[book.id]}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                <div className="font-medium">{book.book_name}</div>
                                                <div className="text-xs text-gray-500">{book.categories}</div>
                                                {localBooks.some(lb => lb.id === parseInt(book.id)) && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded mt-1 inline-block">Downloaded</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Local Books Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Downloaded Books</h2>
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {localBooks.length === 0 ? (
                                        <tr><td colSpan="2" className="px-4 py-4 text-center text-sm text-gray-500">No books downloaded yet.</td></tr>
                                    ) : localBooks.map((book) => (
                                        <tr key={book.id}>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                <div className="font-medium">{book.name}</div>
                                                <div className="text-xs text-gray-500">{book.category_ids}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleDelete(book.id)}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium h-auto p-0 hover:bg-transparent normal-case ring-0"
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageLibrary;
