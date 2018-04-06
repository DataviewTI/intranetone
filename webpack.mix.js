/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                                                                                                  
  ██╗████████╗███████╗███╗   ██╗███████╗        ████████╗ ██████╗          ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
  ██║╚══██╔══╝██╔════╝████╗  ██║██╔════╝        ╚══██╔══╝██╔═══██╗        ██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
  ██║   ██║   █████╗  ██╔██╗ ██║███████╗           ██║   ██║   ██║        ██║     ███████║█████╗  ██║     █████╔╝ 
  ██║   ██║   ██╔══╝  ██║╚██╗██║╚════██║           ██║   ██║   ██║        ██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ 
  ██║   ██║   ███████╗██║ ╚████║███████║           ██║   ╚██████╔╝        ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝╚══════╝           ╚═╝    ╚═════╝          ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝

  - Itens to be analised

    1) find the cause of error '500KB' 
    [BABEL] Note: The code generator has deoptimised the styling of "unknown" as it exceeds the max of "500KB".
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

let mix = require('laravel-mix');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminWebp = require('imagemin-webp');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let WEBPACK_PLUGINS = [];
let COMPILE = {
  base:{
    assets:true,
    img_optimize:{
       state : false//process.env.NODE_ENV !== 'production',
    }
  },
  fe:{
    assets:true,
    img_optimize:{
      state : false
   }
 },
  io:{
    assets:true,
    sass:false,
    img_optimize:{
      state : false
   }
 }
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  ███████╗    ██╗   ██╗    ███╗   ██╗     ██████╗    ████████╗    ██╗     ██████╗     ███╗   ██╗    ███████╗
  ██╔════╝    ██║   ██║    ████╗  ██║    ██╔════╝    ╚══██╔══╝    ██║    ██╔═══██╗    ████╗  ██║    ██╔════╝
  █████╗      ██║   ██║    ██╔██╗ ██║    ██║            ██║       ██║    ██║   ██║    ██╔██╗ ██║    ███████╗
  ██╔══╝      ██║   ██║    ██║╚██╗██║    ██║            ██║       ██║    ██║   ██║    ██║╚██╗██║    ╚════██║
  ██║         ╚██████╔╝    ██║ ╚████║    ╚██████╗       ██║       ██║    ╚██████╔╝    ██║ ╚████║    ███████║
  ╚═╝          ╚═════╝     ╚═╝  ╚═══╝     ╚═════╝       ╚═╝       ╚═╝     ╚═════╝     ╚═╝  ╚═══╝    ╚══════╝
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
//check how set a default path for CopyWebpackPlugin
function __root(str){return "../"+str}

/* a simple CopyWebpackPlugin alias */
function __copy(params){
  WEBPACK_PLUGINS.push(new CopyWebpackPlugin([params]));
}
/*
  bootstrap to execute ImageminPlugin on CopyWebpackPlugin, just add
  plugins to a vector to be executed on end of file, mix.webpackConfig
  are not allowed yet
 */
function __imgOptimize(params){
  WEBPACK_PLUGINS.push(new CopyWebpackPlugin([{
      from: params.from,
      to: params.to,
      ignore: params.ignore || [],
    }
  ]));

  WEBPACK_PLUGINS.push(new ImageminPlugin({
    test: [params.to+'*.png',params.to+'**/*.png'],
    optipng: {
      optimizationLevel: 9
    },
  }));
  
  WEBPACK_PLUGINS.push(new ImageminPlugin({
    test: [params.to+'*.jpg',params.to+'**/*.jpg'],
    jpegtran: null,
    plugins: [
      imageminMozjpeg({
        quality: 75,
        progressive: true
      })
    ],
  }));
}

/*----------------------------------------------------------------------------------------------------------
  Aplication src and destination paths frontend e intranetone
----------------------------------------------------------------------------------------------------------*/
let IO = 'resources/assets/vendors/dataview-intranetone/src/';

let src = {
  vendors: 'resources/assets/vendors/',
  assets: 'resources/assets/',
  dataview: IO, //changed when dataview is a module

  base:{
    root: IO+'base/',
    js: IO+'base/js/',
    css: IO+'base/css/',
    vendors: IO+'vendors/',
    images: IO+'base/images/',
  },

  fe:{
    root: IO+'fe/',
    css: IO+'fe/css/',
    js: IO+'fe/js/',
    custom: IO+'fe/custom/',
    images: IO+'fe/images/',
    layout: IO+'fe/layout/',
    pages: IO+'fe/pages/',
    vendors: IO+'fe/vendors/',
  },
  io:{
    root: IO+'io/',
    css: IO+'io/css/',
    js: IO+'io/js/',
    custom: IO+'io/custom/',
    images: IO+'io/images/',
    layout: IO+'io/layout/',
    services: IO+'io/services/',
    vendors: IO+'io/vendors/',
  },
}

let dest = {
  //Any element puted outside IO and FE paths, are Base
	root: 'public/',
	fonts: 'public/fonts/',
	css: 'public/css/',
	js: 'public/js/',
	vendors: 'public/vendors/',
  images: 'public/images/',

  fe:{
    root: 'public/fe/',
    js: 'public/fe/js/',
    css: 'public/fe/css/',
    vendors: 'public/fe/vendors/',
    images: 'public/fe/images/',
  },
  io:{
    root: 'public/io/',
    js: 'public/io/js/',
    css: 'public/io/css/',
    services: 'public/io/services/',
    vendors: 'public/io/vendors/',
    images: 'public/io/images/',
  }
}

 
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ██╗   ██╗ ███████╗ ███╗   ██╗ ██████╗   ██████╗  ██████╗       ██████╗   █████╗  ████████╗ ██╗  ██╗ ███████╗
  ██║   ██║ ██╔════╝ ████╗  ██║ ██╔══██╗ ██╔═══██╗ ██╔══██╗      ██╔══██╗ ██╔══██╗ ╚══██╔══╝ ██║  ██║ ██╔════╝
  ██║   ██║ █████╗   ██╔██╗ ██║ ██║  ██║ ██║   ██║ ██████╔╝      ██████╔╝ ███████║    ██║    ███████║ ███████╗
  ╚██╗ ██╔╝ ██╔══╝   ██║╚██╗██║ ██║  ██║ ██║   ██║ ██╔══██╗      ██╔═══╝  ██╔══██║    ██║    ██╔══██║ ╚════██║
   ╚████╔╝  ███████╗ ██║ ╚████║ ██████╔╝ ╚██████╔╝ ██║  ██║      ██║      ██║  ██║    ██║    ██║  ██║ ███████║
    ╚═══╝   ╚══════╝ ╚═╝  ╚═══╝ ╚═════╝   ╚═════╝  ╚═╝  ╚═╝      ╚═╝      ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝ ╚══════╝
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

let paths = {
	'jquery': src.vendors + 'jquery/dist/',
	'bootstrap': src.vendors + 'bootstrap/dist/',
	'bs_tether': src.vendors + 'tether/dist/',
	'dv_formvalidation': src.vendors + 'dv-formvalidation/dist/',
	'dv_holdonjs': src.vendors + 'dv-holdOn/src/',
	'sweetalert2': src.vendors + 'sweetalert2/dist/',
	'toastr': src.vendors + 'toastr/',
	'popperjs': src.vendors + 'popper.js/dist/',
	'bootstrapswitch': src.vendors + 'bootstrap-switch/dist/',
  'sortable': src.vendors + 'Sortable/',
	'bsmd4' : src.vendors + 'bootstrap-material-design/',
	'fuelux': src.vendors + 'fuelux/',
	'pickadate': src.vendors + 'pickadate/lib/',
	'datatables': src.vendors + 'datatables/media/',
	'elektron': src.vendors + 'elektron/',
	'onoffcanvas': src.vendors + 'onoffcanvas/dist/',
	'datatables.net': src.vendors + 'datatables.net/',
	'datatables.net_bs': src.vendors + 'datatables.net-bs/',
	'moment': src.vendors + 'moment/',
	'moment_timezone': src.vendors + 'moment-timezone/',
	'moment_duration_format': src.vendors + 'moment-duration-format/lib/',
	'wickedpicker': src.vendors + 'wickedpicker/dist/',
  'dropzone': src.vendors + 'dropzone/dist/',
  'tinymce': src.vendors + 'tinymce/',
	'photoswipe': src.vendors + 'photoswipe/dist/',
	'holderjs': src.vendors + 'holderjs/',
	'jquery_mask': src.vendors + 'jquery-mask-plugin/dist/',
	'requirejs': src.vendors + 'requirejs/',
	'animate': src.vendors + 'animate.css/',
	'wow': src.vendors + 'wow/dist/',
	'owl_carousel': src.vendors + 'owl.carousel/dist/',
};


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    ██████╗      █████╗     ███████╗    ███████╗
    ██╔══██╗    ██╔══██╗    ██╔════╝    ██╔════╝
    ██████╔╝    ███████║    ███████╗    █████╗  
    ██╔══██╗    ██╔══██║    ╚════██║    ██╔══╝  
    ██████╔╝    ██║  ██║    ███████║    ███████╗
    ╚═════╝     ╚═╝  ╚═╝    ╚══════╝    ╚══════╝
                                                
  DEFAULT CONFIGS TO IO/FE with webpack pre deploy
  - try to use babel intead scripts, if not possible, divide the scripts as:
    ({prefix}-mix-... - whitout babel) and ({prefix}-babel-... - babel suport)
  - Execute php "artisan config:cache" to update last conf updates
  - Custom JS always compiled with mix.babel on npm prod 
  - Any element outside IO and FE pats, are considered Base
  - Always load on this order Static,paths,etc and custom as latest
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/



/*---------------------------------------------------------
  "Base" Elements
  Copy base elements to be used both (fe, io);
---------------------------------------------------------*/
if(COMPILE.base.assets){

  mix.babel(src.base.js + 'facebook-sdk-loader.js', dest.js + 'facebook-sdk-loader.min.js');
  mix.babel(src.base.vendors + 'bsmd4/bsmd4.0.0.js',dest.js+'bsmd4.min.js');
  mix.babel(paths.jquery + 'jquery.min.js', dest.js+'jquery.min.js');
  mix.babel(paths.jquery + 'jquery.slim.min.js', dest.js+'jquery.slim.min.js');

  mix.styles([
    src.base.vendors + 'bsmd4/custom-bsmd.css',
  ], dest.css + 'bsmd4.min.css');

  if(!COMPILE.base.img_optimize.state)
    mix.copyDirectory(src.base.images, dest.images);
  else{
    __imgOptimize({
      from: src.base.images,
      to: __root(dest.images)
    });
  }

  mix.copy(src.base.images + 'favicon/favicon.ico', dest.root);

  // bsmd4 requirements
  mix.copy(paths.popperjs + 'umd/popper.min.js', dest.js+'popper.min.js');  //babel off

  /*---------------------------------------------------------
    Exception files for compatibility questions 
    (erros on mix or --production)
    Some JS files doesn't work when mixed with --production,
    or just merged,
    here these files are generated step by step.
  ---------------------------------------------------------*/

  //Pickadate asset (error on mix --production with babel)

  mix.scripts([
    paths.pickadate + 'picker.js',
    paths.pickadate + 'picker.date.js',
    paths.pickadate + 'picker.time.js',
    paths.pickadate + 'legacy.js',
    paths.pickadate + 'translations/pt_BR.js',
    src.base.js + 'defaults/def-pickadate.js',
  ], dest.js + 'pickadate-full.min.js');//babel off

  mix.styles([
    paths.pickadate + 'compressed/themes/default.css',
    paths.pickadate + 'compressed/themes/default.date.css',
    paths.pickadate + 'compressed/themes/default.time.css',
    src.base.css + 'datapicker.css',
  ], dest.css + 'pickadate-full.min.css');

  //CP photoswipe,
  mix.babel([
    paths.photoswipe + 'photoswipe.min.js',
    paths.photoswipe + 'photoswipe-ui-default.min.js',
    src.js + 'photoswipe-loader.js',
  ], dest.vendors + 'photoswipe/photoswipe.min.js');

  __imgOptimize({
    from: paths.photoswipe + 'default-skin',
    to: __root(dest.vendors + 'photoswipe'),
    ignore: ['*.css']
  });
  
}//END COMPILE.base.assets
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                                                                                    
    ██╗███╗   ██╗████████╗██████╗  █████╗ ███╗   ██╗███████╗████████╗     ██████╗ ███╗   ██╗███████╗
    ██║████╗  ██║╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝╚══██╔══╝    ██╔═══██╗████╗  ██║██╔════╝
    ██║██╔██╗ ██║   ██║   ██████╔╝███████║██╔██╗ ██║█████╗     ██║       ██║   ██║██╔██╗ ██║█████╗  
    ██║██║╚██╗██║   ██║   ██╔══██╗██╔══██║██║╚██╗██║██╔══╝     ██║       ██║   ██║██║╚██╗██║██╔══╝  
    ██║██║ ╚████║   ██║   ██║  ██║██║  ██║██║ ╚████║███████╗   ██║       ╚██████╔╝██║ ╚████║███████╗
    ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝        ╚═════╝ ╚═╝  ╚═══╝╚══════╝
                                                                                                    
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

if(COMPILE.io.assets){

  mix.copyDirectory(src.io.vendors+'glyphter-font/fonts/',dest.fonts);


  if(COMPILE.io.sass){
    /*
    mix.sass(src.base.vendors + 'bootstrap-material-design/scss/io-custom-bsmd4.scss',
              'io/css/compiled-io-custom-bsmd4.min.css')
    .options({
      postCss: [
        require('postcss-css-variables')(),
      ]
   });*/

    //fuelux compilation, executa somente uma vez
    //retirar pillbox em alguns casos
    mix.less(paths.fuelux + 'less/fuelux.less', __root(src.io.vendors + 'fuelux/compiled_less/fuelux.css'))
      .less(paths.fuelux + 'less/fuelux-core.less', __root(src.io.vendors + 'fuelux/compiled_less/fuelux-core.css'))
      .less(paths.fuelux + 'less/wizard.less', __root(src.io.vendors + 'fuelux/compiled_less/wizard.css'))
      .less(paths.fuelux + 'less/utility.less', __root(src.io.vendors + 'fuelux/compiled_less/utility.css'))
      .less(paths.fuelux + 'less/pillbox.less', __root(src.io.vendors + 'fuelux/compiled_less/pillbox.css'))
      //less(paths.fuelux + 'less/combobox.less', dest.css + '/compiled_less/combobox.css');

    mix.styles([
      src.io.vendors + 'fuelux/compiled_less/fuelux.css',
      src.io.vendors + 'fuelux/compiled_less/fuelux-core.css',
      src.io.vendors + 'fuelux/compiled_less/wizard.css',
      src.io.vendors + 'fuelux/compiled_less/pillbox.css',
      src.io.vendors + 'fuelux/compiled_less/utility.css',
      //dest.css + 'compiled_less/combobox.css',
    ], src.io.vendors + 'fuelux/fuelux-compiled.min.css');

    mix.babel([
      paths.fuelux + 'js/wizard.js',
      paths.fuelux + 'js/dropdown-autoflip.js',
      paths.fuelux + 'js/utilities.js',
      paths.fuelux + 'js/pillbox.js',
    ], src.io.vendors + 'fuelux/fuelux-compiled.min.js');

  }//end io.sass

  if(!COMPILE.io.img_optimize.state)
    mix.copyDirectory(src.io.images, dest.io.images);
  else{
    __imgOptimize({
      from: src.io.images,
      to: __root(dest.io.images),
      ignore: [
        'source/**/*',
      ],
    });
  }
  /* IO base files for any service */


//mix.babel(src.io.css + 'helpers/dataview-custom.js', dest.io.js+'dataview-custom.min.js');
//mix.babel(src.io.js + 'helpers/dataview-helper.js', dest.io.js+'dataview-helper.min.js');

//move compileds fuelux to dest folder
mix.copy(src.io.vendors + 'fuelux/fuelux-compiled.min.css', dest.io.css);
mix.copy(src.io.vendors + 'fuelux/fuelux-compiled.min.js', dest.io.js);


//copy vendors
mix.copyDirectory(paths.tinymce,dest.io.vendors+'tinymce');
mix.copyDirectory(src.io.vendors + 'tinymce/moxiemanager/', dest.io.vendors + 'tinymce/plugins/moxiemanager/');

// Copy language files
mix.copy(src.io.vendors +'datatables/datatables-pt-br.json', dest.io.vendors + 'datatables/lang/datatables-pt-br.json');
mix.copy(src.io.vendors + 'tinymce/pt_BR.js', dest.io.vendors + 'tinymce/langs/pt_BR.js');

/*---------------------------------------------------------
  - Auth page files (this is not a service)
  for auth files are loaded separated for optimization
---------------------------------------------------------*/

mix.styles([
  src.io.vendors + 'glyphter-font/css/intranetone.css',
  src.io.vendors + 'glyphter-font/css/custom-gi-intranetone.css',
  src.base.vendors + 'glyphter-font/glyphter-font.css',
  src.base.css + 'form-validation.css',
  paths.dv_formvalidation + 'css/formValidation.min.css',
	paths.sweetalert2 + 'sweetalert2.min.css',
	paths.animate + 'animate.min.css',
	paths.dv_holdonjs + 'css/HoldOn.min.css',
  paths.toastr + 'toastr.min.css',
	//src.base.css + 'custom-toastr.css',
	src.io.root + 'auth/auth.css',
], dest.io.css + 'io-mix-auth.min.css');

mix.babel([
	paths.dv_formvalidation + 'js/formValidation.min.js',
	paths.dv_formvalidation + 'js/framework/bootstrap.min.js',
	paths.dv_formvalidation + 'js/language/pt_BR.js',
	paths.dv_holdonjs + 'js/HoldOn.min.js',
	paths.toastr + 'toastr.min.js',
	src.io.root + 'auth/auth.js',
], dest.io.js + 'io-babel-auth.min.js');

mix.scripts([
	paths.sweetalert2 + 'sweetalert2.min.js',
], dest.io.js + 'io-mix-auth.min.js');

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                                                                                              
    ██████╗      █████╗     ███████╗    ██╗  ██╗    ██████╗      ██████╗      █████╗     ██████╗     ██████╗ 
    ██╔══██╗    ██╔══██╗    ██╔════╝    ██║  ██║    ██╔══██╗    ██╔═══██╗    ██╔══██╗    ██╔══██╗    ██╔══██╗
    ██║  ██║    ███████║    ███████╗    ███████║    ██████╔╝    ██║   ██║    ███████║    ██████╔╝    ██║  ██║
    ██║  ██║    ██╔══██║    ╚════██║    ██╔══██║    ██╔══██╗    ██║   ██║    ██╔══██║    ██╔══██╗    ██║  ██║
    ██████╔╝    ██║  ██║    ███████║    ██║  ██║    ██████╔╝    ╚██████╔╝    ██║  ██║    ██║  ██║    ██████╔╝
    ╚═════╝     ╚═╝  ╚═╝    ╚══════╝    ╚═╝  ╚═╝    ╚═════╝      ╚═════╝     ╚═╝  ╚═╝    ╚═╝  ╚═╝    ╚═════╝ 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

mix.styles([
  src.io.vendors + 'glyphter-font/css/intranetone.css',
  src.io.vendors + 'glyphter-font/css/custom-gi-intranetone.css',
  src.base.vendors + 'glyphter-font/glyphter-font.css',
  src.io.layout + 'dashboard.css',
	paths.dv_formvalidation + 'css/formValidation.min.css',
	src.base.css + 'form-validation.css',
	paths.sweetalert2 + 'sweetalert2.min.css',
	paths.dv_holdonjs + 'css/HoldOn.min.css',
	src.base.css + 'holdon.css',
	paths.datatables + 'css/dataTables.bootstrap4.min.css',
	src.io.vendors + 'datatables/datatables-default.css',
	src.io.vendors + 'datatables/datatables-pagination.css',
  src.io.custom + 'custom-wickedpicker.css',
  src.io.custom + 'custom-datatables.css',
	src.io.custom + 'custom-form-validation.css',
  paths.elektron + 'dist/elektron.min.css',
  paths.onoffcanvas + 'onoffcanvas.min.css',
  src.io.layout + 'datatables.css',
  src.io.layout + 'fuelux.css',
  src.io.layout + 'elektron.css',
  src.io.layout + 'dash-menu.css',
  //src.io.custom + 'custom-dashboard.css',
  src.io.custom + 'intranetone-colors.css',
//  src.custom + 'css/intranetone/custom-intranetone.css',
  src.base.css + 'helpers/dv-layout.css',
], dest.io.css + 'io-dashboard.min.css');

mix.babel([
	src.base.js + 'dv-base-helper.js',
  src.base.vendors+'formvalidation-dist-v0.8.1/formValidation-custom.js',  
	paths.dv_formvalidation + 'js/framework/bootstrap.min.js',
	paths.dv_formvalidation + 'js/language/pt_BR.js',
	paths.dv_holdonjs + 'js/HoldOn.min.js',
	paths.datatables + 'js/jquery.dataTables.min.js',
	src.io.js + 'defaults/def-datatables.js',
	src.io.js + 'extensions/ext-datatables.js',
  paths.onoffcanvas + 'onoffcanvas.js',
  paths.wickedpicker + 'wickedpicker.min.js',
  src.io.js + 'dashboard.js',
  src.io.js + 'IOService.js',
], dest.io.js + 'io-babel-dashboard.min.js');

mix.scripts([
  paths.sweetalert2 + 'sweetalert2.min.js',
  src.base.js + 'defaults/def-sweetalert2.js',
], dest.io.js + 'io-dashboard.min.js');





}//end IO.assets






/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    ██╗    ██╗    ███████╗    ██████╗     ██████╗      █████╗      ██████╗    ██╗  ██╗
    ██║    ██║    ██╔════╝    ██╔══██╗    ██╔══██╗    ██╔══██╗    ██╔════╝    ██║ ██╔╝
    ██║ █╗ ██║    █████╗      ██████╔╝    ██████╔╝    ███████║    ██║         █████╔╝ 
    ██║███╗██║    ██╔══╝      ██╔══██╗    ██╔═══╝     ██╔══██║    ██║         ██╔═██╗ 
    ╚███╔███╔╝    ███████╗    ██████╔╝    ██║         ██║  ██║    ╚██████╗    ██║  ██╗
     ╚══╝╚══╝     ╚══════╝    ╚═════╝     ╚═╝         ╚═╝  ╚═╝     ╚═════╝    ╚═╝  ╚═╝
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

mix.webpackConfig({ plugins: WEBPACK_PLUGINS });


