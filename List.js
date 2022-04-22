// jshint esversion: 8

const mongoose = require('mongoose');
const Item = require(__dirname + "/Item.js");
const itemsSchema = mongoose.model('Item').schema;

const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

module.exports = mongoose.model("List", listsSchema);
