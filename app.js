const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Haniel:9962641833@cluster0-mtzzy.mongodb.net/todolistDB", {useNewUrlParser: true});
const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);  

const item1 = new Item({
  name : "Welcome to your todo list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];
const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err)
          console.log("Error");
        else
          console.log("Insertion Successfull");
      });
      res.redirect("/");
    }
    else
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  });
});

app.get("/:path",function(req,res){
  path = _.capitalize(req.params.path);
  List.findOne({name: path}, function(err, foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list = new List({
          name: path,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + path);
      }
      else{
        // show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }

  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete",function(req,res){
  if(req.body.listName === "Today"){
  Item.findByIdAndRemove(req.body.checkbox, function(err){
    if(!err)
      res.redirect("/");
  });
}
else{
  List.findOneAndUpdate({name: req.body.listName}, {$pull: {items: {_id: req.body.checkbox}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + req.body.listName);
    }
  });
  }
});
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
