export function DfOffsetFilter() {
  return function (input,start) {
    start = parseInt(start,10);
    return input.slice(start);
  };
}
