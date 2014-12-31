
var fs = require('fs');

module.exports = exports = function (
	typescriptPublicFiles, 
	typescriptPublicReferences, 
	requirejsDeps, 
	watchTasks, 
	watchFiles, 
	typescriptBuildFiles, 
	typescriptBuildReferences
) {
	return {
		typescript: {
			// A specific target
			"public": {
				src: typescriptPublicFiles,
				dest: 'build/',
				options: {
					// 'es3' (default) | 'es5'
					target: 'es5',
					// 'amd' (default) | 'commonjs'
					module: 'amd',
					// true (default) | false
					sourceMap: true,
					// true | false (default)
					declaration: false,
					// true (default) | false
					removeComments: false,
					noImplicitAny: false,
					basePath: '',
					references: [
						'typings/tsd.d.ts'
					].concat(typescriptPublicReferences)
				},
				ignoreTypeCheck: true
			},
			build: {
				src: typescriptBuildFiles,
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
						'typings/tsd.d.ts'
					].concat(typescriptBuildReferences)
				},
				ignoreTypeCheck: true
			}
		},
		requirejs: {
			compile: {
				options: {
					// baseUrl: "build",
					mainConfigFile: "build/src/main.js",
					name: "../../js/lib/almond",
					out: "build/src/main.optimized.js",
					include: ['main'],
					optimize: "uglify2",
					deps: requirejsDeps,
					uglify2: {
						output: { beautify: true }, 
						compress: { sequences: false },
						mangle: false
					}
				}
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
				files: watchFiles,
				tasks: watchTasks,
				options: {
					livereload: Math.floor(Math.random() * 10000) + 30000,
					debug: false,
					debounceDelay: 100
				}
			}
		},
		less: {
			dev: {
				options: {
					paths: ["./css"],
					sourceMap: true,
					paths: "./css"
				},
				files: {
					"build/css/debug.css": "css/main.less"
				}
			},
			prod: {
				options: {
					paths: ["./css"],
					cleancss: true,
					modifyVars: {
						// imgPath: '"http://mycdn.com/path/to/images"'
					}
				},
				files: {
					"build/css/index.css": "css/main.less"
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
		},
		copy: {
			fonts: {
				src: 'fonts/*',
				dest: 'build/',
			},
			img: {
				src: 'img/*',
				dest: 'build/',
			}
		},
		shell: {
			link_module_repository: {
				command: function () {
					if (
						fs.existsSync(__dirname + '/../module-repository') 
						&& !fs.existsSync(__dirname + '/node_modules/asimplia-repository/.git')
					) {
						return 'mv ./node_modules/asimplia-repository ./node_modules/asimplia-repository.bak && ln -s ../../module-repository ./node_modules/asimplia-repository';
					}
					return 'echo "No ../module-repository linked"';
				}
			},
			link_module_util: {
				command: function () {
					if (
						fs.existsSync(__dirname + '/../module-util') 
						&& !fs.existsSync(__dirname + '/node_modules/asimplia-util/.git')
					) {
						return 'mv ./node_modules/asimplia-util ./node_modules/asimplia-util.bak && ln -s ../../module-util ./node_modules/asimplia-util';
					}
					return 'echo "No ../module-util linked"';
				}
			}
		}
	};
};



exports.typescriptReferences = function (referencesFile, paths) {
	process.stdout.write('Running "typescriptReferences" task' + "\n");

	var getTsFiles = function (paths) {
		var filePaths = [];
		paths.forEach(function (path) {
			var stat = fs.statSync(path);
			if (stat.isDirectory()) {
				var files = fs.readdirSync(path);
				files.forEach(function (file) {
					var filePath = path + '/' + file;
					filePaths = filePaths.concat(getTsFiles([filePath]));
				});
			} else if (path.substring(path.length - 3) === '.ts') {
				filePaths.push(path);
			}
		});
		return filePaths;
	};

	var filePaths = getTsFiles(paths);
	var references = [];
	filePaths.forEach(function (filePath) {
		references.push('/// <reference path="' + filePath + '" />');
	});
	fs.writeFileSync(referencesFile, references.join("\n"));
};

exports.isSubModule = function () {
	return process.env.PWD.match(new RegExp('/node_modules/([\\w\\-]+)$')) !== null;
};
