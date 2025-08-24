import { useSelector } from "react-redux";
import { gameSelector, setSelectedFile } from "store/game";
import './StringList.css';
import { use, useEffect, useState } from "react";
import fs from 'fs/promises';
import { store } from "store/store";
import StringItem from "./StringItem";
import path from "path";

interface I_StringLine {
    srcText: string
    destText: string
    comment?: boolean
}

export default function StringList() {
    const { selectedFile } = useSelector(gameSelector);
    const [stringList, setStringList] = useState<I_StringLine[]>([]);

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        }
    },[stringList])

    useEffect(() => {
        if (selectedFile) {
            setStringList([]);
            loadStringList()
        }
    }, [selectedFile])

    function onKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase();

        if(key === 's' && e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();

            saveFile();
        }
    }

    async function saveFile() {
        const lines: string[] = [];

        for (let line of stringList) {
            let str = "";

            if (line.comment) {
                str = `#${line.srcText}`;
            } else {
                str = line.srcText + "=" + line.destText;
            }

            if (str && str !== '=') {
                lines.push(str);
            }
        }

        const fileContent = lines.join("\n");

        console.log(fileContent);

        try {
            await fs.writeFile(selectedFile, fileContent, "utf-8");
            console.log(`파일을 저장했습니다. (경로: "${selectedFile}")`);
        } catch (err) {
            console.error(`파일 저장에 실패했습니다. (경로: "${selectedFile}")`);
            console.error(err);
        }
    }

    async function loadStringList() {
        console.log(`다음 파일을 로드 중: "${selectedFile}"`);

        try {
            const fileContent = await fs.readFile(selectedFile, 'utf-8');
            const newStringList: I_StringLine[] = [];

            for (let str of fileContent.split("\n")) {

                str = str.trim();

                // 아무것도 없는 줄은 건너뛰기
                if (!str || str.length === 0 || str === '#') {
                    continue;
                }

                // 주석 처리
                if (str.startsWith("#")) {

                    if(str.startsWith("# ")) {
                        str = str.slice(2, str.length);
                    } else {
                        str = str.slice(1, str.length);
                    }

                    newStringList.push({
                        srcText: str,
                        destText: "",
                        comment: true
                    })
                    continue;
                }

                // 이스케이프 처리되지 않은 '=' 문자를 기준으로 원문과 번역문 나누기
                let srcText = "";
                let destText = "";

                for (let i = 0; i < str.length; i++) {
                    if (str[i] === '=' && !(i - 1 >= 0 && str[i - 1] === '\\')) {
                        break;
                    }

                    srcText += str[i];
                }

                destText = str.slice(srcText.length + 1, str.length);

                newStringList.push({
                    srcText, destText
                })
            }

            setStringList(newStringList);

        } catch (err) {
            console.error(`파일을 로드할 수 없습니다: "${selectedFile}"`);
            console.error(err);
            store.dispatch(setSelectedFile(undefined));
        }
    }

    function updateStringList({srcText, destText}, {srcText: newSrcText, destText: newDestText}) {
        stringList.filter(line => line.srcText === srcText && line.destText === destText).forEach(line => {
            line.srcText = newSrcText;
            line.destText = newDestText;
        })

        saveFile();
        console.log("번역 업데이트:",stringList);
    }

    function updateComment(index: number, content: string | undefined) {
        if(!content) {
            setStringList(prev => prev.filter((_,i) => i !== index));
        } else {
            stringList[index] = {
                srcText: content,
                destText: "",
                comment: true
            }
        }

        saveFile();
        console.log("주석 업데이트:",stringList)
    }

    return <div className="string-list">
        {
            stringList.map(({ srcText, destText, comment }, i) => (
                <StringItem
                    key={`string_item_${i}`}
                    index={i}
                    srcText={srcText}
                    destText={destText}
                    comment={comment}
                    updateStringLine={updateStringList}
                    updateComment={updateComment}
                />
            ))
        }
    </div>
}