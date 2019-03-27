var app = require("express")(),
  server = require("http").createServer(app),
  io = require("socket.io").listen(server),
  ent = require("ent"); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

var sharedTodoList = [];

// Chargement de la page index.html
app.get("/", function(req, res) {
  res.render(__dirname + "/todo.ejs", { todolist: sharedTodoList });
});

io.sockets.on("connection", function(socket) {
  // Quand un client ajoute une tâche, celle-ci est immédiatement répercutée chez les autres clients
  socket.on("new", function(task) {
    if (task != "") {
      task = ent.encode(task);
      sharedTodoList.push(task); // On stock la tache dans la liste partagée
    }
    socket.emit("new", { task: updateTasksInList() }); // On se rajoute la tâche à soi-même
    socket.broadcast.emit("new", { task: updateTasksInList() }); // On transmet la tâche aux autres
  });

  socket.on("delete", function(id) {
    if (id != "") {
      sharedTodoList.splice(id, 1);
    }
    socket.emit("new", { task: updateTasksInList() });
    socket.broadcast.emit("new", { task: updateTasksInList() });
  });
});

function updateTasksInList() {
  var task = "";
  for (var i = 0; i < sharedTodoList.length; i++) {
    task +=
      '<li><a id="' + i + '" href="/">✘</a> ' + sharedTodoList[i] + "</li>";
  }
  return task;
}

server.listen(8080);
