import { File, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

const FileRow = ({ file, onOpenFolder, onToggleVisibility }) => {
    const handleRowClick = () => {
        if (file.type === 'folder') {
            onOpenFolder?.(file);
        }
    };
    const handleToggle = (e) => {
        e.stopPropagation();
        onToggleVisibility?.(file, !file.is_disabled);
    };
    function formatBytes(bytes) {
        if (!bytes || isNaN(bytes)) return "--";

        const units = ["B", "KB", "MB", "GB", "TB"];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleRowClick}>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    {file.type === 'folder' ? (
                        <Folder className="w-6 h-6 text-gray-600" />
                    ) : (
                        <File className="w-6 h-6 text-gray-600" />
                    )}
                    <span className="font-medium text-gray-900">{file.name}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-gray-600">--</td>
            <td className="px-6 py-4 text-gray-600">{file.size ? formatBytes(file.size) : '--'}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded ${file.is_disabled
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                            }`}
                    >
                        {file.is_disabled ? 'Hidden' : 'Visible'}
                    </span>
                    <Button
                        size="sm"
                        variant={file.is_disabled ? 'success' : 'destructive'}
                        onClick={handleToggle}
                        aria-label="Toggle visibility"
                        className="text-xs h-7 px-2"
                    >
                        {file.is_disabled ? 'Enable' : 'Disable'}
                    </Button>
                </div>
            </td>
        </tr>
    );
};
export default FileRow;