import * as React from "react";
import StringFormatter from "../Util/stringFormatter";

interface AddressListProps {
  addresses: string[];
  addressAddHandler: (newAddress: string) => void;
  addressSelectedHandler: (address: string) => void;
}

export default class AddressList extends React.Component<AddressListProps, { addressToAdd: string }> {

  constructor(props: AddressListProps) {
    super(props);
    this.state = {
      addressToAdd: ""
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.addClicked = this.addClicked.bind(this);
  }

  handleInputChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({addressToAdd: event.currentTarget.value});
  }

  addClicked() {
    this.props.addressAddHandler(this.state.addressToAdd);
    this.setState({addressToAdd: ""});
  }

  render() {
    return (
      <div>
        <h3>Addresses</h3>
        <input type="text" placeholder="Add address" onChange={this.handleInputChange} value={this.state.addressToAdd}/>
        <button onClick={this.addClicked}>Add</button>
        <ul>
          {this.props.addresses.map((addr: string) =>
            <li key={addr} className="list-item hash" onClick={() => this.props.addressSelectedHandler(addr)}>
              {StringFormatter.trimHash(addr)}
            </li>
          )}
        </ul>
      </div>
    );
  }
}
