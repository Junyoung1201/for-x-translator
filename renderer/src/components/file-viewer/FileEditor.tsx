import { useSelector } from "react-redux";
import { gameSelector, setSelectedFile } from "store/game";
import './FileEditor.css';
import { use, useEffect, useRef, useState } from "react";
import fs from 'fs/promises';
import { store } from "store/store";
import ContentLine from "./ContentLine";
import { I_StringLine } from "types/file-editor";
import { getStringListFromFile, saveFile } from "modules/file-editor";

export default function FileEditor() {
    const { selectedFile } = useSelector(gameSelector);
    const [stringList, setStringList] = useState<I_StringLine[]>([]);
    const fileEditorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        }
    }, [stringList])

    useEffect(() => {
        if (selectedFile) {
            loadStringList();
        } else {
            setStringList([]);
        }
    }, [selectedFile])

    async function loadStringList() {
        try {

            const newStringList = await getStringListFromFile(selectedFile);
            setStringList(newStringList);
            console.log("데이터를 불러왔습니다:",newStringList);

        } catch (err) {
            console.error(`파일로부터 데이터를 가져오지 못했습니다: "${selectedFile}"`);
            console.error(err);
            setStringList([]);
            store.dispatch(setSelectedFile(undefined));
        }
    }

    function onKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase();

        if (key === 's' && e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();

            save();
        }
    }

    /**
     *  모든 변경사항을 stringList에 적용 후 파일 저장
     */
    async function save() {
        const fileEditorElement = fileEditorRef.current;

        if (!fileEditorElement) {
            return;
        }

        const contentLines = [...fileEditorElement.children].filter(line => line.hasAttribute("data-role") && line.classList.contains("content-line"));
        const newStringList: I_StringLine[] = [];

        for (let i = 0; i < contentLines.length; i++) {

            //
            //  주의사항: 꼭 "ContentLine을 삭제하는 상황에서만" continue 키워드를 사용할 것!
            //

            const lineElement = contentLines[i];
            const role = lineElement.getAttribute("data-role")!.toLowerCase();

            // 새로운 배열에 주석 라인
            if (role === "comment") {
                let commentInputElement = lineElement.querySelector('input.comment-input');

                if (commentInputElement && (commentInputElement as HTMLInputElement).value) {
                    newStringList.push({
                        srcText: (commentInputElement as HTMLInputElement).value,
                        destText: "",
                        comment: true
                    })
                } else {
                    continue;
                }
            }

            // 새로운 배열에 번역문 라인 추가
            else if(role === 'translate-line') {
                let srcTextElement = lineElement.querySelector(`input[data-type="srcText"]`);
                let destTextElement = lineElement.querySelector(`input[data-type="destText"]`);

                // 원문 또는 번역문 입력 요소 발견 X -> 삭제처리
                if(!srcTextElement || !destTextElement) {
                    continue;
                }

                let srcText = (srcTextElement as HTMLInputElement).value;
                let destText = (destTextElement as HTMLInputElement).value;

                // 원문 또는 번역문 없음 -> 삭제처리
                if(!srcText || !destText) {
                    continue;
                }

                newStringList.push({
                    srcText, destText
                })
            }
        }

        setStringList(newStringList);
        await saveFile(newStringList, selectedFile);

        console.log("모든 변경사항을 적용했습니다:",newStringList);
    }

    return <div id="file-editor" ref={fileEditorRef}>
        <div className="line-head">
            <div>원문</div>
            <div>번역문</div>
        </div>

        {
            stringList.map(({ srcText, destText, comment }, i) => (
                <ContentLine
                    key={`file_content_line_${i}`}
                    index={i}
                    srcText={srcText}
                    destText={destText}
                    comment={comment}
                />
            ))
        }
    </div>
}