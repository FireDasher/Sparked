"use strict";
import "dotenv/config";
import { ButtonInteraction, ChatInputCommandInteraction, Client, GatewayIntentBits } from "discord.js";
import gd_db from "./gd-database.json" with {type: "json"};

// function format(string: string, replacements: Record<string, string>): string {
// 	return string.replace(/\{(.*?)\}/g, (_, key)=>replacements[key]);
// }

const client = new Client({ intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
	GatewayIntentBits.MessageContent,
] });

const time = 20;

client.on("clientReady", () => {
	console.log("Logged in as " + client.user!.tag);
});

const difficulties: Record<number, keyof typeof gd_db> = {
	0: "Noob",
	1: "Easy",
	2: "Medium",
	3: "Hard",
	4: "Extreme",
	5: "IMPOSSIBLE!!!",
}
const colorsOfDifficulties: Record<number, number> = {
	0: 0xFFFF40,
	1: 0x8BD66B,
	2: 0xF49D46,
	3: 0xD64228,
	4: 0x800080,
	5: 0x400000,
};
const games: Record<string, {answer: string, difficulty: number, timeout: NodeJS.Timeout}> = {};

function startGame(msg: ChatInputCommandInteraction | ButtonInteraction, difficulty: number) {
	if (msg.channelId! in games) msg.reply("There is already a game in this channel!");
	else {
		if (difficulty in difficulties) {
			const db_section = difficulty === 5 ? Object.assign({}, ...Object.values(gd_db)) : gd_db[difficulties[difficulty]];
			const db_keys = Object.keys(db_section);
			const lvlID = db_keys[Math.floor(Math.random() * db_keys.length)] ?? 1;
			const lvlName = db_section[lvlID] ?? "Stereo Madness";

			msg.reply({ embeds: [{
				title: "Guess the Level!",
				description: `**Difficulty:** ${difficulties[difficulty]}\n**Type:** Classic\n**Time:** ${time} seconds` + (difficulty === 5 ? "\nThere is no image so this is truly impossible!!!" : ""),
				color: colorsOfDifficulties[difficulty],
				...(difficulty !== 5 && {image: {
					"url": "https://levelthumbs.prevter.me/thumbnail/" + lvlID,
					"width": 473,
					"height": 473,
				}}),
			}]});
			const game = {answer: lvlName, difficulty: difficulty, timeout: setTimeout(()=>{
				if (msg.channelId in games) {
					const game = games[msg.channelId];
					msg.followUp({ embeds: [{
						title: `Time is up! The correct answer was ${game.answer}`,
						description: `**Level**: ${game.answer}\n**Difficulty:** ${difficulties[game.difficulty]}\n**Type:** Classic\n**Time:** ${time} seconds`,
						color: colorsOfDifficulties[game.difficulty],
					}], components: [{
						type: 1, components: [{
							type: 2,
							label: "Start new game",
							style: 2,
							custom_id: "start_new_game-" + game.difficulty
						}]
					}] });
					delete games[msg.channelId];
				}
			}, time * 1000)};
			games[msg.channelId] = game;
		} else {
			msg.reply("Invalid difficulty!"); // Impossible
		}
	}
}

client.on("interactionCreate", msg => {
	if (msg.isChatInputCommand()) {
		const cmd = msg.commandName;
	
		if (cmd === "ping") msg.reply("Pong! 🏓");
		if (cmd === "pong") msg.reply("Ping! 🏓");
	
		if (cmd === "guess") {
			startGame(msg, msg.options.getInteger("difficulty")!);
		}
	} else if (msg.isButton()) {
		if (msg.customId.startsWith("start_new_game"))
			startGame(msg, parseInt(msg.customId.split("-")[1]));
	}
});

client.on("messageCreate", msg => {
	if (msg.author.bot) return;

	if (msg.channelId in games) {
		const game = games[msg.channelId];
		if (msg.content.trim().toLowerCase() === game.answer.toLowerCase()) {
			msg.reply({ embeds: [{
				title: "Congratulations! You guessed the Level correctly!",
				description: `**Level**: ${game.answer}\n**Difficulty:** ${difficulties[game.difficulty]}\n**Type:** Classic\n**Time:** ${time} seconds`,
				color: colorsOfDifficulties[game.difficulty],
			}], components: [{
				type: 1, components: [{
					type: 2,
					label: "Start new game",
					style: 2,
					custom_id: "start_new_game-" + game.difficulty
				}]
			}] });
			clearTimeout(game.timeout);
			delete games[msg.channelId];
		}
	}
});

client.login(process.env.BOT_TOKEN!);