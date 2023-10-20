const fetch = require("node-fetch");
const crypto = require("crypto");

class FixedFloat {
    /**
     * API Class Constructor
     * @param {String} apiKey API Key
     * @param {String} apiSecret API Secret
     * @description Get your pair of keys from https://fixedfloat.com/user/apikey
     */
    constructor(apiKey, apiSecret) {
        if (!apiKey || !apiSecret) throw new Error('Please provide an API and secret keys');
        this.mainURL = 'https://ff.io/api/v2/';
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    /**
     * Made request
     * @param {String} api_url API URL
     * @param {String} data Param Body
     */
    async _request(api_url, data = '') {
        if (!api_url) throw new Error(`Required params: api_url`);

        const sign = crypto.createHmac('sha256', Buffer.from(this.apiSecret)).update(data).digest('hex');

        const resp = await fetch(this.mainURL + api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'X-API-KEY': this.apiKey,
                'X-API-SIGN': sign
            },
            body: data
        }).then(
            (response) => (response.json())
        );

        if (resp.code !== 0 || resp.msg !== 'OK')
            throw new Error(`Error ${resp.code}: ${resp.msg}`);

        return resp.data;
    }

    /**
     * Getting a list of currencies supported by the FixedFloat service.
     */
    async getCurrencies() {
        return await this._request('ccies');
    }

    /**
     * Getting the exchange rate of a pair of currencies in the selected direction and type of rate.
     * @param {String} fromCcy Code of the currency the client wants to send (ex. ETH)
     * @param {String} toCcy Code of the currency the client wants to receive (ex. BTC)
     * @param {Numeric} amount If direction="from", then this is the amount in currency fromCcy that the client wants to send.
     * 
     *      If direction="to", then this is the amount in currency toCcy that the client wants to receive
     * 
     * @param {'from'|'to'} direction The direction of the exchange determines whether the client wants to send a certain amount or receive a certain amount. Can take one of the following values:
     * 
     *      ● from — if the client wants to send the amount amount in the currency fromCcy
     * 
     *      ● to — if the client wants to receive the amount amount in the currency toCcy
     * 
     * @param {'fixed'|'float'} type Order type: fixed or float (def. float)
     */
    async getPrice(fromCcy, toCcy, amount, direction = 'from', type = 'float') {
        const data = {
            fromCcy: fromCcy,
            toCcy: toCcy,
            amount: amount,
            direction: direction,
            type: type
        };
        return await this._request('price', JSON.stringify(data));
    }

    /**
     * Creating an order for the exchange of selected currencies with a specified amount and address.
     * @param {String} fromCcy Code of the currency the client wants to send (ex. ETH)
     * @param {String} toCcy Code of the currency the client wants to receive (ex. BTC)
     * @param {String} toAddress Destination address to which the funds will be dispatched upon the successful completion of the Order
     * @param {Numeric} amount If direction="from", then this is the amount in currency fromCcy that the client wants to send.
     * 
     *      If direction="to", then this is the amount in currency toCcy that the client wants to receive
     * 
     * @param {'from'|'to'} direction The direction of the exchange determines whether the client wants to send a certain amount or receive a certain amount. Can take one of the following values:
     * 
     *      ● from — if the client wants to send the amount amount in the currency fromCcy
     * 
     *      ● to — if the client wants to receive the amount amount in the currency toCcy
     * 
     * @param {'fixed'|'float'} type Order type: fixed or float (def. float)
     * @param {String} tag This parameter can be omitted by specifying the MEMO or Destination Tag in toAddress separated by a colon.
     */
    async createOrder(fromCcy, toCcy, toAddress, amount, direction = 'from', type = 'float', tag = false) {

        const data = {
            fromCcy: fromCcy,
            toCcy: toCcy,
            toAddress: toAddress,
            amount: amount,
            tag: tag,
            direction: direction,
            type: type
        };
        return await this._request('create', JSON.stringify(data));
    }

    /**
     * The method receives the updated order data.
     * @param {String} id Order ID (ex. 8PQWPY)
     * @param {String} token Order security token received when creating an order in data.token (ex. 5RlERmZxCdyEotQ9UwoDXjR2aclPDq7i2tKXKDkl)
     */
    async getOrder(id, token) {
        const data = {
            id: id,
            token: token
        };
        return await this._request('order', JSON.stringify(data));
    }

    /**
     * Emergency Action Choice
     * @param {String} id Order ID (ex. 8PQWPY)
     * @param {String} token Order security token received when creating an order in data.token (ex. 5RlERmZxCdyEotQ9UwoDXjR2aclPDq7i2tKXKDkl)
     * @param {'EXCHANGE'|'REFUND'} choice Choice of action in the EMERGENCY status. Can be one of the values:
     * 
     *      ● EXCHANGE — Continue the exchange at the market rate at the time the selection was made or at the time the order was corrected
     * 
     *      ● REFUND — Refund minus miner fee
     * 
     * @param {String} address The address to which the refund is to be made. Required if choice="REFUND"
     * @param {String} tag MEMO or Destination Tag if required
     */
    async setEmergency(id, token, choice = 'EXCHANGE', address = false, tag = false) {
        
        const data = {
            id: id,
            token: token,
            choice: choice,
            address: address,
            tag: tag
        };
        return await this._request('emergency', JSON.stringify(data));
    }

    /**
     * Getting a list of images of QR codes for an order
     * @param {String} id Order ID (ex. 8PQWPY)
     * @param {String} token Order security token received when creating an order in data.token (ex. 5RlERmZxCdyEotQ9UwoDXjR2aclPDq7i2tKXKDkl)
     */
    async getQRCodes(id, token) {
        
        const data = {
            id: id,
            token: token
        };
        return await this._request('qr', JSON.stringify(data));
    }
}

module.exports = FixedFloat;