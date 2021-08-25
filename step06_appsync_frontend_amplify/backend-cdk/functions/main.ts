import addTodo from "./addTodo";
import getTodos from "./getTodos";
import deleteTodo from "./deleteTodo";
import updateTodo from "./updateTodo";
import Todo from "./Todo";

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    todo: Todo;
    todoId: string;
  };
};

exports.handler = async function (event: AppSyncEvent) {
  switch (event.info.fieldName) {
    case "addTodo":
      return await addTodo(event.arguments.todo);
    case "getTodos":
      return await getTodos();
    case "deleteTodo":
      return await deleteTodo(event.arguments.todoId);
    case "updateTodo":
      return await updateTodo(event.arguments.todo);
    default:
      return null;
  }
};
