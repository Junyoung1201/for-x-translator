import React, { memo, useRef } from "react"

interface I_StringItemProps {
    srcText: string
    destText: string
    comment: boolean
    index: number
    updateStringLine(from: { srcText: string, destText: string }, to: { srcText: string, destText: string }): void
    updateComment(index: number, content: string): void
}

function StringItem({
    index, srcText, destText, comment,
    updateStringLine, updateComment
}: I_StringItemProps) {

    const srcTextRef = useRef<HTMLInputElement>(null);
    const destTextRef = useRef<HTMLInputElement>(null);

    function onSubmitKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {

        const newSrcText = srcTextRef.current?.value ?? "";
        const newDestText = destTextRef.current?.value ?? "";

        const key = e.key.toLowerCase();

        if (key === 'enter') {

            if (comment) {
                //
                //  주석 업데이트
                //
                updateComment(index, newSrcText);
            } else {
                //
                //  번역 업데이트
                //
                updateStringLine({
                    srcText, destText
                }, {
                    srcText: newSrcText,
                    destText: newDestText
                });
            }
        }
    }

    // 주석
    if (comment) {
        return <div className="string-item" data-role='comment' onKeyUp={onSubmitKeyPress}>
            <input type="text" placeholder="주석 입력" ref={srcTextRef} defaultValue={srcText} />
        </div>
    }

    return <div className="string-item" data-role="translate-line" onKeyUp={onSubmitKeyPress}>
        <input type="text" placeholder="원문" defaultValue={srcText} ref={srcTextRef} />
        <input type="text" placeholder="번역문" defaultValue={destText} ref={destTextRef} />

        <div className="menu">

        </div>
    </div>
}

export default memo(StringItem);