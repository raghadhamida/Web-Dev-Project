// when switch button is clicked
document.getElementById("switch").onclick = switchAccounts;
// when stay on current button is clicked
document.getElementById("stay").onclick = stay;

function switchAccounts(){
    let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//redirects the page to either the home page or the add artwork page. It depends on which type the user was and wants to switch to.
			window.location.href = "http://localhost:3000/" + JSON.parse(this.responseText);
		}
        else if(this.readyState == 4 && this.status == 400){
			alert("UError");
        }
	}
	
	req.open("GET", "/switchAccount");
	req.send(); 
}

function stay(){
	//redirects the page to the home page without switching accounts.
	window.location.href = "http://localhost:3000/home"
}