class Timing {
  start() {}
}

export class Value {
  constructor(value) {
    this.value = value;
  }

  interpolate() {
    return 1;
  }
  setValue(value) {
    this.value = value;
  }
}

export const View = "View";

export function timing() {
  return new Timing();
}

// export default {
//   Value,
//   View: "View",
//   timing: () => new Timing()
// };
