import React from "react";
import { API } from "aws-amplify";
import shortid from "shortid";

export default function Home() {
  const getTodos = `
    query GetTodos{
      getTodos{
        id
        title
        done
      }
    }
  `;
  const addTodo = `
    mutation AddTodo($todo: TodoInput !) {
      addTodo(todo: $todo) {
        done
        id
        title
      }
    }
  `;

  const fetchTodos = async () => {
    try {
      const data = await API.graphql({ query: getTodos });
      console.log("Data : ", data);
    } catch (error) {
      console.log("Error : ", error);
    }
  };

  fetchTodos();
  const Add_Todo = async () => {
    try {
      const todo = {
        id: shortid.generate(),
        title: "Hello from App",
        done: false,
      };
      const data = await API.graphql({
        query: addTodo,
        variables: { todo: todo },
      });
      fetchTodos();
    } catch (error) {
      console.log("Error : ", error);
    }
  };

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => Add_Todo()}>Add Todo</button>
    </div>
  );
}
