import { FC } from 'react'
import { ShortcutsInterface } from '../../interfaces';
import Method from './Method'

interface MethodsProps {
    applyMethod: (key: string) => void,
    shortcuts: ShortcutsInterface
}

const Methods:FC<MethodsProps> = props => {
    return (
        <div className="scrollView" style={{textAlign: "left", borderRadius: 3, maxHeight: "90vh"}}>
            {Object.keys(props.shortcuts).map((sequence) => 
                <Method 
                    sequence={sequence} shortcut={props.shortcuts[sequence]}
                    applyMethod={() => props.applyMethod(sequence)}/>
            )}
        </div>
    )
}

export default Methods;
