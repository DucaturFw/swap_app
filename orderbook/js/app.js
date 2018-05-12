"use strict";
exports.__esModule = true;
var express = require("express");
var agent = require("superagent");
var app = express();
var orderbook = {
    ETH_BTC: {
        buy: [
            {
                maker: "vasya",
                price: 0.11,
                amount: 150,
                url: "localhost:8834/callback"
            },
            {
                maker: "serega",
                price: 0.12,
                amount: 400,
                url: "localhost:8834/callback"
            },
        ],
        sell: [
            {
                maker: "ahmet",
                price: 0.105,
                amount: 0.1,
                url: "localhost:8834/callback"
            },
            {
                maker: "kolyan",
                price: 0.104999,
                amount: 400,
                url: "localhost:8834/callback"
            },
        ]
    }
};
function _del(item, propName) {
    var a = Object.assign({}, item);
    delete a[propName];
    return a;
}
app.get('/orderbook', function (req, res) {
    var book = {};
    Object.keys(orderbook).forEach(function (pair) {
        book[pair] = {
            buy: orderbook[pair].buy.map(function (x) { return _del(x, "url"); }),
            sell: orderbook[pair].sell.map(function (x) { return _del(x, "url"); })
        };
    });
    res.json({ result: book });
});
app.get('/register', function (req, res) {
    // register as market maker
    // let { callback, sig } = req.query
});
app.get('/order/create', function (req, res) {
    var _a = req.query, url = _a.url, pair = _a.pair, addr = _a.addr, price = _a.price, amount = _a.amount, sig = _a.sig;
    var dir = req.query.dir;
    if (!orderbook[pair])
        orderbook[pair] = { buy: [], sell: [] };
    orderbook[pair][dir].push({ amount: amount, price: price, maker: addr, url: url });
    res.json({ result: 1 });
});
app.get('/order/delete', function (req, res) {
    var _a = req.query, pair = _a.pair, addr = _a.addr, price = _a.price, sig = _a.sig;
    var dir = req.query.dir;
    orderbook[pair][dir] = orderbook[pair][dir].filter(function (x) { return (x.maker == addr) && (x.price == price); });
    res.json({ result: 1 });
});
app.get('/order/fulfill', function (req, res) {
    var _a = req.query, pair = _a.pair, maker = _a.maker, taker = _a.taker, price = _a.price;
    var dir = req.query.dir;
    var matchingOrder = orderbook[pair][dir].find(function (x) { return (x.maker == maker) && (x.price == price); });
    if (!matchingOrder)
        return res.json({ error: { code: 14, msg: "matching order not found! go fuck yourself" } });
    var r = agent
        .get(matchingOrder.url)
        .query({ pair: pair, maker: maker, taker: taker, price: price })
        .end(function (err, res) {
        console.log("market maker response: " + r.url + "\n" + res.text);
    });
});
var PORT = 8833;
app.listen(PORT, function () {
    console.log("hello! " + PORT);
});
