import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-log';
import 'prismjs/themes/prism-dark.css';

// export type LogsWindowProps = {
//     divProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
//     style?: React.CSSProperties,
//     logs: string,
// }

const LogsWindow = (props) => {

    return <div {...props.divProps} style={{
        width: "100%", height: "100%", overflow: "scroll", ...props.style
    }}>
        <Editor
    value={props.logs || ""}
    onValueChange={code => {}}
    highlight={code => highlight(code, languages.log)}
    padding={10}
    style={{flex: 1, border: "1px solid black"}}

    />
    </div>
    
}

export default LogsWindow