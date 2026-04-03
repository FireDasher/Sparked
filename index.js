require("dotenv").config({quiet: true});
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

/**
* @param {string} string 
* @param {object} replacements 
* @returns {string}
*/
function format(string, replacements) {
	return string.replace(/\{(.*?)\}/g, (match, key)=>replacements[key]);
}

const client = new Client({ intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
	GatewayIntentBits.MessageContent,
] });

const prefix = "$";
const time = 20;

client.on("clientReady", () => {
	console.log("Logged in as " + client.user.tag);
});

const difficulties = {
	0: "Noob",
	1: "Easy",
	2: "Medium",
	3: "Hard",
	4: "Extreme",
	5: "IMPOSSIBLE!!!",
}
const colorsOfDifficulties = {
	0: 0xFFFF40,
	1: 0x8BD66B,
	2: 0xF49D46,
	3: 0xD64228,
	4: 0x800080,
	5: 0x400000,
};
const gd_db = require("./gd-database.json");
const usageMsg = format(fs.readFileSync("usage.md", "utf8"), {prefix});
const games = {};

client.on("messageCreate", msg => {
	if (msg.author.bot) return;

	if (msg.channelId in games) {
		const game = games[msg.channelId];
		if (msg.content.trim().toLowerCase() === game.answer.toLowerCase()) {
			msg.reply({ embeds: [{
				title: "Congratulations! You guessed the Level correctly!",
				description: `**Level**: ${game.answer}\n**Difficulty:** ${difficulties[game.difficulty]}\n**Type:** Classic\n**Time:** ${time} seconds`,
				color: colorsOfDifficulties[game.difficulty],
			}] });
			clearTimeout(game.timeout);
			delete games[msg.channelId];
		}
	}

	if (!msg.content.startsWith(prefix)) return;

	const args = msg.content.slice(prefix.length).trim().split(/ +/);
	const cmd = args.shift().toLowerCase();

	if (cmd === "ping") msg.reply("Pong! 🏓");
	if (cmd === "pong") msg.reply("Ping! 🏓");

	if (cmd === "guess") {
		if (args.length > 0) {
			if (msg.channelId in games) msg.reply("There is already a game in this channel!");
			else {
				const difficulty = parseInt(args[0]);

				if (difficulty === 5) {
					const all_db = Object.assign({}, ...Object.values(gd_db));

					const db_keys = Object.keys(all_db);
					const lvlID = db_keys[Math.floor(Math.random() * db_keys.length)] ?? 1;
					const lvlName = all_db[lvlID] ?? "Stereo Madness";

					let startMessage = null;
					msg.reply({ embeds: [{
						title: "Guess the Level!",
						description: `**Difficulty:** ${difficulties[difficulty]}\n**Type:** Classic\n**Time:** ${time} seconds\nThere is no image so this is truly impossible!!!`,
						color: colorsOfDifficulties[difficulty],
					}] }).then(e=>startMessage=e);
					const game = {answer: lvlName, difficulty: difficulty, timeout: 0}; // 1 = Correct answer, 2 = Difficuklty, 3 = timeout id
					game.timeout = setTimeout(()=>{
						if (msg.channelId in games) {
							const game = games[msg.channelId];
							startMessage.reply({ embeds: [{
								title: `Time is up! The correct answer was ${game.answer}`,
								description: `**Level**: ${game.answer}\n**Difficulty:** ${difficulties[game.difficulty]}\n**Type:** Classic\n**Time:** ${time} seconds`,
								color: colorsOfDifficulties[game.difficulty],
							}] });
							delete games[msg.channelId];
						}
					}, time * 1000);
					games[msg.channelId] = game;
				} else if (difficulty in difficulties) {
					const db_keys = Object.keys(gd_db[difficulties[difficulty]]);
					const lvlID = db_keys[Math.floor(Math.random() * db_keys.length)] ?? 1;
					const lvlName = gd_db[difficulties[difficulty]][lvlID] ?? "Stereo Madness";

					let startMessage = null;
					msg.reply({ embeds: [{
						title: "Guess the Level!",
						description: `**Difficulty:** ${difficulties[difficulty]}\n**Type:** Classic\n**Time:** ${time} seconds`,
						color: colorsOfDifficulties[difficulty],
						image: {
							"url": "https://levelthumbs.prevter.me/thumbnail/" + lvlID,
							"width": 473,
							"height": 473,
						},
					}] }).then(e=>startMessage=e);
					const game = {answer: lvlName, difficulty: difficulty, timeout: 0};
					game.timeout = setTimeout(()=>{
						if (msg.channelId in games) {
							const game = games[msg.channelId];
							startMessage.reply({ embeds: [{
								title: `Time is up! The correct answer was ${game.answer}`,
								description: `**Level**: ${game.answer}\n**Difficulty:** ${difficulties[game.difficulty]}\n**Type:** Classic\n**Time:** ${time} seconds`,
								color: colorsOfDifficulties[game.difficulty],
							}] });
							delete games[msg.channelId];
						}
					}, time * 1000);
					games[msg.channelId] = game;
				} else {
					msg.reply("Invalid difficulty!");
				}
			}
		} else {
			msg.reply({ embeds: [{
				title: "Usage:",
				description: usageMsg,
				color: 0x40FF80,
			}] });
		}
	}

	if (cmd === "")
		msg.reply({ embeds: [{
			title: "Usage:",
			description: usageMsg,
			color: 0x40FF80,
		}] });
});

client.login(process.env.BOT_TOKEN);