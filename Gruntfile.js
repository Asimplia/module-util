module.exports = function (grunt) {
	var GruntConfiguration = require('./js/GruntConfiguration');

	var typescriptBuildFiles = ["src/**/*.ts", "tests/**/*.ts", "!node_modules/**/*.ts"];
	// Project configuration.
	var config = GruntConfiguration([], [], [], [
		'tsd:reinstall', 'typescript:build', 'jasmine_node:unit'
	], typescriptBuildFiles, typescriptBuildFiles, [
		'typings/tsd.d.ts'
	]);
	grunt.initConfig(config);

	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-typescript');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-jasmine-node');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-contrib-watch');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-tsd');

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
		grunt.task.run('default');
	});
	grunt.registerTask('test', [
		'jasmine_node:unit'
	]);

};
