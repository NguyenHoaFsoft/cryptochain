import React, { Component } from "react";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { withRouter } from "../withRouter"; // Sử dụng withRouter của bạn

class ConductTransaction extends Component {
  state = {
    recipient: '',
    amount: 0
  };

  updateRecipient = event => {
    this.setState({ recipient: event.target.value });
  }

  updateAmount = event => {
    this.setState({ amount: Number(event.target.value) });
  }

  conductTransaction = () => {
    const { recipient, amount } = this.state;
    fetch(`${document.location.origin}/api/transact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amount })
    })
      .then(response => response.json())
      .then(json => {
        alert(json.message || json.type);
        // Sử dụng navigate được truyền qua props từ withRouter
        this.props.navigate('/transaction-pool');
      });
  }

  render() {
    console.log(this.state);
    return (
      <div className="ConductTransaction">
        <Link to="/">Home</Link>
        <h3>Conduct a Transaction</h3>
        <div className="form-container">
          <FormGroup>
            <FormControl
              type="text"
              placeholder="recipient"
              value={this.state.recipient}
              onChange={this.updateRecipient}
            />
          </FormGroup>
          <FormGroup>
            <FormControl
              type="number"
              placeholder="amount"
              value={this.state.amount}
              onChange={this.updateAmount}
            />
          </FormGroup>
          <div>
            <Button
              variant="danger"
              onClick={this.conductTransaction}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ConductTransaction);
