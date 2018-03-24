import AddressInfoService from "./AddressInfoService";
import { Web3 } from "../Util/web3";
import MockWeb3 from "../Util/MockBlockchain";

let service: AddressInfoService;
let web3: Web3;

beforeEach(() => {
  web3 = new MockWeb3();
  service = new AddressInfoService(web3);
});

it("provides the balance for a given address", async () => {
  let balance = await service.getBalance("0x1234");
  expect(balance.toString(10)).toEqual("9900000");
});

it("provides the balance for a given address at a certain block", async () => {
  let balance = await service.getBalanceAt("0x1234", 3);
  expect(balance.toString(10)).toEqual("9900000");
});
