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
					removeComments: false,
					references: [
						'typings/tsd.d.ts',
						'typings_local/tsd.d.ts'
					]
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
				tasks: ['tsd:reinstall', 'typescript:build', 'jasmine_node:unit'],
				options: {
					livereload: 35737,
					debug: false,
					debounceDelay: 100
				}
			}
		},
		tsd: {
			reinstall: {
				options: {
					// execute a command
					command: 'reinstall',
					//optional: always get from HEAD
					latest: true,
					// specify config file
					config: './tsd.json',
					// experimental: options to pass to tsd.API
					opts: {
						// props from tsd.Options
						saveBundle: false,
						//overwriteFiles: true,
						//saveToConfig: false,
						addToBundles: [],
						//resolveDependencies: false
					}
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-tsd');

	grunt.registerTask('default', [
		'tsd:reinstall', 'typescript:build', 'jasmine_node:unit'
	]);
	grunt.registerTask('dev', [
		'tsd:reinstall', 'typescript:build', 'jasmine_node:unit', 'watch:ts'
	]);
	grunt.registerTask('test', [
		'jasmine_node:unit'
	]);

};
