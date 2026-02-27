"use client"
import HeaderSection from "@/components/ui/HeaderSection";
import AdminOption from "../AdminOption";
import { useLanguage } from '@/context/LanguageContext';
import { useMemo } from "react";
import { BookOpen, LayoutDashboard, Library, Settings, Info } from "lucide-react";
import Typography from "@/components/ui/Typography";

const TeacherPortal = () => {
    const { t } = useLanguage();

    const options = useMemo(() => [
        {
            title: t("manageOptions.classesTitle"),
            subtitle: t("manageOptions.classesSubtitle"),
            href: "/manage/teacher/classes",
            icon: BookOpen
        },
        {
            title: t("manageOptions.contentTitle"),
            subtitle: t("manageOptions.contentSubtitle"),
            href: "/manage/admin/manage-content",
            icon: LayoutDashboard
        },
        {
            title: "Manage Library",
            subtitle: "Access and organize school digital assets",
            href: "/manage/admin/library",
            icon: Library
        },
        {
            title: t("manageOptions.preferenceTitle"),
            subtitle: t("manageOptions.preferenceSubtitle"),
            href: "/manage/teacher/preferences",
            icon: Settings
        },
        {
            title: t("manageOptions.manualTitle"),
            subtitle: t("manageOptions.manualSubtitle"),
            href: "/manage/teacher/user-manual",
            icon: Info
        }
    ], [t]);

    return (
        <div className="min-h-screen bg-slate-50 md:bg-transparent pb-12">
            <HeaderSection
                title={t("manageOptions.teacherTitle") || "Teacher Portal"}
                subtitle={t("manageOptions.teacherSubtitle") || "Manage your classes and curriculum content."}
            />

            <div className="px-4 md:px-0 flex flex-col gap-8 mt-6">
                <div className="flex flex-wrap gap-6 justify-start">
                    {options.map((option, index) => (
                        <AdminOption key={index} {...option} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TeacherPortal;
