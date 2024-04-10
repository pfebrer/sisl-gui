import { FC, useCallback, useState } from 'react'

import TextField from '@mui/material/TextField'
import { Autocomplete, Checkbox, InputBase, Typography } from '@mui/material'

import type { ParameterKind } from '../../interfaces'

export type FieldType = "text" | "number" | "select" | "node" | "bool" | "file" | "json"

interface FieldProps {
    input_key: string
    defaultVal?: any
    value: any
    pendingUpdate?: boolean
    type: FieldType
    field_params?: {[key: string]: any}
    kind: ParameterKind
    onChange: (value: any) => void
    warn?: boolean,
    success?: boolean
}

const NodeField: FC<FieldProps> = ({input_key, type, field_params, kind, value, defaultVal, onChange, warn, success}) => {

    const [temporalValue, setTemporalValue] = useState<string | undefined>(undefined)

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
    
    if (["text", "number"].includes(type)) {
        return <div style={{display: "flex", alignItems: "center", background: "whitesmoke", borderRadius: 3, paddingRight: 20, paddingLeft: 10, marginRight: 10, marginLeft: 10}}>
            <Typography> {input_key} </Typography>
            <InputBase 
                sx={{flex: 1}} 
                value={temporalValue !== undefined ? temporalValue : sanitizedVal} 
                inputProps={{ style: {textAlign: 'right'} }}
                onChange={(e) => handleChange(e.target.value)}
            />
        </div>
    } else if (type === "bool"){
        return <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", background: "whitesmoke", borderRadius: 3, paddingRight: 20, paddingLeft: 10, marginRight: 10, marginLeft: 10}}>
            <Typography> {input_key} </Typography>
            <Checkbox checked={temporalValue || sanitizedVal} onChange={(e) => handleChange(e.target.checked)} />
            </div>
    } else if (type === "select") {
        const optionMap = (field_params?.options || []).reduce((acc: {[key: string]: any}, opt: any) => {
            acc[String(opt)] = opt
            return acc
        }, {})

        return <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", background: "whitesmoke", borderRadius: 3, paddingRight: 20, paddingLeft: 10, marginRight: 10, marginLeft: 10}}>
            <Typography> {input_key} </Typography>
            <Autocomplete
                fullWidth
                disableClearable
                size="small"
                value={String(temporalValue || sanitizedVal)}
                placeholder='Pick a value'
                onChange={(e, val) => handleChange(val)}
                options={Object.keys(optionMap)}
                renderInput={(params) => (
                    <TextField
                        variant="standard"
                        {...params}
                        inputProps={{
                            ...params.inputProps,
                            style: { ...params.inputProps.style, textAlign: 'right'}                         
                        }}
                        InputProps={{
                            ...params.InputProps,
                            disableUnderline: true,
                        }}
                    />
                )}
            />
        </div>

    }else {
        return <Typography style={{paddingRight: 20, paddingLeft: 10, marginRight: 10, marginLeft: 10}}> {input_key} </Typography>
    }
}

export default NodeField