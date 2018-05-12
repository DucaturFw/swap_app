"use strict";
exports.__esModule = true;
var express = require("express");
var agent = require("superagent");
var app = express();
app.get("/callback", function (req, res) {
    var _a = req.query, pair = _a.pair, maker = _a.maker, taker = _a.taker, price = _a.price;
    // check taker's wallet, find contract, send shit, receive shit
});
function createOrder(pair, dir, addr, price, amount, callback) {
    // url, pair, addr, price, amount, sig
    agent
        .get("http://localhost:8833/order/create")
        .query({ pair: pair, addr: addr, price: price, dir: dir, amount: amount, url: "http://localhost:" + PORT + "/callback" })
        .query({ sig: "fakesig" })
        .end(function (err, res) {
        if (err)
            return callback(err);
        if (res.error)
            return callback(res.error);
        if (!res.ok)
            return callback(new Error("" + res.status));
        return callback(undefined);
    });
}
var PORT = 8834;
app.listen(PORT, function () {
    console.log("hello! " + PORT);
    createOrder("ETH_BTC", "buy", "walletaddressepta", 0.1, 150, function (err) { return err ? console.error(err) : console.log("order successfully created"); });
});
