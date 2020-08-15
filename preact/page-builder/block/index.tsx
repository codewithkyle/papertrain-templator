import { h, Component } from "preact";

import "./block.scss";

type BlockProps = {
    html: string;
    index: number;
    removeCallback: Function;
};

type BlockState = {};

export class Block extends Component<BlockProps, BlockState> {
    private removeBlock: EventListener = () => {
        this.props.removeCallback(this.props.index);
    };

    render() {
        return (
            <div className="pt-block">
                <div className="pt-block-menu">
                    <button aria-label="move block position" onClick={null} className="pt-block-button -move">
                        <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path
                                fill="currentColor"
                                d="M496 288H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-128H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16z"
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
