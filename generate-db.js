"use strict";
const readline = require("readline");
const clipboardy = require("clipboardy");

const rl = readline.createInterface(process.stdin, process.stdout);

const input = [];

rl.on("line", line=>{
	input.push(line);
});

const bracket2diff = {
	"(noob)": "Noob",
	"(easy)": "Easy",
	"(medium)": "Medium",
	"(hard)": "Hard",
	"(extreme)": "Extreme",
}

rl.on("close", ()=>{
	const result = require("./gd-database.json");
	let diff = "unknown";
	let finished = 0;
	let total = 0;
	for (const idx in input) {
		const id = input[idx];
		if (id === "") continue;
		if (id in bracket2diff) {
			diff = bracket2diff[id];
		} else {
			console.log("Ferthing " + id);
			total++;
			fetch("https://gdbrowser.com/api/level/" + id).then(res=>{
				res.json().then(e=>{
					result[diff][id] = e.name;
					finished++;
				});
			});
			// result[diff][id] = "something";
			// finished++;
		}
	}
	const checkdone = ()=>{
		if (finished == total) {
			clipboardy.default.writeSync(JSON.stringify(result, null, "\t"));
			console.log("Wrote to clipbaord");
		} else {
			setTimeout(checkdone, 100);
		}
	};
	checkdone();
});