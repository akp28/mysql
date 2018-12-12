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

managerView();

function checkProducts(){
    connectionPromise.then(function(){
        connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
            console.table(res);
            promptManager();
        });
    })
    
}

function checkInventory(){
    connectionPromise.then(function(){
        connection.query("SELECT * FROM products where stock_quantity < 5", function (err, res) {
        if (err) throw err;
            console.table(res);
            promptManager();
        })
    })
}

function promptManager() {
    inquirer.prompt({
        name: "action",
        type: "list",

        message: " Would like to continue?\n",
        choices: ["Yes", "No"]
    }).then(function(answer) {
        switch(answer.action) {
            case 'Yes':
                managerView();
            break;

            case 'No':
                connection.end();
            break;
        }
    });
}

function managerView(){
    inquirer
       .prompt([{
          name: "action",
          type: "list",
          message: "Do something",
          choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory","Add New Product"]
       }
    ]) .then(function(input){
        console.log("your choice:" + JSON.stringify(input));
        switch(input.action) {
            case 'View Products for Sale':
                checkProducts();
                break;
            case 'View Low Inventory':
                checkInventory();
                break;
                // connection.end();
            // case 'Add to Inventory':
            //     addInventory();
            // case 'Add New Product':
            //     addProduct();
        }
    })

}