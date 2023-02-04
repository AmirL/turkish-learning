export function arrayMoveMutable(arr: any[], from: number, to: number) {
  const startIndex = to < 0 ? arr.length + to : to;
  const item = arr.splice(from, 1)[0];
  arr.splice(startIndex, 0, item);
}
