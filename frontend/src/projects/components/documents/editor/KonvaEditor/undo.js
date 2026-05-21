import { applyHistoryBatch } from './historyDelta'

export default function undo() {
    if (this.historyIndex < 0) return;
    const entry = this.history[this.historyIndex];
    if (!entry) return;

    this.isApplyingHistory = true;
    try {
        applyHistoryBatch(this, entry, 'undo')
    } finally {
        this.isApplyingHistory = false;
    }

    this.historyIndex--;
    this._historySnapshot = this.saveToJSON();
}