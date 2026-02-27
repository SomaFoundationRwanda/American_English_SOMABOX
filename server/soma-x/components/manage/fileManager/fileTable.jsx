import FileRow from './fileRow';
const FileTable = ({ files, loading, onOpenFolder, onToggleVisibility }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Added by</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Size</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Visibility</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="px-6 py-8 text-gray-500" colSpan={4}>Loading...</td>
                        </tr>
                    ) : files.length === 0 ? (
                        <tr>
                            <td className="px-6 py-8 text-gray-500" colSpan={4}>No items</td>
                        </tr>
                    ) : (
                        files.map((file) => (
                            <FileRow key={file.id} file={file} onOpenFolder={onOpenFolder} onToggleVisibility={onToggleVisibility} />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
export default FileTable;