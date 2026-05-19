export default function getSuggestionLabels() {
    if (this.suggestionLabels && this.suggestionLabels.length) {
        return this.suggestionLabels;
    }
    return ['Outstanding', 'Opportunity'];
}