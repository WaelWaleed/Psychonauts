// const socket = io();

// const chatform = document.getElementById('chat-form');

// //message sumbitting
// chatform.addEventListener('submit', (e)=>{
//     e.preventDefault();

//     const msg = e.target.elements.sendmsg.value;
//     //console.log(msg);
//     // socket.emit('urmsg',msg);
//     socket.emit('sent', msg);
    
//     e.target.elements.sendmsg.value = '';
//     e.target.elements.sendmsg.focus();
// }) 

// socket.on('sent', message => {
//     if(message != ''){
//         outputMsg(message);
//     }
// })
// socket.on('recieved', message => {
//     if(message != ''){
//         gotMsg(message);
//     }
// })
// socket.on('message', message => {
//     if(message != ""){
//         outputMsg(message);
//     }
// })


// function outputMsg(message) {
//     const div = document.createElement('div');
//     div.classList.add("chat-message-right");
//     div.classList.add("pb-4");
//     div.innerHTML = '<div><img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40"><div class="text-muted small text-nowrap mt-2">2:33 am</div></div><div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3"><div class="font-weight-bold mb-1" id="urMsg"></div>' + message +'</div>';
//     document.querySelector("#chatarea").appendChild(div);
// }
// function gotMsg(message) {
//     const div = document.createElement('div');
//     div.classList.add("chat-message-left");
//     div.classList.add("pb-4");
//     div.innerHTML = '<div><img src="https://bootdey.com/img/Content/avatar/avatar3.png" class="rounded-circle mr-1" alt="Alia Sameer" width="40" height="40"><div class="text-muted small text-nowrap mt-2">2:34 am</div></div><div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3"><div class="font-weight-bold mb-1">Alia Sameer</div>' + message + '</div></div>';
// }


