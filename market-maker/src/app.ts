import * as express from "express"
import * as agent from "superagent"

let app = express()

app.get(`/callback`, (req, res) =>
{
	let { pair, maker, taker, price } = req.query
	// check taker's wallet, find contract, send shit, receive shit
})

function createOrder(pair: string, dir: string, addr: string, price: number, amount: number, callback: (err) => void)
{
	// url, pair, addr, price, amount, sig
	agent
		.get(`http://localhost:8833/order/create`)
		.query({ pair, addr, price, dir, amount, url: `http://localhost:${PORT}/callback` })
		.query({ sig: "fakesig" })
		.end((err, res) =>
		{
			if (err)
				return callback(err)
			
			if (res.error)
				return callback(res.error)
			
			if (!res.ok)
				return callback(new Error("" + res.status))
			
			return callback(undefined)
		})
}

let PORT = 8834
app.listen(PORT, () =>
{
	console.log(`hello! ${PORT}`)

	createOrder("ETH_BTC", "buy", "walletaddressepta", 0.1, 150, (err) => err ? console.error(err) : console.log("order successfully created"))
})