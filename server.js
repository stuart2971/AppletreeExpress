const path = require("path")
const express = require("express")
const bodyParser = require('body-parser');
const GoogleSpreadsheet = require("google-spreadsheet")
const { promisify } = require("util");
const Nexmo = require('nexmo');
const MongoClient = require('mongodb').MongoClient;


const app = express()

const creds = require("./client_secret.json");
const { ObjectId, ObjectID } = require("mongodb");
require('dotenv').config();
const nexmo = new Nexmo({
    apiKey: process.env.NEXMO_API_KEY,
    apiSecret: process.env.NEXMO_API_SECRET,
});
//Set static folder
app.use(express.static(path.join(__dirname, "public")))
    //I dont know
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
//Stripe Stuff
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async(req, res) => {
    async function checkIfOpen() {
        return new Promise(resolve => {
            MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
                if (err) throw err;
                var dbo = db.db("AppletreeExpress");
                dbo.collection("Settings").find().toArray(function(err, result) {
                    if (err) throw err;
                    resolve(result[0].OPEN)
                });
            });
        })
    }
    let OPEN = await checkIfOpen();
    if (!OPEN) {
        res.json({ message: "We are currently not taking orders at this time.  Please try again from Monday to Friday from 9:00am - 5:00pm" })
        return;
    }

    let converted_items = []
    const order_data = req.body
    for (let i = 0; i < order_data.length; i++) {
        //do this part
        if (isSandwichOrder(order_data[i])) {
            converted_items[i] = {
                price_data: {
                    currency: "cad",
                    product_data: {
                        name: order_data[i].item,
                    },
                    unit_amount: calculatePrice(order_data[i].item),
                },
                quantity: 1,
                description: makeSandwichDescription(order_data[i])
            }
        } else {
            converted_items[i] = {
                price_data: {
                    currency: "cad",
                    product_data: {
                        name: order_data[i].item,
                    },
                    unit_amount: calculatePrice(order_data[i].item),
                },
                quantity: 1
            }
        }

    }
    console.log(order_data)

    function isSandwichOrder(item) {
        if (Object.keys(item).includes("lettuce")) {
            return true
        }
        return false
    }

    function calculatePrice(item) {
        switch (item) {
            case "Beef Sandwich":
                return 750
            case "Chicken Sandwich":
                return 750;
            case "Falafel Sandwich":
                return 550;
            case "Fries":
                return 350;
            case "Poutine":
                return 600;
            case "Spicy Fries":
                return 400;
            case "Belgian Fries (garlic)":
                return 400;
            case "Belgian Fries (spicy)":
                return 400;
            case "Combo 1":
                return 1000;
            case "Combo 2":
                return 1100;
            case "Combo 3":
                return 600;
            case "Chicken and Falafel Plate":
                return 1200;
            case "3 Spring Rolls":
                return 100;
            case "Cold Pop":
                return 125;
            case "Brownie":
                return 200;
        }
    }

    function makeSandwichDescription(order) {
        let description = "";

        description += order.name + " would like a "
        description += order.spice == "None" ? "" : `${order.spice} `
        description += order.item.includes("Combo") ? `${order.item.includes("Combo 3") ? "falafel" : order.sandwichType} with ` : `${order.item} with `
        description += turnVeggiesIntoArray(order).join(", ");
        description += order.side != undefined ? ` + ${order.side}` : ""
        description += order.drink != undefined ? ` + ${order.drink}` : ""

        return description
    }

    function turnVeggiesIntoArray(order) {
        let arr = [];
        if (order.lettuce) arr.push("lettuce")
        if (order.tomato) arr.push("tomato")
        if (order.cucumber) arr.push("cucumber")
        if (order.onion) arr.push("onion")
        return arr
    }
    async function InsertOrderIntoDatabase() {
        return new Promise(resolve => {
            MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
                if (err) throw err;
                var dbo = db.db("AppletreeExpress");
                dbo.collection("Orders").insertOne({
                    orders: order_data
                }, function(err, res) {
                    if (err) throw err;
                    resolve(res.ops[0]._id)
                });
                db.close();
            });
        })

    }
    let orderId = await InsertOrderIntoDatabase()
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: converted_items,
        mode: "payment",
        success_url: process.env.URL + "/order-success.html",
        cancel_url: process.env.URL + `/order-page.html`,
        billing_address_collection: 'required',
        metadata: { 'orderId': `${orderId}` }
    });
    res.json({ id: session.id });

});

//Stripe Webhooks

async function addToSpreadsheet(sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'payment_intent.payment_method']
    }, );
    let paymentDetails = session.payment_intent.payment_method.billing_details

    async function GetOrderFromDatabase() {
        return new Promise(resolve => {
            MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
                if (err) throw err;
                var dbo = db.db("AppletreeExpress");
                dbo.collection("Orders").find({ _id: ObjectID(session.metadata.orderId) }).toArray(function(err, result) {
                    if (err) throw err;
                    resolve(result)
                });
            });
        })
    }

    let orderData = await GetOrderFromDatabase();
    let ORDER = orderData[0].orders

    async function accessSpreadsheet() {
        const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_URL)
        await promisify(doc.useServiceAccountAuth)(creds)
        const info = await promisify(doc.getInfo)()
        const sheet = info.worksheets[0]
        console.log(`Title: ${sheet.title}.  Rows: ${sheet.rowCount}`)
        for (let i = 0; i < ORDER.length; i++) {

            const row = {
                SandwichName: ORDER[i].name,
                Burger: ORDER[i].item == "Beef Sandwich" || ORDER[i].sandwichType == "beef sandwich" ? "X" : "",
                Chicken: ORDER[i].item == "Chicken Sandwich" || ORDER[i].sandwichType == "chicken sandwich" ? "X" : "",
                Falafel: ORDER[i].item == "Falafel Sandwich" || ORDER[i].item === "Combo 3" ? "X" : "",
                L: ORDER[i].lettuce == true ? "X" : "",
                T: ORDER[i].tomato == true ? "X" : "",
                C: ORDER[i].cucumber == true ? "X" : "",
                O: ORDER[i].onion == true ? "X" : "",
                Spice: ORDER[i].spice,
                Cheese: ORDER[i].cheese,
                Poutine: ORDER[i].item == "Poutine" ? "X" : "",
                Regular: ORDER[i].item == "Fries" ? "X" : "",
                Spicy: ORDER[i].item == "Spicy Fries" ? "X" : "",
                Belgian: ORDER[i].item == "Belgian Fries (garlic)" || ORDER[i].item == "Belgian Fries (spicy)" ? (ORDER[i].item == "Belgian Fries (garlic)" ? "Garlic" : "Spicy") : "",
                SRolls: ORDER[i].item == "3 Spring Rolls" ? "3" : "",
                ComboSide: ORDER[i]["drink"] == undefined && ORDER[i].item.includes("Combo") ? "3 Spring Rolls" : (ORDER[i].item.includes("Combo") ? `${ORDER[i].side} + ${ORDER[i].drink}` : ""),
                Brownie: ORDER[i].item == "Brownie" ? "X" : "",
                Drink: ORDER[i].item == "Cold Pop" ? ORDER[i].drink : "",
                FalafelPlate: ORDER[i].item == "Chicken and Falafel Plate" ? "X" : "",
                Buyer: paymentDetails.name,
                City: paymentDetails.address.city,
                Address: paymentDetails.address.line1,
                Email: paymentDetails.email,
                PostalCode: paymentDetails.address.postal_code

            }

            await promisify(sheet.addRow)(row)
        }
        nexmo.account.checkBalance((err, result) => {
            if (result.value.toFixed(2) < 1) {
                nexmo.message.sendSms("15068708278", process.env.NOTIFY_NUMBER, `Low Texting Balance: ${result.value.toFixed(2)}. To Refill Balance on Nexmo: https://dashboard.nexmo.com/payments/new`);
            }
        });
        nexmo.message.sendSms("15068708278", process.env.NOTIFY_NUMBER, "NEW ORDER MADE ONLINE");
    }
    console.log(paymentDetails)
    accessSpreadsheet()

}


app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (request, response) => {
    let event = request.body;
    // Handle the event
    if (event.type == 'checkout.session.completed') {
        const paymentMethod = event.data.object;
        addToSpreadsheet(request.body.data.object.id)
        response.send();
    }

});

//Open and Close Routes

async function ChangeSetting(isOpen) {
    return new Promise(resolve => {
        MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
            if (err) throw err;
            var dbo = db.db("AppletreeExpress");
            dbo.collection("Settings").updateOne({ _id: ObjectId("5f83b1348ca1bee2b5603ad5") }, { $set: { OPEN: isOpen } }, () => {
                console.log(`Changed store to ${isOpen ? "open" : "closed"}`)
                resolve()
            })
        });
    })
}

app.get(`/OPEN/${process.env.WEBSITE_PASSWORD}`, async(req, res) => {
    await ChangeSetting(true)
    res.send("Website is now open.");
})

app.get(`/CLOSE/${process.env.WEBSITE_PASSWORD}`, async(req, res) => {
    await ChangeSetting(false)
    res.send("Website is now closed.");
})

//Port Stuff
app.listen(process.env.PORT || 3000, () => console.log("We're Online!"))