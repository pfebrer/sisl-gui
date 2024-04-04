import { Download, Upload } from "@mui/icons-material"
import { IconButton, Tooltip } from "@mui/material"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import PythonApiContext from "../apis/context"
import { TooltipsLevelContext } from "../context/tooltips"

const tooltips_titles = {
    "save": {
        "beginner": <div style={{textAlign: "center"}}>
            <div>Save session.</div>
            <div>I will download the current session as a yaml file.</div>
            <div>You can then load it with the button to my left.</div>
        </div>,
        "normal": "Save session",
    },
    "load": {
        "beginner": <div style={{textAlign: "center"}}>
            <div>Load session.</div>
            <div>Click me to select a file or drop it here.</div>
            <div>The file contents will be loaded ON TOP of the current session.</div>
        </div>,
        "normal": "Load session",
    }
}

const SessionIO = () => {

    const { pythonApi } = useContext(PythonApiContext)

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    const {tooltipsLevel} = useContext(TooltipsLevelContext)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const downloadRef = useRef<HTMLAnchorElement>(null)

    const handleLoad = useCallback(() => {

        const file = uploadedFiles[0]

        // Get contents of file
        file.text().then((text: string) => {
            pythonApi.loadsSession(text).then(() =>{

            }).catch((error) => {
                console.error(error)
            })
        })
        
    }, [uploadedFiles, pythonApi])

    useEffect(() => {
        if (uploadedFiles.length > 0) {
            handleLoad()
            setUploadedFiles([])
            fileInputRef.current!.value = ""
        }
    }, [uploadedFiles, fileInputRef, handleLoad])

    const onFileUpload = (e: any) => {

        const justUploadedFiles = e.target.files

        const files: File[] = []

        // Loop through files
        for (let i = 0; i < justUploadedFiles.length; i++) {
            files.push(justUploadedFiles[i])
        }

        setUploadedFiles(files)

    }

    const handleDrop = (e: any) => {
        // Prevent default behavior (Prevent file from being opened)
        e.preventDefault();
        e.stopPropagation()

        const files: File[] = []

        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            [...e.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
                files.push(item.getAsFile())
            }
            });
        } else {
            // Use DataTransfer interface to access the file(s)
            [...e.dataTransfer.files].forEach((file, i) => {
                files.push(file)
            });
        }

        setUploadedFiles(files)

    }

    const clickFileInput = () => {
        fileInputRef.current?.click()
    }

    const handleDownload = () => {
        if (downloadRef.current) {
            pythonApi.savesSession(true).then((yaml) => {
                if (!downloadRef.current) return
                downloadRef.current.href = `data:text/yaml,${yaml as unknown as string}`
                downloadRef.current.download = "session.yaml"
                downloadRef.current.click()
            })
        }
    }

    const fileInput = <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "column"}}>
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault() }
        onClick={clickFileInput}
        style={{flex: 1, display: "flex", alignItems: "center", borderWidth: 3, borderRadius: 10, borderColor: "rgb(218, 222, 226)", borderStyle: "dashed", backgroundColor: "rgb(238, 242, 246)"}} > 
        <Tooltip title={tooltipsLevel !== "none" && tooltips_titles["load"][tooltipsLevel]} arrow>
        <IconButton>
        <Upload/>
        </IconButton>
        </Tooltip>
    </div>
    <input style={{display: "none"}} multiple id="file-selector" name="file-selector" type="file" accept="application/yaml,.yaml,.yml" ref={fileInputRef} onChange={onFileUpload}/>
    </div>

    return <div style={{display: "flex"}}>
        {fileInput}
        <a style={{visibility: "hidden"}} ref={downloadRef} target="_blank" type={"application/yaml"}>Download session</a>
        <Tooltip title={tooltipsLevel !== "none" && tooltips_titles["save"][tooltipsLevel]} arrow>
        <IconButton
            onClick={handleDownload}
            >
                <Download />
        </IconButton>
        </Tooltip>
    </div>

}

export default SessionIO
