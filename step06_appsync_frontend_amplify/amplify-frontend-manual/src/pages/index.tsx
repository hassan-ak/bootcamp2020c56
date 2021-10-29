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

  const fetchTodos = async () => {
    try {
      const data = await API.graphql({ query: getTodos });
      console.log("Data : ", data);
    } catch (error) {
      console.log("Error : ", error);
    }
  };

  fetchTodos();

  return <div>Home Page</div>;
}
