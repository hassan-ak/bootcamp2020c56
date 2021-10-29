import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ddb from "@aws-cdk/aws-dynamodb";
import {
  Duration,
  Expiration,
} from "@aws-cdk/aws-appsync/node_modules/@aws-cdk/core";

export class AppsyncBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
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

    new cdk.CfnOutput(this, "ApiURl", {
      value: api.graphqlUrl,
    });
    new cdk.CfnOutput(this, "ApiKey", {
      value: api.apiKey || "",
    });
    new cdk.CfnOutput(this, "StackRegion", {
      value: this.region,
    });

    const todosLambda = new lambda.Function(this, "AppSyncTodosHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset("lambda"),
      memorySize: 1024,
    });
    const lambdaDs = api.addLambdaDataSource("lambdaDataSource", todosLambda);

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

    const todosTable = new ddb.Table(this, "TodosTable", {
      tableName: "TodosTable",
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });
    todosTable.grantFullAccess(todosLambda);
    todosLambda.addEnvironment("TODOS_TABLE", todosTable.tableName);
  }
}
