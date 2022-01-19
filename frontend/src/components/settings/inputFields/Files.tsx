import { FC, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import PythonApi from '../../../apis/PythonApi'
import { InputFieldProps } from '../InputField'

const FilesInput:FC<InputFieldProps<string>> = () => {
    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file: any) => {
            console.warn("ACCEPTED FILE")
            PythonApi.sendFile(file)
        })

    }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
    )
}

export default FilesInput;
