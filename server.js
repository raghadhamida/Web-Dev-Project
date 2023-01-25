import express from 'express';
let app = express();
import session from 'express-session';
import { default as connectMongoDBSession} from 'connect-mongodb-session';

const MongoDBStore = connectMongoDBSession(session);

//Defining the location of the sessions data in the database.
var store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/project',
  collection: 'sessions'
});
 

//Setting up the express sessions and for it to be stored in the database
app.use(session({
  secret: 'some secret key here',
  resave: true,
  saveUninitialized: false,
  store: store 
}));

//Import mongoose module
import pkg from 'mongoose';

const { connect, Types } = pkg;

app.use(express.urlencoded({extended: true}));

//importing collections
import User from './collections/users.js';
import Art from './collections/artworks.js';
 
//View engine
app.set('views', './views');
app.set("view engine", "pug");

//Set up the routes
app.use(express.static("./public/js"));

//this converts any JSON stringified string to JSON
app.use(express.json());

app.use(function (req, res, next) {
    console.log(req.session);
    next();
});

let returnedArt;

//rendering home
app.get(['/', '/home'], (req, res) => {

	res.render('pages/home', { session: req.session });

});

//rendering register
app.get("/register", (req, res) => {
	res.render("pages/register", { session: req.session }); 
});

//Adding the new user to the useres collection
app.post("/register", async (req, res) => {
  let newUser = req.body;
  try{
      const findUser = await User.findOne({ username: newUser.username});
      //if a user with the same username was found, send error..no duplicates allowed, else: register that user
      if(findUser != null) {
        //console.log("Send error.");
        res.status(400).json({'error': 'User exists'});
      } else {
        console.log("registering: " + JSON.stringify(newUser));
        await User.create(newUser);
        res.status(200).send();
      }
  } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error registering" });
  }  

});


//logging the user in with the provided username and password
app.post("/login", async (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
    try {
        //tries to find the user in the database with the username, if it does it'll check if the user provided the correct password
        const findUser = await User.findOne({ username: username });
        if(findUser != null) { 
            if(findUser.password === password) {
                //setting the session properties
                req.session.loggedin = true;
                req.session.username = findUser.username;
                req.session.userid = findUser._id;
                req.session.userType = findUser.usertype;
                res.render('pages/home', { session: req.session })
            } else {
                res.status(401).send("Not authorized. Invalid password.");
            }
        } else {
            res.status(401).send("Username not found.");
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: "Error logging in."});
    }    

});

//rendering switch page
app.get("/switch", (req, res) => {
  //finding which kind of usertype the current user is and sending the other type to be rendered on the switch page accordingly
  let otherAccount;
  if(req.session.userType==0){
    otherAccount = "Artist";
  }
  if(req.session.userType==1){
    otherAccount = "Patron";
  }
	res.render("pages/switch", {otherType: otherAccount, session: req.session });
     
});


//when switch button is pressed, it updates to the user type the user is switching to and sends which page accordingly
app.get("/switchAccount", async (req, res) => {
  let page;
  try{
    //add if else inside this if for if user has artwork or no
    //if user is currently on patron and wants to switch to artist, it goes to the add artwork page
    if(req.session.userType==0){
      req.session.userType = 1;
      await User.updateOne({ username: req.session.username }, {
        usertype: 1
      });
      page = "addArtwork";
    }
    //if user is currently on artist and wants to switch to patrob, it goes to the add home page
    else if(req.session.userType==1){
      req.session.userType = 0;
      await User.updateOne({ username: req.session.username }, {
        usertype: 0
      });
      page = "home"
    }
    res.status(200).send(JSON.stringify(page));
  } catch(err) {
    console.log(err);
    res.status(400).send("Cannot switch accounts");
  }    
});

//renders add artwork page
app.get("/addArtwork", (req, res) =>{
  res.render("pages/addArtwork", { session: req.session });
});

//adds the artwork if  name is different to the arts databse otherwise sends 400 error
app.post("/addArtwork", async (req, res) =>{
  //add if else for if there is already an artowk with same name.
  let artInfo = req.body;
  artInfo["artist"] = req.session.username;
  const findArt = await Art.findOne({ name: artInfo.name });
  if(findArt != null) {
    //console.log("Send error.");
    res.status(400).send('error: Art exists');
  } else {
    console.log("adding: " + JSON.stringify(artInfo));
    await Art.create(artInfo);
    //adds the artwork's name that the user added to the artworks property in the User model
    //this is done so that the user can see all the artworks that they added
    await User.updateOne(
      { _id: req.session.userid }, 
      { $push: { artworks: artInfo.name } }
    );
    res.status(200).send("added");
  }
  //const result = await Art.create(new Art(artInfo));
});


//renders search page
//the search page shows at the bottom all available artworks names, artist names, categories
app.get("/searchArtworks", async (req, res) =>{
  const arts = await Art.find({});
  res.render("pages/searchArtworks", {arts: arts, session: req.session });
});

//finds all artworks with the given search input
app.post("/search", async (req, res) =>{
  let search = req.body;
  //search.searchKey is what the user chose from the dropdown(artwork name, artist, or category) and search.searchValue is what they inputted in the input box
  returnedArt = await Art.find().where(search.searchKey).equals(search.searchValue);
  console.log(returnedArt);
  //if not found
  if(returnedArt.length==0) {
    //console.log("Send error.");
    res.status(400).send('No results found');
  } else {
    res.status(200).send("sent");
    //renders searched results page
    //res.render("pages/artworks", { result: returnedArt, session: req.session });
  }
});


//Finds the artwork with the artID (which is the Object_id for the document).
app.get('/artworks/:artID', async (req, res) => {
  //finding all the distinct categories of the artworks to use in the rendered artwork page
  let categories = [];
  categories = await Art.distinct("category");
  let obj_id = Types.ObjectId(req.params.artID);
  //finding the artwork wiht that id
  const result = await Art.findOne({ _id: obj_id });
  // console.log(result.reviews instanceof Map);
  // result.reviews.set('bla', 'bla');

  //since reviews in the Art model is of Map type, so here it is converted to a regular object to be able to use it in pug
  const obj = Object.fromEntries(result.reviews);
  //checks if the value(review) of a key(username) is empty(which it happens if the user chose to remove review) and removes the whole 
  //key-value pair from obj so that that removed review doesn't get displayed
  for(let rev in obj){
    if(obj[rev]===''){
      delete obj[rev];
    }
  }
  console.log(obj);
  res.render('pages/artwork', { art: result, reviews: obj, categories: categories, session: req.session });
});

//renders artworks results page
app.get("/artworks", (req, res) =>{
  res.render("pages/artworks", {result: returnedArt, session: req.session });
});

//renders artist page and uses the query parameter in the url
app.get("/artists", async (req, res) =>{
  //finding the artist with the artist name in the query paramter
  let artistName = req.query.artist;
  //an object to store all the arts for this artist with art id as key and art name as value
  let arts = {};
  const allWorks = await User.find().where("username").equals(artistName);
  for(let work of allWorks){
    const art = await Art.findOne({ name: work.artworks[0] });
    arts[art._id] = work.artworks[0];
  }
  //checking to see if user has already this artist in their following
  //this is done so that a follow or unfollow button is rendered on the page accordingly
  let bool=false;
  const user = await User.findOne({ username: req.session.username });
  for(let follow of user.followedArtists){
    if(artistName==follow){
      bool=true;
    }
  }
  //console.log(artistName);
  //renders the found artist's page
  res.render("pages/artist", {bool: bool, allArts: arts, artist: artistName, session: req.session });
});


//adds the followed artist name to the followedArtists property for the user
app.post("/follow", async (req, res) =>{
  let artist = req.body.artistName;
  try{
    await User.updateOne(
      { _id: req.session.userid }, 
      { $push: { followedArtists: artist } }//,
      //done
    );
    res.status(200).send('Success');
  } catch(err) {
    console.log(err);
    res.status(400).json({ error: "Error adding review"});
  }   
});

//renders categories page
app.get("/categories", async (req, res) =>{
  //finding art with the category in the query paramter
  let reqCategory = req.query.category;
  const result = await Art.find().where("category").equals(reqCategory);
  //renders the found artworks page
  res.render("pages/artworks", {result: result, session: req.session });
});

//Logs the user out
app.get("/logout", (req, res) => {
  //setting the session loggedin property to false
  if(req.session.loggedin) {
    req.session.loggedin = false;
  }
  res.redirect(`http://localhost:3000/home`);

});

//adds the review entered and when add review button is pressed
app.post("/addReview", async (req, res) =>{
  let review = req.body.review;
  //the artwork with the id in the url
  let artID = req.body.id;
  console.log(artID);
  //artworksReviews[artID]["reviews"][req.session.userid] = review;
  const artwork = await Art.findOne({ _id: artID });
  if(req.session.username!=artwork.artist){
    //adds the review as a value in a key-value pair in the Map object and the key is the user name that entered this review
    //this is done in order to remember which user entered which review
    artwork.reviews.set(req.session.username, review);
    artwork.save();
    //adds the artwork's id that the user reviewed to the reviews part in the User model
    //this is done so that the user can see all the artworks that they reviewed
    await User.updateOne(
      { _id: req.session.userid }, 
      { $push: { reviews: artID } }
    );
    res.status(200).send('Success');
  }
  else{
    res.status(400).json({ error: "Error adding review"});
  }   
});

//increments the likes of an artwork by one each time the like button is clicked for an artwork
app.post("/addLike", async (req, res) =>{
  let artID = req.body.id;
  const artwork = await Art.findOne({ _id: artID });
  if(req.session.username!=artwork.artist){
    //finds how many likes there already is and increments that by 1 for that artwork
    let numLikes = artwork.likes;
    await Art.updateOne({ _id: artID }, {
      likes: numLikes+1
    });
    //adds the artwork's id that the user liked to the likes part in the User model
    //this is done so that the user can see all the artworks that they liked
    await User.updateOne(
      { _id: req.session.userid }, 
      { $push: { likes: artID } }//,
      //done
    );
    res.status(200).send('Success');
  }
  else{
    res.status(400).json({ error: "Error adding like"});
  }   
});

//renders followed artists page
app.get("/following", async (req, res) =>{
  const result = await User.findOne({ username: req.session.username });
  res.render("pages/artists", { followed: result.followedArtists, session: req.session });
});

// Remove the artist followed associated with the name 
app.delete('/artists/artist/:artistName', async (req, res) => {
  console.log(req.params.artistName);
  //remove all the artists with the same artist name in the query parameter from the followed artists array for the current user
  await User.updateOne({ username: req.session.username }, {
    $pullAll: {
      followedArtists: [req.params.artistName],
    },
  });
  res.send();

});


//renders the user's artworks that were reviewed/liked page
app.get("/yourArtworks", async (req, res) =>{
  const result = await User.findOne({ username: req.session.username });
  //creating a reviews and likes objects to store the reviewed/like arts names with their ids so that they can be rendered using their names on the browser
  let reviews = {};
  for(let rev of result.reviews){
    const artReviewed = await Art.findOne({ _id: rev });
    reviews[rev] = artReviewed.name;
  }
  let likes = {};
  for(let like of result.likes){
    const artLiked = await Art.findOne({ _id: like });
    likes[like] = artLiked.name;
  }
  res.render("pages/yourArtworks", { reviewed: reviews, liked: likes, session: req.session });
});

// Remove the artwork reviewed associated with the id from the reviews array for User 
app.delete('/revArtworks/:revArt', async (req, res) => {
  console.log(req.params.revArt);
  const art = await Art.findOne({_id: req.params.revArt});
  //sets the value of the username who made the review to be an empty string and when the artwork page is rendered, it won't display reviews that are empty string
  art.reviews.set(req.session.username, "");
  await art.save();
  console.log(art);

  //remove all the artworks with the same id in the query parameter from the reviewed arts array for the current user
  await User.updateOne({ username: req.session.username }, {
    $pullAll: {
      reviews: [req.params.revArt],
    },
  });
  res.send();

});

// Remove the artwork liked associated with the id froom the likes array for User 
app.delete('/likedArtworks/:likeArt', async (req, res) => {
  console.log(req.params.likeArt);
  //remove all the artworks with the same id in the query parameter from the likes arts array for the current user
  await User.updateOne({ username: req.session.username }, {
    $pullAll: {
      likes: [req.params.likeArt],
    },
  });
  res.send();

});

//loading the data
const loadData = async () => {
	//Connect to the mongo database
  	const result = await connect('mongodb://localhost:27017/project');
    return result;

};

//Call to load the data
loadData()
  .then(() => {

    app.listen(3000);
    console.log("Listening on port 3000");

  })
  .catch(err => console.log(err));

