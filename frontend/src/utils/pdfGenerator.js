import Konva from 'konva';
import { jsPDF } from 'jspdf';
import { formatChartLabel } from '@/utils/chartLabel';
import { loadImage, cropImage, drawRoundRect } from '@/utils/pdfGenerator/pdfGenerator.helpers';
import {
    getVisibleTextWidth,
    createPdfVariableHelpers
} from '@/utils/pdfGenerator/pdfGenerator.logic';
import { applyManualLinkedVariableExportLayout } from '@/utils/pdfGenerator/pdfGenerator.layout';
import { createPdfGraphRenderers } from '@/utils/pdfGenerator/pdfGenerator.graphs';
import { createPdfTableRenderers } from '@/utils/pdfGenerator/pdfGenerator.tables';
import { createPdfPreloader } from '@/utils/pdfGenerator/pdfGenerator.preload';
import { applyPdfExportCleanup } from '@/utils/pdfGenerator/pdfGenerator.cleanup';
import { createPdfRenderDispatch } from '@/utils/pdfGenerator/pdfGenerator.renderers';

/**
 * Generate PDF purely on the client side using replacing variables in Konva Stage JSON
 * @param {Object} templateJSON - The JSON structure of the document template
 * @param {Object} dataMap - The data to fill into placeholders
 */
export async function downloadClientPDF(templateJSON, dataMap, filename = 'document.pdf') {
    // We create a temporary hidden div
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const templateRoot = templateJSON && templateJSON.content && Array.isArray(templateJSON.content.elements)
        ? templateJSON.content
        : templateJSON;
    const elements = Array.isArray(templateRoot && templateRoot.elements) ? templateRoot.elements : [];

    const width = templateRoot.width || templateJSON.width || 794;
    const height = templateRoot.height || templateJSON.height || 1123;

    const collectFontFamilies = (elements, fonts = new Set()) => {
        if (!Array.isArray(elements)) return fonts;
        elements.forEach((element) => {
            try {
                if (!element || !element.attrs) return;
                const fontFamily = element.attrs.fontFamily;
                if (typeof fontFamily === 'string' && fontFamily.trim()) {
                    fontFamily.split(',').forEach((family) => {
                        const trimmed = family.trim();
                        if (trimmed) fonts.add(trimmed);
                    });
                }
                if (Array.isArray(element.attrs.children)) {
                    collectFontFamilies(element.attrs.children, fonts);
                }
            } catch (err) { /* ignore */ }
        });
        return fonts;
    };

    const ensureLocaleFontsReady = async (lang) => {
        if (typeof document === 'undefined' || !document.fonts) return;
        const families = new Set(
            String(lang || '').toLowerCase().startsWith('th')
                ? ['Noto Sans Thai', 'Sarabun', 'IBM Plex Sans Thai', 'Prompt', 'Kanit', 'Mali', 'Mitr', 'Pridi', 'KoHo', 'Chakra Petch']
                : ['Inter', 'Source Sans 3', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Nunito', 'Merriweather', 'Playfair Display']
        );
        collectFontFamilies(elements, families);
        try {
            await Promise.all(Array.from(families).map((family) => document.fonts.load(`16px "${family}"`)));
            await document.fonts.ready;
        } catch (err) { /* ignore font-loading failures */ }
    };

    // Ensure the template locale drives export-time localization.
    // If the template is marked `th`, it should override the UI language for PDF rendering.
    try {
        if (!dataMap) dataMap = {};
        dataMap.__language = templateRoot.locale || templateJSON.locale || dataMap.__language || dataMap.locale || 'en';
    } catch (e) { /* ignore */ }

    await ensureLocaleFontsReady(dataMap.__language);

    const stage = new Konva.Stage({
        container: container,
        width: width,
        height: height
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    // Initialize third-party Thai segmenter if available
    try {
        if (typeof wordcut !== 'undefined' && wordcut && typeof wordcut.init === 'function') {
            try { wordcut.init(); } catch (e) { /* ignore init errors */ }
        }
    } catch (e) { /* ignore */ }

    // Solid white background to avoid transparent edge artifacts
    const pdfBg = new Konva.Rect({
        x: 0,
        y: 0,
        width: width,
        height: height,
        fill: '#ffffff',
        listening: false,
        name: 'pdf-bg'
    });
    layer.add(pdfBg);

    // Preload elements
    // NOTE: Skip loading inline placeholder dataURLs (canvas-made placeholders)
    // for variable-backed images so their dashed stroke/placeholder does not
    // end up embedded in the exported PDF.
    const preloadElement = createPdfPreloader({ dataMap, loadImage, cropImage });
    const preloads = elements.map(preloadElement);

    await Promise.all(preloads);

    const renderedNodesByOrder = new Map();

    const {
        addRadarGraph,
        addBarGraph,
        renderGraphPlaceholder
    } = createPdfGraphRenderers({ layer, dataMap });
    const {
        addCompetencyTable,
        addSuggestionTable
    } = createPdfTableRenderers({ layer, dataMap });
    const {
        resolveValue,
        replaceTextVariables,
        extractPlaceholderKey
    } = createPdfVariableHelpers(dataMap);

    const {
        renderElements,
    } = createPdfRenderDispatch({
        layer,
        dataMap,
        renderGraphPlaceholder,
        addCompetencyTable,
        addSuggestionTable,
        resolveValue,
        replaceTextVariables,
        extractPlaceholderKey,
        renderedNodesByOrder
    });


    // Load nodes
    renderElements(elements);

    // Sort to handle zIndex properly
    const nodes = layer.children.slice();
    nodes.sort((a, b) => {
        const aZ = a.zIndex() || 0;
        const bZ = b.zIndex() || 0;
        return aZ - bZ;
    });
    nodes.forEach(n => n.moveToTop());

    // Reposition manual-linked data variables into the same horizontal plane
    // with a fixed 20px gap before export, without affecting the editor canvas.
    try {
        applyManualLinkedVariableExportLayout(renderedNodesByOrder, getVisibleTextWidth);
    } catch (e) { }

    applyPdfExportCleanup(layer, width);

    // Convert to PDF
    return new Promise((resolve) => {
        setTimeout(() => {
            const dataUrl = stage.toDataURL({ pixelRatio: 2 }); // High-res
            // A4: 210 x 297 mm
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (height * pdfWidth) / width;

            // Add a tiny bleed to avoid 1px edge lines from canvas scaling
            pdf.addImage(dataUrl, 'PNG', -0.5, -0.5, pdfWidth + 1, pdfHeight + 1);
            pdf.save(filename);

            // cleanup
            document.body.removeChild(container);
            resolve();
        }, 500); // 500ms delay to ensure all images and fonts drew properly
    });
}
