import React, { useRef } from 'react';
import './Translator.css';
import { ipcRenderer } from 'electron';
import { store } from 'store/store';
import { setOutput, translateSelector } from 'store/translate';
import { useSelector } from 'react-redux';

export default function Translator() {

    const {output} = useSelector(translateSelector);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const outputRef = useRef<HTMLTextAreaElement>(null);
    const logRef = useRef<HTMLTextAreaElement>(null);
    const translatorSelectRef = useRef<HTMLSelectElement>(null);

    async function getTranslationResult() {
        const inputElement = inputRef.current;
        const tSelect = translatorSelectRef.current;

        if(!tSelect || !inputElement) { 
            return "";
        }

        if(!inputElement.value) {
            return "번역할 텍스트가 없습니다.";
        }

        const result = await ipcRenderer.invoke('translate', {
            srcText: inputElement.value,
            translator: tSelect.value.toLowerCase()
        })

        if(result.success) {
            return result.data;
        } else {
            return result.message;
        }
    }

    async function onKeyPressSrcText(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        const value = e.currentTarget.value.trim();
        const key = e.key.toLowerCase();
        
        const outputElement = outputRef.current;

        if(!outputElement) {
            return;
        }

        if (key === 'enter' && !e.shiftKey) {

            e.preventDefault();

            if (!value) {
                return;
            }

            const result = await getTranslationResult();

            store.dispatch(setOutput(result));
            outputElement.focus();
        }
    }

    return <div id="translator">
        <div className="menu">
            <select ref={translatorSelectRef} id='translator-select'>
                <option value="deepl">DeepL</option>
                <option value="papago">파파고</option>
                <option value="google">구글</option>
            </select>
        </div>

        <div className='content'>
            <textarea placeholder='원문' ref={inputRef} onKeyUp={onKeyPressSrcText} id='tl-input'></textarea>
            <textarea placeholder='번역 결과' readOnly ref={outputRef} defaultValue={output}></textarea>
        </div>

        <div className='log'>
            <div className='title'>로그</div>
            <textarea readOnly placeholder='여기에 로그가 표시됩니다.' ref={logRef}></textarea>
        </div>
    </div>
}