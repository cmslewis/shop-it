
export function pageGetResultStartIndex(pageIndex: number, pageSize: number) {
    return pageIndex * pageSize;
}

export function pageGetResultEndIndex(pageIndex: number, pageSize: number, numResults: number) {
    return Math.min(numResults, pageIndex * pageSize + pageSize);
}