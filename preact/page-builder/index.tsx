import { h, render, Component, Fragment, createRef } from "preact";

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
        index: number;
        scrollDirection;
    };
    keyboardFocusedIndex: number;
};

const mountingPoint: HTMLElement = document.body.querySelector("#page-builder-mounting-point");

class PageBuilder extends Component<{}, PageBuilderState> {
    private view: any;

    constructor() {
        super();

        this.view = createRef();

        this.state = {
            title: "Untitled page",
            groups: [],
            blocks: [],
            blockData: {},
            view: [],
            drag: {
                over: false,
                handle: null,
                index: null,
                scrollDirection: 0,
            },
            keyboardFocusedIndex: null,
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

    private async fetchBlock(handle: string): Promise<string> {
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

        return await htmlRequest.text();
    }

    private async loadBlock(handle: string, targetIndex: number = null, direction: number = null) {
        if (!this.state.blockData?.[handle]) {
            const html = await this.fetchBlock(handle);
            const updatedState = { ...this.state };
            updatedState.blockData[handle] = {
                html: html,
            };
            if (targetIndex !== null && direction !== null) {
                if (direction === -1) {
                    updatedState.view.splice(targetIndex, 0, handle);
                } else {
                    updatedState.view.splice(targetIndex + 1, 0, handle);
                }
            } else {
                updatedState.view.push(handle);
            }
            this.setState(updatedState);
        } else {
            const updatedState = { ...this.state };
            if (targetIndex !== null && direction !== null) {
                if (direction === -1) {
                    updatedState.view.splice(targetIndex, 0, handle);
                } else {
                    updatedState.view.splice(targetIndex + 1, 0, handle);
                }
            } else {
                updatedState.view.push(handle);
            }
            this.setState(updatedState);
        }

        setTimeout(() => {
            // TODO: figure of if we need to scroll to a specific block or to the end
            this.view.current.scrollTo({
                top: this.view.current.scrollHeight,
                left: 0,
                behavior: "smooth",
            });
        }, 150);
    }

    private dragOver: EventListener = (e: DragEvent) => {
        e.preventDefault();
        const updatedState = { ...this.state };
        updatedState.drag.over = true;
        this.setState(updatedState);
    };

    private dragLeave: EventListener = (e: DragEvent) => {
        e.preventDefault();
        const updatedState = { ...this.state };
        updatedState.drag.over = false;
        this.setState(updatedState);
    };

    private handleDrop: EventListener = (e: DragEvent) => {
        e.preventDefault();
        if (this.state.drag.handle && !this.state.view.length) {
            this.loadBlock(this.state.drag.handle);
        }
        this.setState({
            drag: {
                over: false,
                handle: null,
                index: null,
                scrollDirection: 0,
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
        const updatedState = { ...this.state };
        updatedState.view.splice(index, 1);
        this.setState(updatedState);

        // Get any button and focus then blur it -- shifted blocks maintain focus due to the Preact dynamic rendering
        const button = document.body.querySelector("button");
        button.focus();
        button.blur();
    }

    private shiftBlocks(indexToShift: number, targetIndex: number, direction: number) {
        if (indexToShift === null && this.state.drag.handle !== null) {
            this.loadBlock(this.state.drag.handle, targetIndex, direction);
            return;
        } else if (targetIndex >= this.state.view.length || targetIndex < 0) {
            return;
        }

        if (direction !== 0) {
            const updatedState = { ...this.state };
            const block = updatedState.view[indexToShift];
            updatedState.view.splice(indexToShift, 1);
            if (direction === -1) {
                updatedState.view.splice(targetIndex, 0, block);
            } else {
                updatedState.view.splice(targetIndex + 1, 0, block);
            }
            this.setState(updatedState);
        }

        // Get any button and focus then blur it -- shifted blocks maintain focus due to the Preact dynamic rendering
        const button = document.body.querySelector("button");
        button.focus();
        button.blur();

        setTimeout(() => {
            const blockEl = document.body.querySelector(`.pt-block[data-index="${targetIndex}"]`);
            if (blockEl) {
                blockEl.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }, 150);
    }

    private startBlockShift(index: number) {
        this.setState({
            drag: {
                handle: null,
                over: true,
                index: index,
                scrollDirection: 0,
            },
        });
    }

    private keyboardShift(index: number) {
        this.setState({ keyboardFocusedIndex: index });
    }

    private renderBlock = (handle: string, index: number) => {
        let html = this.state.blockData[handle].html;
        let block = null;
        for (let i = 0; i < this.state.blocks.length; i++) {
            if (this.state.blocks[i].handle === handle) {
                block = this.state.blocks[i];
                break;
            }
        }
        let group = null;
        for (let i = 0; i < this.state.groups.length; i++) {
            if (this.state.groups[i].handle === block.group) {
                group = this.state.groups[i];
                break;
            }
        }
        return (
            <Block
                index={index}
                html={html}
                removeCallback={this.removeBlock.bind(this)}
                shiftBlocks={this.shiftBlocks.bind(this)}
                shiftingBlock={this.state.drag.index}
                startBlockShift={this.startBlockShift.bind(this)}
                keyboardCallback={this.keyboardShift.bind(this)}
                keyboardFocusedIndex={this.state.keyboardFocusedIndex}
                label={block.label}
                group={group.label}
            />
        );
    };

    private scrollCallback() {
        this.view.current.scrollBy({
            top: this.state.drag.scrollDirection * 10,
            left: 0,
            behavior: "auto",
        });

        window.requestAnimationFrame(() => {
            this.scrollCallback();
        });
    }

    private startBodyDrag: EventListener = (e: MouseEvent) => {
        let scrollDirection = e.clientY <= 100 ? -1 : 1;
        const updatedState = { ...this.state };
        updatedState.drag.scrollDirection = scrollDirection;
        this.setState(updatedState);
    };
    private endBodyDrag: EventListener = (e: MouseEvent) => {
        const updatedState = { ...this.state };
        updatedState.drag.scrollDirection = 0;
        this.setState(updatedState);
    };

    private keyboardShiftBlock(direction: number) {
        const newIndex = this.state.keyboardFocusedIndex + direction;
        if (newIndex < 0 || newIndex >= this.state.view.length) {
            return;
        }
        console.log(this.state.keyboardFocusedIndex, newIndex, direction);

        const updatedState = { ...this.state };
        const block = updatedState.view[this.state.keyboardFocusedIndex];
        updatedState.view.splice(this.state.keyboardFocusedIndex, 1);
        updatedState.view.splice(newIndex, 0, block);
        updatedState.keyboardFocusedIndex = newIndex;
        this.setState(updatedState);
    }

    private handleKeyboardMove: EventListener = (e: Event) => {
        if (e instanceof KeyboardEvent && this.state.keyboardFocusedIndex !== null) {
            const key = e.key.toLowerCase();
            switch (key) {
                case "arrowup":
                    this.keyboardShiftBlock(-1);
                    break;
                case "arrowdown":
                    this.keyboardShiftBlock(1);
                    break;
                default:
                    break;
            }
        }
    };

    componentDidMount() {
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

        document.addEventListener("keyup", this.handleKeyboardMove);

        this.scrollCallback();
    }

    render() {
        let aside = null;
        if (this.state.blocks.length) {
            aside = this.state.groups.map((group) => this.renderGroup(group));
        } else {
            aside = (
                // @ts-ignore
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
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
        } else if (!this.state.drag.over) {
            view = <p className="pt-instructions">Click and drag the block on the left to begin building a new page.</p>;
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
                    <div className="view" ref={this.view}>
                        <div className={`page ${this.state.drag.over ? "can-drop" : ""}`} onDragOver={this.dragOver} onDragLeave={this.dragLeave} onDrop={this.handleDrop}>
                            {view}
                            {dropzone}
                        </div>
                    </div>
                </main>
                <div onDragEnter={this.startBodyDrag} onDragLeave={this.endBodyDrag} className="capture-scroll top"></div>
                <div onDragEnter={this.startBodyDrag} onDragLeave={this.endBodyDrag} className="capture-scroll bottom"></div>
            </Fragment>
        );
    }
}

render(<PageBuilder />, mountingPoint);
