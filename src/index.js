const express = require("express");
const cors = require("cors");
const { v4: uuidV4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existentUser = users.find((user) => user.username === username);

  if (!existentUser) {
    return response.status(404).json({
      error: true,
      message: "No user registered with the provided username",
    });
  } else {
    request.body.user = existentUser;
    next();
  }
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const existentUser = users.find((user) => user.username === username);

  if (existentUser)
    return response.status(400).json({
      error: true,
      message: "Username already taken",
    });

  const newUser = {
    id: uuidV4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request.body;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user, title, deadline } = request.body;

  const newTodo = {
    id: uuidV4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const userIndex = users.findIndex((u) => u.username === user.username);
  users[userIndex] = {
    ...user,
    todos: [...user.todos, newTodo],
  };

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user, title, deadline } = request.body;

  const existentTodo = user.todos.find((todo) => todo.id === id);

  if (!existentTodo) {
    return response.status(404).json({
      error: true,
      message: "No todo found with the given id",
    });
  }

  const updatedTodo = {
    ...existentTodo,
    title: title ?? todo.title,
    deadline: deadline ? new Date(deadline) : todo.deadline,
  };

  const updatedUser = {
    ...user,
    todos: user.todos.map((todo) => {
      if (todo.id === id) {
        return updatedTodo;
      } else {
        return todo;
      }
    }),
  };

  const userIndex = users.findIndex((u) => u.username === user.username);
  users[userIndex] = updatedUser;

  return response.status(200).json(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request.body;

  const existentTodo = user.todos.find((todo) => todo.id === id);

  if (!existentTodo) {
    return response.status(404).json({
      error: true,
      message: "No todo found with the given id",
    });
  }

  const updatedTodo = {
    ...existentTodo,
    done: true,
  };

  const updatedUser = {
    ...user,
    todos: user.todos.map((todo) => {
      if (todo.id === id) {
        return updatedTodo;
      } else {
        return todo;
      }
    }),
  };

  const userIndex = users.findIndex((u) => u.username === user.username);
  users[userIndex] = updatedUser;

  return response.status(200).json(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request.body;

  const existentTodo = user.todos.find((todo) => todo.id === id);

  if (!existentTodo) {
    return response.status(404).json({
      error: true,
      message: "No todo found with the given id",
    });
  }

  const updatedUser = {
    ...user,
    todos: user.todos.filter((todo) => todo.id !== id),
  };

  const userIndex = users.findIndex((u) => u.username === user.username);
  users[userIndex] = updatedUser;

  return response.status(204).json(existentTodo);
});

module.exports = app;
