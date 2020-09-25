// Stripe stuff
var stripe = Stripe('pk_test_51HPrfXFFjnckJleAtAsVlq5YqKYOOaM6Lo9kMYDx5b8R5oaLuEeAsIFT96sR3w1snbaqkrA0MJMTMjF6WMfoUFvZ00PMv6zPhX');
var checkoutButton = document.getElementById('checkout-button');

checkoutButton.addEventListener('click', function() {
  fetch('/create-checkout-session', {
    method: 'POST',
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(ORDERS)
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(session) {
    if(Object.keys(session).includes('message')){
      alert(session.message)
      return
    }
    return stripe.redirectToCheckout({ sessionId: session.id });
  })
  .then(function(result) {
    // If `redirectToCheckout` fails due to a browser or network
    // error, you should display the localized error message to your
    // customer using `error.message`.
    if (result.error) {
      alert(result.error.message);
    }
  })
  .catch(function(error) {
    console.error('Error:', error);
  });
});