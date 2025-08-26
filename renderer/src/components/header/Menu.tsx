import React from 'react';
import './Menu.css';
import { openGameDirSelectDialog } from 'modules/fs';
import { store } from 'store/store';
import { setGameDir } from 'store/game';

export default function Menu() {

    async function onClickSelectGameDir(e: React.MouseEvent<HTMLButtonElement>) {
        const {success,data} = await openGameDirSelectDialog();
        
        if(success) {

            if(typeof data === 'string') {
                store.dispatch(setGameDir(data));
            } else {
                console.error(`게임 폴더 경로는 문자열이어야 합니다.`)
            }
        } else {
            console.error(`게임 폴더 선택에 실패했습니다.`)
        }
    }

    return <div id="header-menu">
        <button onClick={onClickSelectGameDir}>
            <img src="/img/folder.svg" alt="폴더" />
        </button>
    </div>
}