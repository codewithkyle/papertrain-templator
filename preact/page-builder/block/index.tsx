import { h, Component, createRef } from "preact";

import "./block.scss";

type BlockProps = {
    html: string;
    index: number;
    removeCallback: Function;
    shiftBlocks: Function;
    startBlockShift: Function;
    shiftingBlock: number;
    keyboardCallback: Function;
    keyboardFocusedIndex: number;
    label: string;
    group: string;
};

type BlockState = {
    style: "dropzone" | "dragging" | null;
    dropPosition: "top" | "bottom" | null;
};

export class Block extends Component<BlockProps, BlockState> {
    private block: any;

    constructor() {
        super();
        this.state = {
            style: null,
            dropPosition: null,
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
        this.setState({ style: "dragging" });
        this.props.startBlockShift(this.props.index);
    };

    private dragOver: EventListener = (e: DragEvent) => {
        if (this.props.shiftingBlock !== this.props.index) {
            const mousePos = {
                x: e.clientX,
                y: e.clientY,
            };
            const blockBounds = this.block.current.getBoundingClientRect();
            let shiftDirection = this.hitDetect(mousePos, blockBounds);
            this.setState({ style: "dropzone", dropPosition: shiftDirection === -1 ? "top" : "bottom" });
        }
    };

    private dragLeave: EventListener = (e: DragEvent) => {
        if (this.props.shiftingBlock !== this.props.index) {
            this.setState({ style: null, dropPosition: null });
        }
    };

    private hitDetect(mousePos: { x: number; y: number }, block: { x: number; y: number; height: number }): number {
        const halfway = block.y + block.height / 2;
        if (mousePos.y >= halfway) {
            return 1;
        }
        return -1;
    }

    private handleDrop: EventListener = (e: DragEvent) => {
        e.preventDefault();
        if (this.props.shiftingBlock !== this.props.index) {
            const mousePos = {
                x: e.clientX,
                y: e.clientY,
            };
            const blockBounds = this.block.current.getBoundingClientRect();
            let shiftDirection = this.hitDetect(mousePos, blockBounds);
            if ((shiftDirection === -1 && this.props.shiftingBlock === this.props.index - 1) || (shiftDirection === 1 && this.props.shiftingBlock === this.props.index + 1)) {
                shiftDirection = 0;
            }
            this.props.shiftBlocks(this.props.shiftingBlock, this.props.index, shiftDirection);
        }
        this.setState({ style: null });
    };

    private endDrag: EventListener = (e: DragEvent) => {
        e.preventDefault();
        this.setState({ style: null });
    };

    private handleMoveClick: EventListener = (e: Event) => {
        if (e instanceof KeyboardEvent) {
            this.props.keyboardCallback(this.props.index === this.props.keyboardFocusedIndex ? null : this.props.index);
        }
    };

    render() {
        return (
            <div
                ref={this.block}
                className={`pt-block ${this.props.keyboardFocusedIndex === this.props.index ? "dragging" : ""} ${this.state.style} ${
                    this.state.dropPosition ? `drop-${this.state.dropPosition}` : ""
                }`}
                onDragOver={this.dragOver}
                onDrop={this.handleDrop}
                onDragLeave={this.dragLeave}
                data-index={this.props.index}
            >
                <div className="pt-block-menu">
                    <button
                        aria-label="move block position"
                        onDragStart={this.startDrag}
                        onDragEnd={this.endDrag}
                        className="pt-block-button -move"
                        draggable={true}
                        onKeyPress={this.handleMoveClick}
                    >
                        <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path
                                fill="currentColor"
                                d="M276 236.075h115.85v-76.15c0-10.691 12.926-16.045 20.485-8.485l96.149 96.149c4.686 4.686 4.686 12.284 0 16.971l-96.149 96.149c-7.56 7.56-20.485 2.206-20.485-8.485v-76.149H275.999v115.776h76.15c10.691 0 16.045 12.926 8.485 20.485l-96.149 96.15c-4.686 4.686-12.284 4.686-16.971 0l-96.149-96.149c-7.56-7.56-2.206-20.485 8.485-20.485H236V276.075H120.149v76.149c0 10.691-12.926 16.045-20.485 8.485L3.515 264.56c-4.686-4.686-4.686-12.284 0-16.971l96.149-96.149c7.56-7.56 20.485-2.206 20.485 8.485v76.15H236V120.15h-76.149c-10.691 0-16.045-12.926-8.485-20.485l96.149-96.149c4.686-4.686 12.284-4.686 16.971 0l96.149 96.149c7.56 7.56 2.206 20.485-8.485 20.485H276v115.925z"
                            ></path>
                        </svg>
                    </button>
                    <button aria-label={`block ${this.props.index} info`} className="pt-block-button -info">
                        <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                            <path
                                fill="currentColor"
                                d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z"
                            ></path>
                        </svg>
                        <dl className="pt-block-info">
                            <dt>Block:</dt>
                            <dd>{this.props.label}</dd>
                            <dt>Group:</dt>
                            <dd>{this.props.group}</dd>
                        </dl>
                    </button>
                    <button aria-label={`delete block ${this.props.index}`} onClick={this.removeBlock} className="pt-block-button -danger">
                        <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                                fill="currentColor"
                                d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div style={{ width: "100%", position: "relative", display: "block" }} dangerouslySetInnerHTML={{ __html: this.props.html }}></div>
            </div>
        );
    }
}
