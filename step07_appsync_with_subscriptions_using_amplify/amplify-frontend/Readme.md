# Step 07b - Amplify Frontend (Subscriptions)

## Steps to code

1.  Create a new directory by using `mkdir amplify-frontend`
2.  Naviagte to the newly created directory using `cd amplify-frontend`
3.  use `npm init` to initilize an yarn project in the directory which creates a package.json file with the following content
    ```
    {
      "name": "amplify-frontend",
      "version": "1.0.0",
      "main": "index.js",
      "license": "MIT"
    }
    ```
4.  Install gatsby, react and react dom using `yarn add gatsby react react-dom`. This will update packge.json and create node_modules.json along with yarn.lock
5.  update package.json to add scripts

    ```
    "scripts": {
       "develop": "gatsby develop",
       "build": "gatsby build",
       "clean": "gatsby clean"
    }
    ```

6.  create gatsby-config.js

    ```
    module.exports = {
      plugins: [],
    };
    ```

7.  create "src/pages/index.tsx"

    ```
    import React from "react";
    export default function Home() {
       return <div>Home Page</div>;
    }
    ```

8.  create "src/pages/404.tsx"

    ```
    import React from "react";
    export default function Error() {
       return <div>Error Page</div>;
    }
    ```

9.  create "static/favicon.ico"

10. create ".gitignore"

    ```
    node_modules/
    .cache
    public/
    ```

11. To run the site use `gatsby develop`
12. Install the Amplify CLI using `npm install -g @aws-amplify/cli` not required if installed once
13. Configure Amplify using `amplify configure` not required if AWS is already configured
14. Initialize Amplify using `amplify init`
15. Integrate Amplify with your Appsync by running the following command `amplify add codegen --apiId akfeecqoivgfbj33xvnmcxd75i`. this will be available in every AppSync Api documentation
16. In case schema of the API is updated we can update the code in the client app using `amplify codegen`
17. Install aws-amplify in the app using `yarn add aws-amplify`
18. Create a client to pass the Amplify configuration to all the pages and components "src/amplifyContext/client.tsx".

    ```
    import React, { ReactNode } from "react";
    import Amplify from "aws-amplify";
    import awsmobile from "../aws-exports";

    interface props {
       children: ReactNode;
    }

    export default function amplifyClient({ children }: props) {
       Amplify.configure(awsmobile);
       return <div>{children}</div>;
    }
    ```

19. Wrap the root element with this client "src/wrappers/wrap-root-element.tsx"

    ```
    import React from "react"
    import AmplifyClient from "../amplifyContext/client"

    export default ({ element }) => <AmplifyClient>{element}</AmplifyClient>
    ```

20. Create "gatsby-browser.js" and "gatsby-ssr.js"

    ```
    export { default as wrapRootElement } from "./src/wrappers/wrap-root-element";
    ```

21. Update "src/pages/index.tsx" to use queries, mutations and subscriptions in the app

    ```
    import React from "react";
    import React, { useState, useEffect } from "react";
    import { getTodos } from "../graphql/queries";
    import { addTodo } from "../graphql/mutations";
    import { API, graphqlOperation } from "aws-amplify";
    import { onAddTodo } from "../graphql/subscriptions";

    interface title {
      title: string;
    }
    interface incomingData {
      data: {
         getTodos: title[];
      };
    }

    export default function Home() {

      const [loading, setLoading] = useState(true);
      const [subscriptionTitle, setSubscriptiontitle] = useState<string>(
         "nothing available right now"
      );
      const [inputTitle, setInputTitle] = useState<string>("");
      const subscription = API.graphql(graphqlOperation(onAddTodo)) as any;
      const [todoData, setTodoData] = useState<incomingData | null>(null);

      const addTodoMutation = async () => {
         try {
            const todo = { title: inputTitle, done: false };
            const data = await API.graphql({
               query: addTodo,
               variables: { todo: todo },
            });
            setInputTitle("");
         } catch (e) {
            console.log(e);
         }
      };

      const fetchTodos = async () => {
         try {
            const data = await API.graphql({ query: getTodos });
            setTodoData(data as incomingData);
            setLoading(false);
         } catch (e) {
            console.log(e);
         }
      };

      function handleSubscription() {
         subscription.subscribe({
            next: (status: {
            value: { data: { onAddTodo: { title: React.SetStateAction<string> } } };
            }) => {
               // when mutation will run the next will trigger
               console.log("New SUBSCRIPTION ==> ", status.value.data);
               setSubscriptiontitle(status.value.data.onAddTodo.title);
               fetchTodos();
            },
         });
      }

      useEffect(() => {
         fetchTodos(); //will fetch data for the first time
         handleSubscription(); // will make a subscription connection for the first time
      }, []);

      return (
         <div>
            {loading ? (
               <h1>Loading ...</h1>
            ) : (
               <div style={{ display: "flex", justifyContent: "center" }}>
                  <div>
                     <label>
                        <input
                           type='text'
                           value={inputTitle}
                           onChange={(e) => {
                              setInputTitle(e.target.value);
                           }}
                           placeholder='Todo title'
                        />
                     </label>
                     <button onClick={() => addTodoMutation()}>Add Todo</button>
                     <ul>
                        {todoData?.data.getTodos.map((item, ind) => (
                           <li style={{ marginLeft: "1rem", marginTop: "1rem" }} key={ind}>
                              {item.title}
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div style={{ marginLeft: "5rem" }}>
                     <h2>Latest Todo Title</h2>
                     <p>{subscriptionTitle}</p>
                  </div>
               </div>
            )}
         </div>
      );
    }
    ```
