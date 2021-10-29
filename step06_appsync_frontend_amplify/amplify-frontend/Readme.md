# Step 06b - Amplify Frontend

## Steps to code

1. Create a new directory by using `mkdir gatsbyempty`
2. Naviagte to the newly created directory using `cd gatsbyempty`
3. use `npm init` to initilize an yarn project in the directory which creates a package.json file with the following content
   ```
   {
   "name": "gatsbyempty",
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

12. Install the Amplify CLI using `npm install -g @aws-amplify/cli` not required if installed once
13. Configure Amplify using `amplify configure` not required if AWS is already configured
14. Initialize Amplify using `amplify init`
15. Integrate Amplify with your Appsync by running the following command `amplify add codegen --apiId uyph4ae6czggvlm225ourbu75e`. this will be available in every AppSync Api documentation
16. In case schema of the API is updated we can update the code in the client app using `amplify codegen`
17.
