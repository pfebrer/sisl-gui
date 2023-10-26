import { createContext } from "react";
import { PythonApi } from "./PythonApi";

const PythonApiContext = createContext({pythonApi: new PythonApi(), setPythonApi: (api:PythonApi) => {}})

const PythonApiStatusContext = createContext(0)

export {PythonApiStatusContext}

export default PythonApiContext;
