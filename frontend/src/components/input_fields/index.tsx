import { FC, useCallback, useContext, useState } from 'react'

import { Autocomplete, Checkbox, InputAdornment, ToggleButton } from '@mui/material'
import TextField from '@mui/material/TextField'

import { NodesContext } from '../../context/session_context'
import type { ParameterKind } from '../../interfaces'

export type FieldType = "text" | "number" | "select" | "node" | "bool" | "file" | "json"

interface FieldProps {
    input_key: string
    defaultVal?: any
    value: any
    help?: string
    pendingUpdate?: boolean
    type: FieldType
    kind: ParameterKind
    field_params?: {[key: string]: any}
    onChange: (value: any) => void
    warn?: boolean,
    success?: boolean
}

const Field: FC<FieldProps> = ({input_key, type, kind, value, defaultVal, help, onChange, warn, success, field_params}) => {

    const [temporalValue, setTemporalValue] = useState<string | undefined>(undefined)

    const nodes = useContext(NodesContext)

    const getInputValue = useCallback((value: any, default_value: any) => {
        var inputVal = value

        if (value === undefined) inputVal = default_value

        if (type === "node") return inputVal
        else if (type === "json") return JSON.stringify(inputVal)
        else return inputVal
    }, [type])

    const sanitizeChangedInput = useCallback((value: any) => {
        if (type === "node") return value
        else if (type === "number") {
            if (value === "" || value[value.length - 1] === ".") throw new Error("Invalid number")
            return Number(value)
        } else if(type === "json") return value !== "" ? JSON.parse(value) : undefined
        else return value
    }, [type])

    const handleChange = useCallback((value: any) => {
        try {
            const sanitized = sanitizeChangedInput(value)
            onChange(sanitized)
            setTemporalValue(undefined)
        } catch (error) {
            setTemporalValue(value)
        }
    }, [onChange, sanitizeChangedInput])

    const sanitizedVal = getInputValue(value, defaultVal)
    
    var props = {}
    
    if (type === "node") {
        const multiple = kind === "VAR_POSITIONAL"

        let defaultValue
        if (value){
            if (multiple) defaultValue = value ? value.map((val: any) => ({label: nodes[val].name, value: val})) : []
            else defaultValue = value && nodes[value] ? {label: nodes[value].name, value: value} : undefined
        }

        return <Autocomplete
            //disablePortal
            multiple={multiple}
            fullWidth
            size="small"
            defaultValue={defaultValue}
            inputValue={temporalValue}
            placeholder='Pick a node'
            onChange={(e, val) => handleChange(multiple ? val ? val.map((item:any) => item.value) : undefined : val?.value)}
            onInputChange={(e, val) => setTemporalValue(val)}
            options={Object.keys(nodes).map(Number).map(key => ({label: nodes[key].name, value: key}))}
            renderInput={(params) => (
                <TextField
                    label={input_key}
                    color={temporalValue && (multiple || temporalValue !== nodes[value]?.name) ? "error" : warn ? "warning" : success ? "success" : undefined}
                    focused={(temporalValue && (multiple || temporalValue !== nodes[value]?.name)) || warn || success ? true : undefined}
                    {...params}
                />
            )}
        />
    } else if (type === "file"){
        

        // let filtered_paths = paths
        // if (pathFilter) {
        //     let filter;
        //     if (pathFilter.includes("*")) {
        //         const re = new RegExp(`^${pathFilter.replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i');
        //         filter = (name: string) => re.test(name)
        //     } else {
        //         filter = (name: string) => name.includes(pathFilter)
        //     }

        //     filtered_paths = filtered_paths.filter(filter)
        // }

        // return (
        //     <Autocomplete
        //         //disablePortal
        //         placeholder='Enter a path'
        //         fullWidth
        //         freeSolo
        //         size="small"
        //         inputValue={temporalValue}
        //         onInputChange={(e, val) => handleChange(val)}
        //         options={paths}
        //         renderInput={(params) => (
        //             <TextField
        //                 label={input_key}
        //                 color={temporalValue ? "error" : warn ? "warning" : success ? "success" : undefined}
        //                 focused={temporalValue || warn || success ? true : undefined}
        //                 {...params}
        //             />
        //         )}
        //     />
        // )
    } else if (type === "bool"){
        const selected = temporalValue || sanitizedVal
        return <div style={{flex: 1}}>
               <ToggleButton
                size="small"
                style={{width: "100%",  padding: 0, color: "black"}}
                value="check"
                selected={selected} 
                onChange={(e) => handleChange(!selected)}
                >
                    {input_key}
                    <Checkbox checked={selected}/>
                </ToggleButton>
            </div>
    } else if (type === "select") {

        const optionMap = (field_params?.options || []).reduce((acc: {[key: string]: any}, opt: any) => {
            acc[String(opt)] = opt
            return acc
        }, {})

        return <Autocomplete
            disableClearable
            fullWidth
            size="small"
            value={String(temporalValue || sanitizedVal)}
            placeholder='Pick a value'
            onChange={(e, val) => handleChange(optionMap[val])}
            options={Object.keys(optionMap)}
            renderInput={(params) => (
                <TextField
                    label={input_key}
                    helperText={help}
                    color={temporalValue && temporalValue !== sanitizedVal ? "error" : warn ? "warning" : success ? "success" : undefined}
                    focused={temporalValue || warn || success ? true : undefined}
                    {...params}
                />
            )}
        />
    }

    let endAdornment;
    if (type === "number") endAdornment = "#"
    else if (type === "text") endAdornment = "T"
    else if (type === "json") endAdornment = "JSON" 

    return (
        <TextField
            value={temporalValue !== undefined ? temporalValue : sanitizedVal}
            helperText={help}
            multiline
            label={input_key} size="small" fullWidth
            color={temporalValue !== undefined ? "error" : warn ? "warning" : success? "success" : undefined}
            onChange={(e) => handleChange(e.target.value)}
            focused={temporalValue || warn || success ? true : undefined}
            {...props}
            InputProps={{
                endAdornment: <InputAdornment position="start">{endAdornment}</InputAdornment>,
            }}
        />
    )
}

export default Field