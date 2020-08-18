import { h, render, Component, Fragment, createRef } from "preact";

import "../base.scss";
import "../buttons.scss";

import "./page-builder.scss";
import "./header.scss";
import "./circle-rail-spinner.scss";

import { TitleInput } from "./title-input";
import { BlockButton } from "./block-button";
import { Block } from "./block";
import { buildEntryForm } from "./entry-builder";
import { buildTemplateForm } from "./template-builder";

type BlockGroup = {
    handle: string;
    label: string;
};

type IBlock = {
    handle: string;
    group: string;
    label: string;
    resouces: Array<string>;
    id: string;
};

type BlockData = {
    html: string;
    data: object;
};

type PageBuilderState = {
    title: string;
    groups: Array<BlockGroup>;
    blocks: Array<IBlock>;
    ready: boolean;
    blockData: {
        [key: string]: BlockData;
    };
    view: Array<{
        id: string;
        handle: string;
    }>;
    drag: {
        over: boolean;
        handle: string;
        index: number;
        scrollDirection: number;
        id: string;
    };
    keyboardFocusedIndex: number;
    submitting: boolean;
    prompt: "creator" | "editor" | null;
    windowSizeError: boolean;
};

const mountingPoint: HTMLElement = document.body.querySelector("#page-builder-mounting-point");

class PageBuilder extends Component<{}, PageBuilderState> {
    private view: any;

    constructor() {
        super();

        this.view = createRef();

        this.state = {
            ready: false,
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
                id: null,
            },
            keyboardFocusedIndex: null,
            submitting: false,
            prompt: null,
            windowSizeError: window.innerHeight < 768 || window.innerWidth < 1440,
        };
    }

    // Functions =========================================================================================================

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

    private async fetchBlock(handle: string, id: string): Promise<string> {
        // Load CSS
        if (!document.head.querySelector(`link[href="${location.origin}/assets/${handle}.css"]`)) {
            const stylesheet = document.createElement("link");
            stylesheet.href = `${location.origin}/assets/${handle}.css`;
            stylesheet.rel = "stylesheet";
            document.head.appendChild(stylesheet);
        }

        // Load script
        if (!document.head.querySelector(`script[src="${location.origin}/assets/${handle}.mjs"]`)) {
            const script = document.createElement("script");
            script.src = `${location.origin}/assets/${handle}.mjs`;
            script.type = "module";
            document.head.appendChild(script);
        }
        const htmlRequest = await fetch(`${location.origin}/${mountingPoint.dataset.cpTrigger}/papertrain/api/render/block/${id}/${handle}`, {
            method: "GET",
            credentials: "include",
        });

        return await htmlRequest.text();
    }

    private async loadBlockResources(handle: string) {
        let block;
        for (let i = 0; i < this.state.blocks.length; i++) {
            if (this.state.blocks[i].handle === handle) {
                block = this.state.blocks[i];
                break;
            }
        }
        for (let i = 0; i < block.resources.length; i++) {
            let type = block.resources[i].match(/(\.css)$/) ? "link" : "script";
            let url;
            if (block.resources[i].match(/^(http)|^(https)/)) {
                url = block.resources[i];
            } else {
                url = `${location.origin}/assets/${block.resources[i]}`;
            }
            const el: any = document.createElement(type);
            if (type === "link") {
                if (!document.head.querySelector(`link[href="${url}"]`)) {
                    el.href = url;
                    el.rel = "stylesheet";
                    console.log("asd");
                }
            } else {
                if (!document.head.querySelector(`script[src="${url}"]`)) {
                    el.src = url;
                    el.type = url.match(/(\.mjs)/) ? "module" : "text/javascript";
                }
            }
            document.head.appendChild(el);
        }
    }

    private async fetchBlockData(id: string): Promise<object> {
        const request = await fetch(`${location.origin}/${mountingPoint.dataset.cpTrigger}/papertrain/api/block/${id}.json`, {
            method: "GET",
            credentials: "include",
            headers: new Headers({
                Accept: "application/json",
            }),
        });
        return await request.json();
    }

    private async loadBlock(handle: string, targetIndex: number = null, direction: number = null, id: string = null) {
        let block = { handle: handle, id: id };
        if (!this.state.blockData?.[handle] && id !== null) {
            this.loadBlockResources(handle);
            const html = await this.fetchBlock(handle, id);
            const data = await this.fetchBlockData(id);
            const updatedState = { ...this.state };
            updatedState.blockData[handle] = {
                html: html,
                data: data,
            };
            if (targetIndex !== null && direction !== null) {
                if (direction === -1) {
                    updatedState.view.splice(targetIndex, 0, block);
                } else {
                    updatedState.view.splice(targetIndex + 1, 0, block);
                }
            } else {
                updatedState.view.push(block);
            }
            this.setState(updatedState);
        } else {
            const updatedState = { ...this.state };
            if (targetIndex !== null && direction !== null) {
                if (direction === -1) {
                    updatedState.view.splice(targetIndex, 0, block);
                } else {
                    updatedState.view.splice(targetIndex + 1, 0, block);
                }
            } else {
                updatedState.view.push(block);
            }
            this.setState(updatedState);
        }

        setTimeout(() => {
            if (targetIndex === null && direction === null) {
                this.view.current.scrollTo({
                    top: this.view.current.scrollHeight,
                    left: 0,
                    behavior: "smooth",
                });
            }
            this.setState({
                drag: {
                    over: false,
                    handle: null,
                    index: null,
                    scrollDirection: 0,
                    id: null,
                },
            });
        }, 150);
    }

    private startBlockShift(index: number) {
        this.setState({
            drag: {
                handle: null,
                over: true,
                index: index,
                scrollDirection: 0,
                id: null,
            },
        });
    }

    private updateTitle(title: string) {
        this.setState({ title: title });
    }

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
        if (indexToShift === null && this.state.drag.handle !== null && this.state.drag.id !== null) {
            this.loadBlock(this.state.drag.handle, targetIndex, direction, this.state.drag.id);
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
            this.setState({
                drag: {
                    over: false,
                    handle: null,
                    index: null,
                    scrollDirection: 0,
                    id: null,
                },
            });
        }, 150);
    }

    private keyboardShift(index: number) {
        this.setState({ keyboardFocusedIndex: index });
    }

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

    private keyboardShiftBlock(direction: number) {
        const newIndex = this.state.keyboardFocusedIndex + direction;
        if (newIndex < 0 || newIndex >= this.state.view.length) {
            return;
        }

        const updatedState = { ...this.state };
        const block = updatedState.view[this.state.keyboardFocusedIndex];
        updatedState.view.splice(this.state.keyboardFocusedIndex, 1);
        updatedState.view.splice(newIndex, 0, block);
        updatedState.keyboardFocusedIndex = newIndex;
        this.setState(updatedState);
    }

    private setDragHandle(handle: string, id: string) {
        const updatedState = { ...this.state };
        updatedState.drag.handle = handle;
        updatedState.drag.id = id;
        this.setState(updatedState);
    }

    private cloneBlock(index: number) {
        const updatedState = { ...this.state };
        const block = updatedState.view[index];
        updatedState.view.splice(index, 0, block);
        this.setState(updatedState);
        setTimeout(() => {
            this.setState({
                drag: {
                    over: false,
                    handle: null,
                    index: null,
                    scrollDirection: 0,
                    id: null,
                },
            });
        }, 150);
    }

    private setInitialState() {
        const blocks = new URLSearchParams(location.search).getAll("b");
        let loaded = 0;
        const view = [];
        new Promise((resolve) => {
            if (blocks.length === 0) {
                resolve();
            }
            for (let i = 0; i < blocks.length; i++) {
                const values = blocks[i].split(":");
                view.push({ handle: values[1], id: values[0] });
                this.loadBlock(values[1], null, null, values[0]).then(() => {
                    loaded++;
                    if (blocks.length === loaded) {
                        resolve();
                    }
                });
            }
        }).then(() => {
            window.history.replaceState(null, null, `${location.origin}/${mountingPoint.dataset.cpTrigger}/papertrain/page-builder`);
            this.setState({ ready: true, view: view });
            setTimeout(() => {
                this.view.current.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "auto",
                });
                this.setState({
                    drag: {
                        over: false,
                        handle: null,
                        index: null,
                        scrollDirection: 0,
                        id: null,
                    },
                });
            }, 150);
        });
    }

    private async create(type: "templates" | "pages") {
        this.setState({ submitting: true, prompt: null });
        let form = new FormData();
        form.append("CRAFT_CSRF_TOKEN", mountingPoint.dataset.csrf);
        form.append("title", this.state.title);

        let blockData = {};
        for (const key in this.state.blockData) {
            blockData[key] = this.state.blockData[key].data;
        }

        if (type === "templates") {
            form.append("sectionId", "4");
            form.append("enabled", "1");
            form = buildTemplateForm(form, this.state.view);
        } else {
            form.append("sectionId", "1");
            form.append("enabled", "0");
            let handles = [];
            for (let i = 0; i < this.state.view.length; i++) {
                handles.push(this.state.view[i].handle);
            }
            form = buildEntryForm(form, handles, blockData);
        }

        const request = await fetch(`${location.origin}/actions/entries/save-entry`, {
            method: "POST",
            credentials: "include",
            headers: new Headers({
                Accept: "application/json",
            }),
            body: form,
        });
        const response = await request.json();
        if (request.ok) {
            if (response?.success) {
                location.href = `${location.origin}/${mountingPoint.dataset.cpTrigger}/entries/${type}/${response.id}`;
            } else {
                this.setState({ submitting: false });
            }
        } else {
            this.setState({ submitting: true });
        }
    }

    // Event Listeners =========================================================================================================

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
            this.loadBlock(this.state.drag.handle, null, null, this.state.drag.id);
        }
    };

    private handleReset: EventListener = () => {
        if (window.confirm("Are you sure you want to trash this page layout?")) {
            this.setState({ view: [] });
        }
    };

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

    private handleSave: EventListener = () => {
        if (!this.state.view.length) {
            return;
        }

        if (this.state.title === "Untitled page") {
            this.setState({ prompt: "editor" });
            return;
        }
        const isCreator = mountingPoint.dataset.creator;
        if (isCreator) {
            this.setState({ prompt: "creator" });
            return;
        }
    };

    private savePage: EventListener = () => {
        this.create("pages");
    };

    private handleURLPrompt: EventListener = () => {
        let url = `${location.origin}/${mountingPoint.dataset.cpTrigger}/papertrain/page-builder`;
        for (let i = 0; i < this.state.view.length; i++) {
            switch (i) {
                case 0:
                    url += `?b=${this.state.view[i].id}:${this.state.view[i].handle}`;
                    break;
                default:
                    url += `&b=${this.state.view[i].id}:${this.state.view[i].handle}`;
                    break;
            }
        }
        prompt("Share this page layout.", url);
    };

    private clearPrompt: EventListener = () => {
        this.setState({ prompt: null });
    };

    private saveAsTemplate: EventListener = () => {
        this.create("templates");
    };

    private leavePage: EventListener = () => {
        location.href = `${location.origin}/${mountingPoint.dataset.cpTrigger}`;
    };

    private checkResize: EventListener = () => {
        if (window.innerWidth < 1440 || window.innerHeight < 768) {
            if (!this.state.windowSizeError) {
                this.setState({ windowSizeError: true });
            }
        } else {
            if (this.state.windowSizeError) {
                this.setState({ windowSizeError: false });
            }
        }
    };

    // Render Functions =========================================================================================================

    private renderBlockButton = (block: IBlock, group: string) => {
        if (block.group === group) {
            return <BlockButton label={block.label} handle={block.handle} callback={this.setDragHandle.bind(this)} addBlockCallback={this.loadBlock.bind(this)} id={block.id} />;
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
                newBlock={this.state.drag.handle}
                cloneBlockCallback={this.cloneBlock.bind(this)}
                handle={block.handle}
            />
        );
    };

    // Preact Functions =========================================================================================================\

    componentDidUpdate() {
        document.body.querySelectorAll("img").forEach((el) => {
            el.draggable = false;
        });
    }

    private async init() {
        await this.fetchBlocks();
        setTimeout(() => {
            this.setInitialState();
        }, 150);
    }

    componentDidMount() {
        this.init();
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

        window.addEventListener("resize", this.checkResize, { passive: true });
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
        if (this.state.view.length && this.state.ready) {
            view = this.state.view.map((block, index) => this.renderBlock(block.handle, index));
        } else if (!this.state.ready) {
            view = (
                // @ts-ignore
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {/* 
                    // @ts-ignore */}
                    <circle-rail-spinner role="alert" aria-busy="true" aria-live="polite"></circle-rail-spinner>;
                </div>
            );
        } else if (!this.state.drag.over) {
            view = <p className="pt-instructions">Click and drag the block on the left to begin building a new page.</p>;
        } else {
            view = (
                <div className="drop-zone">
                    <p>Release the block to add it to the page.</p>
                </div>
            );
        }

        let submitting = null;
        if (this.state.submitting) {
            submitting = (
                // @ts-ignore
                <div className="pt-submitting">
                    <div>
                        <p>Creating page...</p>
                        {/* 
                        // @ts-ignore */}
                        <circle-rail-spinner role="alert" aria-busy="true" aria-live="polite"></circle-rail-spinner>
                    </div>
                </div>
            );
        }

        let prompt;
        switch (this.state.prompt) {
            case "creator":
                prompt = (
                    <div className="prompt">
                        <div className="prompt-background" onClick={this.clearPrompt}></div>
                        <div className="prompt-container">
                            <p>What type of layout is this?</p>
                            <button style={{ width: "calc(50% - 0.5rem)", marginRight: "1rem" }} className="pt-bttn -solid -primary" onClick={this.saveAsTemplate}>
                                Template
                            </button>
                            <button style={{ width: "calc(50% - 0.5rem)" }} className="pt-bttn -solid -primary" onClick={this.savePage}>
                                Page
                            </button>
                        </div>
                    </div>
                );
                break;
            case "editor":
                prompt = (
                    <div className="pt-prompt">
                        <div className="pt-prompt-background" onClick={this.clearPrompt}></div>
                        <div className="pt-prompt-container" style={{ display: "flex", flexFlow: "row nowrap", alignItems: "center" }}>
                            <TitleInput value={this.state.title} callback={this.updateTitle.bind(this)} />
                            <button
                                disabled={this.state.title === "Untitled page" || !this.state.title}
                                style={{ marginLeft: "1rem" }}
                                className="pt-bttn -solid -primary"
                                onClick={this.handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                );
                break;
            default:
                prompt = null;
                break;
        }

        let deviceSizeWarning = null;
        if (this.state.windowSizeError) {
            deviceSizeWarning = (
                <div className="pt-device-size-warning">
                    <div>
                        <p>This application requires a screen size of at least 1440x768. Please resize your browser window or view on a device with a larger screen.</p>
                    </div>
                </div>
            );
        }

        return (
            <Fragment>
                <header style={{ filter: this.state.submitting ? "blur(4px)" : "" }}>
                    <div>
                        <button onClick={this.leavePage} className="pt-bttn -text -grey -round -icon-only" style={{ marginRight: "0.5rem" }}>
                            <i>
                                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path
                                        fill="currentColor"
                                        d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"
                                    ></path>
                                </svg>
                            </i>
                        </button>
                        <TitleInput value={this.state.title} callback={this.updateTitle.bind(this)} />
                    </div>
                    <div>
                        <button onClick={this.handleURLPrompt} className="pt-bttn -text -grey -icon-only -round">
                            <i>
                                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path
                                        fill="currentColor"
                                        d="M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z"
                                    ></path>
                                </svg>
                            </i>
                        </button>
                        <button onClick={this.handleReset} className="pt-bttn -danger -text -icon-only -round" style={{ marginLeft: "0.25rem" }}>
                            <i>
                                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path
                                        fill="currentColor"
                                        d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"
                                    ></path>
                                </svg>
                            </i>
                        </button>
                        <button onClick={this.handleSave} className="pt-bttn -text -primary -icon-only -round" style={{ marginLeft: "0.25rem" }}>
                            <i>
                                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path
                                        fill="currentColor"
                                        d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"
                                    ></path>
                                </svg>
                            </i>
                        </button>
                    </div>
                </header>
                <main style={{ filter: this.state.submitting ? "blur(4px)" : "" }} className="page-builder">
                    <aside>{aside}</aside>
                    <div className="view" ref={this.view}>
                        <div className={`page ${this.state.drag.over ? "can-drop" : ""}`} onDragOver={this.dragOver} onDragLeave={this.dragLeave} onDrop={this.handleDrop}>
                            {view}
                            {dropzone}
                        </div>
                    </div>
                </main>
                <div
                    onDragEnter={this.startBodyDrag}
                    onDragLeave={this.endBodyDrag}
                    className={`capture-scroll top ${this.state.drag.handle !== null || this.state.drag.index !== null ? "is-active" : ""}`}
                ></div>
                <div
                    onDragEnter={this.startBodyDrag}
                    onDragLeave={this.endBodyDrag}
                    className={`capture-scroll bottom ${this.state.drag.handle !== null || this.state.drag.index !== null ? "is-active" : ""}`}
                ></div>
                {submitting}
                {prompt}
                {deviceSizeWarning}
            </Fragment>
        );
    }
}

render(<PageBuilder />, mountingPoint);
