import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
    state = { displayTransactions: false };

    toggleTransactions = () => {
        this.setState({ displayTransactions: !this.state.displayTransactions });
    }

    get displayTransactions() {
        // Truy cập đúng mảng giao dịch từ dữ liệu:
        const transactions = this.props.block.data.data;

        console.log("Corrected Data:", transactions);
        console.log("Is Array?", Array.isArray(transactions));

        if (!Array.isArray(transactions)) {
            return <p>No transactions available</p>;
        }

        if (this.state.displayTransactions) {
            return (
                <div>
                    {transactions.map(transaction => (
                        <div key={transaction.id}>
                            <hr />
                            <Transaction transaction={transaction} />
                        </div>
                    ))}
                    <br />
                    <Button
                        bsStyle="danger"
                        bsSize="small"
                        onClick={this.toggleTransactions}
                    >
                        Show Less
                    </Button>
                </div>
            );
        }

        const stringifiedData = JSON.stringify(transactions);
        const dataDisplay = stringifiedData.length > 35 ?
            `${stringifiedData.substring(0, 35)}...` :
            stringifiedData;

        return (
            <div>
                <div>Data: {dataDisplay}</div>
                <Button
                    bsStyle="danger"
                    bsSize="small"
                    onClick={this.toggleTransactions}
                >
                    Show more
                </Button>
            </div>
        );
    }

    render() {
        const { timestamp, hash } = this.props.block;

        const hashDisplay = `${hash.substring(0, 15)}...`;

        return (
            <div className='Block'>
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                {this.displayTransactions}
            </div>
        );
    }
};

export default Block;