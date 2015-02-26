
var fs = require('fs');
var path = require('path');

module.exports = exports = function (
	typescriptPublicFiles, 
	typescriptPublicReferences, 
	requirejsDeps, 
	watchFiles, 
	typescriptBuildFiles, 
	typescriptBuildReferences,
	basePath
) {
	return {
		typescript: {
			// A specific target
			"public": {
				src: typescriptPublicFiles,
				dest: 'build/public/',
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
					references: typescriptBuildReferences
				},
				ignoreTypeCheck: true
			}
		},
		requirejs: {
			compile: {
				options: {
					// baseUrl: "build",
					mainConfigFile: "build/public/src/main.js",
					name: "../../../bower_components/almond/almond",
					out: "build/public/src/main.optimized.js",
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
		bower: {
			install: {
				options: {
					targetDir: "./build/lib",
					layout: "byComponent",
					verbose: true,
					cleanTargetDir: true
				}
			}
		},
		jasmine_node: {
			options: {},
			unit: {
				options: {
					specFolders: ['build/tests/unit/']
				},
			},
			integration: {
				options: {
					specFolders: ['build/tests/integration/']
				},
			},
		},
		protractor: {
			feature: {
				options: {
					configFile: 'tests/feature.conf.js'
				},
			}
		},
		watch: {
			ts: {
				files: watchFiles,
				tasks: ['dev'],
				options: {
					livereload: Math.floor(Math.random() * 10000) + 30000,
					debug: false,
					debounceDelay: 100,
					spawn: false
				}
			}
		},
		less: {
			dev: {
				options: {
					sourceMap: true,
					sourceMapFilename: 'build/css/debug.css.map',
					sourceMapRootpath: '../../',
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
						saveBundle: true,
						//overwriteFiles: true,
						saveToConfig: false,
						addToBundles: [],
						//resolveDependencies: false
					}
				}
			}
		},
		copy: {
			fonts: {
				expand: true,
				cwd: "build/",
				src: '**/fonts/*',
				dest: 'build/fonts/',
				flatten: true,
				filter: 'isFile'
			},
			img: {
				src: 'img/*',
				dest: 'build/'
			}
		},
		shell: {
			link_module: {
				command: function (depName) {
					if (process.env.NODE_ENV !== 'dev') {
						return 'echo "Link only in dev environment NODE_ENV"';
					}
					var modulePath = exports.resolvePackagePath(depName, basePath);
					if (
						modulePath 
						&& fs.existsSync(modulePath + '/.git') 
						&& !fs.existsSync(basePath + '/node_modules/' + depName + '/.git')
					) {
						return 'rm -rf ' + basePath + '/node_modules/' + depName + ' && ln -s ' + modulePath + ' ' + basePath + '/node_modules/' + depName;
					}
					return 'echo "No package ' + depName + ' linked"';
				}
			}
		},
		subgrunt: {
			'asimplia': [
				'node_modules/asimplia-repository',
				'node_modules/asimplia-util'
			]
		},
		clean: {
			build: "build/"
		},
		develop: {
			server: {
				file: 'build/src/app.js',
				nodeArgs: [],
				args: [],
				env: {}
			},
			app: {
				file: 'app.js',
				nodeArgs: [],
				args: [],
				env: {
					NODE_ENV: 'dev'
				}
			}
		},
		wait: {
			typings: {      
				options: {
					delay: 10,
					after : function () {
						if (!fs.existsSync(basePath + '/typings/tsd.d.ts')) {
							return true;
						}
					}
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

exports.loadParentNpmTasks = function (grunt, name) {
	var root = path.resolve('node_modules');
	var depth = 0;
	while (depth < 10) {
		var tasksdir = path.join(root, name, 'tasks');
		if (grunt.file.exists(tasksdir)) {
			grunt.loadNpmTasks(name);
			return;
		} else {
			name = '../../node_modules/' + name;
			depth++;
		}
	}
	grunt.log.error('Parent Npm module "' + name + '" not found. Is it installed?');
};

exports.resolveNodeModulePath = function (nodeModuleFileRelativePath) {
	nodeModuleFileRelativePath = 'node_modules/' + nodeModuleFileRelativePath;
	var depth = 0;
	while (depth < 10) {
		if (fs.existsSync(nodeModuleFileRelativePath)) {
			return nodeModuleFileRelativePath;
		}
		nodeModuleFileRelativePath = '../' + nodeModuleFileRelativePath;
		depth++;
	}
	throw new Error('Parent Npm module file "' + nodeModuleFileRelativePath + '" not found. Is it exists?');
};

exports.resolvePackagePath = function (depName, basePath) {
	var depth = 0;
	while (depth < 10) {
		basePath = basePath + '/..';
		var dirNames = exports.getDirectories(basePath);
		for (var i in dirNames) {
			var dirName = dirNames[i];
			var modulePath = path.resolve(basePath + '/' + dirName);
			var packageConfPath = modulePath + '/package.json';
			if (!fs.existsSync(packageConfPath)) {
				continue;
			}
			var packageConf = require(packageConfPath);
			if (packageConf.name !== depName) {
				continue;
			}
			return modulePath;
		}
		depth++;
	}
	return null;
};

exports.getDirectories = function (srcPath) {
	return fs.readdirSync(srcPath).filter(function (file) {
		return fs.statSync(path.join(srcPath, file)).isDirectory();
	});
};
