import FileList from 'components/FileList';
import GameFolderSelect from 'components/GameFolderSelect';
import { Config } from 'modules/config';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { gameSelector, setGameDir } from 'store/game';
import { store } from 'store/store';
import './App.css';
import path from 'path';
import StringList from 'components/StringList';

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
            openLastGameDir();
        })();
    }, [])

    async function waitForVariables() {
        return new Promise(done => {

            const checkVariables = () => {
                return (
                    __APP_PATH
                )
            }

            let timer = setInterval(() => {
                if(checkVariables()) {
                    console.log("준비되었습니다.")
                    clearInterval(timer);
                    done(null);
                }
            },10);
        })
    }

    async function initConfig() {
        await Config.loadConfig();
        console.log("설정을 불러왔습니다:", Config.getConfig());
    }

    async function openLastGameDir() {
        const lastGameDir = Config.getConfig().lastGameDir;

        if (lastGameDir) {
            // state 업데이트
            store.dispatch(setGameDir(lastGameDir));
            console.log("마지막으로 작업했던 게임 폴더를 열었습니다:", lastGameDir);
        }
    }

    return <>
        {
            !gameDir && <GameFolderSelect />
        }
        {
            gameDir &&
            <>
                <header>
                    게임: {gameDir.slice(gameDir.lastIndexOf(path.sep) + 1, gameDir.length)}
                </header>

                <section>
                    <div className='file-list-holder'>
                        <FileList />
                    </div>
                    <div className='file-content-holder'>
                        <StringList />
                        <div className='menu'>

                        </div>
                    </div>
                </section>
            </>
        }
    </>
}