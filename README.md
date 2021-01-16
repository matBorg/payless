# Payless

Payless is an instrument that will help you save money! It will alert you on a discord server when a product on amazon is on sale. 

### Installation
Open terminal and run 
```sh
$ git clone https://github.com/matBorg/payless
$ cd payless
```

Payless requires [Node.js](https://nodejs.org/) v4+ to run and some dependencies

```sh
$ npm install
```


### How to make it works
On the same folder of main.js create 2 json file.
```
$ touch list.json
$ touch credential.json
```
On "list.json" put your product's url like in the example below
```
[
    {
        "url": "http://www.amazon.it/..."
    },
    {
        "url": "http://www.amazon.it/..."
    }
]
```

Then you must go to channel settings, go to integrations, click on webhook and create one, then copy the webhook id and paste it on "credential.json" like in the example below:
```
[
    {
        "discordUrl": "<webHookId>"
    }
]
```

Then you are ready to go! Just type 
```
$ node main.js
```

made with [Alex Foderaro](https://github.com/AlexFoderaro03)