//jshint esversion:8

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Item = require(__dirname + "/Item.js");
const List = require(__dirname + "/List.js");
const _ = require("lodash");
const dotenv = require('dotenv').config();
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

app.get("/", async(req, res) => {
  try {
    const foundItems = await Item.find();

    if(foundItems.length === 0){
      const insertedItems = await Item.insertMany(defaultItems);
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  } catch (e) {
    console.error(e);
  }
});

app.post("/", async(req, res) => {
  try {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });

    if(listName === "Today"){
      await item.save();
      res.redirect("/");
    }else{
      console.log();
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + _.lowerCase(listName));
    }
  } catch (e) {
    console.error(e);
  }
});

app.post("/delete", async(req, res) => {
  try {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect("/");
    }else{
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
      res.redirect("/" + _.lowerCase(listName));
    }
  } catch (e) {
    console.error(e);
  }
});

app.get('/:customListName', async(req , res) =>{
  try {
    const customListName = _.capitalize(req.params.customListName);

    const foundList = await List.findOne({name: customListName});

    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      await list.save();

      res.redirect("/" + _.lowerCase(customListName));
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }

  } catch (e) {
    console.error(e);
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
