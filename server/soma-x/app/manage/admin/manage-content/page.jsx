import FileManager from "@/components/manage/fileManager/MainFileManager";
import ManageTitle from "@/components/manage/ManageTitle";

const ManageContent = () => {
    return ( 
        <div>
            <ManageTitle title="Manage content" />
            <FileManager />
        </div>
     );
}
 
export default ManageContent;