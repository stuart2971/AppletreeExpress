const path = require("path")
const express = require("express")
const bodyParser = require('body-parser');

const app = express()

//Set static folder
app.use(express.static(path.join(__dirname, "public")))
//I dont know
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
//Stripe Stuff
const stripe = require('stripe')('sk_test_51HPrfXFFjnckJleAvp727UGzpGA8iOM10ihFXIaRsT8ufFHvNvoDXhnVTjwBvh8GVWhYXk8f6gSTJRTEKQ5cLgo600n4IVTUru');

app.post("/create-checkout-session", async (req, res) => {
  console.log(req.body)

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
    return 500
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
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });

  res.json({ id: session.id });
});


//Port Stuff
const PORT = 3000 || process.env.port
app.listen(PORT, () => console.log("Listening on port 3000"))