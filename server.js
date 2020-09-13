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
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "Combo 1", 
          },
          unit_amount: 2000,
        },
        quantity: 1,
        description: "3 Spring Rolls",
      },
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "Combo 1", 
          },
          unit_amount: 2000,
        },
        quantity: 1,
        description: "3 Spring Rolls",
      },
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "Combo 1", 
          },
          unit_amount: 2000,
        },
        quantity: 1,
        description: "3 Spring Rolls",
      }
    ],
    mode: "payment",
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });

  res.json({ id: session.id });
});


//Port Stuff
const PORT = 3000 || process.env.port
app.listen(PORT, () => console.log("Listening on port 3000"))