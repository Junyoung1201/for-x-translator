import { useSelector } from "react-redux";
import { gameSelector, setSelectedFile } from "store/game";
import './FileEditor.css';
import { use, useEffect, useRef, useState } from "react";
import fs from 'fs/promises';
import { store } from "store/store";
import ContentLine from "./ContentLine";
import { I_StringLine } from "types/file-editor";
import { saveFile } from "modules/file-editor";

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
            setStringList([]);
            loadStringList()
        }
    }, [selectedFile])

    function onKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase();

        if (key === 's' && e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();

            saveAllChanged();
        }
    }

    /**
     *  모든 변경사항을 stringList에 적용
     */
    async function saveAllChanged() {
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

                    if (str.startsWith("# ")) {
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