export default function pickFirst(list) {
    return Array.isArray(list) && list.length ? list[0] : null;
}