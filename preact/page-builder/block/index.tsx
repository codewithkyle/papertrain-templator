import { h, Component, createRef } from "preact";

import "./block.scss";

type BlockProps = {
    html: string;
    index: number;
    removeCallback: Function;
    shiftBlocks: Function;
    startBlockShift: Function;
    shiftingBlock: number;
};

type BlockState = {
    dragOver: boolean;
};

export class Block extends Component<BlockProps, BlockState> {
    private block: any;

    constructor() {
        super();
        this.state = {
            dragOver: false,
        };
        this.block = createRef();
    }

    private removeBlock: EventListener = () => {
        this.props.removeCallback(this.props.index);
    };

    private startDrag: EventListener = (e: DragEvent) => {
        const noop: HTMLElement = document.body.querySelector("no-op") || document.createElement("no-op");
        noop.style.cssText = "opacity:0;visibility:hidden;position:absolute;top:-9999px;left:-9999px;";
        if (!noop.isConnected) {
            document.body.appendChild(noop);
        }
        e.dataTransfer.setDragImage(noop, 0, 0);
        this.props.startBlockShift(this.props.index);
    };

    private dragOver: EventListener = (e: DragEvent) => {
        if (this.props.shiftingBlock !== this.props.index && this.props.shiftingBlock !== null) {
            this.setState({ dragOver: true });
        }
    };

    private dragLeave: EventListener = (e: DragEvent) => {
        if (this.props.shiftingBlock !== this.props.index) {
            this.setState({ dragOver: false });
        }
    };

    private handleDrop: EventListener = (e: DragEvent) => {
        e.preventDefault();
        if (this.props.shiftingBlock !== null && this.props.shiftingBlock !== this.props.index) {
            this.props.shiftBlocks(this.props.shiftingBlock, this.props.index);
        }
        this.setState({ dragOver: false });
    };

    render() {
        return (
            <div ref={this.block} className={`pt-block ${this.state.dragOver ? "can-drop" : ""}`} onDragOver={this.dragOver} onDrop={this.handleDrop} onDragLeave={this.dragLeave}>
                <div className="pt-block-menu">
                    <button aria-label="move block position" onDragStart={this.startDrag} className="pt-block-button -move" draggable={true}>
                        <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path
                                fill="currentColor"
                                d="M276 236.075h115.85v-76.15c0-10.691 12.926-16.045 20.485-8.485l96.149 96.149c4.686 4.686 4.686 12.284 0 16.971l-96.149 96.149c-7.56 7.56-20.485 2.206-20.485-8.485v-76.149H275.999v115.776h76.15c10.691 0 16.045 12.926 8.485 20.485l-96.149 96.15c-4.686 4.686-12.284 4.686-16.971 0l-96.149-96.149c-7.56-7.56-2.206-20.485 8.485-20.485H236V276.075H120.149v76.149c0 10.691-12.926 16.045-20.485 8.485L3.515 264.56c-4.686-4.686-4.686-12.284 0-16.971l96.149-96.149c7.56-7.56 20.485-2.206 20.485 8.485v76.15H236V120.15h-76.149c-10.691 0-16.045-12.926-8.485-20.485l96.149-96.149c4.686-4.686 12.284-4.686 16.971 0l96.149 96.149c7.56 7.56 2.206 20.485-8.485 20.485H276v115.925z"
                            ></path>
                        </svg>
                    </button>
                    <button aria-label={`delete block ${this.props.index}`} onClick={this.removeBlock} className="pt-block-button -danger">
                        <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                                fill="currentColor"
                                d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div style={{ width: "100%", position: "relative", display: "block" }} dangerouslySetInnerHTML={{ __html: this.props.html }}></div>
            </div>
        );
    }
}
