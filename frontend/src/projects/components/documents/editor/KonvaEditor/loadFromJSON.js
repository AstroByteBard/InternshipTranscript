export default async function loadFromJSON(data) {
    if (!data || !data.elements) return;
    this.isLoading = true;
    const locale = String(data.locale || this.templateLocale || 'th').toLowerCase();
    this.templateLocale = locale;

    const collectFontFamilies = (elements, fonts = new Set()) => {
        if (!Array.isArray(elements)) return fonts
        elements.forEach((element) => {
            try {
                if (!element || !element.attrs) return
                const fontFamily = element.attrs.fontFamily
                if (typeof fontFamily === 'string' && fontFamily.trim()) {
                    fonts.add(fontFamily.trim())
                }
                if (Array.isArray(element.attrs.children)) {
                    collectFontFamilies(element.attrs.children, fonts)
                }
            } catch (err) { /* ignore */ }
        })
        return fonts
    }

    const ensureLocaleFontsReady = async () => {
        if (typeof document === 'undefined' || !document.fonts) return;
        const families = new Set(
            locale.startsWith('th')
                ? ['Noto Sans Thai', 'Sarabun', 'IBM Plex Sans Thai', 'Prompt', 'Kanit', 'Mali', 'Mitr', 'Pridi', 'KoHo', 'Chakra Petch']
                : ['Inter', 'Source Sans 3', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Nunito', 'Merriweather', 'Playfair Display']
        );
        collectFontFamilies(data.elements, families);
        try {
            await Promise.all(Array.from(families).map((family) => document.fonts.load(`16px "${family}"`)));
            await document.fonts.ready;
        } catch (err) { /* ignore font-loading failures */ }
    };

    await ensureLocaleFontsReady();

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
                locale,
                onCreate: (node) => this.applySavedAttrs(node, el.attrs)
            });
        } else if (el.className === 'Image') {
            if (el.attrs.elementType === 'graph' || el.attrs.name === 'graph-placeholder') {
                await this.addGraphPlaceholder(el.attrs.graphType, {
                    ...el.attrs,
                    locale,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            } else if (el.attrs.variableName && !el.src) {
                await this.addImagePlaceholder(el.attrs.variableName, {
                    ...el.attrs,
                    locale,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            } else {
                await this.addImage(el.src, {
                    ...el.attrs,
                    locale,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            }
        } else if (el.className === 'Group') {
            if (el.attrs.elementType === 'graph' || el.attrs.name === 'graph-placeholder') {
                await this.addGraphPlaceholder(el.attrs.graphType, {
                    ...el.attrs,
                    locale,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            } else if (el.attrs.name === 'competency-table') {
                await this.addCompetencyTable(el.attrs.variableName || '{GeneralCompetencies}', {
                    ...el.attrs,
                    locale,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            } else if (el.attrs.name === 'suggestion-table') {
                await this.addSuggestionTable({
                    ...el.attrs,
                    locale,
                    onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                });
            } else if (el.attrs.name === 'suggestion-table-part') {
                const node = this.addSuggestionColumn({
                    ...el.attrs,
                    locale,
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
    this.history = [];
    this.historyIndex = -1;
    this._historySnapshot = this.saveToJSON();
    this.historyLog = [];
    if (typeof this.renderManualDataVariableConnectors === 'function') {
        this.renderManualDataVariableConnectors();
    }
}