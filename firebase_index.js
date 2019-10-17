console.log(superdupa);

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

    var newDate = new Date();
    var currentYear = newDate.getFullYear();
    var currentMonth = newDate.getMonth() + 1;
    var currentDay = newDate.getDate();
    var currentHour = newDate.getHours();
    var currentMinute = newDate.getMinutes();

    if (currentMinute < 10) {
        currentMinute = `0${currentMinute}`;
    }

    document.getElementById("date").value = `${currentYear}-${currentMonth}-${currentDay}T${currentHour}:${currentMinute}`;
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

            var db = firebase.firestore();

            var docRef = db.collection("users").doc(uid);

            docRef.onSnapshot(function (doc) {

                localStorage.number2 = JSON.stringify(doc.data());

                document.getElementById("titleHeader").innerHTML = `Welcome back, ${doc.data().name}`;

                var parentDiv = document.getElementById("allContacts");

                parentDiv.innerHTML = "";

                var contacts = doc.data().contacts;

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

        } else {
            alert('you have not logged in!');
            window.location.href = 'firebase_login.html'
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

    toggleLoader();

    var message = document.getElementById("sendMessageText").value;

    var contactList = document.getElementById("contactHolder").childNodes;

    var media = document.getElementById("media").value;

    if (checkEmptiness(message, "Message")) {
        if (contactList.length == 1) {
            alert(`Please select some contacts😊`);
        } else {

            if (media == "") {
                var contactHolder = [];

                for (i = 1; i < contactList.length; i++) {

                    var contact = contactList[i].innerText;

                    var number = contact.slice(contact.length - 13, contact.length - 1)

                    console.log(contact);

                    contactHolder.push(number);

                    send(number, message, "");
                    //alert("message sent!");
                    //window.location.reload(true);
                    //create 1/4 sent

                    toastr.info('Preparing to send your message!');

                    resetInputs();

                    document.body.scrollTop = document.documentElement.scrollTop = 0;

                    toggleLoader();
                }
            } else {
                //send errthing with media

                const ref = firebase.storage().ref();

                const file = document.getElementById('media').files[0];

                //const file = $('#photo').get(0).files[0];

                const name = (+new Date()) + '-' + file.name;

                const task = ref.child(name).put(file);

                toastr.info('uploading your media')

                task.then((snapshot) => {
                    console.log(snapshot);
                    snapshot.ref.getDownloadURL().then(url => {


                            console.log(url);

                            var contactHolder = [];

                            for (i = 1; i < contactList.length; i++) {

                                var contact = contactList[i].innerText;

                                var number = contact.slice(contact.length - 13, contact.length - 1)

                                console.log(contact);

                                contactHolder.push(number);

                                send(number, message, url);
                                //alert("message sent!");
                                //window.location.reload(true);
                                //create 1/4 sent

                                toastr.info('Preparing to send your message!');
                            }
                        }

                    )
                });

                resetInputs();

                document.body.scrollTop = document.documentElement.scrollTop = 0;

                toggleLoader();


            }


        }

    }
}

function send(number, message, url) {

    var form = new FormData();
    form.append("Body", message);
    form.append("To", `whatsapp:${number}`);
    form.append("From", "whatsapp:+14155238886");

    if (url != "") {
        form.append("MediaUrl", url);
    }


    var half1 = "d957747df68438";
    var half2 = "d2db18896dc8305901";

    var joinedString = half1 + half2;

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.twilio.com/2010-04-01/Accounts/ACd39a50f2581980a42fa759d2a587253b/Messages.json",
        "method": "POST",
        "beforeSend": function (xhr) {
            /* Authorization header */
            xhr.setRequestHeader("Authorization", "Basic " + btoa("ACd39a50f2581980a42fa759d2a587253b" + ":" + joinedString))
        },
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": form
    };

    $.ajax(settings).done(function (response, status) {
        console.log(response);
        console.log(status);

        if (status == "success") {
            toastr.success(`Your message was a ${status} 😎`);
        } else {
            toastr.error(`Error sending your message ${status}😨`);
        }


    });
}

function addToSchedule() {

    toastr.info("Preparing to schedule your message");

    var message = document.getElementById("sendMessageText").value;

    var contactList = document.getElementById("contactHolder").childNodes;

    var media = document.getElementById("media").value;

    if (checkEmptiness(message, "Message")) {

        if (contactList.length == 1) {
            alert(`Please select some contacts😊`)
        } else {

            if (media == "") {
                var contacts = [];

                console.log(contacts);

                for (i = 1; i < contactList.length; i++) {

                    var contact = contactList[i].innerText;

                    var number = contact.slice(contact.length - 13, contact.length - 1);

                    contacts.push(number);
                };

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
                            toastr.info("your message has been scheduled!");
                            resetInputs();
                        }
                    });

                    xhr.open("POST", "https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/schedule?api_key=keynre40bTqHjQ7AD", true);
                    xhr.setRequestHeader("Content-Type", "application/json");

                    xhr.send(data);
                };

            } else {

                const ref = firebase.storage().ref();

                const file = document.getElementById('media').files[0];

                const name = (+new Date()) + '-' + file.name;

                const task = ref.child(name).put(file);

                toastr.info('uploading your media')

                task.then((snapshot) => {
                    console.log(snapshot);
                    snapshot.ref.getDownloadURL().then(url => {

                            toastr.info('Media uploaded');

                            var contacts = [];

                            console.log(contacts);

                            for (i = 1; i < contactList.length; i++) {

                                var contact = contactList[i].innerText;

                                var number = contact.slice(contact.length - 13, contact.length - 1);

                                contacts.push(number);
                            };

                            var datelocal = document.getElementById("date").value;

                            if (checkEmptiness(datelocal, "Date")) {
                                var data = JSON.stringify({
                                    "fields": {
                                        "Message": message,
                                        "Contacts": contacts.toString(),
                                        "Date": datelocal,
                                        "Media": url
                                    }
                                });

                                var xhr = new XMLHttpRequest();

                                xhr.addEventListener("readystatechange", function () {
                                    if (this.readyState === 4) {
                                        console.log(this.responseText);
                                        toastr.info("your message has been scheduled!");
                                        resetInputs();
                                    }
                                });

                                xhr.open("POST", "https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/schedule?api_key=keynre40bTqHjQ7AD", true);
                                xhr.setRequestHeader("Content-Type", "application/json");

                                xhr.send(data);
                            };



                        }

                    )
                });

                resetInputs();

                document.body.scrollTop = document.documentElement.scrollTop = 0;

                toggleLoader();

            }
        }

        //if yes
        //create link
        //then use link add to schedule



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

    if (holder.style.display != "block") {
        
        holder.innerHTML = "";

        holder.style.display = "block";
        
        //add button
        var button = document.createElement("BUTTON");
        var textNode = document.createTextNode("create list");
        button.appendChild(textNode);
        button.setAttribute("onclick","createList()");
        holder.appendChild(button);

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

            divNode.appendChild(pNode);

            holder.appendChild(divNode);
        }

    } else {
        holder.style.display = "none"
    }

}

function createList() {
    var newlist = document.getElementById("listTitle").value;

    //get added contacts from localstorage.newContactList

    var numbers = localStorage.contactsToBeUpdated.split(";");

    var newContacts = JSON.parse(localStorage.number2).contacts;

    var fullBranch = JSON.parse(localStorage.number2);

    for (key in newContacts) {

        console.log(numbers);
        console.log(key);
        if (numbers.includes(key)) {
            console.log(newContacts[key])
            var currentList = newContacts[key].list;

            currentList.push(newlist);

            fullBranch.contacts[key].list = currentList;

            //add newList to currently list
            console.log(newContacts[key]);
            updateContactAgain(fullBranch.contacts);

        }
    }

}

function updateContactAgain(object) {

    var db = firebase.firestore();

    var toBeUpdated = db.collection("users").doc(localStorage.user);

    // Set the "capital" field of the city 'DC'
    return toBeUpdated.update({
            contacts: object
        })
        .then(function () {
            console.log("Document successfully updated!");
            window.location.reload();
        })
        .catch(function (error) {
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

function addNewContact() {
    var newContactName = document.getElementById("addContactName").value;
    var newContactNumber = document.getElementById("addContactNumber").value;

    //send!
    var db = firebase.firestore();

    var toBeUpdated = db.collection("users").doc(localStorage.user);

    var newContacts = JSON.parse(localStorage.number2).contacts;

    newContacts[newContactNumber] = {
        list: ["all"],
        number: newContactNumber,
        name: newContactName
    }

    // Set the "capital" field of the city 'DC'
    return toBeUpdated.update({
            contacts: newContacts
        })
        .then(function () {
            console.log("Document successfully updated!");
            window.location.reload();
        })
        .catch(function (error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
}

function addModalLists() {

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

function changeCSVLabel(inputItem) {

    var fileName = inputItem.value.split("\\").pop();

    document.getElementById('customFileLabel').innerHTML = fileName;

}

function uploadCSV() {

    var fullBranch = JSON.parse(localStorage.number2);

    var newContacts = JSON.parse(localStorage.wamCSVData).data;

    newContacts.map(contact => {

        var newContactName = contact[0];
        var newContactNumber = contact[1];

        if (newContactNumber[0] != "+") {
            newContactNumber = `+${newContactNumber}`;
        }

        if (validate(newContactNumber)) {

            var newContact = {
                name: newContactName,
                number: newContactNumber,
                list: ['all']
            }

            fullBranch.contacts[newContactNumber] = newContact;
            updateContactAgain(fullBranch.contacts);

        } else {
            var errorText = `Invalid contact: ${newContactNumber} ${newContactName}`;
            toastr.error(errorText);
        }




    })

    toastr.info("upload done😎");

    document.getElementById("closeModalButton").click();
}

function validatePhoneNumber(phone) {
    var regex = /^\+(?:[0-9] ?){6,14}[0-9]$/;

    if (regex.test(phone)) {
        // Valid international phone number
        return true;
    } else {
        // Invalid international phone number
        return false;
    }
}

function handleFileSelect(evt) {
    var file = evt.target.files[0];

    Papa.parse(file, {
        header: false,
        complete: function (results) {
            console.log(results)
            localStorage.wamCSVData = JSON.stringify(results);
        }
    });
}

$(document).ready(function () {
    $("#customFile").change(handleFileSelect);
});

function checkInputLength(item) {

    console.log(item.value.length)

    if (item.value.length == 200) {
        toastr.error("You've reached your character limit😨")
    }

}

function resetInputs() {
    var contacts = document.getElementById("allContactsForm");
    contacts.reset();

    var subscriptionList = document.getElementById("subList");
    subscriptionList.reset();

    var selectedContacts = document.getElementById("contactHolder");
    selectedContacts.innerHTML = "";

    var inputText = document.getElementById("sendMessageText");

    inputText.value = "";

    document.getElementById("media").value = ""
    //add subscription list
}