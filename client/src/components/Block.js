import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
    state = { displayTransactions: false };

    toggleTransactions = () => {
        this.setState({ displayTransactions: !this.state.displayTransactions });
    }

    get displayTransactions() {
        const { data } = this.props.block;
        const stringifiedData = JSON.stringify(data);

        const dataDisplay = stringifiedData.length > 35 ?
            `${stringifiedData.substring(0, 35)}...` :
            stringifiedData;

        if (this.state.displayTransactions) {
            return
            <div>
                {
                    data.map(transaction => (
                        <div key={transaction.id}>
                            <hr />
                            <Transaction transaction={transaction} />
                        </div>
                    ))
                }
                <Button
                    bsStyle="danger"
                    bsSize="small"
                    onClick={this.toggleTransactions}
                >
                    Show Less
                </Button>
            </div>
        }
        return <div>
            Data: {dataDisplay}
            <Button
                bsStyle="danger"
                bsSize="small"
                onClick={this.toggleTransactions}
            >
                Show more
            </Button>
        </div>
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