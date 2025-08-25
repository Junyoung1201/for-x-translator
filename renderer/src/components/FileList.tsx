import fs from 'fs/promises';
import path from 'path';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { gameSelector } from 'store/game';
import FileItem from './FileItem';
import './FileList.css';

export default function FileList() {

    const { translationDir } = useSelector(gameSelector);
    const [searchText, setSearchText] = useState<string>();
    const [fileList, setFileList] = useState<{
        name: string
    }[]>([]);

    useEffect(() => {
        getFileList();
    }, [])

    async function getFileList() {
        const _fileList = (

            await fs.readdir(translationDir, { withFileTypes: true })

        ).filter(file => file.isFile() && path.extname(file.name) === '.txt');

        if (_fileList) {
            setFileList(_fileList);
        }
    }

    function onChangeSearchText(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchText(e.currentTarget.value);
    }

    return <div className="file-list">
        <div className='search'>
            <input type='text' placeholder='검색어 입력' onChange={onChangeSearchText} />
        </div>

        {
            fileList
                .filter(file => {

                    // 검색어 없으면 무조건 통과
                    if (!searchText) {
                        return true;
                    }

                    // 검색어에 공백이 있으면 -> 공백을 기준으로 한 키워드 목록이 모두 포함되어 있어야함
                    if (searchText.includes(" ")) {
                        if (searchText.split(" ").some(word => !file.name.includes(word))) {
                            return false;
                        }

                        return true;
                    } else {
                        return file.name.includes(searchText);
                    }
                })
                .map((file, i) => (
                    <FileItem
                        key={`file_item_${i}`}
                        name={file.name}
                    />
                ))
        }
    </div>
}