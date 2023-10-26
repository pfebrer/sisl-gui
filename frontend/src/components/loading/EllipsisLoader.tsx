
interface EllipsisLoaderProps {
    style?: React.CSSProperties,
    dotStyle?: React.CSSProperties,
}

const EllipsisLoader = (props: EllipsisLoaderProps) => {
    return <div style={props.style} className="lds-ellipsis">
        <div style={props.dotStyle}></div>
        <div style={props.dotStyle}></div>
        <div style={props.dotStyle}></div>
        <div style={props.dotStyle}></div>
    </div>
}

export default EllipsisLoader;