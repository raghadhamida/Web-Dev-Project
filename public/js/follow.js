// when follow or unfollow button is clicked
if(document.getElementById("follow")!=null){
    document.getElementById("follow").onclick = follow;
}
else{
    document.getElementById("unfollow").onclick = unfollow;
}
//when follow button clicked
function follow(){
    //stores the artist's name so that it can be used
	let artistName = document.getElementById("follow").value;
    console.log(artistName);
    let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		//if art name isn't already taken, it alerts of the success, otherwise it gives an error message
		if(this.readyState == 4 && this.status == 200){
			window.location.href = "http://localhost:3000/artists?artist="+artistName;
		}
        else if(this.readyState == 4 && this.status == 400){
			alert("error");
        }
	}
	
	req.open("POST", "/follow");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify({artistName: artistName})); 
}


//when unfollow button clicked
function unfollow(){
    //stores the artist's name so that it can be used
	let artistName = document.getElementById("unfollow").value;
    console.log(artistName);
    fetch(`http://localhost:3000/artists/artist/${artistName}`, {
        method: 'DELETE', 
    })
    // fetch() returns a promise. When we have received a response from the server,
    // the promise's `then()` handler is called with the response.
    .then((response) => {
        // Our handler throws an error if the request did not succeed.
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        // Otherwise (if the response succeeded), our handler fetches the response
        // as text by calling response.text(), and immediately returns the promise
        // returned by `response.text()`.
        return response.text();
    })
    // When response.text() has succeeded, the `then()` handler is called with
    // the text, and we redirect to another URL..
    .then((responseText) => {
        location.href=`http://localhost:3000/artists?artist=${artistName}`
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(error));

}