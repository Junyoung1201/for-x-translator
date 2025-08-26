import { useSelector } from "react-redux";
import SystemMessage from "./SystemMessage";
import { gameSelector } from "store/game";
import path from "path";
import './Header.css';
import Menu from "./Menu";

export default function Header() {

    const {gameDir} = useSelector(gameSelector);

    return <header>
        <div className='left'>
            <div>게임: {gameDir.slice(gameDir.lastIndexOf(path.sep) + 1, gameDir.length)}</div>
        </div>

        <div className='right'>
            <SystemMessage />
            <Menu />
        </div>
    </header>
}