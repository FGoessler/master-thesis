import { HTMLAttributes, ReactWrapper } from "enzyme";

/// This is a helper function to deal with the bit messy capabilities of enzyme to simulate form input element changes.
export function simulateInput(node: ReactWrapper<HTMLAttributes, {}>, input: string) {
  (node as any).node.value = input;
  node.first().simulate("change");
}

export function noOp() {
  return;
}
