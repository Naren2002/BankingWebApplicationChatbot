// function sentmsg(data) {
//
//   var para = document.createElement("p");
//   var paral = document.createElement("p");
//
//   para.setAttribute("class", "mess");
//   paral.setAttribute("class", "mess");
//
//   var msg = document.getElementById('customermsg').value;
//   if (msg != "") {
//     para.innerHTML = msg;
//
//     paral.innerHTML = "HI left msg";
//
//     var chatl = document.createElement("div");
//     var chatr = document.createElement("div");
//     var sp = document.createElement("div");
//
//     sp.setAttribute("class", "sp");
//     chatl.setAttribute("class", "chat-l");
//     chatr.setAttribute("class", "chat-r");
//
//     textbox.appendChild(chatr);
//     textbox.appendChild(chatl);
//     chatr.appendChild(sp);
//     chatl.appendChild(paral);
//     chatr.appendChild(para);
//
//
//     customermsg.value = "";
//
//   }
//
//
// }

function openForm() {
  if (document.getElementById("frames").style.display == "block"){
    document.getElementById("frames").style.display = "none";
  }
  else{
    document.getElementById("frames").style.display = "block";
  }
}

function closeForm() {
  document.getElementById("chatbox").style.display = "none";
  document.getElementById("textbox").innerHTML = "";
}

function minimizeForm() {
  document.getElementById("chatbox").style.display = "none";
}
