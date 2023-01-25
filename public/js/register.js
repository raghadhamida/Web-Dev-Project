// when register button is clicked
document.getElementById("reg").onclick = addUser;

function addUser(){
    let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;
    //the usertype key is to indicate whether the user is of type patron or artist. 0: patron.  1: artist
    //A new registered user is always a patron at first.
	let newUser = { username: username, password: password, usertype: 0, followedArtists: [], reviews: [], likes: [], artworks: [], workshops: []};

    let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//redirects the page to the home page.
			window.location.href = "http://localhost:3000/home";
		}
        else if(this.readyState == 4 && this.status == 400){
            document.getElementById("username").value = '';
			document.getElementById("password").value = '';
			alert("Username already taken, please use a different one");
        }
	}
	
	req.open("POST", "/register");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(newUser)); 
}

