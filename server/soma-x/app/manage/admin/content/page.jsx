"use client"
import Link from "next/link";
import { useLanguage } from '@/context/LanguageContext';

const ManageContent = () => {
    const { t, setLang, lang } = useLanguage();
    return ( 
        <div>
            <div className="flex items-center gap-x-2">
                <Link href="/manage/admin" className={`bg-accent-lighter text-white px-4 py-2 rounded-full hover:bg-accent-light cursor-pointer block w-fit my-3`}>
                    Back
                </Link>
                <h2 className={`heading-2`}>Manage content</h2>
            </div>
        </div>
    );
}

export default ManageContent;