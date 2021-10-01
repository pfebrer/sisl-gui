import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import PythonApi from '../../../apis/PythonApi'

function FilesInput() {
    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
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
