"use client";

import React, { useState, useEffect } from 'react';
import ModalOverlay from '../ui/ModelOverlay';
import { Button } from '../ui/button';
import Input from '../ui/input';
import Typography from '../ui/Typography';
import { toast } from 'sonner';

const OnboardingModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

    useEffect(() => {
        const checkSetupStatus = async () => {
            try {
                const res = await fetch(`${SERVER_URL}/auth/setup-status`);
                const data = await res.json();
                if (data.setup_done === false) {
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Failed to check setup status:", error);
            }
        };
        checkSetupStatus();
    }, [SERVER_URL]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${SERVER_URL}/auth/setup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("System setup successful!");
                setIsOpen(false);
            } else {
                toast.error(data.message || "Setup failed");
            }
        } catch (error) {
            console.error("Setup error:", error);
            toast.error("Could not connect to the server");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <div className="p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <Typography variant="h2" className="text-[#00274c] font-black tracking-tighter mb-2">
                        System Setup
                    </Typography>
                    <Typography variant="muted" className="text-slate-500 font-medium">
                        Welcome to SomaBox. Please create your primary administrator account to continue.
                    </Typography>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Typography variant="label" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Admin Email
                        </Typography>
                        <Input
                            type="email"
                            placeholder="admin@example.com"
                            required
                            value={formData.email}
                            onChange={(val) => setFormData({ ...formData, email: val })}
                            className="bg-slate-100 border-none h-12 rounded-xl px-4 text-accent-dark font-bold focus:ring-2 focus:ring-accent-dark/20 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <Typography variant="label" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Password
                        </Typography>
                        <Input
                            type="password"
                            variant="password"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={(val) => setFormData({ ...formData, password: val })}
                            className="bg-slate-100 border-none h-12 rounded-xl px-4 text-accent-dark font-bold focus:ring-2 focus:ring-accent-dark/20 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <Typography variant="label" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Confirm Password
                        </Typography>
                        <Input
                            type="password"
                            variant="password"
                            placeholder="••••••••"
                            required
                            value={formData.confirmPassword}
                            onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
                            className="bg-slate-100 border-none h-12 rounded-xl px-4 text-accent-dark font-bold focus:ring-2 focus:ring-accent-dark/20 transition-all"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-14 bg-[#00274c] hover:bg-[#001a33] text-[#ffcc33] font-black uppercase tracking-widest rounded-xl shadow-xl transition-all active:scale-95"
                    >
                        {loading ? "Initializing..." : "Complete Setup"}
                    </Button>
                </form>

                <Typography variant="muted" className="mt-6 text-[10px] text-center opacity-40 font-bold uppercase tracking-widest">
                    This is a one-time setup process
                </Typography>
            </div>
        </ModalOverlay>
    );
};

export default OnboardingModal;
