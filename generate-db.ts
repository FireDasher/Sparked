"use strict";
import readline from "readline";
import { readFile, writeFile } from "fs/promises";

const rl = readline.createInterface(process.stdin, process.stdout);

const input: string[] = [];

rl.on("line", line=>{
	input.push(line)
});

const bracket2diff = {
	"(noob)": "Noob",
	"(easy)": "Easy",
	"(medium)": "Medium",
	"(hard)": "Hard",
	"(extreme)": "Extreme",
};

function keyDelimiterValueDelimiterKeyDelimiterValueFormatToObject(parts: string[]): Record<string, string> {
	const obj: Record<string, string> = {};
	for (let i = 0; i < parts.length; i += 2) obj[parts[i]] = parts[i+1];
	return obj;
}

rl.on("close", async()=>{
	const result: Record<string, Record<string, string>> = JSON.parse(await readFile("gd-database.json", "utf-8"));
	// const result: Record<string, Record<string, string>> = {};
	let diff = "unknown";

	let diffs: Record<string, string> = {};
	let ids: string[] = [];

	for (let i = 0; i < input.length; ++i) {
		const id = input[i];
		if (id.trim().length === 0) continue;
		if (id in bracket2diff) {
			diff = bracket2diff[id as keyof typeof bracket2diff];
		} else {
			ids.push(id);
			diffs[id] = diff;
		}
	}
	
	const res = await fetch("http://www.boomlings.com/database/getGJLevels21.php", {
		method: "POST",
		headers: {
			"User-Agent": "",
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			"secret": "Wmfd2893gb7",
			"type": "10",
			"str": ids.join(",")
		}).toString()
	});
	const value = await res.text();
	console.log(value);

	const levels = value.split("#", 1)[0].split("|");
	const names = levels.map(levelObject => keyDelimiterValueDelimiterKeyDelimiterValueFormatToObject(levelObject.split(":")));
	for (let i = 0; i < names.length; ++i) {
		const id = names[i]["1"];
		const name = names[i]["2"];
		const diff = diffs[id];
		if (typeof result[diff] == "undefined") result[diff] = {};
		result[diff][id] = name;
	}

	await writeFile("gd-database.json", JSON.stringify(result, null, "\t"));
});