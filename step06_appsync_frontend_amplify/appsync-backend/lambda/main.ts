import addTodo from "./addTodo";
import deleteTodo from "./deletTodo";
import getTodos from "./getTodo";
import Todo from "./Todo";
import updateTodo from "./updateTodo";
type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    todo: Todo;
    todoId: string;
  };
};
exports.handler = async (event: AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "addTodo":
      return await addTodo(event.arguments.todo);
    case "deleteTodo":
      return await deleteTodo(event.arguments.todoId);
    case "getTodos":
      return await getTodos();
    case "updateTodo":
      return await updateTodo(event.arguments.todo);
    default:
      return null;
  }
};
