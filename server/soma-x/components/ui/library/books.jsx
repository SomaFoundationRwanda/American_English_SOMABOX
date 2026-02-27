import { useEffect, useState } from "react";
import EpubReader from "./EpubReader";
import Typography from "@/components/ui/Typography";
import UniversalPlayerModal from "@/components/ui/UniversalPlayerModal";

const BooksPage = ({ selectedFilters, searchQuery }) => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

    useEffect(() => {
        async function loadBooks() {
            try {
                const res = await fetch(`${SERVER_URL}/library/books`);
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);
                }
            } catch (err) {
                console.error(err);
            }
        }
        loadBooks();
    }, [SERVER_URL]);

    const filteredBooks = books.filter(book => {
        // Filter by search query
        if (searchQuery && !book.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Filter by categories
        if (selectedFilters.subjects?.length > 0) {
            const bookCats = book.category_ids.split(',').map(c => c.trim().toLowerCase());
            if (!bookCats.some(cat => selectedFilters.subjects.map(s => s.toLowerCase()).includes(cat))) return false;
        }

        return true;
    });

    const openBook = (book) => {
        setSelectedBook(book);
        setIsPlayerOpen(true);
    };

    return (
        <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 mt-[9rem] mb-[3rem] md:mb-0 md:mt-0 p-4 md:p-6 mx-3 rounded-xl bg-accent-background">
                {filteredBooks.map((item, index) => (
                    <div
                        key={index}
                        className="w-75 h-fit relative left-1/2 -translate-x-1/2 cursor-pointer group bg-gray-300 p-1"
                        onClick={() => openBook(item)}
                    >
                        <img src={SERVER_URL + "/library-book-covers/" + item.id + ".avif"} alt={item.name} />
                        {console.log(SERVER_URL + "/library-book-covers/" + item.id + ".avif")}
                    </div>
                ))}

                {/* Show message if no books match */}
                {filteredBooks.length === 0 && (
                    <Typography variant="body" color="muted" className="text-center col-span-full py-12">
                        No books found matching your criteria.
                    </Typography>
                )}
            </div>

            {/* Reader/Player Modals */}
            {selectedBook && selectedBook.type === 'epub' && isPlayerOpen && (
                <EpubReader
                    url={`${SERVER_URL}/library/file/${selectedBook.id}`}
                    title={selectedBook.name}
                    onClose={() => setIsPlayerOpen(false)}
                />
            )}

            {selectedBook && selectedBook.type === 'pdf' && (
                <UniversalPlayerModal
                    isOpen={isPlayerOpen}
                    onClose={() => setIsPlayerOpen(false)}
                    mediaItem={{
                        id: selectedBook.id,
                        title: selectedBook.name,
                        type: 'pdf',
                        pdf_url: `${SERVER_URL}/library/file/${selectedBook.id}`,
                        url: `${SERVER_URL}/library/file/${selectedBook.id}`
                    }}
                />
            )}
        </div>
    );
}

export default BooksPage;
