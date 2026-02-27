"use client"
import HeaderSection from "@/components/ui/HeaderSection";
import AdminOption from "../AdminOption";
import Unauthorized from "@/components/sections/Unauthorized";
import { useContext, useMemo } from "react";
import DataContext from "@/context/DataContext";
import { useLanguage } from '@/context/LanguageContext';
import { AddUserDrawer } from "@/components/AddUserDrawer";
import { Button } from "@/components/ui/button";
import Users from "./comps/Users";
import { RefreshCcw, LayoutDashboard, Library, Users as UsersIcon, Plus } from "lucide-react";
import Typography from "@/components/ui/Typography";

const AdminPortal = () => {
    const { t } = useLanguage();
    const { authenticated, role, unshiftString } = useContext(DataContext);
    const userRole = unshiftString(role);

    const options = useMemo(() => [
        {
            title: t("AdminManageOptions.syncTitle"),
            subtitle: t("AdminManageOptions.syncSubtitle"),
            href: "/manage/admin/sync",
            icon: RefreshCcw,
            allowedRoles: ['admin']
        },
        {
            title: t("AdminManageOptions.contentTitle"),
            subtitle: t("AdminManageOptions.contentSubtitle"),
            href: "/manage/admin/manage-content",
            icon: LayoutDashboard,
            allowedRoles: ['admin', 'teacher']
        },
        {
            title: "Manage Library",
            subtitle: "Download and manage books from the cloud",
            href: "/manage/admin/library",
            icon: Library,
            allowedRoles: ['admin']
        }
    ].filter(option => option.allowedRoles.includes(userRole)), [t, userRole]);

    if (!authenticated) return <Unauthorized />;

    return (
        <div className="min-h-screen bg-slate-50 md:bg-transparent pb-12">
            {/* <HeaderSection
                title={t("manageOptions.adminTitle") || "Admin Portal"}
                subtitle={t("manageOptions.adminSubtitle") || "Manage system content, users, and synchronization."}
            /> */}

            <div className="px-4 md:px-0 flex flex-col gap-8 mt-6">
                {/* Options Grid */}
                <div className="flex flex-wrap gap-6 justify-start">
                    {options.map((option, index) => (
                        <AdminOption key={index} {...option} />
                    ))}
                </div>

                {/* Users Management Section */}
                {userRole === 'admin' && (
                    <div className="w-full max-w-4xl bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-inner overflow-hidden">
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent-light-3 rounded-lg">
                                        <UsersIcon className="w-5 h-5 text-accent-dark" />
                                    </div>
                                    <Typography variant="h3">
                                        {t("AdminTable.tableTitle")}
                                    </Typography>
                                </div>
                                <AddUserDrawer
                                    trigger={
                                        <Button className="h-11 px-6 gap-2 shadow-md hover:shadow-lg transition-all">
                                            <Plus className="w-4 h-4" />
                                            {t("AdminTable.tableButton")}
                                        </Button>
                                    }
                                />
                            </div>

                            <div className="bg-white/60 rounded-xl border border-slate-200/40 min-h-[400px]">
                                <Users />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPortal;
