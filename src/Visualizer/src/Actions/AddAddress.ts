import { Action } from "redux";

export interface AddAddress extends Action {
  type: string;
  address: string;
}

export function isAddAddress(action: Action): action is AddAddress {
  return action.type === "AddAddress";
}

export const addAddress = (address: string): AddAddress => {
  return {
    type: "AddAddress",
    address: address
  };
};
