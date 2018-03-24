
export function beDefined(val: any | undefined): any {
  if (val === undefined) {
    throw new Error("Precondition failed! Value should be defined!");
  }
  return val;
}

export function beString(val: any | undefined): string {
  if (typeof val !== "string") {
    throw new Error(`Precondition failed! Value should be a string but is ${typeof val}!`);
  }
  return val;
}

export function beNonEmptyString(val: any | undefined): string {
  beString(val);
  if (!val.length) {
    throw new Error("Precondition failed! Value should be a string and non empty!");
  }
  return val;
}

export function beNumber(val: any | undefined): number {
  if (typeof val !== "number") {
    throw new Error(`Precondition failed! Value should be a number but is ${typeof val}!`);
  }
  return val;
}

export function beObject(val: any | undefined): any {
  if (typeof val !== "object") {
    throw new Error(`Precondition failed! Value should be a object but is ${typeof val}!`);
  }
  return val;
}
