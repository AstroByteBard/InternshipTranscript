import { loadImage, cropImage } from '@/utils/pdfGenerator/pdfGenerator.helpers';

export const createPdfPreloader = ({ dataMap = {}, loadImage: loadImageFn = loadImage, cropImage: cropImageFn = cropImage } = {}) => {
    return async (el) => {
        if (el.className === 'Image') {
            const attrs = el.attrs || {};
            if (attrs.name === 'graph-placeholder') {
                const graphType = attrs.graphType || '';
                const cleanKey = graphType.replace(/Graph_/g, '').toLowerCase();
                const chartImages = dataMap && dataMap.__chartImages ? dataMap.__chartImages : null;
                let imgSrc = null;
                if (chartImages) {
                    if (cleanKey.indexOf('general') >= 0 && (chartImages.general || chartImages.General)) imgSrc = chartImages.general || chartImages.General;
                    else if (cleanKey.indexOf('specific') >= 0 && (chartImages.specific || chartImages.Specific)) imgSrc = chartImages.specific || chartImages.Specific;
                    else if (chartImages[cleanKey]) imgSrc = chartImages[cleanKey];
                }
                if (imgSrc) {
                    el._loadedImage = await loadImageFn(imgSrc);
                    return el;
                }
            }

            if (el.src && el.src !== '') {
                const srcStr = String(el.src || '');
                const isDataUrl = srcStr.indexOf('data:') === 0;
                const hasVariable = !!(el.attrs && el.attrs.variableName);
                if (isDataUrl && hasVariable) {
                    el._loadedImage = null;
                } else {
                    el._loadedImage = await loadImageFn(el.src);
                    if (el._loadedImage && el._loadedImage.width && el._loadedImage.height) {
                        const isBanner = el._loadedImage.width > el._loadedImage.height * 2;
                        if (isBanner) {
                            el._loadedImage = await cropImageFn(el._loadedImage, 1);
                        }
                    }
                }
            }
        }

        return el;
    };
};
