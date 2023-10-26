import { useContext, useState } from "react"

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.css';

import PythonApiContext from "../../apis/context"
import { Button, Typography } from "@mui/material"

const NodeTerminal = (props) => {

    const {pythonApi} = useContext(PythonApiContext)

    const [terminalInput, setTerminalInput] = useState("# Run some python code here\n")
    const [terminalOutput, setTerminalOutput] = useState("")

    const preCode = props.node ? "node = session.get_node(" + props.node.id + ")\n": ""

    const runPythonCode = () => {

        const code = preCode + terminalInput

        pythonApi.runPython(code).then((output) => {
            setTerminalOutput(output)
        })
    }

    const handleKeyDown = (e) => {
        // If shift + enter is pressed, run the python code
        if (e.keyCode === 13 && e.shiftKey) {
            e.preventDefault()
            e.stopPropagation()
            runPythonCode()
        }
    }

    return <div style={{...props.style, height: "100%", display: "flex", flexDirection: "column"}}>
        <Typography>
        Run whatever you want here (the <code>node</code> variable contains the current node):
        </Typography>
        <div style={{paddingTop: 20, paddingBottom: 20, flex: 1, display: "flex", flexDirection: "column", width: "100%"}}>
            <Editor
            value={terminalInput}
            onValueChange={code => setTerminalInput(code)}
            onKeyDown={handleKeyDown}
            highlight={code => highlight(code, languages.python)}
            padding={10}
            style={{flex: 1, border: "1px solid black"}}

            />
            <Button  color="primary" onClick={runPythonCode} fullWidth>RUN (SHIFT+Enter)</Button>
        </div>
        <div id="terminal-output" className="no-scrollbar" style={{overflowY: "scroll", height: 200}}>{terminalOutput}</div>
    </div>
}

export default NodeTerminal;