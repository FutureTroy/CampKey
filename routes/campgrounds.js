var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware")


//INDEX Route == Display all campgrounds from DB
router.get("/", function (req,res) {
    // console.log(req.user);
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
        }
    });
});

//CREATE Route == Adding a new campground to the DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // res.send("You posting dawg, good job");
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, price: price, image: image, description: desc, author:author};
    //Create a new campground and save to database
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            // newlyCreated is what the newCapmground is added to the database as
            console.log(newlyCreated);
            //redirect back to the campgrounds page
            res.redirect("/campgrounds");
        }
    })
})

//NEW Route == Show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new") ;
});

//SHOW Route == Show's campground details
router.get("/:id", function(req, res) {
    //Find the campground with Provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err || !foundCampground){
           console.log(err);
           req.flash("error", "Campground not found");
           res.redirect("back");
       } else{
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
       }
    });
    // req.params.id;
});

//  EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
    
});



//  UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
   //find and update the correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       }else{
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
   //redirect somewhere(showpage)
});

//  DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    })
});

//  Middleware




module.exports = router;