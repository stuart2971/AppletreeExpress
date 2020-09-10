let ORDERS = []
let item = ""
let item_details = {}

//General Methods
document.getElementById("sandwich_modal_confirm").disabled = true
function isBlank(blank){
    if(blank === "" || blank === undefined) return true
    return false
}

//Etc
function changeSandwichType(type){
    item = type
}
function addNonCustomizableItem(itemType){
    item = itemType
    ORDERS.push({item})
    document.getElementById("item_counter").innerHTML = ORDERS.length
}

//Modal Settings

//SANDWICH MODAL
//Gets all inputs within modal and put it into []
let sandwich_inputs = document.getElementById("sandwich_modal").querySelectorAll("input, radio, checkbox, textbox, text")
for (var i = 0; i < sandwich_inputs.length; i++) {
    sandwich_inputs[i].addEventListener('change', () => {
        //needs to redefine current item to prevent copying other items
        item_details = {}
        item_details.name = sandwich_inputs[0].value
        item_details.tomato = sandwich_inputs[2].checked
        item_details.cucumber = sandwich_inputs[3].checked
        item_details.onion = sandwich_inputs[4].checked
        item_details.cheese = undefined
        item_details.spice = undefined
        for(let j= 5; j < 9; j++)
            if(sandwich_inputs[j].checked) item_details.cheese = sandwich_inputs[j].value
    
        for(let j= 9; j < 13; j++)
            if(sandwich_inputs[j].checked) item_details.spice = sandwich_inputs[j].value

        let AddButton = document.getElementById("sandwich_modal_confirm")
        if(isBlank(item_details.name) || isBlank(item_details.cheese) || isBlank(item_details.spice)){
            console.log("blank")
            AddButton.classList.add("disabled")
        }else {
            console.log("full")
            AddButton.classList.remove("disabled")
        }
    });
}

document.getElementById("sandwich_modal_confirm").onclick = () => {
    console.log(item_details)
    if(isBlank(item_details.name) || isBlank(item_details.cheese) || isBlank(item_details.spice)){
        console.log('items are not all filled out')
    }else {
        item_details.item = item
        ORDERS.push(item_details)
        document.getElementById("email-form").reset()
        document.getElementById("sandwich_modal_confirm").classList.add("disabled")
        document.getElementById("item_counter").innerHTML = ORDERS.length
    }
    
}


//FALAFEL MODAL
//Gets all inputs within modal and put it into []
let falafel_inputs = document.getElementById("falafel_modal").querySelectorAll("input, radio, checkbox, textbox, text")
for (var i = 0; i < falafel_inputs.length; i++) {
    falafel_inputs[i].addEventListener('change', () => {
        //needs to redefine current item to prevent copying other items
        item_details = {}
        item_details.name = falafel_inputs[0].value
        item_details.lettuce = falafel_inputs[1].checked
        item_details.tomato = falafel_inputs[2].checked
        item_details.cucumber = falafel_inputs[3].checked
        item_details.onion = falafel_inputs[4].checked
    
        for(let j= 5; j < 9; j++)
            if(falafel_inputs[j].checked) item_details.spice = falafel_inputs[j].value

        console.log(item_details)
        let AddButton = document.getElementById("falafel_modal_confirm")
        if(isBlank(item_details.name) || isBlank(item_details.spice)){
            console.log("blank")
            AddButton.classList.add("disabled")
        }else {
            console.log("full")
            AddButton.classList.remove("disabled")
        }
    });
}

document.getElementById("falafel_modal_confirm").onclick = () => {
    console.log(item_details)
    if(isBlank(item_details.name) || isBlank(item_details.spice)){
        console.log('items are not all filled out')
    }else {
        item_details.item = item
        ORDERS.push(item_details)
        document.getElementById("email-form").reset()
        document.getElementById("item_counter").innerHTML = ORDERS.length
    }
    
}

//Checkout

function goToCheckout(){
    console.log(ORDERS)
}