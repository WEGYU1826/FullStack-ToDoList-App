const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
// const port = 3000;

// const items = ["Buy Food" , "Cook Food" , "Eat Food"];
// const workItem = ["Go to work" , "Pretend to like it"];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Local DataBase...
// mongoose.connect("mongodb://localhost:27017/toDoListDB", {
//   useNewUrlParser: true,
// });

// Remote DataBase...
mongoose.connect("mongodb+srv://wegyu:test123@cluster0.iccuq.mongodb.net/toDoListDB", {
  useNewUrlParser: true,
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = new mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  items: [itemsSchema]
})

const List = new mongoose.model("List" , listSchema);


const item_1 = new Item({
  name: "Welcome to your todo list!",
});

const item_2 = new Item({
  name: "Hit the + button to add a new item!",
});

const item_3 = new Item({
  name: "<---Hit this to delete an item!",
});

const defaultItems = [item_1, item_2, item_3];

app.get("/", (req, res) => {
  Item.find((err, items) => {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        Item.insertMany(defaultItems, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully added the document to the toDoListDB");
          }
        })
        res.redirect("/");
      } else {
        // mongoose.connection.close();
        // console.log(items);
        res.render("list", {listTitle: "Today", newListItems: items});
      }
      
    }
  })

  // const day = date.getDate();

});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemAdd = new Item({
    name: itemName,
  });

  if(listName === "Today"){
    itemAdd.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName }, (err , foundItems) => {
      if(!err){
        foundItems.items.push(itemAdd);
        foundItems.save();
        res.redirect("/" + listName);
      }
    })
  }

  // if(req.body.list === "Work"){
  //   workItem.push(item);
  //   res.redirect("/work")
  // }else{
  //   items.push(item);
  //   res.redirect("/");
  // }

})

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},(err , foundItems) => {
      if(!err){
        console.log("Successfully deleted checked item from " +listName);
        res.redirect("/" +listName);
      }
    })
  }


})

app.get("/:listID" ,(req , res) => {
  const listName = _.capitalize(req.params.listID);
  List.findOne({name: listName}, (err , lists) => {
    if(!err){
      if(!lists){
        const list = new List({
          name: listName,
          items: defaultItems,
        })
        list.save();
        res.redirect("/"+ listName);
      }else{
        res.render("list", {listTitle: lists.name, newListItems: lists.items});
      }
    }
  })

})


app.get("/about", (req, res) => {
  res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
  
app.listen(port, () => {
  console.log("Server is running at port " + port);
});