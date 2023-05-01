# Darewin-bot

Darewin is a chatbot available on Messenger. *You talk to him, like to a friend, and he answers you.
His unique goal is to help you improve, evolve so that you become the best version of yourself.*
For more information, visit [darewin.life](http://darewin.life/)


This project is made with Node.js using ECMAScript 6 (packed via Webpack) and uses the Serverless framework. The entire technical stack is on AWS, allowing total scalability.

![Alt text](https://cloudacademy.com/blog/wp-content/uploads/2016/05/serverless-framework-logo.png)

## Architecture

The project architecture uses various AWS cloud components. In the diagram below we can see the different interactions.

![infrastructure](http://darewin.life/images/infrastructure.png)


**1.** When setting up the webhook from Messenger, Facebook will call our lambda function "webhookFB". It will check the token and send information back to Facebook to set up the "Start" button on Messenger.

**2.** When the user communicates with our bot, it is via the lambda function handleMessage. It will notify the user that the message has been taken into account, then it will store the conversation in the database, update the user's profile, and decide on the next message to send.

**3.** The next message will be put in an SQS queue with a certain delay.

**4.** Once the delay is reached, deliversMessageBox will be alerted by the SQS queue.

**5.** deliversMessageBox sends the message to the client.

### Some explanations

All the AWS elements configuration is located in the serverless.yml file, where you can see the environment variables, including the branches (dev, preprod, prod), the DynamoDB tables, the SQS queue, and the entry points of the lambda functions.

The handler.js file is the application entry defined by serverless.yml.

In the src/handleConversation file, you will find all the functional logic of the bot.

The src/services file contains all the services allowing to interact with Facebook, Messenger, as well as DynamoDB and SQS.


## Getting Started

Before you can launch the project, you will need to prepare your environment.

### Prerequisites

First of all, make sure you have Python installed on your machine (in my case, I have version 2.7.15).
To check if this is the case, launch this command in your console (CMD for Windows or terminal for Linux):

```diff
$ python
+ Python 2.7.15 (v2.7.15:ca079a3ea3, Apr 30 2018, 16:30:26) [MSC v.1500 64 bit (AMD64)] on win32
```

If not, you can download it [here](https://www.python.org/downloads/release/python-2715/)

Make sure you have the right version of Node.js installed. You need version 6.1.0.
To find out your version, enter this command in your console: 

```sh
$ node --version
```

If not, download the LTS version of Node.js [ici](https://nodejs.org/en/download/)

Then use nvm to select version 6.1.0 of Node.js. To install nvm, go [here](https://github.com/creationix/nvm)

Once installed, launch the command :

```sh
$ nvm install 6.1.0
```

nstall node-inspector for debugging:

```sh
$ npm install -g node-inspector
```

Exposing the local application to the world via ngrok.

```sh
$ npm install ngrok -g
```


Install the serverless framework

```sh
$ npm install serverless -g
```

Now, connect serverless to our Amazon Web Services solution by following this [link](https://serverless.com/framework/docs/providers/aws/guide/credentials/?utm_source=cli&utm_medium=cli&utm_campaign=cli_helper_links)


Finally, navigate to the project directory and run this command:

```sh
$ npm install
```

## Usage


### To launch the project locally

Ensure that the defaultStage environment variable in serverless.yml has a value of 'dev' or the name of your branch.

```yml
 custom:
  defaultStage: dev
```

Update the PAGE_ACCESS_TOKEN variable in serverless.yml to include the new value found in Messenger=>Settings=>Token Generation in your Facebook application.

```diff
 environment:
-    PAGE_ACCESS_TOKEN: [ACCESS_TOKEN]
+ PAGE_ACCESS_TOKEN: [FACEBOOK_ACCESS_TOKEN]
```

Start serverless locally:

```sh
$ sls offline start
```

Copy the GET /fbhook URL and open the serverless port (by default 3000) to the outside by running this command in a new console:

```sh
$ ngrok http 3000
```

Copy the forwarding URL with https and append /fbhook to the end. For example:

```diff
- https://[generated_url].ngrok.io/
+ https://[generated_url].ngrok.io/fbhook
```


This will be your webhook URL to put in Messenger. You can follow [this tutorial](https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup?locale=fr_FR) to learn how to set it up.

Now you're ready to test 😁


### To debug locally

To be able to debug the code locally, run this command:

```sh
$ node-debug sls offline
```

This will launch a chrome page where there will be a source tab where you can put a breakpoint in the source code located in the webpack folder.

Then configure the application as before.


## Deployment 

Make sure that the deployment environment matches your branch in the serverless.yml file.

```yml
 custom:
  defaultStage: dev
```

Also, make sure that the PAGE_ACCESS_TOKEN and VERIFY_TOKEN variables are the ones specified in Messenger.

```yml
 PAGE_ACCESS_TOKEN: [ACCESS_TOKEN]
 VERIFY_TOKEN: [FACEBOOK_ACCESS_TOKEN]
```

Finally, to deploy your application on AWS, run this command:

```sh
$ serverless deploy
```

This command will install all dependencies and set up the environment (SQS, lambda function, DynamoDB).

And it's done 😎

Unless this is the first time you have deployed or if you have performed an sls remove, then follow these instructions:

Then go to [AWS](https://eu-west-3.console.aws.amazon.com/lambda/home?region=eu-west-3#/functions)

Go to Services=>Simple Queue Services. Select [branch]-messanges and click the "queue action" button then "configure trigger for lambda function" Select the lambda function [branch]-deliversMessageBoxes and click save.

And it's done 😌

## Removal

To remove the deployed configuration from AWS, run this command:  

```sh
$ serverless remove
```

⚠️ This command will delete all lambda functions, tables and their contents, and SQS files. This command can be useful when the project's technical stack has completely changed.


## Authors

* **Quentin Laujac / Buddydoe** - *Initial work* - [QuentinLaujac](https://github.com/QuentinLaujac)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
