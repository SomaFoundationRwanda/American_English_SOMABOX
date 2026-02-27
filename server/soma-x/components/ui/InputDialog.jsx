"use client";

import React, { useState } from 'react';
import ModalOverlay from './ModelOverlay';
import { Button } from './button';
import Input from './input';
import Typography from './Typography';

const InputDialog = ({ isOpen, title, label, placeholder, defaultValue = "", onConfirm, onClose, confirmText = "Save", cancelText = "Cancel" }) => {
    const [value, setValue] = useState(defaultValue);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(value);
        setValue("");
        onClose();
    };

    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-4">
                <Typography variant="h3" className="mb-4">{title}</Typography>
                <div className="mb-6">
                    {label && <Typography variant="label" className="mb-2 block">{label}</Typography>}
                    <Input
                        id="dialog-input"
                        value={value}
                        onChange={(val) => setValue(val)}
                        placeholder={placeholder}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirm();
                        }}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="ring-0">
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="ring-0"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
};

export default InputDialog;
