import { h, Component } from "preact";

import "./title-input.scss";

type TitleInputProps = {
    value: string;
    callback: Function;
};

export class TitleInput extends Component<TitleInputProps, {}> {
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

    render() {
        return (
            <input
                autofocus
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
