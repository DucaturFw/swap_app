import * as express from "express"
import * as agent from "superagent"

let app = express()

interface IOrder
{
    maker: string
    price: number
    amount: number
    url: string
}
interface IOrderBook
{
    buy: IOrder[]
    sell: IOrder[]
}

let orderbook: { [currency: string]: IOrderBook } = {
    ETH_BTC: {
        buy: [
            {
                maker: `vasya`,
                price: 0.11,
                amount: 150,
                url: `localhost:8834/callback`,
            },
            {
                maker: `serega`,
                price: 0.12,
                amount: 400,
                url: `localhost:8834/callback`,
            },
        ],
        sell: [
            {
                maker: `ahmet`,
                price: 0.105,
                amount: 0.1,
                url: `localhost:8834/callback`,
            },
            {
                maker: `kolyan`,
                price: 0.104999,
                amount: 400,
                url: `localhost:8834/callback`,
            },
        ]
    }
}

function _del<A extends {}>(item: A, propName: keyof A)
{
    let a = Object.assign({}, item)
    delete a[propName]
    return a
}

app.get('/orderbook', (req, res) =>
{
    let book = { }
    Object.keys(orderbook).forEach(pair =>
    {
        book[pair] = {
            buy: orderbook[pair].buy.map(x => _del(x, "url")),
            sell: orderbook[pair].sell.map(x => _del(x, "url"))
        }
    })
    res.json({ result: book })
})
app.get('/register', (req, res) =>
{
    // register as market maker
    // let { callback, sig } = req.query
})
app.get('/order/create', (req, res) =>
{
    let { url, pair, addr, price, amount, sig } = req.query
    let dir: "buy" | "sell" = req.query.dir
    if (!orderbook[pair])
        orderbook[pair] = { buy: [], sell: [], }
    
    orderbook[pair][dir].push({ amount, price, maker: addr, url })

    res.json({ result: 1 })
})
app.get('/order/delete', (req, res) =>
{
    let { pair, addr, price, sig } = req.query
    let dir: "buy" | "sell" = req.query.dir
    
    orderbook[pair][dir] = orderbook[pair][dir].filter(x => (x.maker == addr) && (x.price == price))
    
    res.json({ result: 1 })
})
app.get('/order/fulfill', (req, res) =>
{
    let { pair, maker, taker, price } = req.query
    let dir: "buy" | "sell" = req.query.dir

    let matchingOrder = orderbook[pair][dir].find(x => (x.maker == maker) && (x.price == price))
    if (!matchingOrder)
        return res.json({ error: { code: 14, msg: `matching order not found! go fuck yourself` } })
    
    let r = agent
        .get(matchingOrder.url)
        .query({ pair, maker, taker, price })
        .end((err, res) =>
        {
            console.log(`market maker response: ${r.url}\n${res.text}`)
        })
})

let PORT = 8833
app.listen(PORT, () =>
{
    console.log(`hello! ${PORT}`)
})