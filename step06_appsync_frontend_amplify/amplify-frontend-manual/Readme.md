# Step 06c - Amplify Frontend Manual

## Steps to code

1. Create a new directory by using `mkdir amplify-frontend-manual`
2. Naviagte to the newly created directory using `cd amplify-frontend-manual`
3. use `npm init` to initilize an yarn project in the directory which creates a package.json file with the following content
   ```
   {
   "name": "amplify-frontend-manual",
   "version": "1.0.0",
   "main": "index.js",
   "license": "MIT"
   }
   ```
4. Install gatsby, react and react dom using `yarn add gatsby react react-dom`. This will update packge.json and create node_modules.json along with yarn.lock
5. update package.json to add scripts

   ```
   "scripts": {
      "develop": "gatsby develop",
      "build": "gatsby build",
      "clean": "gatsby clean"
   }
   ```

6. create gatsby-config.js

   ```
   module.exports = {
   plugins: [],
   };
   ```

7. create "src/pages/index.tsx"

   ```
   import React from "react";
   export default function Home() {
      return <div>Home Page</div>;
   }
   ```

8. create "src/pages/404.tsx"

   ```
   import React from "react";
   export default function Error() {
      return <div>Error Page</div>;
   }
   ```

9. create "static/favicon.ico"

10. create ".gitignore"

    ```
    node_modules/
    .cache
    public/
    ```

11. To run the site use `gatsby develop`

12. Create configration file "src/aws-exports.js"

    ```
    const awsmobile = {
      aws_project_region: "us-east-2",
      aws_appsync_graphqlEndpoint:
         "https://oeyqg3oukzcbbp7ydpv2faxt3q.appsync-api.us-east-2.amazonaws.com/graphql",
      aws_appsync_region: "us-east-2",
      aws_appsync_authenticationType: "API_KEY",
      aws_appsync_apiKey: "da2-7fwnqx5gbbdx7br7776vpw327y",
    };

    export default awsmobile;
    ```

13. install aws apmlify in the app using `yarn add aws-amplify`
14. Create a wrapper "src.wrapper/wrap-root-element"

    ```
    import React from "react";
    import { Amplify } from "aws-amplify";
    import awsmobile from "../aws-exports";

    export default ({ element }) => {
      Amplify.configure(awsmobile);
      return <div>{element}</div>;
    };

    ```

15. Create gatsby-browser.js and gatsby-ssr.js

    ```
    export { default as wrapRootElement } from "./src/wrapper/wrap-root-element";

    ```

16. Update "src/pages/index.tsx" to use queries and display data in console

    ```
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
    ```

17. isntall short id in the app using `yarn add shortid`
18. Updated "src/pages/index.tsx" to use mutations

    ```
    import shortid from "shortid";
    const addTodo = `
       mutation AddTodo($todo: TodoInput !) {
          addTodo(todo: $todo) {
          done
          id
          title
          }
       }
    `;
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
    <button onClick={() => Add_Todo()}>Add Todo</button>
    ```
