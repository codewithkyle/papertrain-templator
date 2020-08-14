import { h, render, Component } from "preact";

class PageBuilder extends Component {
    render() {
        return <span>Hello world!</span>;
    }
}

render(<PageBuilder />, document.body.querySelector("#page-builder-mounting-point"));
