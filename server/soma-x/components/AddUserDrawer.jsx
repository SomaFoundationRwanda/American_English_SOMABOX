"use client";

import { useState, useEffect } from "react";
import { HelpCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import Typography from "@/components/ui/Typography";
import Input from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const roles = [
    {
        value: "teacher",
        label: "Teacher",
    },
    {
        value: "admin",
        label: "Admin",
    }
];

import { Loader2 } from "lucide-react";

export function AddUserDrawer({ user, trigger, onSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedDomain, setSelectedDomain] = useState("teacher");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setEmail(user.email || "");
            setSelectedDomain(user.role || "teacher");
            setPassword(""); // Don't pre-fill password for security
        } else {
            setEmail("");
            setSelectedDomain("teacher");
            setPassword("");
        }
    }, [user]);

    const handleClick = async () => {
        try {
            if (!email || (!user && !password) || !selectedDomain) {
                alert("Please fill in all fields");
                return;
            }
            // Verify email format
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address");
                return;
            }

            setLoading(true);
            const url = user
                ? `${process.env.NEXT_PUBLIC_SERVER_URL}/users/${user.id}`
                : `${process.env.NEXT_PUBLIC_SERVER_URL}/users`;

            const method = user ? "PATCH" : "POST";

            const body = {
                email,
                role: selectedDomain,
            };
            if (password) body.password = password;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Failed to ${user ? 'update' : 'add'} user`);
            }
            alert(`User ${user ? 'updated' : 'added'} successfully`);

            if (!user) {
                setEmail("");
                setPassword("");
                setSelectedDomain("teacher");
            }

            if (onSuccess) onSuccess();

            console.log(data)
        } catch (error) {
            alert(error.message);
            console.error(`Error ${user ? 'updating' : 'adding'} user:`, error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                {trigger}
            </DrawerTrigger>

            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>{user ? "Edit User" : "Add User"}</DrawerTitle>
                        <DrawerDescription>
                            {user ? "Update user's credentials" : "Add new user's credentials"}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 pb-0 space-y-[24px]">
                        <hr />

                        <div className="space-y-4">
                            <Typography weight="medium" color="gray_900" className="mb-2">
                                Select role
                            </Typography>

                            <Input
                                id="select-domain"
                                variant="select"
                                placeholder="Select your domain"
                                value={selectedDomain}
                                onChange={(value) => setSelectedDomain(value)}
                                options={roles}
                                disabled={loading}
                            />
                            <Typography weight="medium" color="gray_900" className="mb-2">
                                Email
                            </Typography>
                            <Input
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={(value) => setEmail(value)}
                                disabled={loading}
                            />
                            <Typography weight="medium" color="gray_900" className="mb-2">
                                {user ? "New Password (leave blank to keep current)" : "Password"}
                            </Typography>
                            <Input
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(value) => setPassword(value)}
                                disabled={loading}
                            />
                        </div>

                        <hr />
                    </div>

                    <DrawerFooter>
                        <div className="flex justify-between gap-2">
                            <DrawerClose asChild className={`w-1/2`}>
                                <Button width={`w-full`} variant="outline" disabled={loading}>Cancel</Button>
                            </DrawerClose>

                            <Button
                                className={"w-1/2"}
                                disabled={loading || !email || (!user && !password) || !selectedDomain}
                                onClick={handleClick}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {user ? "Update" : "Add"}
                            </Button>
                        </div>

                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
