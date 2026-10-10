const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value.trim();


    if (username === "" || password === "") {

        alert("Please enter your username and password.");

        return;
    }


    alert("Login successful!");

});


const createAccount =
    document.getElementById("createAccount");


createAccount.addEventListener("click", function() {

    alert("Create Workspace clicked!");

});