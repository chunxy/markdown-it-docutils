/** Directives for creating tables */
import type Token from "markdown-it/lib/token";
import { Directive, IDirectiveData } from "./main";
import { nonnegative_int } from "./options";
export declare class ListTable extends Directive {
    required_arguments: number;
    optional_arguments: number;
    final_argument_whitespace: boolean;
    has_content: boolean;
    option_spec: {
        "header-rows": typeof nonnegative_int;
        "stub-columns": typeof nonnegative_int;
        width: import("./options").OptionSpecConverter;
        widths: import("./options").OptionSpecConverter;
        class: import("./options").OptionSpecConverter;
        name: import("./options").OptionSpecConverter;
        align: import("./options").OptionSpecConverter;
    };
    run(data: IDirectiveData): Token[];
}
export declare const tables: {
    "list-table": typeof ListTable;
};
