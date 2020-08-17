import { h, Component, createRef } from "preact";

import "./title-input.scss";

type TitleInputProps = {
    value: string;
    callback: Function;
};

export class TitleInput extends Component<TitleInputProps, {}> {
    private input: any;

    constructor() {
        super();
        this.input = createRef();
    }

    private handleInput: EventListener = (e: Event) => {
        const input = e.currentTarget as HTMLInputElement;
        this.props.callback(input.value);
    };

    private handleBlur: EventListener = (e: Event) => {
        const input = e.currentTarget as HTMLInputElement;
        const cleanValue = input.value.trim();
        if (!cleanValue.length) {
            this.props.callback("Untitled page");
        } else {
            this.props.callback(cleanValue);
        }
    };

    componentDidMount() {
        this.input.current.focus();
    }

    render() {
        return (
            <input
                autofocus
                ref={this.input}
                className="title-input"
                type="text"
                // @ts-ignore
                autocapitalize={false}
                // @ts-ignore
                autocomplete="no"
                value={this.props.value}
                onInput={this.handleInput}
                onBlur={this.handleBlur}
            />
        );
    }
}
