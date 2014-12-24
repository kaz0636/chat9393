module.exports = function (grunt) {
    licenseRegexp = /^\!|^@preserve|^@cc_on|\bMIT\b|\bMPL\b|\bGPL\b|\(c\)|License|Copyright/mi;
    isLicenseComment = (function () {
        var _prevCommentLine;
        _prevCommentLine = 0;
        return function (node, comment) {
            if (licenseRegexp.test(comment.value) || comment.line === 1 || comment.line === _prevCommentLine + 1) {
                _prevCommentLine = comment.line;
                return true;
            }
            _prevCommentLine = 0;
            return false;
        };
    })();

    grunt.initConfig({
        //load config
        pkg: grunt.file.readJSON('package.json'),

        //path
        paths: {
            img: 'images/', //元画像
            imgdist: '../images/'
        },

        //imagemin
        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.img %>',
                    src: '**/*.{jpg,gif}',
                    dest: '<%= paths.imgdist %>'
                }]
            }
        },

        // tinypng
        tinypng: {
            options: {
                apiKey: "VJk538m2aMduo-wHCHtl-C7FWzM1O3bg"
            },
            files: {
                expand: true,
                cwd: '<%= paths.img %>',
                src: '**/*.png',
                dest: '<%= paths.imgdist %>'
            }
        },

        //compass
        compass: {
            dist: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'css',
                    outputStyle: 'expanded'
                }
            }
        },

        //css minify
        csso: {
            dynamic_mappings: {
                expand: true,
                cwd: './css/',
                src: ['*.css', '!*.min.css'],
                dest: '../css/',
                ext: '.css'
            }
        },

        //jsminify
        uglify: {
            options: {
                preserveComments: isLicenseComment
            },
            main: {
                src: [
                    'js/bootbox.js',
                    'js/main.js'
                ],
                dest: '../js/<%= pkg.name %>.min.js'
            }
        },

        // Watch
        watch: {
            img: {
                files: ['<%= paths.img %>**/*.{png,jpg,gif}'],
                tasks: ['imagemin', 'tinypng']
            },
            compass: {
                files: ['scss/*.scss'],
                tasks: ['compass']
            },
            csso: {
                files: ['css/*.css'],
                tasks: ['csso']
            },
            uglify: {
                files: ['js/*.js'],
                tasks: ['uglify']
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-tinypng');
    grunt.loadNpmTasks("grunt-contrib-compass");
    grunt.loadNpmTasks('grunt-csso');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['imagemin', 'tinypng', 'compass', 'csso', 'uglify', 'watch']);
};