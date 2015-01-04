var npm = require("npm");
var conf = require("./package.json");
var deps = conf.buildDependencies;
var args = [];
Object.keys(deps).forEach(function (name) {
	args.push(name + "@" + deps[name]);
});
npm.load(conf, function (e) {
	if (e) return console.error(e);
	npm.commands.install(args, function (e) {
		if (e) return console.error(e);
		console.info("Installed npm modules: ", args);
	});
});
