import path from "path";
import { memo } from "react";
import { useSelector } from "react-redux"
import { gameSelector, setSelectedFile } from "store/game";
import { store } from "store/store";

function FileItem({
    name
}: {
    name: string
}) {

    const {translationDir} = useSelector(gameSelector);
    
    function onClick() {
        store.dispatch(setSelectedFile(path.join(translationDir, name)));
    }

    return <div className="file-item" onClick={onClick}>
        <div className="name">{
            name.slice(0, name.lastIndexOf("."))
        }</div>
    </div>
}

export default memo(FileItem)