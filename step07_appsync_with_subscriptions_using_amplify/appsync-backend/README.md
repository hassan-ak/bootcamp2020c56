# Step 07a - AppSync Backend (with subscription)

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
   import { join } from "path";
   import * as lambda from "@aws-cdk/aws-lambda";
   import { GraphqlApi, Schema, FieldLogLevel } from "@aws-cdk/aws-appsync";
   import { AttributeType, Table, BillingMode } from "@aws-cdk/aws-dynamodb";

   ```

9. create "graphql/schema.gql" to define schema for the api

   ```
   type Todo {
      id: ID!
      title: String!
      done: Boolean!
   }
   input TodoInput {
      title: String!
      done: Boolean!
   }
   type Query {
      getTodos: [Todo]
   }
   type Mutation {
      addTodo(todo: TodoInput!): Todo!
   }
   type Subscription {
      onAddTodo: Todo @aws_subscribe(mutations: ["addTodo"])
   }
   ```

10. Update "lib/appsync-backend-stack.ts" to create new AppSync Api

    ```
    const api = new GraphqlApi(this, "Api", {
      name: `todosapi`,
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      schema: new Schema({
        filePath: join("__dirname", "/../", "schema/schema.graphql"),
      }),
    });
    ```

11. Update "lib/appsync-backend-stack.ts" to print URL, Key and ID of API

    ```
    new cdk.CfnOutput(this, "Endpoint", {
      value: api.graphqlUrl,
    });
    new cdk.CfnOutput(this, "API_Key", {
      value: api.apiKey || "",
    });
    new cdk.CfnOutput(this, "API_ID", {
      value: api.apiId || "",
    });
    ```

12. Create "lambda/todo.ts" to define type for Todo item whihc is then be used in lambda function

    ```
    type Todo = {
        id: string;
        title: string;
        done: boolean;
    };
    export type TodoInput = {
        title: string;
        done: boolean;
    };
    export default Todo;
    ```

13. Install AWS sdk using `npm install aws-sdk`
14. Create "lambda/addTodo.ts" to define a function for adding new todo

    ```
    const AWS = require("aws-sdk");
    import { randomBytes } from "crypto";
    import { TodoInput } from "./Todo";
    const docClient = new AWS.DynamoDB.DocumentClient();
    async function addTodo(todo: TodoInput) {
        const params = {
            TableName: process.env.TODOS_TABLE,
            Item: { id: randomBytes(16).toString("hex"), ...todo },
        };
        try {
            await docClient.put(params).promise();
            return { ...params.Item };
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

16. Create "lambda/main.ts" to define lambda function

    ```
    import addTodo from "./addTodo";
    import getTodos from "./getTodos";
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
    exports.handler = async (event: AppSyncEvent) => {
      switch (event.info.fieldName) {
         case "addTodo":
            return await addTodo(event.arguments.todo);
         case "getTodos":
            return await getTodos();
         default:
            return null;
      }
    };
    ```

17. Update "lib/appsync-backend-stack.ts" to connect lambda function to the stack and connect AppSync Api with the lambda function

    ```
    const todosLambda = new lambda.Function(this, "AppsyncLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "main.handler",
      memorySize: 1024,
    });
    const lambdaDs = api.addLambdaDataSource("lambdaDatasource", todosLambda);
    ```

18. Update "lib/appsync-backend-stack.ts" to create resolvers

    ```
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getTodos",
    });
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "addTodo",
    });
    ```

19. Update "lib/appsync-backend-stack.ts" to create DynamoDB table, connect it with the lambda functiona and set environment variables

    ```
    const todosTable = new Table(this, "TodosTable", {
        billingMode: BillingMode.PAY_PER_REQUEST,
        partitionKey: {
            name: "id",
            type: ddb.AttributeType.STRING,
        },
    });
    todosTable.grantReadWriteData(todosLambda);
    todosLambda.addEnvironment('TODOS_TABLE', todosTable.tableName);
    ```

20. Deploy the app using `cdk deploy`
21. Test the Api using postman or AWS console
22. Destroy the app using `cdk destroy`
