# AppSync FrontEnd Amplify (Manual)

## Steps

```
Create an empty Gatsby Project
```

```
yarn add aws-amplify
```

Create src/aws-exports.js with the following content

```
const awsmobile = {
    "aws_project_region": "******ADD YOUR REGION HERE: example (us-east-1) *********",
    "aws_appsync_graphqlEndpoint": "******ADD YOUR GRAPHQL ENDPOINT HERE*********",
    "aws_appsync_region": "******ADD YOUR REGION HERE: example (us-east-1) *********",
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": "********ADD YOUR GRAPHQL API KEY HERE*********"
};


export default awsmobile;
```

```
Create "src/wrappers/wrap-root-element"
```

```
Create "gatsby-browser.js" and "gatsby-ssr.js"
```

```
update "src/pages/index.tsx"
```
