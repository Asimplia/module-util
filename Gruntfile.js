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
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-shell');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-wait');
	GruntConfiguration.loadParentNpmTasks(grunt, 'grunt-tslint');

	grunt.registerTask('default', [
		'clean:build', 'shell:link_tsd', 'tsd:reinstall', 'wait:typings', 'typescript:build', 'typescript:public', 'tslint:all', 'jasmine_node:unit'
	]);
	grunt.registerTask('dev', ['typescript:build', 'typescript:public', 'jasmine_node:unit', 'watch:ts']);
	grunt.registerTask('prepublish', ['default']);
	grunt.registerTask('test', [
		'jasmine_node:unit'
	]);

};
