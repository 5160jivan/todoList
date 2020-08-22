const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express(); 
const lodash = require("lodash");
const mongoose = require("mongoose");
var items = ["Buy Food", "Cook Food"];
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://5160jivan:Liverpool@5160@cluster0-kkmug.mongodb.net/todoListDB", {useNewUrlParser: true, useUnifiedTopology : true});

const taskSchema = new mongoose.Schema({
    name : String
});

const Task = mongoose.model("Task", taskSchema);

const item1 = new Task({
    name : "Buy Food"
});

const item2 = new Task({
    name : "Cook Food"
});

const item3 = new Task({
    name : "Eat Food"
});


const defaultItemms = [item1, item2, item3];


const listSchema = {
    name : String,
    items : [taskSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(request, response)
{
    var today = new Date();
    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    Task.find({}, function(err,  foundItems){
        if(foundItems.length === 0)
        {
            Task.insertMany(defaultItemms, function(err){
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    console.log("Succesfully inserted default items.");
                }
            });
            response.redirect("/");
        }
        else
        {
            var day = date.getDate();;
            response.render("list", {today: day, listName : "Work", newListItems: foundItems});
        }
    });
    
});

app.get("/:customRoute", function(request, response){

    const customListName = lodash.capitalize(request.params.customRoute);
    List.findOne({name : customListName}, function(err, foundList){
        if(!err)
        {
            if(!foundList){
                const list = new List({
                    name : customListName,
                    items : defaultItemms
                });
            
                list.save();
                response.redirect("/" + customListName)
            }
            else
            {
                var day = date.getDate();;
                response.render("list", {today: day, listName : customListName,newListItems: foundList.items});
            }
        }
    });
    
});


app.post("/", function(request, response)
{
    const item = request.body.newItem;
    const listName = request.body.list;
    const task = new Task({
        name : item
    });
    if(listName === "Work")
    {
        task.save();
        response.redirect("/");

    }
    
    else{
        List.findOne({name : listName}, function(err, foundList){
            foundList.items.push(task);
            foundList.save();
            response.redirect("" + listName);
        });
    }
});



app.post("/delete", function(request, response){
    const checkedItemId = request.body.checkbox;
    const listName = request.body.listName;
    if(listName === "Work")
    {
        Task.findByIdAndRemove(checkedItemId, function(err){
            if(err)
            {
                console.log(err);
            }
            else
            {
                response.redirect("/");
                console.log("Succesfully removed");
            }
        });
    }

    else
    {
        List.findOneAndUpdate({name : listName}, {$pull : {items: {_id : checkedItemId}}}, function(err, results){
            if(!err)
            {
                response.redirect("/" + listName);
            }
        });
    }
   
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function()
{
    console.log("Server running on port 3000");
})