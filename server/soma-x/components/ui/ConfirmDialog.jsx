"use client";

import React from 'react';
import ModalOverlay from './ModelOverlay';
import { Button } from './button';
import Typography from './Typography';

const ConfirmDialog = ({ isOpen, title, description, onConfirm, onClose, confirmText = "Confirm", cancelText = "Cancel", variant = "default" }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-4">
                <Typography variant="h3" className="mb-2">{title}</Typography>
                <Typography variant="body" color="muted" className="mb-6">
                    {description}
                </Typography>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="ring-0">
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="ring-0"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
};

export default ConfirmDialog;
