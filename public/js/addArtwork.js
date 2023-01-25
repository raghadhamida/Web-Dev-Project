// when add artwork button is clicked
document.getElementById("add").onclick = addArtwork;

//takes the values for the art info entered and sends to server
function addArtwork(){
    let name = document.getElementById("name").value;
	let year = document.getElementById("year").value;
    let category = document.getElementById("category").value;
    let medium = document.getElementById("medium").value;
    let description = document.getElementById("description").value;
    let image = document.getElementById("image").value;

	let newArtwork = { name: name, year: year, category: category, medium: medium, description: description, image: image, likes: 0, reviews: new Map()};
 
    let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		//if art name isn't already taken, it alerts of the success, otherwise it gives an error message
		if(this.readyState == 4 && this.status == 200){
			window.location.href = "http://localhost:3000/home";
			alert("Artwork added!");
		}
        else if(this.readyState == 4 && this.status == 400){
			alert("Artwork name already exists. Try another one!");
        }
	}
	
	req.open("POST", "/addArtwork");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(newArtwork)); 
}