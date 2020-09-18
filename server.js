const path = require("path")
const express = require("express")
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const GoogleSpreadsheet = require("google-spreadsheet")
const { promisify } = require("util");
const Nexmo = require('nexmo');

const app = express()

const creds = require("./client_secret.json")
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

let ORDER = undefined;

app.post("/create-checkout-session", async (req, res) => {
  console.log(req.body)
  ORDER = req.body
  let converted_items = []
  const order_data = req.body
  for(let i = 0; i < order_data.length; i++){
    //do this part
    if(isSandwichOrder(order_data[i])){
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
    }else{
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

  // console.log(converted_items)

  function isSandwichOrder(item){
    if(Object.keys(item).includes("lettuce")){
      return true
    }
    return false
  }
  function calculatePrice(item){
    switch(item){
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
  //and this
  function makeSandwichDescription(order){
    let description = "";

    description += order.name + " would like a "
    description += order.spice == "None" ? "" : `${order.spice} `
    description += order.item.includes("Combo") ? `${order.item.includes("Combo 3") ? "falafel" : order.sandwichType} with ` : `${order.item} with `
    description += turnVeggiesIntoArray(order).join(", ");
    description += order.side != undefined ? ` + ${order.side}` : ""
    description += order.drink != undefined ? ` + ${order.drink}` : ""

    return description
  }


  function turnVeggiesIntoArray(order){
    let arr = [];
    if(order.lettuce) arr.push("lettuce")
    if(order.tomato) arr.push("tomato")
    if(order.cucumber) arr.push("cucumber")
    if(order.onion) arr.push("onion")
    return arr
  }


  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: converted_items,
    mode: "payment",
    success_url: process.env.URL + "/success",
    cancel_url: process.env.URL + "/order-page.html"
  });
  res.json({ id: session.id });
  
});



app.get("/success", async (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
  const sessions = await stripe.checkout.sessions.list({
    limit: 1,
  });
  console.log(sessions.data[0].customer)
  const customer = await stripe.customers.retrieve(sessions.data[0].customer);
  console.log(customer)

  async function accessSpreadsheet(){
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_URL)
    await promisify(doc.useServiceAccountAuth)(creds)
    const info = await promisify(doc.getInfo)()
    const sheet = info.worksheets[0]
    console.log(`Title: ${sheet.title}.  Rows: ${sheet.rowCount}`)
    // console.log(ORDER)
    for(let i = 0; i < ORDER.length; i++){
  
      const row = {
        SandwichName: ORDER[i].name,
        Burger: ORDER[i].item == "Beef Sandwich" || ORDER[i].sandwichType == "beef sandwich"? "X" : "",
        Chicken: ORDER[i].item == "Chicken Sandwich" || ORDER[i].sandwichType == "chicken sandwich"? "X" : "",
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
        Belgian: ORDER[i].item == "Belgian Fries (garlic)" ||  ORDER[i].item == "Belgian Fries (spicy)"? (ORDER[i].item == "Belgian Fries (garlic)" ? "Garlic" : "Spicy") : "",
        SRolls: ORDER[i].item == "3 Spring Rolls" ? "3" : "",
        ComboSide: ORDER[i]["drink"] == undefined && ORDER[i].item.includes("Combo") ? "3 Spring Rolls"  : (ORDER[i].item.includes("Combo") ? `${ORDER[i].side} + ${ORDER[i].drink}` : ""),
        Brownie: ORDER[i].item == "Brownie" ? "X" : "",
        Drink: ORDER[i].item == "Cold Pop" ? ORDER[i].drink : "",
        FalafelPlate: ORDER[i].item == "Chicken and Falafel Plate" ? "X" : ""
      }
  
      await promisify(sheet.addRow)(row)
    }
  }
  nexmo.account.checkBalance((err, result) => {
    if(result.value.toFixed(2) < 1){
      nexmo.message.sendSms("15068708278", process.env.NOTIFY_NUMBER, `Low Texting Balance: ${result.value.toFixed(2)}. To Refill Balance on Nexmo: https://dashboard.nexmo.com/payments/new`);
    }
  });
  accessSpreadsheet()
  nexmo.message.sendSms("15068708278", process.env.NOTIFY_NUMBER, "NEW ORDER MADE ONLINE");
})


//for email put this in app.get("/success", .....
// var transporter = nodemailer.createTransport({
//   service: 'smtp.gmail.com',
//   port: 587,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_USERNAME,
//     pass: process.env.GMAIL_PASSWORD
//   }
// });

// var mailOptions = {
//   from: process.env.GMAIL_USERNAME,
//   to: process.env.SEND_ORDER_TO_GMAIL,
//   subject: 'NEW ORDER',
//   text: makeEmail()
// };

// function makeEmail(){
//   let email = "";

//   for(let i = 0; i < ORDER.length; i++){
//     let keys = Object.keys(ORDER[i]);
//     email += `Item: ${ORDER[i].item}\n`
//     if(keys.length != 1){ 
//       let veggies = [];
//       for(let j = 0; j < keys.length; j++){
//         if(keys[j] === "item") continue;
//         function checkVeggies(veggie){
//           if(keys[j] == veggie){
//             veggies.push(veggie);
//             return true
//           }
//           return false
//         }
//         if(checkVeggies("lettuce")) continue
//         if(checkVeggies("tomato"))continue
//         if(checkVeggies("cucumber"))continue
//         if(checkVeggies("onion"))continue
//         email += `${keys[j]}: ${ORDER[i][keys[j]]}\n`
//       }
//       email += `Veggies: ${veggies.join(", ")}\n`
//     }
//     email += "\n"
//   }
  
  
//   return email;
// }

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });

//Port Stuff
app.listen(process.env.PORT || 3000, () => console.log("We're Online!"))