import React from "react";
import { API } from "aws-amplify";

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
    mutation AddTodo($todo: TodoInput!) {
      addTodo(todo: $todo) {
        id
        title
        done
      }
    }
  `;

  const fetchTodos = async () => {
    try {
      const data = await API.graphql({ query: getTodos });
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const add_Todo = async () => {
    try {
      const todo = {
        id: "12345",
        title: "hello",
        done: false,
      };
      const data = await API.graphql({
        query: addTodo,
        variables: { todo: todo },
      });
      fetchTodos();
    } catch (error) {
      console.log(error);
    }
  };

  fetchTodos();

  return (
    <div>
      <button
        onClick={() => {
          add_Todo();
        }}
      ></button>
    </div>
  );
}
