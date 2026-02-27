import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowLeftIcon } from "lucide-react";

const ManageTitle = ({ title }) => {
    return (
        <div className="flex items-center gap-x-2">
            <Link href="/manage/admin" tabIndex={-1}>
                <Button variant="default" className="ring-0 h-9">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </Link>
            <h2 className={`heading-2`}>
                {title}
            </h2>
        </div>
    );
}

export default ManageTitle;