/**
 *  원문을 XUnity.AutoTranslator에 호환되는 정규식으로 형태로 변경
 */
export function convertToRegexString(str: string) {

    let result = "";
    
    // 이스케이프 처리되지 않은 '=', '(', ')' 문자 이스케이프 처리
    const NEED_ESCAPE = ["=","(",")"]

    for(let i = 0; i < str.length; i++) {
        if(NEED_ESCAPE.includes(str[i]) && (i-1 < 0 || str[i-1] !== '\\')) {
            result += '\\';
        }

        result += str[i];
    }

    // 이스케이프된 정상적인 정규식은 다시 되돌리기
    result = result.replaceAll("\\(.+\\)", "(.+)");
    
    // 앞에 "sr:^" 추가
    if(!str.startsWith("sr:^")) {
        result = "sr:^"+result;
    }

    // 맨 뒤에 "$" 추가
    if(!str.endsWith("$")) {
        result = result+"$";
    }

    return result;
}

/**
 *  현재 선택된 텍스트를 새로운 텍스트로 교체
 */
export function setSelectionText(str: string) {
    const active = document.activeElement as (HTMLInputElement | HTMLTextAreaElement | null);
    const tag = active?.tagName?.toUpperCase();

    if (active && (tag === 'INPUT' || tag === 'TEXTAREA')) {
        const start = active.selectionStart;
        const end = active.selectionEnd;

        // 선택한 텍스트가 없음
        if (start == null || end == null || start === end) {
            return;
        }

        const before = active.value.slice(0, start);
        const after = active.value.slice(end);
        active.value = before + str + after;

        // 커서를 교체된 텍스트 뒤로 이동
        const pos = start + str.length;
        active.setSelectionRange(pos, pos);

        // 리액트/뷰 등 바인딩을 위해 input 이벤트 발행
        active.dispatchEvent(new Event('input', { bubbles: true }));
        return;
    }

    // 일반 문서, 콘텐츠 영역에서 선택된 경우
    const sel = window.getSelection();

    if (!sel || sel.rangeCount === 0) {
        return;
    }

    const range = sel.getRangeAt(0);

    if (range.collapsed) {
        return; 
    }

    // 선택 영역을 새 텍스트로 교체
    range.deleteContents();
    const textNode = document.createTextNode(str);
    range.insertNode(textNode);

    // 커서를 새 텍스트 뒤로 위치
    range.setStartAfter(textNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    const container = (textNode.parentElement ?? undefined);
    const editableHost = container?.closest('[contenteditable="true"]') as HTMLElement | null;

    if (editableHost) {
        editableHost.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
}