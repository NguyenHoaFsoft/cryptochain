import React, { Component } from "react";
import Transaction from "./Transaction";
import { Link } from "react-router-dom";
import { transform } from "@babel/core";

class TransactionPool extends Component {
    state = { transactionPoolMap: {} };

    fetchTransactionPoolMap = () => {
        fetch('http://localhost:3000/api/transaction-pool-map')
            .then(response => response.json())
            .then(json => this.setState({ transactionPoolMap: json }));
    }

    componentDidMount() {
        this.fetchTransactionPoolMap();
    }

    render() {
        const transactions = Object.values(this.state.transactionPoolMap);
        return (
            <div className="TransactionPool">
                <div><Link to='/'>Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    transactions.map(transaction => (
                        <div key={transaction.id}>
                            <hr />
                            <Transaction transaction={transaction} />
                        </div>
                    ))
                }
            </div>
        );
    }

}

export default TransactionPool;
