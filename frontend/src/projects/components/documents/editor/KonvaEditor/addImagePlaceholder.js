export default function addImagePlaceholder(variableName, opts = {}) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Do not draw a stroked border for image placeholders — keep them borderless
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 28px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(variableName.replace(/[{}]/g, ''), canvas.width / 2, canvas.height / 2);

        const dataUrl = canvas.toDataURL('image/png');
        this.addImage(dataUrl, {
            width: 380,
            height: 240,
            ...opts,
            variableName
        }).then(resolve);
    });
}