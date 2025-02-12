import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";
import { Link } from "react-router-dom";
import { withRouter } from "../withRouter"; // Sử dụng withRouter của bạn

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
    state = { transactionPoolMap: {} };

    fetchTransactionPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => {
                console.log("Transaction Pool Data:", json);
                this.setState({ transactionPoolMap: json });
            });
    }

    fetchMineTransactions=() => {
        fetch(`${document.location.origin}/api/mine-transactions`)
        .then(response=>{
            if(response.status === 200){
                alert("Sucess");
                this.props.navigate('/blocks');
            }else{
                alert("The mine-transactions block request dit not complete.");
            }
        })
           
    }

    componentDidMount() {
        this.fetchTransactionPoolMap();

        this.fetchPoolMapInterval = setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INTERVAL_MS
        );
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval);
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
                <hr />
                <Button
                    variant="danger"
                    onClick={this.fetchMineTransactions}
                >
                    Mine the Transactions
                </Button>
            </div>
        );
    }

}

export default withRouter(TransactionPool);
