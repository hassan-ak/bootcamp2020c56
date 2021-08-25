# Connecting to Appsync GraphQL API with AWS Amplify

Note: The backend CDK code used in this project was taken from step 04. This step only covers on how to integrate Appsync with client-side using Amplify

## Introduction

We have already seen how to integrate appsync with apollo client. There is another way to do it using amplify. The advantage of using amplify is that you do not have to define a complex client especially if you are using subscriptions.
The client-side configuration of a secured appsync is also quit easy to define using this method. A secured Appsync can have various authorization methods. The one we are using in this example is procted by an API-KEY.
