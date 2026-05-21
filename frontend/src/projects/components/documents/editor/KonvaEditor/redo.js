import { applyHistoryBatch } from './historyDelta'

export default function redo() {
    if (this.historyIndex >= this.history.length - 1) return;
    const nextIndex = this.historyIndex + 1;
    const entry = this.history[nextIndex];
    if (!entry) return;

    this.isApplyingHistory = true;
    try {
        applyHistoryBatch(this, entry, 'redo')
    } finally {
        this.isApplyingHistory = false;
    }

    this.historyIndex = nextIndex;
    this._historySnapshot = this.saveToJSON();
}