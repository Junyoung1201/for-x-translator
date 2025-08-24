import fs from 'fs/promises';
import path from 'path';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { gameSelector } from 'store/game';
import FileItem from './FileItem';
import './FileList.css';

export default function FileList() {

    const {translationDir} = useSelector(gameSelector);
    const [fileList,setFileList] = useState<{
        name: string
    }[]>([]);

    useEffect(() => {
        getFileList();
    },[])
    
    async function getFileList() {
        const _fileList = (

            await fs.readdir(translationDir, { withFileTypes: true })

        ).filter(file => file.isFile() && path.extname(file.name) === '.txt');

        if(_fileList) {
            setFileList(_fileList);
        }
    }

    return <div className="file-list">
        {
            fileList.map((file,i) => (
                <FileItem 
                    key={`file_item_${i}`}
                    name={file.name}
                />
            ))
        }
    </div>
}