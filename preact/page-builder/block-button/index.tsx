import { h, Component, createRef } from "preact";

import "./block-button.scss";

type BlockButtonProps = {
    label: string;
    handle: string;
    callback: Function;
    addBlockCallback: Function;
    id: string;
};

type BlockButtonState = {
    dragging: boolean;
};

export class BlockButton extends Component<BlockButtonProps, BlockButtonState> {
    private button: any;

    constructor() {
        super();
        this.state = {
            dragging: false,
        };
        this.button = createRef();
    }

    private startDrag: EventListener = (e: DragEvent) => {
        e.dataTransfer.dropEffect = "move";
        this.setState({
            dragging: true,
        });
        this.props.callback(this.props.handle, this.props.id);
    };

    private endDrag: EventListener = () => {
        this.setState({ dragging: false });
    };

    private click: EventListener = () => {
        this.props.addBlockCallback(this.props.handle, null, null, this.props.id);
    };

    render() {
        return (
            <button
                className={`button-block ${this.state.dragging ? "is-dragging" : ""}`}
                onDragStart={this.startDrag}
                onDragEnd={this.endDrag}
                draggable={true}
                onClick={this.click}
                ref={this.button}
            >
                {this.props.label}
            </button>
        );
    }
}
