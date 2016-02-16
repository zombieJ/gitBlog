'use strict';

module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		config: grunt.file.readJSON('grunt.json'),

		jshint: {
			options: {
				browser: true,
				globals: {
					$: true,
					jQuery: true,
					moment: true,
				},
			},
			all: [
				'public/**/*.js'
			],
		},

		clean: {
			build: ['dist/', 'tmp/'],
			tmp: ['tmp/'],
			dist: ['dist/'],
		},
		concat: {
			app: {
				src: [
					'public/js/common.js',
					'public/js/app.js',

					'app/public/js/srv/*.js',
					'app/public/js/ctrl/*.js',
				],
				dest: 'tmp/public/js/scripts.js'
			},
			js: '<%= config.concat.js %>',
			css: {
				options: {
					process: function(src, filepath) {
						return "@import url(https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300italic,400italic,600italic);" +
							src.replace('@import url(https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300italic,400italic,600italic);', '');
					}
				},
				src: '<%= config.concat.css.src %>',
				dest: '<%= config.concat.css.dest %>',
			}
		},
		'regex-replace': {
			strict: {
				src: ['tmp/public/js/scripts.js'],
				actions: [
					{
						name: 'use strict',
						search: '\\\'use strict\\\';?',
						replace: '',
						flags: 'gmi'
					}
				]
			},
		},
		uglify: {
			dist: {
				options: {
					mangle: false
				},
				src: 'tmp/public/js/scripts.js',
				dest: 'tmp/public/js/scripts.min.js'
			}
		},
		cssmin: {
			dist: {
				files: {
					'tmp/public/css/styles.css': ['app/public/css/main.css']
				}
			}
		},
		htmlrefs: {
			dist: {
				src: 'app/index.html',
				dest: "tmp/index.html",
			}
		},
		copy: {
			dist: {
				files: [
					{expand: true, cwd: 'tmp/', src: ['**'], dest: 'dist'},
					{expand: true, cwd: 'app/', src: ['public/images/**', 'partials/**'], dest: 'dist'},
					{expand: true, cwd: 'node_modules/font-awesome/', src: ['fonts/**'], dest: 'dist/public'},
					{expand: true, cwd: 'node_modules/bootstrap/', src: ['fonts/**'], dest: 'dist/public'},
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-htmlrefs');
	grunt.loadNpmTasks('grunt-regex-replace');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', [
		// jshint
		'jshint:all',
		// Clean Env
		'clean:build',
		// Compress JS
		'concat:app',
		'regex-replace:strict',
		'uglify',
		'concat:js',
		// Compress CSS
		'cssmin',
		'concat:css',
		// Pass HTML Resources
		'htmlrefs',
		'copy',
		// Clean Env
		'clean:tmp',
	]);
};