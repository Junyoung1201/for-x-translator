import { useSelector } from "react-redux"
import { messageSelector } from "store/message"

export default function SystemMessage() {

    const {system} = useSelector(messageSelector);

    return <div id="system-msg">
        {system}    
    </div>
}