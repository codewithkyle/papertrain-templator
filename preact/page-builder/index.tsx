import { h, render, Component, Fragment } from "preact";

import "../normalize.css";
import "../brixi.css";
import "../base.scss";
import "../buttons.scss";

import "./page-builder.scss";
import "./header.scss";
import "./circle-rail-spinner.scss";

import { TitleInput } from "./title-input";

type BlockGroup = {
    handle: string;
    label: string;
};

type Block = {
    handle: string;
    group: string;
    label: string;
    css: boolean;
    js: boolean;
};

type BlockData = {
    js: string;
    css: string;
    html: string;
};

type PageBuilderState = {
    title: string;
    groups: Array<BlockGroup>;
    blocks: Array<Block>;
    blockData: {
        [key: string]: BlockData;
    };
    view: Array<string>;
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
            for (const key in response.blocks) {
                const newBlock = {
                    handle: key,
                    group: response.blocks[key].group,
                    label: response.blocks[key].label,
                    css: response.blocks[key]?.css ?? true,
                    js: response.blocks[key]?.js ?? false,
                };
                updatedState.blocks.push(newBlock);
            }
            this.setState(updatedState);
        }
    }

    private async fetchBlock(handle: string) {
        const request = await fetch(`${location.origin}/${mountingPoint.dataset.cpTrigger}/papertrain/api/render/${handle}`, {
            method: "GET",
            credentials: "include",
            headers: new Headers({
                Accept: "text/html",
            }),
        });
        const response = await request.text();
        if (request.ok) {
            const updatedState = { ...this.state };
            updatedState.blockData[handle] = {
                html: response,
                css: null,
                js: null,
            };
            updatedState.view.push(handle);
            this.setState(updatedState);
        }
    }

    private loadBlock: EventListener = (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        if (!this.state.blockData?.[target.dataset.handle]) {
            this.fetchBlock(target.dataset.handle);
        } else {
            this.setState({ view: [...this.state.view, target.dataset.handle] });
        }
    };

    private renderBlockButton = (block: Block, group: string) => {
        if (block.group === group) {
            return (
                <button onClick={this.loadBlock} data-handle={block.handle} className="block font-grey-700 font-sm mb-1">
                    {block.label}
                </button>
            );
        }
    };

    private renderGroup = (group: BlockGroup) => {
        let blocks = this.state.blocks.map((block) => this.renderBlockButton(block, group.handle));
        return (
            <div className="block w-full mb-4">
                <h3 className="block w-full mb-1 font-lg font-grey-800 font-medium cursor-default text-uppercase">{group.label}</h3>
                {blocks}
            </div>
        );
    };

    private renderBlock = (handle: string) => {
        return <div style={{ display: "block", position: "relative", width: "100%" }} dangerouslySetInnerHTML={{ __html: this.state.blockData[handle].html }}></div>;
    };

    componentWillMount() {
        this.fetchBlocks();
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
        return (
            <Fragment>
                <header>
                    <TitleInput value={this.state.title} callback={this.updateTitle.bind(this)} />
                    <div>
                        <button onClick={null} className="button -solid -primary">
                            Create Page
                        </button>
                    </div>
                </header>
                <main className="page-builder">
                    <aside>{aside}</aside>
                    <div className="view">
                        <div className="page">{this.state.view.map((handle) => this.renderBlock(handle))}</div>
                    </div>
                </main>
            </Fragment>
        );
    }
}

render(<PageBuilder />, mountingPoint);
