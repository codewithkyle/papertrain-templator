import { h, render, Component, Fragment } from "preact";

import "../normalize.css";
import "../brixi.css";
import "../base.scss";

import "./page-builder.scss";
import "./header.scss";

import { TitleInput } from "./title-input";

type PageBuilderState = {
    title: string;
};

class PageBuilder extends Component<{}, PageBuilderState> {
    constructor() {
        super();

        this.state = {
            title: "Untitled page",
        };
    }

    private updateTitle(title: string) {
        this.setState({ title: title });
    }

    render() {
        return (
            <Fragment>
                <header>
                    <TitleInput value={this.state.title} callback={this.updateTitle.bind(this)} />
                    <div>Page builder actions</div>
                </header>
                <main className="page-builder">
                    <aside>Blocks</aside>
                    <div className="view">
                        <div className="page">View</div>
                    </div>
                </main>
            </Fragment>
        );
    }
}

render(<PageBuilder />, document.body.querySelector("#page-builder-mounting-point"));
