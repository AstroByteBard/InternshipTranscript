export default function undo() {
    if (this.historyIndex > 0) {
        this.historyIndex--;
        this.loadFromJSON(JSON.parse(this.history[this.historyIndex]));
    }
}