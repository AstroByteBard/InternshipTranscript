import Konva from 'konva'

export default function addSuggestionTable(opts = {}) {
    return new Promise(async (resolve) => {
        const maxW = this.stage.width();
        const defaultW = 650;
        const hasX = typeof opts.x !== 'undefined' || typeof opts.left !== 'undefined'
        const hasY = typeof opts.y !== 'undefined' || typeof opts.top !== 'undefined'
        const x = hasX ? Number(typeof opts.x !== 'undefined' ? opts.x : opts.left) : Math.max(10, Math.floor((maxW - defaultW) / 2));
        const y = hasY ? Number(typeof opts.y !== 'undefined' ? opts.y : opts.top) : 100;

        // Explicitly split into two columns: Outstanding and Opportunity
        const labels = ['Outstanding', 'Opportunity'];
        const columnGap = 30;
        const columnWidth = Math.floor((defaultW - columnGap) / 2);

        const groups = [];

        // Parent group for the two-column table
        const parentGroup = new Konva.Group({ x, y, draggable: true, name: 'suggestion-table' });
        this.assignCreationOrder(parentGroup);

        // Left Column: Outstanding
        const leftGroup = this.addSuggestionColumn({
            ...opts,
            labels: [labels[0]],
            x,
            y,
            columnWidth
        });
        if (leftGroup) {
            leftGroup.setAttr('variableName', '{Outstanding}');
            // Move into parentGroup and adjust local coords
            try {
                leftGroup.x(leftGroup.x() - parentGroup.x());
                leftGroup.y(leftGroup.y() - parentGroup.y());
                leftGroup.remove();
                parentGroup.add(leftGroup);
            } catch (e) { /* ignore */ }
            groups.push(leftGroup);
        }

        // Right Column: Opportunity
        const rightGroup = this.addSuggestionColumn({
            ...opts,
            labels: [labels[1]],
            x: x + columnWidth + columnGap,
            y,
            columnWidth
        });
        if (rightGroup) {
            rightGroup.setAttr('variableName', '{Opportunities}');
            try {
                rightGroup.x(rightGroup.x() - parentGroup.x());
                rightGroup.y(rightGroup.y() - parentGroup.y());
                rightGroup.remove();
                parentGroup.add(rightGroup);
            } catch (e) { /* ignore */ }
            groups.push(rightGroup);
        }

        this.layer.add(parentGroup);

        if (typeof opts.onCreate === 'function') {
            try { opts.onCreate(parentGroup); } catch (e) { /* ignore */ }
        }

        // Ensure placeholders are generated for each column
        if (leftGroup) this.updateSuggestionPlaceholderForGroup(leftGroup);
        if (rightGroup) this.updateSuggestionPlaceholderForGroup(rightGroup);

        this.layer.draw();
        this.saveHistory();
        resolve(parentGroup);
    });
}
