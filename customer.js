var mysql = require("mysql")
var inquirer =require("inquirer");
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "pass1234",
    database: "bamazon"

})
var connectionPromise = new Promise(function(resolve, reject){
    resolve(
        connection.connect(function(err){
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");
        
        })
    )
})

getOrder();

function getOrder(){
    connectionPromise.then(function(){
        connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
            console.table(res);
            userInput();
        });
    })
}

function updateDB(id,quantity){
    connectionPromise.then(function(){
        connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity : quantity
            },
            {
                id : id
            }
            
        ],function (err,res){
            if(err) throw err;
        });
    });
}

function userInput() {
    // var mysqlreadResults = rows;
    inquirer
       .prompt([{
          name: "productID",
          type: "input",
          message: "Enter product ID"
       },
        {
            type: "input",
            name: "Quantity",
            message: "How many of them needed"
          
       }
    ]) .then(function(input){

        var inputID = input.productID;
        var inputQuantity = input.Quantity;

        connection.query("SELECT * FROM products where ?",{id: inputID},function (err, res) {
            // console.log("query " + JSON.stringify(res));
            if (!res.length){
                console.log("Enter valid input");
                customerPrompt();
            }else if (input.Quantity <= res[0].stock_quantity){
                console.log("Order Eligble for purchase");
                var avaiableQuantity = res[0].stock_quantity;
                var price = res[0].price;
                var totalQuantity = avaiableQuantity - input.Quantity; 
                // console.log("avaiable quantity: " + totalQuantity);
                updateDB(inputID,totalQuantity);
               var totalCost = inputQuantity * price;
                console.log("\n  Order fulfilled! You ordered cost is $" + totalCost + "\n" );
                customerPrompt();
            }else{
                console.log("Insufficient quantity! .. \n");
                customerPrompt();
            }
        })
    
    });    
}

function customerPrompt(){
    inquirer.prompt({
        name: "action",
        type: "list",

        message: " Would like to continue shopping?\n",
        choices: ["Yes", "No"]
    }).then(function(answer) {
        switch(answer.action) {
            case 'Yes':
                getOrder();
            break;

            case 'No':
                connection.end();
            break;
        }
    })
};




