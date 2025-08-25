import React, { memo, useRef } from "react"
import { convertToRegexString, setSelectionText } from "utils/text"

interface I_StringItemProps {
    srcText: string
    destText: string
    comment: boolean
    index: number
}

function ContentLine({
    index, srcText, destText, comment,
}: I_StringItemProps) {

    const srcTextRef = useRef<HTMLInputElement>(null);
    const destTextRef = useRef<HTMLInputElement>(null);

    /**
     *  원문 단축키 헨들러
     */
    function onOriginTextShortcut(e: React.KeyboardEvent<HTMLInputElement>) {
        const key = e.key.toLowerCase();

        // ` : 정규식으로 바꾸기
        if(key === '`') {
            e.preventDefault();

            setSelectionText("(.+)");

            // 텍스트를 정규식으로 변경
            e.currentTarget.value = convertToRegexString(e.currentTarget.value);
        }

        // 아래 원문으로 이동
        if(key === 'down') {
            e.preventDefault();
            
        }
    }

    function onSubmitKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
        const key = e.key.toLowerCase();

        if (key === 'enter') {
        }
    }

    // 주석
    if (comment) {
        return <div className="content-line" data-role='comment' onKeyUp={onSubmitKeyPress} data-line-index={index}>
            <input type="text" placeholder="주석 입력" ref={srcTextRef} defaultValue={srcText?.trim()} className="comment-input" />
        </div>
    }

    return <div className="content-line" data-role="translate-line" onKeyUp={onSubmitKeyPress} data-line-index={index}>
        <input type="text" placeholder="원문" defaultValue={srcText} ref={srcTextRef} onKeyDown={onOriginTextShortcut} data-type="srcText" />
        <input type="text" placeholder="번역문" defaultValue={destText} ref={destTextRef} data-type="destText" />

        <div className="menu">

        </div>
    </div>
}

export default memo(ContentLine);