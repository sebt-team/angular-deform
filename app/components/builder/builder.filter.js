export function DfOffsetFilter() {
  return function (input,start) {
    start = parseInt(start,10);
    return input.slice(start);
  };
}

export function DfRemoveHiddens() {
  return function (inputs) {
    return inputs.filter( i => {
      return !i.hidden;
    })
  };
}
