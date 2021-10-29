# Step 06a - AppSync BackEnd

# Steps to code

1. Create a new directory by using `mkdir appsync-backend`
2. Naviagte to the newly created directory using `cd appsync-backend`
3. Create a cdk app using `cdk init app --language typescript`
4. Use `npm run watch` to auto build our app as we code
5. Install AppSync in the app using `npm i @aws-cdk/aws-appsync`
6. Install lambda in the app using `npm i @aws-cdk/aws-lambda`
7. Install dynamoDB in the app using `npm i @aws-cdk/aws-dynamodb`
8. Update "lib/appsync-backend-stack.ts" to import appsync, lambda and dynamoDB in the stack

   ```
   import * as appsync from "@aws-cdk/aws-appsync";
   import * as lambda from "@aws-cdk/aws-lambda";
   import * as ddb from "@aws-cdk/aws-dynamodb";

   ```

9. create "graphql/schema.gql" to define schema for the api

   ```
   type Todo {
      id: ID!
      title: String!
      done: Boolean!
   }
   input TodoInput {
      id: ID!
      title: String!
      done: Boolean!
   }
   type Query {
      getTodos: [Todo]
   }
   type Mutation {
      addTodo(todo: TodoInput!): Todo
      updateTodo(todo: TodoInput!): Todo
      deleteTodo(todoId: String!): String
   }
   ```

10. Update "lib/appsync-backend-stack.ts" to create new AppSync Api

    ```
    import {
      Duration,
      Expiration,
    } from "@aws-cdk/aws-appsync/node_modules/@aws-cdk/core";
    const api = new appsync.GraphqlApi(this, "TodoApi", {
       name: "todos-appsync-api",
       schema: appsync.Schema.fromAsset("graphql/schema.gql"),
       authorizationConfig: {
         defaultAuthorization: {
            authorizationType: appsync.AuthorizationType.API_KEY,
            apiKeyConfig: {
               expires: Expiration.after(Duration.days(20)),
            },
         },
       },
       xrayEnabled: true,
    });
    ```

11. Update "lib/appsync-backend-stack.ts" to print URL, Key and region of API

    ```
    new cdk.CfnOutput(this, "ApiURl", {
      value: api.graphqlUrl,
    });
    new cdk.CfnOutput(this, "ApiKey", {
      value: api.apiKey || "",
    });
    new cdk.CfnOutput(this, "StackRegion", {
      value: this.region,
    });
    ```

12. Create "lambda/Todo.ts" to define type for Todo item whihc is then be used in lambda function

    ```
    type Todo = {
      id: string;
      title: string;
      done: boolean;
    };
    export default Todo;
    ```

13. Install AWS sdk using `npm install aws-sdk`
14. Create "lambda/addTodo.ts" to define a function for adding new todo

    ```
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient();
    import Todo from "./Todo";
    async function addTodo(todo: Todo) {
      const params = {
         TableName: process.env.TODOS_TABLE,
         Item: todo,
      };
      try {
         await docClient.put(params).promise();
         return todo;
      } catch (err) {
         console.log("DynamoDB error: ", err);
         return null;
      }
    }
    export default addTodo;
    ```

15. Create "lambda/getTodo.ts" to fetch todos from table

    ```
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient();
    async function getTodos() {
      const params = {
         TableName: process.env.TODOS_TABLE,
      };
      try {
         const data = await docClient.scan(params).promise();
         return data.Items;
      } catch (err) {
         console.log("DynamoDB error: ", err);
         return null;
      }
    }
    export default getTodos;
    ```

16. Create "lambda/deletTodo.ts" to delete selected todo

    ```
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient();
    async function deleteTodo(todoId: string) {
       const params = {
          TableName: process.env.TODOS_TABLE,
          Key: {
             id: todoId,
          },
       };
       try {
          await docClient.delete(params).promise();
          return todoId;
       } catch (err) {
          console.log("DynamoDB error: ", err);
          return null;
       }
    }
    export default deleteTodo;
    ```

17. Create "lambda/updateTodo.ts" to update selected todo

    ```
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient();
    type Params = {
      TableName: string | undefined;
      Key: string | {};
      ExpressionAttributeValues: any;
      ExpressionAttributeNames: any;
      UpdateExpression: string;
      ReturnValues: string;
    };
    async function updateTodo(todo: any) {
      let params: Params = {
         TableName: process.env.TODOS_TABLE,
         Key: {
            id: todo.id,
         },
         ExpressionAttributeValues: {},
         ExpressionAttributeNames: {},
         UpdateExpression: "",
         ReturnValues: "UPDATED_NEW",
      };
      let prefix = "set ";
      let attributes = Object.keys(todo);
      for (let i = 0; i < attributes.length; i++) {
         let attribute = attributes[i];
         if (attribute !== "id") {
            params["UpdateExpression"] +=
            prefix + "#" + attribute + " = :" + attribute;
            params["ExpressionAttributeValues"][":" + attribute] = todo[attribute];
            params["ExpressionAttributeNames"]["#" + attribute] = attribute;
            prefix = ", ";
         }
      }
      try {
         await docClient.update(params).promise();
         return todo;
      } catch (err) {
         console.log("DynamoDB error: ", err);
         return null;
      }
    }
    export default updateTodo;
    ```

18. Create "lambda/main.ts" to define lambda function

    ```
    import addTodo from "./addTodo";
    import deleteTodo from "./deleteTodo";
    import getTodos from "./getTodos";
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
    ```

19. Update "lib/appsync-backend-stack.ts" to connect lambda function to the stack and connect AppSync Api with the lambda function

    ```
    const todosLambda = new lambda.Function(this, "AppSyncTodosHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset("lambda"),
      memorySize: 1024,
    });
    const lambdaDs = api.addLambdaDataSource("lambdaDataSource", todosLambda);
    ```

20. Update "lib/appsync-backend-stack.ts" to create resolvers

    ```
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getTodos",
    });
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "addTodo",
    });
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deleteTodo",
    });
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "updateTodo",
    });
    ```

21. Update "lib/appsync-backend-stack.ts" to create DynamoDB table, connect it with the lambda functiona and set environment variables

    ```
    const todosTable = new ddb.Table(this, "TodosTable", {
       tableName: "TodosTable",
      partitionKey: {
         name: "id",
         type: ddb.AttributeType.STRING,
      },
    });
    todosTable.grantFullAccess(todosLambda);
    todosLambda.addEnvironment("TODOS_TABLE", todosTable.tableName);
    ```

22. Deploy the app using `cdk deploy`
23. Test the Api using postman or AWS console
24. Destroy the app using `cdk destroy`
