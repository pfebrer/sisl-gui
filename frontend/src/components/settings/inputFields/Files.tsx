import { FC, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

// Files input is not yet an input field supported for parameters

interface FilesInputProps {
    placeholder: string,
    onChange: (files: File[]) => void,
    style?: {[key:string]: any},
}

const FilesInput:FC<FilesInputProps> = ({placeholder, onChange, style }) => {
    const onDrop = useCallback((files: File[]) => onChange(files), [onChange])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    return (
        <div {...getRootProps()} style={style}>
            <input {...getInputProps()} />
            <p>{placeholder}</p>
        </div>
    )
}

export default FilesInput;
