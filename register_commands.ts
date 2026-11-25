"use strict";
import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
const rest = new REST().setToken(process.env.BOT_TOKEN!);

(async () => {
    await rest.put(
        Routes.applicationCommands(process.env.APP_ID!),
        { body: [
			new SlashCommandBuilder()
				.setName("sparked")
				.setDescription("Starts a new Sparked guessing game")
				.setContexts([0, 1, 2])
				.setIntegrationTypes([0, 1])
				.addIntegerOption(option =>
					option.setName("difficulty")
					.setDescription("Choose a difficulty")
					.setRequired(true)
					.addChoices({name: "Noob", value: 0}, {name: "Easy", value: 1}, {name: "Medium", value: 2}, {name: "Hard", value: 3}, {name: "Extreme", value: 4}, {name: "IMPOSSIBLE!!!", value: 5}, {name: "Demonlist", value: 6})
				)
				.toJSON(),
			new SlashCommandBuilder()
				.setName("guess")
				.setDescription("Submits a guess to the active game in the current channel. ONLY REQUIRED FOR USER INSTALLATION!")
				.setContexts([0, 1, 2])
				.setIntegrationTypes(1)
				.addStringOption(option =>
					option.setName("guess")
					.setDescription("guess")
					.setRequired(true)
				)
				.toJSON()
		] }
    );
})();
