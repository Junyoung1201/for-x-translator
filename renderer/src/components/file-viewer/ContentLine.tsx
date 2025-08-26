import React, { memo, useRef } from "react"
import { convertToRegexString, getSelectionText, setSelectionText } from "utils/text"

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
    function onShortcutSrcText(e: React.KeyboardEvent<HTMLInputElement>) {
        const key = e.key.toLowerCase();

        // ` : 정규식으로 바꾸기
        if (key === '`') {
            e.preventDefault();

            const replaced = setSelectionText("(.+)");

            // 텍스트를 정규식으로 변경
            e.currentTarget.value = convertToRegexString(e.currentTarget.value);

            // 정규식으로 바뀐 번역문에 있는 단어도 자동 변경
            const parent = e.currentTarget.parentElement!;
            const destTextInput = parent.querySelector<HTMLInputElement>('input[data-type="destText"');

            if (destTextInput.value) {

                // 정규식 'n$'으로 치환할 때, n을 구하기
                let max_n: number = -1;
                let n: number = 1;
                const str = destTextInput.value;

                for (let i = 0; i < str.length; i++) {
                    if (i > 0 && str[i] === '$') {
                        let _n = parseInt(str[i - 1]);

                        if (!isNaN(_n) && (max_n as number) > max_n) {
                            max_n = _n;
                        }
                    }
                }

                n = (Math.max(max_n, 0)) + 1;

                destTextInput.value = destTextInput.value.replaceAll(replaced, `$${n}`);
            }
        }

        //
        //  위, 아래 원문으로 커서 이동
        //
        const moveCursorRelativeMe = (increIndex: number) => {
            const contentLineHolder = e.currentTarget.parentElement!.parentElement!;
            const contentLines = [...contentLineHolder.children];
            const myContentLineIndex = contentLines.indexOf(e.currentTarget!.parentElement)

            if (myContentLineIndex !== contentLines.length - 1 && myContentLineIndex + increIndex >= 0) {
                contentLines[myContentLineIndex + increIndex].querySelector<HTMLInputElement>('input[data-type="srcText"]')!.focus();
            }
        }

        if (key === 'arrowdown') {
            e.preventDefault();
            moveCursorRelativeMe(1);
        }

        else if (key === 'arrowup') {
            e.preventDefault();
            moveCursorRelativeMe(-1);
        }
    }

    // 주석
    if (comment) {
        return <div className="content-line" data-role='comment'data-line-index={index}>
            <input type="text" placeholder="주석 입력" ref={srcTextRef} defaultValue={srcText?.trim()} className="comment-input" />
        </div>
    }

    return <div className="content-line" data-role="translate-line" data-line-index={index}>
        <input type="text" placeholder="원문" defaultValue={srcText} ref={srcTextRef} onKeyDown={onShortcutSrcText} data-type="srcText" />
        <input type="text" placeholder="번역문" defaultValue={destText} ref={destTextRef} data-type="destText" />

        <div className="menu">

        </div>
    </div>
}

export default memo(ContentLine);