const {
    REST,
    Routes,
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActivityType,
    Partials,
    Events

} = require("discord.js");

const path = require("path");
require("dotenv").config();
const fs = require("fs");

/**
 * @description The bot's client
 */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
    ],
    allowedMentions: {
        parse: [],
        repliedUser: false
    }
});

/**
 * @description Parses all commands into an array
 */
let commandMap = new Map();

/**
 * @description Loads all available commands
 */
function loadCommands() {
    const commandsPath = path.join(__dirname, 'interactions');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            commandMap.set(command.data.name, command);
            console.log(`Loaded command '${command.data.name}.js'`);
        } catch (err) {
            console.log(err);
        }
    }
}

/**
 * @description Loads all slash commands
 */
function deployCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, 'interactions');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GuildID), { body: commands }).then(() => {
        console.log('Successfully registered application commands.')
    }).catch((err) => {
        console.log(err)
    });
}


/*

// If there is a warning error, it will emit it to the console and then create a new folder inside the Logs/Warns folder

client.on('warn', (info) => {
    console.log(info);
    const logfolder = './Logs/Warns';
    const dateTime = Date.now();

    fs.appendFile(logfolder + `Warn - ${dateTime}.txt`, info.toString(), function (err) {
        if (err) throw err
        console.log('Logged the new warn to: \\Logs\\Warns\\Warn - ' + dateTime + '.txt')
    })

});

// If there is an error, it will emit it to the console and then create a new folder inside the Logs/Errors folder

client.on('error', (info) => {
    const logfolder = './Logs/Errors';
    const dateTime = Date.now();

    fs.appendFile(logfolder + `ERROR - ${dateTime}.txt`, info.toString(), function (err) {
        if (err) throw err
        console.log('Logged the new Error to: \\Logs\\Errors\\ERROR - ' + dateTime + '.txt')
    })
})

*/

// Runs all commands, sends error message when an command errors.

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandMap.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, interaction.member, client);
    } catch (err) {
        console.error(err);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "❌ Erro ao executar o comando.",
                ephemeral: true
            });
        }
    }
});


loadCommands();

client.once(Events.ClientReady, () => {
    console.log("Client Ready");

    client.user.setPresence({
        activities: [{ name: "over obfuscation", type: ActivityType.Watching }]
    });

    deployCommands();
});

client.login(process.env.TOKEN).then(() => {
    console.log("Logged In");
}).catch(console.error);
