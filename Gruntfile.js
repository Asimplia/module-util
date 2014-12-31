module.exports = function (grunt) {
	var GruntConfiguration = require('./js/GruntConfiguration');

	var typescriptBuildFiles = ["src/**/*.ts", "tests/**/*.ts", "!node_modules/**/*.ts"];
	// Project configuration.
	var config = GruntConfiguration([], [], [], [
		'tsd:reinstall', 'typescript:build', 'jasmine_node:unit'
	], typescriptBuildFiles, typescriptBuildFiles, [
		'typings_local/tsd.d.ts'
	]);
	grunt.initConfig(config);

	if (!GruntConfiguration.isSubModule()) {
		grunt.loadNpmTasks('grunt-typescript');
		grunt.loadNpmTasks('grunt-jasmine-node');
		grunt.loadNpmTasks('grunt-contrib-watch');
		grunt.loadNpmTasks('grunt-tsd');
	}

	grunt.registerTask('default', [
		'tsd:reinstall', 'typescript:build', 'jasmine_node:unit'
	]);
	grunt.registerTask('dev', function () {
		GruntConfiguration.typescriptReferences(__dirname + '/build/references.ts', [
			__dirname + '/src', 
			__dirname + '/tests', 
			__dirname + '/typings'
		]);
		grunt.task.run('tsd:reinstall', 'typescript:build', 'jasmine_node:unit', 'watch:ts');
	});
	grunt.registerTask('postinstall', function () {
		if (!GruntConfiguration.isSubModule()) {
			grunt.task.run('default');
		}
	});
	grunt.registerTask('test', [
		'jasmine_node:unit'
	]);

};
