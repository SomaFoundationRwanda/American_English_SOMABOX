"use client";

import React, { useState } from 'react';
import ModalOverlay from './ModelOverlay';
import { Button } from './button';
import Input from './input';
import Typography from './Typography';
import { toast } from 'sonner';

const UploadBookModal = ({ isOpen, onClose, onUploadSuccess, SERVER_URL }) => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [categories, setCategories] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Auto-fill name from filename without extension
            const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
            setName(fileName);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('categories', categories);

        try {
            const res = await fetch(`${SERVER_URL}/library/upload`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                toast.success("Book uploaded successfully");
                onUploadSuccess();
                onClose();
                // Reset form
                setFile(null);
                setName("");
                setCategories("");
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to upload book");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-6 min-w-[400px]">
                <Typography variant="h3" className="mb-6 font-bold text-[#00274c]">Upload New Book</Typography>

                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select EPUB or PDF File</label>
                        <input
                            type="file"
                            accept=".epub,.pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-[#00274c]/5 file:text-[#00274c]
                                hover:file:bg-[#00274c]/10 transition-all cursor-pointer"
                        />
                    </div>

                    <Input
                        id="book-name"
                        label="Book Name"
                        placeholder="Enter book title"
                        value={name}
                        onChange={(val) => setName(val)}
                    />

                    <Input
                        id="book-categories"
                        label="Categories (comma separated)"
                        placeholder="e.g. Fiction, Education, History"
                        value={categories}
                        onChange={(val) => setCategories(val)}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={onClose} className="ring-0">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading || !file}
                            className="bg-[#00274c] text-white hover:bg-[#00274c]/90 ring-0 px-8"
                        >
                            {isUploading ? "Uploading..." : "Upload Book"}
                        </Button>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
};

export default UploadBookModal;
