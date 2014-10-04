module.exports = function (grunt) {

	var tsFiles = ["src/**/*.ts", "tests/**/*.ts", "!node_modules/**/*.ts"];
	// Project configuration.
	grunt.initConfig({
		typescript: {
			// A specific target
			build: {
				src: tsFiles,
				dest: 'build/',
				options: {
					// 'es3' (default) | 'es5'
					target: 'es5',
					// 'amd' (default) | 'commonjs'
					module: 'commonjs',
					// true (default) | false
					sourceMap: false,
					// true | false (default)
					declaration: false,
					// true (default) | false
					removeComments: false
				},
				ignoreTypeCheck: true
			}
		},
		jasmine_node: {
			unit: {
				options: {
					specFolders: ['build/tests/unit/']
				},
			}
		},
		watch: {
			ts: {
				files: tsFiles,
				tasks: ['typescript:build', 'jasmine_node:unit'],
				options: {
					livereload: 35737,
					debug: false,
					debounceDelay: 100
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [
		'typescript:build', 'jasmine_node:unit'
	]);
	grunt.registerTask('dev', [
		'typescript:build', 'jasmine_node:unit', 'watch:ts'
	]);
	grunt.registerTask('test', [
		'jasmine_node:unit'
	]);

};
