import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Session, SessionLastUpdates, Flow, Nodes, NodeClassesRegistry } from '../interfaces';
import PythonApiContext from '../apis/context';

const nodesDefaultState: Nodes = {}
const flowsDefaultState: {[key: string]: Flow} = {}
const nodeClassesRegistryDefaultState: NodeClassesRegistry = {node_classes: {}, types_registry: {}, typehints: {}}
const logsDefaultState = ""

const defaultState: Session = {
    nodes: nodesDefaultState,
    node_classes_registry: nodeClassesRegistryDefaultState,
    logs: logsDefaultState,
    flows: flowsDefaultState,
}

const flowsContextDefaultState = {
    flows: flowsDefaultState,
    setFlows: (flows: {[key: string]: Flow}) => {},
    flowsFromServer: false
}

const lastUpdateDefault: SessionLastUpdates = {nodes: 0., flows: 0., node_classes: 0.}

export const NodesContext = createContext(nodesDefaultState);
export const FlowsContext = createContext(flowsContextDefaultState);
export const NodeClassesRegistryContext = createContext(nodeClassesRegistryDefaultState);
export const SessionContext = createContext(defaultState);
export const SessionLastUpdatesContext = createContext(lastUpdateDefault);

export const NodesSynchronizer = (props: any) => {
    const { pythonApi } = useContext(PythonApiContext)
    const [nodes, setNodes] = useState(nodesDefaultState)

    const {nodes: lastNodeUpdate} = useContext(SessionLastUpdatesContext)

    useEffect(() => {
        pythonApi.getNodes().then((nodes: any) => nodes && setNodes(nodes))
    }, [lastNodeUpdate, pythonApi])

    return <NodesContext.Provider value={nodes}>{props.children}</NodesContext.Provider>
}

export const FlowsSynchronizer = (props: any) => {
    const { pythonApi } = useContext(PythonApiContext)
    const [flows, setFlows] = useState(flowsDefaultState)

    const [lastOursUpdate, setLastOursUpdate] = useState(0)
    const [flowsFromServer, setFlowsFromServer] = useState(false)
    const [updating, setUpdating] = useState(false)

    const {flows: lastFlowUpdate} = useContext(SessionLastUpdatesContext)

    useEffect(() => {
        if (!updating && lastFlowUpdate > lastOursUpdate) {
            pythonApi.getFlows().then((flows: any) => {
                if (flows) {
                    setFlowsFromServer(true)
                    setFlows(flows)
                }
            })
        }
    }, [lastFlowUpdate, pythonApi, lastOursUpdate, updating])

    const setThisFlows = useCallback((flows: {[key:string]: Flow}) => {
        setUpdating(true)
        setFlowsFromServer(false)
        setFlows(flows)
        pythonApi.setFlows(flows).then((last_update) =>{
            setLastOursUpdate(last_update as unknown as number)
            setUpdating(false)
        })
    }, [pythonApi])

    return <FlowsContext.Provider value={{flows, setFlows: setThisFlows, flowsFromServer}}>{props.children}</FlowsContext.Provider>
}

export const NodeClassesRegistrySynchronizer = (props: any) => {
    const { pythonApi } = useContext(PythonApiContext)
    const [nodeClassesRegistry, setNodeClassesRegistry] = useState(nodeClassesRegistryDefaultState)

    const {node_classes: lastNodeClassesRegistryUpdate} = useContext(SessionLastUpdatesContext)

    useEffect(() => {
        pythonApi.getNodeClassesRegistry().then((node_classes_registry: any) => node_classes_registry && setNodeClassesRegistry(node_classes_registry))
    }, [lastNodeClassesRegistryUpdate, pythonApi])

    return <NodeClassesRegistryContext.Provider value={nodeClassesRegistry}>{props.children}</NodeClassesRegistryContext.Provider>
}

export const SessionSynchronizer = (props: any) => {

    return <NodesSynchronizer>
        <FlowsSynchronizer>
            <NodeClassesRegistrySynchronizer>
                {props.children}
            </NodeClassesRegistrySynchronizer>
        </FlowsSynchronizer>
    </NodesSynchronizer>

} 