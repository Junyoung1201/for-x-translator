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
import FileEditor from 'components/file-viewer/FileEditor';
import { openLastTranslationFile } from 'modules/file-editor';
import Header from 'components/header/Header';
import Translator from 'components/translator/Translator';
import { globalShortcutHandler } from 'modules/shortcut';

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

            window.addEventListener('keydown', globalShortcutHandler);
        })();

        return () => {
            window.removeEventListener('keydown', globalShortcutHandler);
        }
    }, [])

    useEffect(() => {
        window.addEventListener('keydown', globalShortcutHandler);

        return () => {
            window.removeEventListener('keydown', globalShortcutHandler);
        }
    }, [gameDir]);

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
                <Header />

                <section>
                    <div className='file-list-holder'>
                        <FileList />
                    </div>

                    <div className='file-editor-holder'>
                        <FileEditor />
                        <div className='menu'>

                        </div>
                    </div>

                    <div className='translator-holder'>
                        <Translator />
                    </div>
                </section>
            </>
        }
    </>
}