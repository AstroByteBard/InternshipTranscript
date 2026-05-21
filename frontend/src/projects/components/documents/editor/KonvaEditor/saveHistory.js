import { clonePlain, diffHistorySnapshots, summarizeHistoryAction } from './historyDelta'

export default function saveHistory() {
    if (!this.stage || this.isLoading || this.isApplyingHistory) return;
    const data = this.saveToJSON();
    if (!data) return;

    if (!this._historySnapshot) {
        this._historySnapshot = data;
        return;
    }

    const actions = diffHistorySnapshots(this._historySnapshot, data);
    if (!actions.length) return;

    // Remove everything after current history index
    if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(actions);
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
    this._historySnapshot = data;

    const logEntry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: new Date().toISOString(),
        historyIndex: this.historyIndex,
        actions: clonePlain(actions),
        summaries: actions.map(summarizeHistoryAction)
    };

    if (!Array.isArray(this.historyLog)) this.historyLog = [];
    this.historyLog.unshift(logEntry);
    if (this.historyLog.length > 25) this.historyLog.pop();

    if (typeof this.$emit === 'function') {
        try { this.$emit('history-recorded', logEntry); } catch (e) { /* ignore */ }
    }
}