const path = require("path")
const express = require("express")
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const GoogleSpreadsheet = require("google-spreadsheet")
const { promisify } = require("util")

const app = express()

const creds = require("./client_secret.json")
require('dotenv').config()
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
    if(Object.keys(item).length == 1){
      return false
    }
    return true
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
    success_url: "http://localhost:3000/success",
    cancel_url: "https://appletreeexpress.herokuapp.com/order-page.html"
  });
  res.json({ id: session.id });
  
});

async function accessSpreadsheet(){
  const doc = new GoogleSpreadsheet("1SeXx9TzKInDGV8rtiYHNI1v0coGpTop3JCiCDTav7LY")
  await promisify(doc.useServiceAccountAuth)(creds)
  const info = await promisify(doc.getInfo)()
  const sheet = info.worksheets[0]
  console.log(`Title: ${sheet.title}.  Rows: ${sheet.rowCount}`)
  // console.log(ORDER)
  for(let i = 0; i < ORDER.length; i++){

    const row = {
      burg: ORDER[i].item == "Beef Sandwich" ? "X" : "",
      chick: ORDER[i].item == "Chicken Sandwich" ? "X" : "",
      falafel: ORDER[i].item == "Falafel Sandwich" ? "X" : "",
      L: ORDER[i].lettuce == true ? "X" : "",
      T: ORDER[i].tomato == true ? "X" : "", 
      c: ORDER[i].cucumber == true ? "X" : "",
      o: ORDER[i].onion == true ? "X" : "",
      Spicy: ORDER[i].spice,
      Cheese: ORDER[i].cheese
    }

    await promisify(sheet.addRow)(row)
  }

}

app.get("/success", (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
  accessSpreadsheet()


  
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