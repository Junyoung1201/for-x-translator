import FileList from 'components/FileList';
import GameFolderSelect from 'components/GameFolderSelect';
import { Config } from 'modules/config';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { gameSelector, setGameDir, setSelectedFile } from 'store/game';
import { store } from 'store/store';
import './App.css';
import path from 'path';
import FileEditor from 'components/file-viewer/FileEditor';
import { openLastTranslationFile } from 'modules/file-editor';
import SystemMessage from 'components/header/SystemMessage';

ReactDOM.createRoot(document.querySelector("body>#app")!).render(
    <Provider store={store}>
        <App />
    </Provider>
)

function App() {

    const { gameDir } = useSelector(gameSelector);

    useEffect(() => {
        (async () => {
            await waitForVariables();
            await initConfig();
            openLastTranslationFile();

            window.addEventListener('keydown', onGlobalShortcut);
        })();

        return () => {
            window.removeEventListener('keydown', onGlobalShortcut);
        }
    }, [])

    useEffect(() => {
        window.addEventListener('keydown', onGlobalShortcut);

        return () => {
            window.removeEventListener('keydown', onGlobalShortcut);
        }
    }, [gameDir]);

    function onGlobalShortcut(e: KeyboardEvent) {
        const key = e.key.toLowerCase();

        // 파일 새로고침
        if (key === 'f5' || (e.ctrlKey && key === 'r')) {
            e.stopPropagation();
            e.preventDefault();

            console.log("hello world");

            openLastTranslationFile();
        }
    }

    async function waitForVariables() {
        return new Promise(done => {

            const checkVariables = () => {
                return (
                    __APP_PATH
                )
            }

            let timer = setInterval(() => {
                if (checkVariables()) {
                    console.log("준비되었습니다.")
                    clearInterval(timer);
                    done(null);
                }
            }, 10);
        })
    }

    async function initConfig() {
        await Config.loadConfig();
        console.log("설정을 불러왔습니다:", Config.getConfig());
    }

    return <>
        {
            !gameDir && <GameFolderSelect />
        }
        {
            gameDir &&
            <>
                <header>
                    <div className='left'>
                        <div>게임: {gameDir.slice(gameDir.lastIndexOf(path.sep) + 1, gameDir.length)}</div>
                    </div>
                    
                    <div className='right'>
                        <SystemMessage />
                    </div>
                </header>

                <section>
                    <div className='file-list-holder'>
                        <FileList />
                    </div>
                    <div className='file-content-holder'>
                        <FileEditor />
                        <div className='menu'>

                        </div>
                    </div>
                </section>
            </>
        }
    </>
}