export default function redo() {
    if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.loadFromJSON(JSON.parse(this.history[this.historyIndex]));
    }
}