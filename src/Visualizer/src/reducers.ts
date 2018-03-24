import { combineReducers } from "redux";
import { listReducer } from "./List/ListReducers";
import { detailsReducer } from "./Details/DetailsReducers";

export const rootReducer = combineReducers({
  details: detailsReducer,
  list: listReducer
});
