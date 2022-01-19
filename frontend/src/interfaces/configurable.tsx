import { HTMLAttributes } from 'react'

export interface InputFieldInterface {
    type: string,
    params: {[key:string]: any},
    style?: HTMLAttributes<HTMLDivElement>,
    [key:string]: any
}

export interface ParamInterface {
    key: string,
    name: string,
    default: any,
    help?: string
    inputField: InputFieldInterface
}

export interface GroupInterface {
    key: string,
    name: string,
    icon: string,
    description: string,
}

export interface ParamGroupInterface extends GroupInterface {
    subGroups: GroupInterface[], // Only one level of nesting in subgroups (at least for now)
}

export interface ConfigurableObjectInterface {
    id: string,
    settings: {[key:string]: any}, // Setting values
    params: ParamInterface[],
    paramGroups: ParamGroupInterface[],
}

export default ConfigurableObjectInterface;