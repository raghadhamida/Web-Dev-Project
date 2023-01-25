// when search button is clicked
document.getElementById("submit").onclick = searchResults;

//takes the search criteria info entered and sends to server
function searchResults(){
    let searchBy = document.getElementById("search-select");
    //stores which choice is selected in the drop down 
	let searchByOption = searchBy.options[searchBy.selectedIndex].value;
	console.log(searchByOption);
	//stores what the user ientered in the input box
    let searchFor = document.getElementById("search").value;

	let searchCriteria = { searchKey: searchByOption, searchValue: searchFor};

    let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		//if artworks are found with given input, redirects page to all artworks filtered with the search criteria
		if(this.readyState == 4 && this.status == 200){
			window.location.href = "http://localhost:3000/artworks";
		}
        else if(this.readyState == 4 && this.status == 400){
			alert("Cannot find artwork with that input");
        }
	}
	
	req.open("POST", "/search");
	req.setRequestHeader('Content-Type', 'application/json');
	console.log(searchCriteria);
	req.send(JSON.stringify(searchCriteria)); 
}