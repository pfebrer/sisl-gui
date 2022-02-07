import { FC } from "react";
import { StructOrPlotableInterface} from "../../interfaces";

interface TagProps {
    id: string,
    selected: boolean,
    toggle: () => void,
}

interface PlotableTagProps extends TagProps {
    plotable: StructOrPlotableInterface
}

export const PlotableTag:FC<PlotableTagProps> = (props) => {
    return (
        <div
            className={"plotableTag " + (props.selected ? "active" : "")}
            onClick={props.toggle}
            data-tip={props.plotable.path}
            data-effect="solid">
            <div>{props.plotable.name}</div>
            <div style={{ fontSize: "0.7em", color: "gray" }}>{".../" + props.plotable.path.split("/").slice(-2, -1)[0]}</div>
        </div>
    )
}

interface StructureTagProps extends TagProps {
    structure: StructOrPlotableInterface
}

export const StructureTag:FC<StructureTagProps> = (props) => {

    return (
        <div
            className={"structTag " + (props.selected ? "active" : "")}
            onClick={props.toggle}
            data-tip={props.structure.path}
            data-effect="solid">
            <div>{props.structure.name.replace(".fdf", "")}</div>
            <div style={{ fontSize: "0.7em", color: "gray" }}>{".../" + props.structure.path.split("/").slice(-2, -1)[0]}</div>
        </div>
    )
}

export default PlotableTag;

