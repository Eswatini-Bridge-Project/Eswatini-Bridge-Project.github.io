function showSignup() {
    var signupform = document.getElementById("signUpForm");

    var loginform = document.getElementById("loginForm");

    signupform.style.display = "block";
    loginform.style.display = "none";
}

function setUpHomePage() {
    
    toggleLoader();
    
    var urlParams = new URLSearchParams(window.location.search);
    
    document.getElementById("titleHeader").innerHTML += urlParams.get('name');
    
    document.getElementById("date").value = "2014-01-02T11:42";
    localStorage.contactsToBeUpdated = "";


    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            
            localStorage.user = uid;
            
            console.log(user.email);

            var db = firebase.firestore();

            var docRef = db.collection("users").doc(uid);

            docRef.onSnapshot(function (doc) {
                
                localStorage.number2 = JSON.stringify(doc.data());
                
                document.getElementById("titleHeader").innerHTML = `Welcome back, ${doc.data().name}`;

                var parentDiv = document.getElementById("allContacts");

                var contacts = doc.data().contacts;
                
                console.log("contacts are" + JSON.stringify(contacts));
                
                var listHolder = [];

                for (var key in contacts) {
                    var contactDetails = contacts[key];
                    var number = contactDetails.number;
                    var name = contactDetails.name;
                    var lists = contactDetails.list;

                    createContactCard(name, number, parentDiv);
                    
                    //add the lists from contact to list
                    lists.map(list => {
                        if (!listHolder.includes(list)) {
                            listHolder.push(list);
                        }
                    })
                }
                
                localStorage.lists = listHolder;

                    listHolder.map(list => {
                        var parentDiv = document.getElementById("subList");
                        createListCard(list, parentDiv);
                    })
                
                toggleLoader();
            });

        }
        else{
            alert('you have not logged in!');
            window.location.href='firebase_login.html'
        }
    });
    
}

function createListCard(list, parentDiv) {
    //create a name
    var divNode = document.createElement("DIV");
    var pNode = document.createElement("P");
    var inputNode = document.createElement("INPUT");
    var textnode = document.createTextNode(list);

    inputNode.setAttribute("type", "checkbox");
    inputNode.setAttribute("onclick", "checkSubList(this)");
    divNode.setAttribute("style", "display: inline-block");

    pNode.appendChild(inputNode);
    pNode.appendChild(textnode);

    divNode.appendChild(pNode);

    parentDiv.appendChild(divNode);
}

function createContactCard(name, number, parentDiv) {
    //create a name
    var divNode = document.createElement("DIV");
    var pNode = document.createElement("P");
    var inputNode = document.createElement("INPUT");
    var textnode = document.createTextNode(`${name} (${number})`);

    inputNode.setAttribute("type", "checkbox");
    inputNode.setAttribute("onclick", "checker(this)");
    pNode.appendChild(inputNode);
    pNode.appendChild(textnode);

    divNode.appendChild(pNode);

    parentDiv.appendChild(divNode);
}

function sendMessage() {

    document.getElementById("loader").style.display = "block";

    var message = document.getElementById("sendMessageText").value;

    var contactList = document.getElementById("contactHolder").childNodes;

    if (checkEmptiness(message, "Message")) {
        if (contactList.length == 1) {
            alert(`Please select some contacts😊`);
        } else {
            var contactHolder = [];

            for (i = 1; i < contactList.length; i++) {

                var contact = contactList[i].innerText;

                var number = contact.slice(contact.length - 13, contact.length - 1)

                console.log(contact);

                contactHolder.push(number);

                send(number, message);
                //alert("message sent!");
                //window.location.reload(true);
                //create 1/4 sent
                
                toastr.info('Preparing to send your message!');
                
                resetInputs();
                
                document.body.scrollTop = document.documentElement.scrollTop = 0;
                
                toggleLoader();
            }
        }

    }
}

function resetInputs(){
    var contacts = document.getElementById("allContactsForm");
    contacts.reset();
    
    var selectedContacts = document.getElementById("contactHolder");
    selectedContacts.innerHTML="";
    
    var inputText = document.getElementById("sendMessageText");
    
    inputText.innerHTML = "";
}

function send(number, message) {

    var form = new FormData();
    form.append("Body", message);
    form.append("To", `whatsapp:${number}`);
    form.append("From", "whatsapp:+14155238886");
    /*form.append("MediaUrl", "https://images.unsplash.com/photo-1545093149-618ce3bcf49d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80");*/

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.twilio.com/2010-04-01/Accounts/ACd39a50f2581980a42fa759d2a587253b/Messages.json",
        "method": "POST",
        "beforeSend": function (xhr) {
            /* Authorization header */
            xhr.setRequestHeader("Authorization", "Basic " + btoa("ACd39a50f2581980a42fa759d2a587253b" + ":" + "d957747df68438d2db18896dc8305901"))
        },
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": form
    };

    $.ajax(settings).done(function (response,status) {
        console.log(response);
        console.log(status);
        toastr.success(`Your message was a ${status} 😎`);

    });
}

function addToSchedule() {

    var message = document.getElementById("sendMessageText").value;

    var contactList = document.getElementById("contactHolder").childNodes;

    if (checkEmptiness(message, "Message")) {

        if (contactList.length == 1) {
            alert(`Please select some contacts😊`)
        } else {
            var contacts = [];

            console.log(contacts);

            for (i = 1; i < contactList.length; i++) {

                var contact = contactList[i].innerText;

                var number = contact.slice(contact.length - 13, contact.length - 1);

                contacts.push(number);
            }

            console.log(contacts);

            var datelocal = document.getElementById("date").value;

            if (checkEmptiness(datelocal, "Date")) {
                var data = JSON.stringify({
                    "fields": {
                        "Message": message,
                        "Contacts": contacts.toString(),
                        "Date": datelocal
                    }
                });

                var xhr = new XMLHttpRequest();

                xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        console.log(this.responseText);
                        alert("your message has been scheduled!");
                        window.location.reload();
                    }
                });

                xhr.open("POST", "https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/schedule?api_key=keynre40bTqHjQ7AD", false);
                xhr.setRequestHeader("Content-Type", "application/json");

                xhr.send(data);
            };
        }



    }
}

function checker(item) {

    console.log(item.parentNode.childNodes);
    var name = item.parentNode.childNodes[1].nodeValue.trim();

    if (item.checked) {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(name);

        node.setAttribute("class", "fa-li");

        node.appendChild(textnode);
        document.getElementById("contactHolder").appendChild(node);
    } else {

        var contactList = document.getElementById("contactHolder").childNodes;

        for (i = 0; i < contactList.length; i++) {

            var contact = contactList[i].innerText;

            console.log(contact);

            console.log(name);

            console.log(name == contact);

            if (contact == name) {
                contactList[i].remove()
                break;
            }

        }

    }

}

function displayCreateList() {
    var holder = document.getElementById("addToList");
    holder.style.display = "block";

    //add input
    var input = document.createElement("INPUT");
    input.setAttribute("type", "text");
    input.setAttribute("id", "listTitle");
    input.setAttribute("placeholder", "insert name of list");

    holder.appendChild(input);

    //add CREATE Button

    //load contacts
    
    var allData = JSON.parse(localStorage.number2);
        
        for (var key in allData.contacts) {
                    var contactDetails = allData.contacts[key];
                    var number = contactDetails.number;
                    var name = contactDetails.name;

                    var divNode = document.createElement("DIV");
                    var pNode = document.createElement("P");
                    var inputNode = document.createElement("INPUT");
                    var textnode = document.createTextNode(`${name} (${number})`);

                    inputNode.setAttribute("type", "checkbox");
                    inputNode.setAttribute("onclick", "updateNewList(this)");
                    pNode.appendChild(inputNode);
                    pNode.appendChild(textnode);
                    divNode.setAttribute("class", "text-center");

                    divNode.appendChild(pNode);

                    holder.appendChild(divNode);
                }
    
}

function createList() {
    var newlist = document.getElementById("listTitle").value;

    //get added contacts from localstorage.newContactList

    var numbers = localStorage.contactsToBeUpdated.split(";");
    
    var newContacts = JSON.parse(localStorage.number2).contacts;
    
    var fullBranch = JSON.parse(localStorage.number2);
    
    for(key in newContacts){
        
        console.log(numbers);
        console.log(key);
        if(numbers.includes(key)){
            console.log(newContacts[key])
            var currentList = newContacts[key].list;
            
            currentList.push(newlist);
            
           fullBranch.contacts[key].list = currentList;
            
            //add newList to currently list
            console.log(newContacts[key]);
            updateContactAgain(key,fullBranch.contacts);
            
        }
    }

}

function updateContactAgain(number,object){
    
    var db = firebase.firestore();
    
    var toBeUpdated = db.collection("users").doc(localStorage.user);

    // Set the "capital" field of the city 'DC'
    return toBeUpdated.update({
        contacts : object
    })
    .then(function() {
        console.log("Document successfully updated!");
        window.location.reload();
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function updateNewList(item) {
    var contact = item.parentNode.childNodes[1].nodeValue.trim();

    var number = contact.slice(contact.length - 13, contact.length - 1);
    //add these to a list for contacts to be updated
    localStorage.contactsToBeUpdated += number + ";";
    console.log(localStorage.contactsToBeUpdated);
}

function updateContact(number, id, list) {

    var data = JSON.stringify({
        "records": [
            {
                "id": id,
                "fields": {
                    "List": list
                }
        }
      ]
    });

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open("PATCH", "https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/contact?api_key=keynre40bTqHjQ7AD", false);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(data);
}

function checkSubList(item) {
    //onclick get the name on the click
    var subList = item.parentNode.childNodes[1].nodeValue;

    //var contacts = JSON.parse(localStorage.number);
    var contacts2 = JSON.parse(localStorage.number2);
    
    var numbers = contacts2.contacts;
    
    for (var key in contacts2.contacts) {
        var lists = contacts2.contacts[key].list;
        console.log(lists);
         if (lists.includes(subList)) {
            //now find this contact and check it
             
              var index = Object.keys(numbers).indexOf(key);
             
            var holder = document.getElementById("allContacts").children[index].children[0].innerText;

            var number = holder.slice(holder.length - 13, holder.length - 1)

            console.log(number);
            console.log(index);

            document.getElementById("allContacts").children[index].children[0].children[0].click();

        }
    }

    //if contact has tag click it
}

function checkEmptiness(item, name) {
    if (item == undefined || item == "") {
        alert(`Looks like ${name} is empty!😊`);
        return false;
    } else {
        return true;
    }
}

function toggleLoader() {

    var loader = document.getElementById("loader").style.display;

    if (loader == "block") {
        document.getElementById("loader").style.display = "none";
    } else {
        document.getElementById("loader").style.display = "block";
    }
}

function addNewContact(){
    var newContactName = document .getElementById("addContactName").value;
    var newContactNumber = document.getElementById("addContactNumber").value;
    
    //send!
    var db = firebase.firestore();
    
    var toBeUpdated = db.collection("users").doc(localStorage.user);
    
    var newContacts = JSON.parse(localStorage.number2).contacts;
    
    newContacts[newContactNumber] = {
        list : ["all"],
        number : newContactNumber,
        name : newContactName
    }

    // Set the "capital" field of the city 'DC'
    return toBeUpdated.update({
        contacts : newContacts
    })
    .then(function() {
        console.log("Document successfully updated!");
        window.location.reload();
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function addModalLists(){
    
    var currentList = localStorage.lists.split(",");
    
    var inputNode = document.createElement("INPUT");
    
    inputNode.setAttribute("type", "checkbox");
    inputNode.setAttribute("id", "checkbox");
    
    
    
    //create a name
    var divNode = document.createElement("DIV");
    var pNode = document.createElement("P");
    var inputNode = document.createElement("INPUT");
    var textnode = document.createTextNode(list);

    inputNode.setAttribute("type", "checkbox");
    inputNode.setAttribute("onclick", "checkSubList(this)");
    divNode.setAttribute("style", "display: inline-block");

    pNode.appendChild(inputNode);
    pNode.appendChild(textnode);

    divNode.appendChild(pNode);

    parentDiv.appendChild(divNode);
    
}
