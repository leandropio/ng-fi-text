module.exports = function(grunt) {
  var name, latest, version, bannerContent, devRelease, minRelease,
  sourceMap, sourceMapUrl, lDevRelease, lMinRelease,
  lSourceMapMin;

  latest = '<%= pkg.name %>';
  version = '<%= pkg.version%>';
  name = '<%= pkg.name %>-v<%= pkg.version%>';
  bannerContent = '/*! <%= pkg.name %> v<%= pkg.version %> - ' +
  '<%= grunt.template.today("yyyy-mm-dd") %> \n' +
  ' *  License: <%= pkg.license %> \n'+
  ' *  Author: <%= pkg.author %> */\n\n';
  


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // qunit:{
    //   target: {
    //     src: ['test/**/*.html']
    //   }
    // },
    // configure copy task
    
    copy: {
      latest: {
      // Grunt will search for "**/*.js" under "lib/" when the "uglify" task
      // runs and build the appropriate src-dest file mappings then, so you
      // don't need to update the Gruntfile when files are added or removed.
      files: [
      {
          expand: true,     // Enable dynamic expansion.
          cwd: 'src/',      // Src matches are relative to this path.
          src: ['**/*.js'], // Actual pattern(s) to match.
          dest: 'dist',   // Destination path prefix.
          //ext: '.min.js',   // Dest filepaths will have this extension.
          //extDot: 'first'   // Extensions in filenames begin after the first dot
        },
        ],
      },
      versions: {
        files: [
        {
          expand: true,     // Enable dynamic expansion.
          cwd: 'src/',      // Src matches are relative to this path.
          src: ['**/*.js'], // Actual pattern(s) to match.
          dest: 'legacy_versions/'+version,   // Destination path prefix.
          ext: '.'+version+'.js',   // Dest filepaths will have this extension.
          extDot: 'first'   // Extensions in filenames begin after the first dot
        },
        ],
      },
    },
    // configure uglify task
    uglify:{
      options: {
        //banner: bannerContent,
        sourceMapRoot: '../',
        sourceMap: true,

      },
      // target: {
      //   src: ['src/**/*.js'],
      //   dest: minRelease
      // },
      latest: {
        files: [
        {
          expand: true,     // Enable dynamic expansion.
          cwd: 'dist',      // Src matches are relative to this path.
          src: ['**/*.js'], // Actual pattern(s) to match.
          dest: 'dist',   // Destination path prefix.
          ext: '.min.js',   // Dest filepaths will have this extension.
          extDot: 'first'   // Extensions in filenames begin after the first dot
        },
        ],
      },
      versions: {
        files: [
        {
          expand: true,     // Enable dynamic expansion.
          cwd: 'legacy_versions/'+version,      // Src matches are relative to this path.
          src: ['**/*.js'], // Actual pattern(s) to match.
          dest: 'legacy_versions/'+version,   // Destination path prefix.
          ext: '.'+version+'.min.js',   // Dest filepaths will have this extension.
          extDot: 'first'   // Extensions in filenames begin after the first dot
        },
        ],
      }
    },
    // configure concat task
    concat: {
      options: {
        banner: bannerContent
      },
      dynamic_mappings: {
        files: [
        {
          expand: true,     // Enable dynamic expansion.
          cwd: 'dist',      // Src matches are relative to this path.
          src: ['**/*.js'], // Actual pattern(s) to match.
          dest: 'dist',   // Destination path prefix.
          //ext: '.min.js',   // Dest filepaths will have this extension.
          //extDot: 'first'   // Extensions in filenames begin after the first dot
        },
        {
          expand: true,     // Enable dynamic expansion.
          cwd: 'legacy_versions/'+version,      // Src matches are relative to this path.
          src: ['**/*.js'], // Actual pattern(s) to match.
          dest: 'legacy_versions/'+version,   // Destination path prefix.
          //ext: '.min.js',   // Dest filepaths will have this extension.
          //extDot: 'first'   // Extensions in filenames begin after the first dot
        },
        ],
      }
    },
    // configure jshint task
    jshint: {
      options: {
        trailing: true,
        eqeqeq: true,
        //strict:false,
        undef: false,
        predef: ['angular','window','console'],
      },
      target: {
        src: ['src/**/*.js', 'test/**/*.js']
      }
    }
  });

grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('default', [
    'jshint', 
    // 'qunit'
    ]);

  grunt.registerTask('build', [
    'jshint', 
    'copy:latest', 
    'uglify:latest', 
    

    'copy:versions',
    'uglify:versions',


    'concat',
    // 'qunit'
    ]);
};
