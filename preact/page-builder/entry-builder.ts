function convertToCamelCase(str: string) {
    let arr = str.split("-");
    let capital = arr.map((item, index) => (index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item));
    return capital.join("");
}

function buildMatrixBlockData(form: FormData, namespace: string, value: any, key: string) {
    let i = 0;
    if (typeof value === "object" && value?.length !== 0) {
        i++;
        let blockNamespace = `${namespace}[fields]`;
        for (const field in value) {
            const matrixOrSuperTableBlockTest = new RegExp("pt-block-");
            if (matrixOrSuperTableBlockTest.test(field)) {
                buildField(form, `${blockNamespace}[${field}]`, value[field]);
            }
        }
    } else {
        buildField(form, `${namespace}[fields][${key}]`, value);
    }
}

function buildMatrixData(form: FormData, namespace: string, matrix: object, newId: number) {
    let i = 0;

    let matrixNamespace = `${namespace}[blocks][new${newId}][fields]`;

    for (const field in matrix) {
        i++;
        buildField(form, `${matrixNamespace}[${field}]`, matrix[field]);

        // form.append(`${namespace}[sortOrder][]`, `new${i}`);
        // let superTableType = null;
        // const hasSuperTableBlockIdTest = new RegExp(/st\-block\-type\-\d+/);
        // if (hasSuperTableBlockIdTest.test(key)) {
        //     superTableType = key.match(/st\-block\-type\-\d+/)?.[0]?.match(/\d+/)?.[0];
        // }
        // form.append(`${matrixNamespace}${superTableType ? `[new${i}]` : ""}[type]`, superTableType ?? field);
        // form.append(`${matrixNamespace}[enabled]`, "1");

        // buildMatrixBlockData(form, `${matrixNamespace}[new${i}]`, block[key][field], field);

        // let blockId = block.replace(/(pt\-block\-)|(st\-block\-type\-\d+)/g, "");
        // if (!isNaN(parseInt(blockId))) {
        //     blockId = null;
        // }
        // const blockNamespace = `${matrixNamespace}[new${i}]`;
        // form.append(`${blockNamespace}[type]`, blockId ?? "");
        // if (typeof value[key][block] === "object") {
        //     const superTableBlockType = block.match(/st\-block\-type\-\d+/)?.[0]?.replace(/st\-block\-type\-/, "") ?? null;
        //     if (superTableBlockType) {
        //         form.set(`${blockNamespace}[type]`, superTableBlockType);
        //     }
        //     // fields[pageBuilder][blocks][new1][fields][superTableField][blocks][new1][fields][sortOrder][]: new1
        //     // let updatedNamespace = `${blockNamespace}[fields]`;
        //     for (const field in value[key][block]) {
        //         buildField(form, blockNamespace, value[key][block][field]);
        //     }
        // }
        // i++;
    }
}

function buildField(form: FormData, namespace: string, value: any) {
    // Don't touch empty matrix or super tables
    if (Array.isArray(value)) {
        return;
    }
    console.log(value) === null;
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
                const matrixOrSuperTableBlockTest = new RegExp("pt-block-");
                if (matrixOrSuperTableBlockTest.test(key)) {
                    i++;
                    const superTableType = key.match(/st\-block\-type\-\d+/)?.[0]?.match(/\d+/)?.[0] ?? null;
                    const matrixType = key.match(/m\-block\-type\-.*/)?.[0]?.replace(/m\-block\-type\-/, "") ?? null;
                    const type = superTableType ?? matrixType;
                    form.append(`${namespace}[sortOrder][]`, `new${i}`);
                    if (type) {
                        form.append(`${namespace}[blocks][new${i}][type]`, type);
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
