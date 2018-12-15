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
}).catch(error => { console.log('caught', error.message); });

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
            // console.table(JSON.stringify(res));
            if (res.index == null){
                console.log("Inventory looks Good");
            }

            promptManager();
        })
    })
}

function addInventory() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: " Enter the Item ID of the product",

    }, {
        name: "quantity",
        type: "input",
        message: " Enter quantity you wish to add",

    }]).then(function(answer){
        connectionPromise.then(function(){
            connection.query("SELECT * FROM products where ?",
            {
                id : answer.id
            },function (err, res) {
                if (err) throw err;
               itemQuantity = res[0].stock_quantity + parseInt(answer.quantity);
                console.table("addInv: " +JSON.stringify(res));
                updateItem(itemQuantity,answer.id) ;
            });
    //     }).then(function(){
            
    //     })
     })
    })

}

function updateItem(itemQuantity,id){
    connectionPromise.then(function(){
        console.log("here");
        connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity : itemQuantity     
            },
            {
                id : id
            }
        ],function (err, res) {
           console.log("+1"); 
          if (err) throw err;
            console.table(res);  
        })
    }).then(function(){
            connection.query("select * from products where ?",{
                id : id
            },function (err, res) {
              if (err) throw err;
              console.log('+2');
              console.table(res);
            })
    }).then(function(){
        console.log('+3');
        promptManager(); 
    });

      
}

function addProduct() {
    inquirer.prompt([{
        name: "productName",
        type: "input",
        message: " Enter the name of the product",
    }, {
        name: "departmentName",
        type: "input",
        message: " Enter the department of the product",
    }, {
        name: "price",
        type: "input",
        message: " Enter price of the product",
    }, {
        name: "quantity",
        type: "input",
        message: " Enter the quantity",                
    }]).then(function(answer){
        connectionPromise.then(function(){
            connection.query("INSERT INTO products SET ?", {
                product_name: answer.productName,
                department_name: answer.departmentName,
                price: answer.price,
                stock_quantity: answer.quantity
            }, function(err, res) {
                console.log('\n  The new product was added - See the Inventory Table\n');
            })
        }).then(function(){
            checkProducts();
        // }).then(function(){
        //          promptManager();
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
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                // promptManager();
                break;
        }
    })

}