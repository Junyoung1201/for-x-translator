import { openGameFolderDialog } from 'modules/fs';
import './GameFolderSelect.css';
import { store } from 'store/store';
import { setGameDir } from 'store/game';

export default function GameFolderSelect() {

    async function selectGameFolder() {
        const { success, message, data } = await openGameFolderDialog();

        if (success) {
            if (typeof data === 'string') {
                store.dispatch(setGameDir(data));
            } else {
                console.error('게임 경로 값은 문자열이어야 합니다.');
            }
        } else {
            console.error(`게임 폴더 선택 실패: ${message}`)
        }
    }

    return <div id="game-folder-select">
        <div className='content'>
            <h1>게임 폴더가 선택되지 않았습니다.</h1>
            <button id='game-folder-select-btn' onClick={selectGameFolder}>
                게임 폴더 선택하기
            </button>
        </div>
    </div>
}