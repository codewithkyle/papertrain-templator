export function buildTemplateForm(
    form: FormData,
    blocks: Array<{
        handle: string;
        id: string;
    }>
): FormData {
    for (let i = 0; i < blocks.length; i++) {
        let namespace = "fields[templateBuilder]";
        let blockId = `new${i + 1}`;
        // Add block to the matrix
        form.append(`${namespace}[sortOrder][]`, blockId);
        // Set block type
        form.append(`${namespace}[blocks][${blockId}][type]`, "block");
        // Create relation
        form.append(`${namespace}[blocks][${blockId}][fields][block][]`, blocks[i].id);
    }
    return form;
}
