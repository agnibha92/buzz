// Include dependencies
const Discord = require('discord.js');
let Enquirer = require('enquirer');
let LocalStorage = require('json-localstorage');
let colors = require('colors');

const client = new Discord.Client();
let enquirer = new Enquirer();

// Enquirer registrations
enquirer.register('confirm', require('prompt-confirm'));

// Questions for token entry
let prompt_token = [{
        name: 'token',
        message: 'What is your API token?'
    },
    {
        type: 'confirm',
        name: 'remember',
        message: 'Would you like to save this for next time?'
    }
];

// Keyword triggers
let buzzwords = [
    'rules',
    'i play'
];

// Include custom modules
// let rules = require('./modules/rules');

// Initiate bot
function init() {
    console.log('Buzz Bot - v1.0.0 (beta)\n'.bold.underline.blue);
    process.stdout.write('Loading... '.yellow);
}

function connect() {
    let token;

    if (LocalStorage.getItem('token')) {
        client.login(LocalStorage.getItem('token'));
    }
    else {
        enquirer.ask(prompt_token)
            .then(function(response) {
                if (response.remember) {
                    console.log('remembered');
                    LocalStorage.setItem('token', response.token);
                }
                else {
                    console.log('not remembered');
                }
                client.login(token = response.token)
            });
    }
}

function printRules(message) {
    console.log(' .. ' + 'Rules'.underline);
    message.reply('All community members are expected to abide by the follow:\n' +
        '1. Treat others with respect. Banter is fun, bullying is not. Make sure all parties are on the same page when it comes to communicating. This includes both text and voice chats.\n' +
        '2. Do not spam any channel with nonsense.\n' +
        '3. No advertising. If you have an event, or something you would like to promote, please talk to a member of leadership to get permission.\n' +
        '4. Leave all hate, racism, derogatory terms, and offensive comments out of our community.');
    console.log(' ... ' + 'Replied'.green + ' with ' + 'Server Rules'.yellow);
}

function addGames(message) {
    let games = getGames(message);

    console.log(' .. ' + 'Add Game(s)'.bold.cyan);
    games.forEach(function(game) {
        if (message.content.includes(game)) {
            message.member.addRole(message.guild.roles.find('name', game));
            console.log(' ... ' + 'Added '.green + game.magenta)
        }
    });

    message.reply(':thumbsup:');
}

function removeGames(message) {
    let games = getGames(message);


}

function getGames(message) {
    let games = [];
    let roles = message.guild.roles;

    roles.forEach(function(role) {
        if (role.hexColor === '#f1c40f' && !role.hoist) {
            games.push(role.name);
        }
    });

    return games;
}

function evalMessage(message) {
    let triggered = [];

    process.stdout.write(' . Searching message for triggers... '.yellow);

    buzzwords.forEach(function(keyword) {
        if (message.content.includes(keyword) && !triggered.includes(keyword)) {
            triggered.push(keyword);
        };
    });



    if (triggered.length > 0) {
        let count = triggered.length;
        console.log('Found ' + count.toString().bold.green);
    }
    else {
        console.log('Found ' + '0'.bold.red);
    }

    triggered.forEach(function(trigger) {
        switch (trigger) {
            case 'rules':
                printRules(message);
                break;
            case 'i play':
                addGames(message);
        }
    });

    process.stdout.write('\nListening... '.yellow);
}

client.on('ready', () => {
    console.log('Success!\n'.green);
    process.stdout.write('Listening... '.yellow);
});

client.on('message', message => {
    if (message.isMentioned(client.user) || message.channel.type === 'dm') {
        console.log('Heard'.green + ' message from ' +
            message.author.username.bold.blue + ' in #' +
            message.channel.name.bold.magenta);
        evalMessage(message);
    }
});

init();
connect();
