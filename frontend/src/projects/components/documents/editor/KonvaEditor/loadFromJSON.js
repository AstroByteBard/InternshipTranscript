export default async function loadFromJSON(data) {
    if (!data || !data.elements) return;
    this.isLoading = true;

    // Clear existing elements (except BG and Transformer)
    const bg = this.layer.findOne('.background-rect');
    this.layer.children.forEach(node => {
        if (node !== this.transformer && node !== bg) {
            node.destroy();
        }
    });
    this.transformer.nodes([]);
    try { this.emitSelectionChange() } catch (err) { /* ignore */ }

    // Elements are added in order, so they get correct zIndex naturally.
    for (const el of data.elements) {
        if (el.className === 'Text') {
            await this.addTextBlock(el.attrs.text, {
                ...el.attrs,
                onCreate: (node) => this.applySavedAttrs(node, el.attrs)
            });
        } else if (el.className === 'Image') {
            if (el.attrs.name === 'graph-placeholder') {
                await this.addGraphPlaceholder(el.attrs.graphType, {
                    ...el.attrs,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            } else if (el.attrs.variableName && !el.src) {
                await this.addImagePlaceholder(el.attrs.variableName, {
                    ...el.attrs,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            } else {
                await this.addImage(el.src, {
                    ...el.attrs,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            }
        } else if (el.className === 'Group') {
            if (el.attrs.name === 'competency-table') {
                await this.addCompetencyTable(el.attrs.variableName || '{GeneralCompetencies}', {
                    ...el.attrs,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            } else if (el.attrs.name === 'suggestion-table') {
                await this.addSuggestionTable({
                    ...el.attrs,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            } else if (el.attrs.name === 'suggestion-table-part') {
                const node = this.addSuggestionColumn({
                    ...el.attrs,
                    labels: el.attrs.labels,
                    columnWidth: el.attrs.columnWidth,
                    x: el.attrs.x,
                    y: el.attrs.y
                });
                if (node) {
                    this.applySavedAttrs(node, el.attrs)
                }
            }
        }
    }
    this.transformer.moveToTop()
    this.layer.batchDraw();
    this.isLoading = false;
}