import { h, render, Component, Fragment } from "preact";

import "../base.scss";
import "../buttons.scss";

import "./page-builder.scss";
import "./header.scss";
import "./circle-rail-spinner.scss";

import { TitleInput } from "./title-input";
import { BlockButton } from "./block-button";
import { Block } from "./block";

type BlockGroup = {
    handle: string;
    label: string;
};

type IBlock = {
    handle: string;
    group: string;
    label: string;
};

type BlockData = {
    html: string;
};

type PageBuilderState = {
    title: string;
    groups: Array<BlockGroup>;
    blocks: Array<IBlock>;
    blockData: {
        [key: string]: BlockData;
    };
    view: Array<string>;
    drag: {
        over: boolean;
        handle: string;
    };
};

const mountingPoint: HTMLElement = document.body.querySelector("#page-builder-mounting-point");

class PageBuilder extends Component<{}, PageBuilderState> {
    constructor() {
        super();

        this.state = {
            title: "Untitled page",
            groups: [],
            blocks: [],
            blockData: {},
            view: [],
            drag: {
                over: false,
                handle: null,
            },
        };
    }

    private updateTitle(title: string) {
        this.setState({ title: title });
    }

    private async fetchBlocks() {
        const request = await fetch(`${location.origin}/${mountingPoint.dataset.cpTrigger}/papertrain/api/config.json`, {
            method: "GET",
            credentials: "include",
            headers: new Headers({
                Accept: "application/json",
            }),
        });
        const response = await request.json();
        if (request.ok) {
            const updatedState = { ...this.state };
            updatedState.groups = response.groups;
            updatedState.blocks = response.blocks;
            this.setState(updatedState);
        }
    }

    private async fetchBlock(handle: string) {
        let block: IBlock = null;
        for (let i = 0; i < this.state.blocks.length; i++) {
            if (this.state.blocks[i].handle === handle) {
                block = this.state.blocks[i];
                break;
            }
        }

        // Load CSS
        const stylesheet = document.createElement("link");
        stylesheet.href = `${location.origin}/assets/${handle}.css`;
        stylesheet.rel = "stylesheet";
        document.head.appendChild(stylesheet);

        // Load script
        const script = document.createElement("script");
        script.src = `${location.origin}/assets/${handle}.mjs`;
        script.type = "module";
        document.head.appendChild(script);

        const htmlRequest = await fetch(`${location.origin}/${mountingPoint.dataset.cpTrigger}/papertrain/api/render/${handle}`, {
            method: "GET",
            credentials: "include",
        });

        const htmlResponse = await htmlRequest.text();
        const updatedState = { ...this.state };
        updatedState.blockData[handle] = {
            html: htmlResponse,
        };
        updatedState.view.push(handle);
        this.setState(updatedState);
    }

    private loadBlock(handle: string) {
        if (!this.state.blockData?.[handle]) {
            this.fetchBlock(handle);
        } else {
            this.setState({ view: [...this.state.view, handle] });
        }
    }

    private dragOver: EventListener = (e: DragEvent) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        const updatedState = { ...this.state };
        updatedState.drag.over = true;
        this.setState(updatedState);
    };

    private dragLeave: EventListener = (e: DragEvent) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        const updatedState = { ...this.state };
        updatedState.drag.over = false;
        this.setState(updatedState);
    };

    private handleDrop: EventListener = (e: DragEvent) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        this.loadBlock(this.state.drag.handle);
        this.setState({
            drag: {
                over: false,
                handle: null,
            },
        });
    };

    private handleReset: EventListener = () => {
        this.setState({ view: [] });
    };

    private setDragHandle(handle: string) {
        const updatedState = { ...this.state };
        updatedState.drag.handle = handle;
        this.setState(updatedState);
    }

    private renderBlockButton = (block: IBlock, group: string) => {
        if (block.group === group) {
            return <BlockButton label={block.label} handle={block.handle} callback={this.setDragHandle.bind(this)} addBlockCallback={this.loadBlock.bind(this)} />;
        }
    };

    private renderGroup = (group: BlockGroup) => {
        let blocks = this.state.blocks.map((block) => this.renderBlockButton(block, group.handle));
        return (
            <div className="block w-full mb-4">
                <h3 className="block w-full mb-1 font-grey-800 font-medium cursor-default text-uppercase">{group.label}</h3>
                {blocks}
            </div>
        );
    };

    private removeBlock(index: number) {
        const updatedStata = { ...this.state };
        updatedStata.view.splice(index, 1);
        this.setState(updatedStata);
    }

    private renderBlock = (handle: string, index: number) => {
        let html = this.state.blockData[handle].html;
        return <Block index={index} html={html} removeCallback={this.removeBlock.bind(this)} />;
    };

    componentWillMount() {
        this.fetchBlocks();
        // Normalize
        const normalize = document.createElement("link");
        normalize.href = `${location.origin}/assets/normalize.css`;
        normalize.rel = "stylesheet";
        document.head.appendChild(normalize);

        // Brixi
        const brixi = document.createElement("link");
        brixi.href = `${location.origin}/assets/brixi.css`;
        brixi.rel = "stylesheet";
        document.head.appendChild(brixi);

        // Buttons
        const buttons = document.createElement("link");
        buttons.href = `${location.origin}/assets/buttons.css`;
        buttons.rel = "stylesheet";
        document.head.appendChild(buttons);
    }

    render() {
        let aside = null;
        if (this.state.blocks.length) {
            aside = this.state.groups.map((group) => this.renderGroup(group));
        } else {
            aside = (
                // @ts-ignore
                <div className="w-full h-full" flex="justify-center items-center">
                    {/* 
                    // @ts-ignore */}
                    <circle-rail-spinner role="alert" aria-busy="true" aria-live="polite"></circle-rail-spinner>;
                </div>
            );
        }

        let view: any = null;
        let dropzone = null;
        if (this.state.view.length) {
            view = this.state.view.map((handle, index) => this.renderBlock(handle, index));
            if (this.state.drag.over) {
                dropzone = (
                    <div className="drop-zone">
                        <p>Release the block to add it to the page.</p>
                    </div>
                );
            }
        } else if (!this.state.drag.over) {
            view = <p className="block w-full text-center p-4 font-grey-700">Click and drag the block on the left to begin building a new page.</p>;
        } else {
            view = (
                <div className="drop-zone">
                    <p>Release the block to add it to the page.</p>
                </div>
            );
        }

        return (
            <Fragment>
                <header>
                    <TitleInput value={this.state.title} callback={this.updateTitle.bind(this)} />
                    <div>
                        <button onClick={this.handleReset} className="pt-bttn -danger -text mr-1">
                            Reset Page
                        </button>
                        <button onClick={null} className="pt-bttn -solid -primary">
                            Create Page
                        </button>
                    </div>
                </header>
                <main className="page-builder">
                    <aside>{aside}</aside>
                    <div className="view">
                        <div className={`page ${this.state.drag.over ? "can-drop" : ""}`} onDragOver={this.dragOver} onDragLeave={this.dragLeave} onDrop={this.handleDrop}>
                            {view}
                            {dropzone}
                        </div>
                    </div>
                </main>
            </Fragment>
        );
    }
}

render(<PageBuilder />, mountingPoint);
