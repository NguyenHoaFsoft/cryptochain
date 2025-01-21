import Wallet from "./index.js";
import { verifySignature } from "../util/index.js";
import Transaction from "./transaction.js";
import { STARTING_BALANCE } from "../config.js";
import Blockchain from "../blockchain/index.js";
import jest from 'jest-mock';


describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'foobar';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    describe('createTransaction()', () => {
        describe('and the amount exceeds the balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' }))
                    .toThrow('Amount exceeds balance');
            });
        });

        describe('and the amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                transaction = wallet.createTransaction({ amount, recipient });
            });

            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });

        });

        describe('and the chain is passed', () => {
            it('calls `Wallet.calculateBalance()`', () => {
                const calculateBalanceMock = jest.fn();

                const originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;
                wallet.createTransaction({
                    recipient: 'foo',
                    amount: 10,
                    chain: new Blockchain().chain
                });
                expect(calculateBalanceMock).toHaveBeenCalled();
                Wallet.calculateBalance = originalCalculateBalance;
            });

        });

        describe('calculateBalance()', () => {
            let blockchain;

            beforeEach(() => {
                blockchain = new Blockchain();
            });

            describe('and there are no outputs for the wallet', () => {
                it('returns the startting balance', () => {
                    expect(wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })).toEqual(STARTING_BALANCE);
                });
            });

            describe('and there are outputs for the wallet', () => {
                let transactionOne, transactionTwo;

                beforeEach(() => {
                    transactionOne = new Wallet().createTransaction({
                        recipient: wallet.publicKey,
                        amount: 50
                    });
                    transactionTwo = new Wallet().createTransaction({
                        recipient: wallet.publicKey,
                        amount: 60
                    });
                    blockchain.addBlock({ data: [transactionOne, transactionTwo] });
                });


                it('adds the output values of all unspent transactions to the balance', () => {
                    expect(wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })).toEqual(STARTING_BALANCE +
                        transactionOne.outputMap[wallet.publicKey] +
                        transactionTwo.outputMap[wallet.publicKey]);
                });

                describe('and the wallet has made a transaction', () => {
                    let recentTransaction;

                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recipient: 'foo-recipient',
                            amount: 30
                        });

                        blockchain.addBlock({ data: [recentTransaction] });
                    });

                    it('returns the balance for the most recent transaction', () => {
                        expect(
                            Wallet.calculateBalance({
                                chain: blockchain.chain,
                                address: wallet.publicKey
                            })).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                    });

                    describe('and there are outputs next to and after the recent transaction', () => {
                        let sameBlockTransaction, nextBlockTransaction;

                        beforeEach(() => {
                            // Tạo giao dịch gần nhất
                            recentTransaction = wallet.createTransaction({
                                recipient: 'later-foo-address',
                                amount: 60
                            });

                            // Giao dịch trong cùng block
                            sameBlockTransaction = Transaction.rewardTransaction({
                                minerWallet: wallet
                            });

                            // Thêm block chứa recentTransaction và sameBlockTransaction
                            blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] });

                            // Giao dịch trong block tiếp theo
                            nextBlockTransaction = new Wallet().createTransaction({
                                recipient: wallet.publicKey,
                                amount: 75
                            });

                            // Thêm block chứa nextBlockTransaction
                            blockchain.addBlock({ data: [nextBlockTransaction] });
                        });

                        it('includes the output amounts in the returned balance', () => {
                            expect(
                                Wallet.calculateBalance({
                                    chain: blockchain.chain,
                                    address: wallet.publicKey
                                })
                            ).toEqual(
                                recentTransaction.outputMap[wallet.publicKey] +
                                nextBlockTransaction.outputMap[wallet.publicKey] +
                                sameBlockTransaction.outputMap[wallet.publicKey]
                            );
                        });
                    });



                });
            });
        });
    });
});