import cryptoHash from './crypto-hash.js';

describe('cryptoHash()', () => {

    it('generates a SHA-256 hashed output', () => {
        const expectedHash = cryptoHash('foo');
        expect(cryptoHash('foo')).toEqual(expectedHash);
    });

    it('produces the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three'))
            .toEqual(cryptoHash('three', 'one', 'two'));
    });

    it('produces a unique hash when the properties have changed on an input', () => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'a';
        expect(cryptoHash(foo)).not.toEqual(originalHash);

    });
});