// when add review button is clicked
document.getElementById("review").onclick = addReview;
// when like button is clicked
document.getElementById("like").onclick = addLike;

//takes the review info entered and sends to server
function addReview(){
    let review = document.getElementById("rev").value;
	//finding the artwork id from the url in order to add this review to that artwork
	let artID = window.location.pathname.split("/").pop();
	let reviewForArt = {id: artID, review: review};
    let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		//
		if(this.readyState == 4 && this.status == 200){
			window.location.href = `http://localhost:3000/artworks`;
		}
        else if(this.readyState == 4 && this.status == 400){
			alert("Cannot Add Review to your own Artwork");
        }
	}
	
	req.open("POST", "/addReview");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(reviewForArt)); 
}


//increases the number of likes of this artwork by 1 each time
function addLike(){
	//finding the artwork id from the url in order to add this like to that artwork
	let artID = window.location.pathname.split("/").pop();
	let id = {id: artID};
    let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			window.location.href = `http://localhost:3000/artworks`;
		}
        else if(this.readyState == 4 && this.status == 400){
			alert("Cannot add like");
        }
	}
	
	req.open("POST", "/addLike");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(id)); 
}