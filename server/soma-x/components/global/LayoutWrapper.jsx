"use client"
import { usePathname } from 'next/navigation';
import Nav from "@/components/global/Nav";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isPublicPage = pathname === '/' || pathname === '/setup';

    return (
        <div className="flex min-h-screen">
            <Nav />
            <div className={`w-full flex-1 h-full ${!isPublicPage ? 'md:ml-20 global-horizontal-padding' : ''}`}>
                {children}
            </div>
        </div>
    );
}
