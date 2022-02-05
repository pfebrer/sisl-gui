import { FC, FocusEvent } from 'react'

import { MdRemoveCircle } from 'react-icons/md'
import { TabInterface } from '../../interfaces';

interface TabComponentInterface {
    tab: TabInterface,
    selected: boolean,
    selectTab: () => void,
    removeTab: () => void,
    updateTabName: (name: string ) => void,
}

const Tab:FC<TabComponentInterface> = (props) => {

    const updateTabName = (e: FocusEvent<HTMLDivElement>) => {
        if (e.target.blur) e.target.blur(); 
        const name = e.target.textContent
        if (name) props.updateTabName(name)}
    
    const {id: tabID, name: tabName} = props.tab

    return (
        <div
                key={tabID}
                className={props.selected ? "active plotTab" : "plotTab"}
                onClick={props.selected ? undefined : props.selectTab}>
            <div
                id={tabID}
                contentEditable={props.selected}
                
                onBlur={updateTabName}
                //onKeyUp={(e) => {if (e.keyCode === 13) updateTabName(e)}}
                >{tabName}</div>
            {props.selected ? <div className="removeTabBut" onClick={props.removeTab}><MdRemoveCircle size={20}/></div> : null}
        </div>
    )
}

export default Tab;