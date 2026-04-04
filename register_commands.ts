"use strict";
import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
const rest = new REST().setToken(process.env.BOT_TOKEN!);

(async () => {
    await rest.put(
        Routes.applicationCommands(process.env.APP_ID!),
        { body: [
			new SlashCommandBuilder()
				.setName("guess")
				.setDescription("Starts a new guessing game")
				.addIntegerOption(option =>
					option.setName("difficulty")
					.setDescription("Choose a difficulty")
					.setRequired(true )
					.addChoices({name: "Noob", value: 0}, {name: "Easy", value: 1}, {name: "Medium", value: 2}, {name: "Hard", value: 3}, {name: "Extreme", value: 4}, {name: "IMPOSSIBLE!!!", value: 5})
				)
				.toJSON()
		] }
    );
})();