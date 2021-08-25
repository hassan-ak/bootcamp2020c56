import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ddb from "@aws-cdk/aws-dynamodb";

export class BackendCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    //
    const api = new appsync.GraphqlApi(this, "TodoApi", {
      name: "cdk-todos-appsync-api",
      schema: appsync.Schema.fromAsset("graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(200)),
          },
        },
      },
      xrayEnabled: true,
    });

    //
    const todosLambda = new lambda.Function(this, "AppSyncTodoHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "main.handler",
      memorySize: 1024,
    });

    //
    const lambdaDs = api.addLambdaDataSource("lambdaDatasource", todosLambda);

    //
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

    //
    const todosTable = new ddb.Table(this, "CDKTodosTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    //
    todosTable.grantFullAccess(todosLambda);
    todosLambda.addEnvironment("TODOS_TABLE", todosTable.tableName);

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });

    // Prints out the AppSync GraphQL API ID to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIID", {
      value: api.apiId || "",
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region,
    });
  }
}
