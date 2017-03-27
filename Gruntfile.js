var compass = require('compass-importer');

module.exports = function (grunt) {

  require('jit-grunt')(grunt);

  /**
   * 共通設定 定義
   */
  var config = {
    path: {
      // Source配置パス
      src: {
        dir        : __dirname + '/src',
        handlebars : '<%= path.src.dir %>/handlebars',
        scss       : '<%= path.src.dir %>/scss/<%= path.device %>',
        js         : '<%= path.src.dir %>/js/<%= path.device %>'
      },
      // Build出力パス
      dev: {
        dir    : __dirname + '/_dev',
        assets : '<%= path.dev.dir %>/assets',
        css    : '<%= path.dev.assets %>/css/<%= path.device %>',
        js     : '<%= path.dev.assets %>/js/<%= path.device %>'
      },
      docs: {
        styleguide: __dirname + '/docs/styleguide',
      }
    }
  };

  grunt.initConfig({

    path: config.path, // パス設定 参照

    /**
     * Build出力先をクリアする
     */
    clean: {
      dev: [ '<%= path.dev.dir %>', '<%= path.src.font %>/.temp' ],
      docs_js: ['<%= path.docs.js %>']
    },

    /**
     * 静的HTMLをRenderし指定パスに出力する
     */
    assemble: {
      options: {
        layoutdir: '<%= path.src.handlebars %>/layouts',
        src: '<%= path.dev.dir %>',
        data: ['<%= path.src.handlebars %>/data/*.json'],
        helpers: [
          'handlebars-helper-prettify',
          'handlebars-helper-repeat'
        ],
        prettify: {
          condense: true,
          indent_char: '  ',
          indent: 1,
          unformatted: ['br']
        }
      },
      dev: {
        options: {
          
          layout: 'default.hbs',
          partials: ['<%= path.src.handlebars %>/partials/**/*.hbs']
        },
        files: [
          {
            expand: true,
            cwd: '<%= path.src.handlebars %>/pages/',
            src: '*.hbs',
            dest: '<%= path.dev.dir %>'
          },
          {
            expand: true,
            cwd: '<%= path.src.handlebars %>/index/',
            src: '*.hbs',
            dest: '<%= path.dev.dir %>'
          },
          {
            expand: true,
            cwd: '<%= path.src.handlebars %>/static/',
            src: '**/*.hbs',
            dest: '<%= path.dev.dir %>'
          }
        ]
      },
      styleguide: {
        options: {
          layoutdir: '<%= path.src.handlebars %>/layouts',
          layout: 'default.hbs',
          partials: ['<%= path.src.handlebars %>/styleguide/partials/**/*.hbs']
        },
        files:[
          {
            expand: true,
            cwd: '<%= path.src.handlebars %>/styleguide/pages/',
            src: '**/*.hbs',
            dest: '<%= path.dev %>' 
          }
        ]
      }
    },

    /**
     * Sassコンパイル
     */
    sass:{
      options: {
        importer: compass,
        sourceMap: false,
        includePaths: [ '<%= path.src.scss %>' ],
        outputStyle: 'expanded'
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= path.src.scss %>/',
          src: [ '**/*.scss' ],
          dest: '<%= path.dev.css %>/sp/',
          ext: '.css'
        }]
      }
    },

    /**
     * CSSポストプロセッサ
     */
    postcss: {
      options: {
        sourcemap: false,
        processors: [
          require('autoprefixer')({
            browsers: ['ios_saf >= 7', 'Android >= 4.1', 'ChromeAndroid >= 50', 'last 2 versions']
          }),
          require('cssnano')()
        ]
      },
      dist: {
        src: ['<%= path.dev.css %>/**/*.css']
      }
    },

    /**
     * ファイル監視
     */
    watch: {
      options: {
        livereload: true
      },
      styleguide: {
        files: ['<%= path.src.handlebars %>/styleguide/**/*.**'],
        tasks: ['assemble:styleguide'],
        options: {
          spawn: false
        }
      },
      html: {
        files: ['<%= path.src.handlebars %>/**/*.**', '!<%= path.src.handlebars %>/styleguide/**/*.**'],
        tasks: ['assemble:dev'],
        options: {
          spawn: false
        }
      },
      css: {
        files: ['<%= path.src.scss %>/**/*.scss'],
        tasks: ['sass', 'postcss'],
        options: {
          spawn: false
        }
      }
    },

    /**
     * ローカルサーバー
     */
    connect: {
      server: {
        options: {
          base: '<%= path.dev %>',
          livereload: true
        }
      }
    }
  });

  grunt.registerTask('build', ['clean:dev', 'assemble', 'sass', 'postcss']);

  grunt.registerTask('serve', ['build', 'connect', 'watch']);

}