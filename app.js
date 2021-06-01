//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

const mongoose = require("mongoose");


mongoose.connect("mongodb+srv://admin-ratnesh:test123@cluster0.c7iws.mongodb.net/todolistDB", {
    useNewUrlParser: true
}, {
    useUnifiedTopology: true
})

const itemSchema = new mongoose.Schema({
    name: String,
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todoList",
})
const item2 = new Item({
    name: "Hit + button to add a new item",
})
const item3 = new Item({
    name: "<--Hit this to delete an item",
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {
    res.redirect("/home")

});

app.get('/:listName', (req, res) => {
    let listName =_.capitalize(req.params.listName);
    List.findOne({
        name: listName
    }, (err, foundList) => {
        if (!foundList) {
            const list = new List({
                name: listName,
                items: defaultItems
            })

            list.save()
            res.redirect("/" + listName)
        } else {
            res.render("list", {
                listTitle: foundList.name,
                newListItems: foundList.items
            });
        }
    })

})

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = _.capitalize(req.body.list);
    if(itemName==""){
        res.redirect("/" + listName)
    }
    else{
        const newItem = new Item({
            name: itemName,
        })

        List.findOne({
            name: listName
        }, (error, foundList) => {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName)
        })
    }


});

app.post("/delete", function (req, res) {
    const deleteItemId = req.body.itemId;
    const deleteList =_.capitalize(req.body.listName);
    
    List.findOneAndUpdate( {name:deleteList} , {$pull : {items : {_id:deleteItemId} }} ,(err,foundList)=>{})
    res.redirect("/"+deleteList)
    
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server Working....")
})


