# Web-Dev-Project

Final Project Report
Youtube Link: https://www.youtube.com/watch?v=hOfZT56Bv-4

After the zip file has been downloaded, to install the node_modules
and package-lock.json Run:
npm install
Then, in order to initialize the database with the databaseinitializer.js, run:
node database-initializer.js
Then, to run the server, run:
node server.js
To be able to visualize the database, you can open another terminal
meanwhile and run:
mongosh
use project
show collections
db.users.find().pretty()
db.arts.find().pretty()
To exit: just type exit
The database-initializer.js create a new MongoDB/Mongoose
database from the gallery.json file provided and it adds to the
database new artworks and adds extra keys. It creates two collection:
users, arts
The users collection stores the artists in the gallery.json as users with
user type ‘1’ which is the number for the artists user types. Normal
users who aren’t artists have user type ‘0’, These get added to the
users collection when they register on the website.
The artworks.js file creates the arts collection schema with the
following properties:
Name, artist, year, category, medium, description, image, likes,
reviews
Most of them are strings, except for likes which is a Number and it is
necessary to count how many likes an artwork has. And reviews is of
Map type that stores the names of users that made a review as a key
and the review they made as a value.
The users.js file creates the users collection schema with the following
properties:
username, password, usertype, followedArtists, reviews, likes,
artworks, workshops
followedArtists is an array of artists names that the user followed.
reviews and likes are arrays of ObjectIDs that store the id of the
document of the artwork they interacted with. artworks is an array of
artworks names they have and same for workshops.
*****Overall Design Discussion and Explanation of Design
Decisions:*******
The html side of the application was implemented all in pug files
because it allows us to access things dynamically and have variables in
the pug. The application was separated between client side and
server side as this is necessary.
All the client files are stored in the js folder in the public folder. There
are several of the client side javascripts because it is better to
separate them according to what the action they are handling since
we’ve learned that it is
hard to have several pug files with the same client script. The action
the user like for example adding an artwork has its button and when
that is clicked, it would be handled by its corresponding js file with a
name that suits that action
like ‘addArtowrk.js’.
Additionally, express-session was used because it helps us access user
data when they are browsing the application. In this application, the
session has the following properties: loggedin, username, userid,
usertype.
A good design decision that was made was that each of the pages has
the header of links to all pages a user may want.
Another one is that the input boxes have default values, and this
ensures that no empty values will be sent or added.
A design decision that was made was that when the user clicks on
searchArtworks, they can choose from a dropdown menu whether
they want to search with artwork name, artist name, or by category.
Then they would enter in an input box the
search name/category name they’re looking for. In that page, all the
artworks available are displayed at the bottom so they know what to
write. *It may have been a better design to provide the artwork
names/artists/categories in a drop down
so the user can easily choose from them and especially since in my
design, the user has to enter the name they want exactly like what it
is in the database or else the application won’t find it*
Also, when the user is prompted to add an artwork when they want
to switch accounts, the artwork name they provide must be unique or
else the server sends a 400 bad request and the user is alerted with a
message. This also applies for the
username the user chooses to register in.
Throughout the implementation of the code, a lot of POST, GET,
DELETE requests were made and handled with proper HTTP status
codes. This allows CRUD(create/read/update/delete)
 All the href urls in the headers.pug were handled in the server.js to
render the appropriate page.
These headers are displayed on the page when the user is logged in.
/home
/switch for switching account types
/following to see who they’re following
/searchArtworks to search for artworks
/yourArtworks to see the artworks they’ve reviewed and/or liked
/logout
When the user isn’t logged in they only have two header links:
/register to register and then click on again after register button is
clicked to login
/home
 As to the other requests that are made when a user clicks on a
button or when a specific url is specified in client side javascript:
GET /switchAccount is made in the switch.js file and handled in the
server.
It is used to update to the user type the user is switching to and sends
which page accordingly.
In that switching page, I implemented a stay on page in case the user
changed their mind.
GET /addArtwork renders the add artwork page when the user
chooses to switch to artist.
POST /addArtwork handles if the user wants to add an artwork but it
only sends a good response if the username is unique.
POST /search to find all arts with what the user is searching for
(In the search artworks page, the available arts were displayed so that
the user can know what to search for)
GET /artworks/:artID is used to get a specific art with its id and this
request is used several times in the implementation because there are
several pages that have link to artworks.
GET /artworks is used when the user hits search and it displays the
corresponding artworks as links
GET /artists always comes with query parameter of the specific artist
name like so :
/artists?artist=<name>
The link to that url is used especially when viewing a specific artwork
in artwork.pug and the artist name is a link on that page.
POST /follow is made in the follow.js when the follow button is
clicked and this handler adds that artist to the following page
GET /categories also uses query parameters that look like:
/categories?category=<..> which is used to get the page that shows all
the artworks that are in this category. These links are shown in the
specific artwork page.
POST /addReview handles when the add review button is clicked for a
specific artwork
POST /addLike handles when the like button is clicked and adds the
number of likes to that art
DELETE /artists/artist/:artistName is a handler for when the user hits
unfollow button and this is used in two pages; the ‘following’ page
and in the specific artists page where it shows either the follow or the
unfollow button depends on what the user made.
DELETE /revArtworks/:revArt is made if a user removed their review
for an artwork in the /yourArtworks page and it removes the id of the
artwork from the array of reviews for the user
DELETE /likedArtworks/:likeArt is same as the above but for the liked
arts
Mongoose and Schema Types were used in this application because it
makes handling MongoDb databases easier.
