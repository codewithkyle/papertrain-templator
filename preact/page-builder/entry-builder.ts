function convertToCamelCase(str: string) {
    let arr = str.split("-");
    let capital = arr.map((item, index) => (index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item));
    return capital.join("");
}

function buildMatrixData(form: FormData, namespace: string, matrix: object, newId: number) {
    let matrixNamespace = `${namespace}[blocks][new${newId}][fields]`;
    for (const field in matrix) {
        if (field !== "ptBlockType") {
            buildField(form, `${matrixNamespace}[${field}]`, matrix[field]);
        }
    }
}

function buildField(form: FormData, namespace: string, value: any) {
    // Don't touch empty matrix or super tables
    if (Array.isArray(value)) {
        return;
    }
    switch (typeof value) {
        case "number":
            form.append(`${namespace}[]`, `${value}`);
            break;
        case "string":
            form.append(`${namespace}`, value);
            break;
        case "object":
            // Might be a Matrix/Super Table OR it could be a custom field
            let i = 0;
            for (const key in value) {
                const matrixOrSuperTableBlockTest = new RegExp("matrix-");
                if (matrixOrSuperTableBlockTest.test(key)) {
                    i++;
                    form.append(`${namespace}[sortOrder][]`, `new${i}`);
                    for (const block in value[key]) {
                        if (block === "ptBlockType") {
                            form.append(`${namespace}[blocks][new${i}][type]`, value[key][block]);
                            break;
                        }
                    }
                    buildMatrixData(form, namespace, value[key], i);
                }
            }
            break;
        default:
            // form.append(`${namespace}[]`, `${value}`);
            break;
    }
}

export function buildEntryForm(
    form: FormData,
    blocks: Array<string>,
    blockData: {
        [key: string]: object;
    }
): FormData {
    for (let i = 0; i < blocks.length; i++) {
        const camelCase = convertToCamelCase(blocks[i]);
        const kebabCase = blocks[i];
        let namespace = "fields[pageBuilder]";
        let blockId = `new${i + 1}`;

        // Add block to the matrix
        form.append(`${namespace}[sortOrder][]`, blockId);
        // Set block type
        form.append(`${namespace}[blocks][${blockId}][type]`, camelCase);

        // Update namespace
        namespace = `${namespace}[blocks][${blockId}][fields]`;

        // Wrangle data
        for (const key in blockData[kebabCase]) {
            const data = blockData[kebabCase];
            const value = data[key];
            let localNamespace = `${namespace}[${key}]`;
            buildField(form, localNamespace, value);
        }
    }
    return form;
}
