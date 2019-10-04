function checkUsers(){
    setInterval(function(){ createElements(); }, 60000);
}
    
    
function createElements(){
    
    var schedule = getUsers("https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/schedule?api_key=keynre40bTqHjQ7AD");
    
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    today.getHours(); // => 9
    today.getMinutes(); // =>  30
    
    var todayDate = `${yyyy}-${mm}-${dd}`;
    var todayTime = `${today.getHours()}:${today.getMinutes()}`;
    
    if(today.getMinutes() < 10){
        todayTime = `${today.getHours()}:0${today.getMinutes()}`;
    }
    
    if(today.getHours() < 10){
        todayTime = `0${today.getHours()}:${today.getMinutes()}`;
    }
        
        var paragraph = document.createElement("p");
  paragraph.innerHTML = `${todayDate} | ${todayTime}`;
  document.body.appendChild(paragraph);
    
    schedule.records.map(item => {

        var message = item.fields.Message;
        var contacts = item.fields.Contacts;
        var date = item.fields.Date.toString().slice(0,10);
        var time = item.fields.Date.toString().slice(11,16);

        console.log(contacts.split(","),todayTime,time);
        
        if(todayDate == date && todayTime == time){
            
            var numbers = contacts.split(",");
            
            numbers.map( number => {
                sendMessage(message,number);
            })
            
           }
    });
}
    

    
function getUsers(theUrl){
     var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl , false ); // false for synchronous request
    xmlHttp.send( null );
    
    return JSON.parse(xmlHttp.responseText);
    
}
    
function sendMessage(message,number){
    
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

    $.ajax(settings).done(function (response) {
        console.log(response);
        
    });
}