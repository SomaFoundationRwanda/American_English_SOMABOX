import { AddUserDrawer } from "@/components/AddUserDrawer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";

const Users = () => {

    const { t } = useLanguage();
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json();
        console.log(data)
        setUsers(data);
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {t("AdminTable.tableEmail")}
                        </th>
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {t("AdminTable.tableRole")}
                        </th>
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {t("AdminTable.TableManage")}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map((user, index) => (
                        <tr key={user.id || index} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4">
                                <span className="font-medium text-slate-700">{user.email}</span>
                            </td>
                            <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {t(`role.${user.role}`)}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <AddUserDrawer
                                    user={user}
                                    onSuccess={fetchUsers}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 px-4 rounded-lg bg-slate-100/50 hover:bg-accent-dark hover:text-white border-none transition-all font-bold"
                                        >
                                            {t("AdminTable.TableManage")}
                                        </Button>
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Users;