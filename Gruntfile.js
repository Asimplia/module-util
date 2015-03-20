module.exports = function (grunt) {
	var GruntConfiguration = require('./js/GruntConfiguration');

	var typescriptBuildFiles = ["src/**/*.ts", "tests/**/*.ts"];
	// Project configuration.
	var config = GruntConfiguration(typescriptBuildFiles, [
		'typings/tsd.d.ts'
	], [], typescriptBuildFiles, typescriptBuildFiles, [
		'typings/tsd.d.ts'
	], __dirname);
	grunt.initConfig(config);

	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-typescript');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-jasmine-node');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-contrib-watch');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-contrib-clean');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-tsd');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-wait');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-tslint');

	grunt.registerTask('default', [
		'clean:build', 'tsd:reinstall', 'wait:typings', 'typescript:build', 'typescript:public', 'jasmine_node:unit'
	]);
	grunt.registerTask('dev', function () {
		GruntConfiguration.typescriptReferences(__dirname + '/build/references.ts', [
			__dirname + '/src', 
			__dirname + '/tests', 
			__dirname + '/typings'
		]);
		grunt.task.run('typescript:build', 'typescript:public', 'tslint:all', 'jasmine_node:unit', 'watch:ts');
	});
	grunt.registerTask('prepublish', function () {
		grunt.task.run('default');
	});
	grunt.registerTask('test', [
		'jasmine_node:unit'
	]);

};
