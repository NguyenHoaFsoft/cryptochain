import React, { Component } from "react";
import Transaction from "./Transaction";
import { Link } from "react-router-dom";

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
    state = { transactionPoolMap: {} };

    // fetchTransactionPoolMap = () => {
    //     fetch(`${document.location.origin}/api/transaction-pool-map`)
    //         .then(response => response.json())
    //         .then(json => this.setState({ transactionPoolMap: json }));
    // }
    fetchTransactionPoolMap = () => {
        console.log("Fetching transaction pool from:", document.location.origin);
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => {
                console.log("Transaction Pool Data:", json);
                this.setState({ transactionPoolMap: json });
            });
    }

    componentDidMount() {
        this.fetchTransactionPoolMap();

        setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INTERVAL_MS
        );
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
