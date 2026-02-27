"use client"
import { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const DataContext = createContext();

export default DataContext

// Helper functions for basic obfuscation
const shiftString = (str) => {
    if (!str) return '';
    return str.split('').map(ch => {
        if (/[a-z]/.test(ch)) {
            return String.fromCharCode((ch.charCodeAt(0) - 97 + 1) % 26 + 97);
        } else if (/[A-Z]/.test(ch)) {
            return String.fromCharCode((ch.charCodeAt(0) - 65 + 1) % 26 + 65);
        }
        return ch;
    }).join('');
}

const unshiftString = (str) => {
    if (!str) return '';
    return str.split('').map(ch => {
        if (/[a-z]/.test(ch)) {
            return String.fromCharCode((ch.charCodeAt(0) - 97 + 25) % 26 + 97);
        } else if (/[A-Z]/.test(ch)) {
            return String.fromCharCode((ch.charCodeAt(0) - 65 + 25) % 26 + 65);
        }
        return ch;
    }).join('');
}

export function DataProvider({ children }) {
    const [summaryData, setSummaryData] = useState(null);
    const [mainCategories, setMainCategories] = useState(null);
    const [customContentSummary, setCustomContentSummary] = useState(null);
    const [role, setRole] = useState("");
    const [authenticated, setAuthenticated] = useState(false);

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

    // Fetch data on mount
    useEffect(() => {
        const loadAllData = async () => {
            try {
                // Fetch basic summary
                const summaryRes = await fetch(`${SERVER_URL}/content/levels/summary`);
                if (summaryRes.ok) setSummaryData(await summaryRes.json());
                else throw new Error("Server error");

                // Fetch main categories
                const categoriesRes = await fetch(`${SERVER_URL}/content/main-categories`);
                if (categoriesRes.ok) setMainCategories(await categoriesRes.json());

                // Fetch custom content summary
                const customSummaryRes = await fetch(`${SERVER_URL}/content/custom-content/summary`);
                if (customSummaryRes.ok) setCustomContentSummary(await customSummaryRes.json());
            } catch (error) {
                console.error("Data fetching error:", error);
                toast.error("Network error: Could not reach the server. Some content may not be available.");
            }
        };

        loadAllData();
    }, [SERVER_URL]);

    // Auth verification
    useEffect(() => {
        const verifyAuth = () => {
            const storedAl = localStorage.getItem('al');
            const storedGh = localStorage.getItem('gh');

            if (!storedAl || !storedGh) {
                setAuthenticated(false);
                setRole("");
                return;
            }

            try {
                const decryptedRole = unshiftString(storedGh);
                const allowedRoles = ['admin', 'teacher'];

                if (allowedRoles.includes(decryptedRole)) {
                    setRole(storedGh);
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                    setRole("");
                }
            } catch (error) {
                setAuthenticated(false);
                setRole("");
            }
        };

        verifyAuth();
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('al');
        localStorage.removeItem('gh');
        setAuthenticated(false);
        setRole("");
        window.location.href = '/';
    }, []);

    const contextData = {
        summaryData,
        setSummaryData,
        mainCategories,
        setMainCategories,
        customContentSummary,
        setCustomContentSummary,
        authenticated,
        setAuthenticated,
        role,
        setRole,
        shiftString,
        unshiftString,
        logout,
        SERVER_URL
    };

    return (
        <DataContext.Provider value={contextData}>
            {children}
        </DataContext.Provider>
    );
}
