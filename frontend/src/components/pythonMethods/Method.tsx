import { FC } from 'react'
import ReactMarkDown from "react-markdown"
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Button, ExpansionPanelActions } from '@material-ui/core'
import { ShortCutInterface } from '../../interfaces'

interface MethodProps {
    sequence: string,
    shortcut: ShortCutInterface,
    applyMethod: () => void,
}

const Method:FC<MethodProps> = props => {
    return (
        <ExpansionPanel>
            <ExpansionPanelSummary
                style={{display: "flex", cursor: "pointer", justifyContent: "space-between", alignItems: "center"}}>
                <span style={{color: "gray", marginRight: 10}}>{props.sequence}</span>
                <span style={{fontWeight: "bold"}}>{props.shortcut.name}</span>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{fontSize: 13}}>
                <ReactMarkDown>{props.shortcut.description}</ReactMarkDown>
            </ExpansionPanelDetails>
            <ExpansionPanelActions>
                <Button onClick={props.applyMethod}>APPLY METHOD</Button>
            </ExpansionPanelActions>
        </ExpansionPanel>
    )
}

export default Method;
