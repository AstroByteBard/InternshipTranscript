export default function saveHistory() {
    if (!this.stage || this.isLoading) return;
    const data = this.saveToJSON();
    if (!data) return;

    // Remove everything after current history index
    if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(JSON.stringify(data));
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
}