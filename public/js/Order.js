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
    alert(`YOU HAVE ADDED ${itemType.toUpperCase()} TO YOUR CART`)
    item = itemType
    ORDERS.push({item})
    document.getElementById("item_counter").innerHTML = ORDERS.length
}
function addDrink(){
    const drink_select = document.getElementById("Cold_Pop")
    if(drink_select.value == "") {
        alert("You have to choose an option from above. ")
        return
    }
    ORDERS.push({
        item: "Cold Pop",
        drink: drink_select.value
    })
    drink_select.selectedIndex = 0
    alert(`YOU HAVE ADDED ${drink_select.value.toUpperCase()} TO YOUR CART`)
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
        item_details.lettuce = sandwich_inputs[1].checked
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
        alert(`YOU HAVE ADDED ${item_details.item} TO YOUR CART`)
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
        alert(`YOU HAVE ADDED ${item_details.item} TO YOUR CART`)
        document.getElementById("email-form").reset()
        document.getElementById("item_counter").innerHTML = ORDERS.length
    }
    
}

//COMBO 1 MODAL
let combo1_inputs = document.getElementById("combo1_modal").querySelectorAll("input, radio, checkbox, textbox, select")
for (var i = 0; i < combo1_inputs.length; i++) {
    combo1_inputs[i].addEventListener('change', () => {
        item_details = {}

        item_details.name = combo1_inputs[0].value
        for(let j= 1; j < 3; j++)
            if(combo1_inputs[j].checked) item_details.sandwichType = combo1_inputs[j].value

        for(let j= 3; j < 7; j++)
            if(combo1_inputs[j].checked) item_details.cheese = combo1_inputs[j].value

        item_details.lettuce = combo1_inputs[7].checked
        item_details.tomato = combo1_inputs[8].checked
        item_details.cucumber = combo1_inputs[9].checked
        item_details.onion = combo1_inputs[10].checked
    
        for(let j= 11; j < 15; j++)
            if(combo1_inputs[j].checked) item_details.spice = combo1_inputs[j].value

        item_details.drink = combo1_inputs[15].value
        item_details.side = "3 Spring Rolls"

        let AddButton = document.getElementById("combo1_modal_confirm")
        if(isBlank(item_details.name) || isBlank(item_details.spice)|| isBlank(item_details.drink)|| isBlank(item_details.sandwichType)|| isBlank(item_details.cheese)){
            console.log("blank")
            AddButton.classList.add("disabled")
        }else {
            console.log("full")
            AddButton.classList.remove("disabled")
        }
    });
}

document.getElementById("combo1_modal_confirm").onclick = () => {
    console.log(item_details)
    if(isBlank(item_details.name) || isBlank(item_details.spice)|| isBlank(item_details.drink)|| isBlank(item_details.sandwichType)|| isBlank(item_details.cheese)){
        console.log('items are not all filled out')
    }else {
        item_details.item = "Combo 1";
        ORDERS.push(item_details)
        alert(`YOU HAVE ADDED ${item_details.item.toUpperCase()} TO YOUR CART`)
        document.getElementById("email-form").reset()
        document.getElementById("item_counter").innerHTML = ORDERS.length
    }
    
}

//COMBO 2 MODAL
let combo2_inputs = document.getElementById("combo2_modal").querySelectorAll("input, radio, checkbox, textbox, select")
for (var i = 0; i < combo2_inputs.length; i++) {
    combo2_inputs[i].addEventListener('change', () => {
        item_details = {}

        item_details.name = combo2_inputs[0].value
        for(let j= 1; j < 3; j++)
            if(combo2_inputs[j].checked) item_details.sandwichType = combo2_inputs[j].value

        for(let j= 3; j < 7; j++)
            if(combo2_inputs[j].checked) item_details.cheese = combo2_inputs[j].value

        item_details.lettuce = combo2_inputs[7].checked
        item_details.tomato = combo2_inputs[8].checked
        item_details.cucumber = combo2_inputs[9].checked
        item_details.onion = combo2_inputs[10].checked
    
        for(let j= 11; j < 15; j++)
            if(combo2_inputs[j].checked) item_details.spice = combo2_inputs[j].value

        for(let j= 15; j < 17; j++)
            if(combo2_inputs[j].checked) item_details.side = combo2_inputs[j].value

        item_details.drink = combo2_inputs[17].value

        console.log(item_details)
        let AddButton = document.getElementById("combo2_modal_confirm")
        if(isBlank(item_details.name) || isBlank(item_details.spice)|| isBlank(item_details.drink)|| isBlank(item_details.sandwichType)|| isBlank(item_details.cheese) || isBlank(item_details.side)){
            console.log("blank")
            AddButton.classList.add("disabled")
        }else {
            console.log("full")
            AddButton.classList.remove("disabled")
        }
    });
}

document.getElementById("combo2_modal_confirm").onclick = () => {
    console.log(item_details)
    if(isBlank(item_details.name) || isBlank(item_details.spice)|| isBlank(item_details.drink)|| isBlank(item_details.sandwichType)|| isBlank(item_details.cheese) || isBlank(item_details.side)){
        console.log('items are not all filled out')
    }else {
        item_details.item = "Combo 2"
        ORDERS.push(item_details)
        alert(`YOU HAVE ADDED ${item_details.item.toUpperCase()} TO YOUR CART`)
        document.getElementById("email-form").reset()
        document.getElementById("item_counter").innerHTML = ORDERS.length
    }
    
}

//COMBO 3 MODAL
let combo3_inputs = document.getElementById("combo3_modal").querySelectorAll("input, radio, checkbox, textbox, select")
for (var i = 0; i < combo3_inputs.length; i++) {
    combo3_inputs[i].addEventListener('change', () => {
        item_details = {}

        item_details.name = combo3_inputs[0].value
        
        item_details.lettuce = combo3_inputs[1].checked
        item_details.tomato = combo3_inputs[2].checked
        item_details.cucumber = combo3_inputs[3].checked
        item_details.onion = combo3_inputs[4].checked
    
        for(let j= 5; j < 9; j++)
            if(combo3_inputs[j].checked) item_details.spice = combo3_inputs[j].value

        item_details.side = combo3_inputs[9].value

        let AddButton = document.getElementById("combo3_modal_confirm")
        if(isBlank(item_details.name) || isBlank(item_details.spice)|| isBlank(item_details.side)){
            console.log("blank")
            AddButton.classList.add("disabled")
        }else {
            console.log("full")
            AddButton.classList.remove("disabled")
        }
    });
}

document.getElementById("combo3_modal_confirm").onclick = () => {
    console.log(item_details)
    if(isBlank(item_details.name) || isBlank(item_details.spice)|| isBlank(item_details.side)){
        console.log('items are not all filled out')
    }else {
        item_details.item = "Combo 3"
        alert(`YOU HAVE ADDED ${item_details.item.toUpperCase()} TO YOUR CART`)
        ORDERS.push(item_details)
        document.getElementById("email-form").reset()
        document.getElementById("item_counter").innerHTML = ORDERS.length
    }
    
}
