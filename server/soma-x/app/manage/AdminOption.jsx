import Typography from "@/components/ui/Typography";
import Link from "next/link";

const AdminOption = ({ title, subtitle, href, icon: Icon }) => {
    return (
        <Link href={href} className="px-5 py-8 md:px-6 md:py-10 w-full sm:w-[48%] md:w-[31%] xl:w-[23%] rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 group flex flex-col gap-4">
            {Icon && (
                <div className="w-12 h-12 rounded-xl bg-accent-light-3/50 flex items-center justify-center text-accent-dark group-hover:bg-accent-dark group-hover:text-white transition-all duration-300 shadow-inner">
                    <Icon size={24} />
                </div>
            )}
            <div className="space-y-1">
                <Typography variant="h4" color="accent" className="group-hover:translate-x-1 transition-transform duration-300">
                    {title}
                </Typography>
                <Typography variant="muted" className="group-hover:translate-x-1 transition-transform duration-300">
                    {subtitle}
                </Typography>
            </div>
        </Link>
    );
}

export default AdminOption;