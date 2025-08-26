/**
 *  원문을 XUnity.AutoTranslator에 호환되는 정규식으로 형태로 변경
 */
export function convertToRegexString(str: string) {

    let result = "";

    // 이스케이프 처리되지 않은 '=', '(', ')' 문자 이스케이프 처리
    const NEED_ESCAPE = ["=", "(", ")"]

    for (let i = 0; i < str.length; i++) {
        if (NEED_ESCAPE.includes(str[i]) && (i - 1 < 0 || str[i - 1] !== '\\')) {
            result += '\\';
        }

        result += str[i];
    }

    // 이스케이프된 정상적인 정규식은 다시 되돌리기
    result = result.replaceAll("\\(.+\\)", "(.+)");

    // 앞에 "sr:^" 추가
    if (!str.startsWith("sr:^")) {
        result = "sr:^" + result;
    }

    // 맨 뒤에 "$" 추가
    if (!str.endsWith("$")) {
        result = result + "$";
    }

    return result;
}

export function isNumber(str: string) {
    return isNaN(parseInt(str));
}

/**
 *  현재 선택된 텍스트를 반환
 */
export function getSelectionText(): string | undefined {
    const active = document.activeElement as (HTMLInputElement | HTMLTextAreaElement | null);
    const tag = active?.tagName?.toUpperCase();

    // <input> 또는 <textarea> 내부 선택 처리
    if (active && (tag === 'INPUT' || tag === 'TEXTAREA')) {
        const start = active.selectionStart;
        const end = active.selectionEnd;

        if (start == null || end == null || start === end) {
            return undefined;
        }

        const s = Math.min(start, end);
        const e = Math.max(start, end);
        return active.value.slice(s, e);
    }

    // 일반 문서/콘텐츠 영역 선택 처리
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) {
        return undefined;
    }

    const text = sel.toString();
    return text.length > 0 ? text : undefined;
}

/**
 *  현재 선택된 텍스트를 새로운 텍스트로 교체
 */
export function setSelectionText(str: string): string | undefined {
    const active = document.activeElement as (HTMLInputElement | HTMLTextAreaElement | null);
    const tag = active?.tagName?.toUpperCase();

    // <input> / <textarea> 인 경우
    if (active && (tag === 'INPUT' || tag === 'TEXTAREA')) {
        const start = active.selectionStart;
        const end = active.selectionEnd;

        if (start == null || end == null || start === end) {
            return undefined;
        }

        // 교체 전 텍스트
        const replaced = active.value.slice(start, end);

        const before = active.value.slice(0, start);
        const after = active.value.slice(end);
        active.value = before + str + after;

        // 커서를 교체된 텍스트 뒤로 이동
        const pos = start + str.length;
        active.setSelectionRange(pos, pos);

        // 바인딩을 위해 input 이벤트 발행
        active.dispatchEvent(new Event('input', { bubbles: true }));

        return replaced;
    }

    // 일반 문서, 콘텐츠 영역에서 선택된 경우
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
        return undefined;
    }

    const range = sel.getRangeAt(0);
    if (range.collapsed) {
        return undefined;
    }

    // 교체 전 텍스트 저장
    const replaced = range.toString();

    // 선택 영역을 새 텍스트로 교체
    range.deleteContents();
    const textNode = document.createTextNode(str);
    range.insertNode(textNode);

    // 커서를 새 텍스트 뒤로 위치
    const newRange = document.createRange();
    newRange.setStartAfter(textNode);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    // contenteditable 호스트에 input 이벤트 발행
    const container = (textNode.parentElement ?? undefined);
    const editableHost = container?.closest('[contenteditable="true"]') as HTMLElement | null;

    if (editableHost) {
        editableHost.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }

    return replaced;
}