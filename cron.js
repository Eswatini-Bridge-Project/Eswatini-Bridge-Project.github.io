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
        var url = item.fields.Media;
        var date = item.fields.Date.toString().slice(0,10);
        var time = item.fields.Date.toString().slice(11,16);

        console.log(contacts.split(","),todayTime,time);
        
        if(todayDate == date && todayTime == time){
            
            var numbers = contacts.split(",");
            
            numbers.map( number => {
                sendMessage(message,number,url);
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
    
function sendMessage(message,number,url){
    
    var form = new FormData();
    form.append("Body", message);
    form.append("To", `whatsapp:${number}`);
    form.append("From", "whatsapp:+14155238886");
    
    
    if (url != "") {
        form.append("MediaUrl", url);
    }

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.twilio.com/2010-04-01/Accounts/ACd39a50f2581980a42fa759d2a587253b/Messages.json",
        "method": "POST",
        "beforeSend": function (xhr) {
            /* Authorization header */
           xhr.setRequestHeader("Authorization", "Basic " + btoa(ACCOUNT_SID + ":" + AUTH_TOKEN))
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