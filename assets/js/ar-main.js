var actions = [];


// Create renderer
renderer = new THREE.WebGLRenderer({
  antialias : true,
  alpha: true,
  
  // In order to capture the image being drawn on the canvas
  // https://stackoverflow.com/questions/15558418/how-do-you-save-an-image-from-a-three-js-canvas
  preserveDrawingBuffer: true
});
renderer.setClearColor(new THREE.Color('lightgrey'), 0);
// renderer.setSize( window.innerWidth, window.innerHeight, true);
console.log(window.innerWidth);
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild( renderer.domElement );


// Material
defaultMaterial = new THREE.MeshNormalMaterial({
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide
});

// setup arToolkitSource
arToolkitSource = new THREEx.ArToolkitSource({
  sourceType : 'webcam',
});

function onResize() {
  arToolkitSource.onResizeElement();
  console.log(renderer.domElement)
  arToolkitSource.copyElementSizeTo(renderer.domElement)	;

  if ( arToolkitContext.arController !== null ) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    arToolkitSource.copyElementSizeTo(arToolkitSkepticContext.arController.canvas);	
    arToolkitSource.copyElementSizeTo(arToolkitStudioContext.arController.canvas);	
  }	
}

arToolkitSource.init(function onReady(){
  onResize()
});

// Loader
loader = new THREE.GLTFLoader();

// Scene
scene = new THREE.Scene();

let ambientLight = new THREE.AmbientLight( 0xffffff, 1);
scene.add( ambientLight );

camera = new THREE.Camera();
scene.add(camera);

clock = new THREE.Clock();

// handle resize event
addEventListener('resize', function(){
  onResize()
});


function loadScene(url, options, callback) {
  // setup arToolkitContext
  // create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
    // debug: true,
    detectionMode: 'mono_and_matrix',
    matrixCodeType: '3x3',
    cameraParametersUrl: '/assets/data/camera_para.dat',
  });

  // copy projection matrix to camera when initialization complete
  arToolkitContext.init( function onCompleted(){
    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
    arController = arToolkitContext.arController;
  
    // add listener
    arController.addEventListener('getMarker', function foundVCard(e) {
      if (arController.barcodeMarkers[37].inCurrent) {
        document.querySelector('#vcard').classList.add('visible');
        arController.removeEventListener('getMarker', foundVCard);
      }
    });
  });

  // setup markerRoots
  // build markerControls
  markerRoot = new THREE.Group();
  scene.add(markerRoot);

  let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'barcode', 
    barcodeValue: 37
    // patternUrl: "/assets/markers/hiro.patt",
  })

  // Load a glTF resource
  console.time('Loaded GLTF model');
  loader.load(
    // resource URL
    '/assets/models/pixelHeart/pixelHeart.gltf',

    // called when the resource is loaded
    function ( gltf ) {
      console.timeEnd('Loaded GLTF model');
      console.log(gltf);

      // material
      // gltf.scene.children.forEach(child => {
      //   if (child.isMesh) child.material = defaultMaterial;
      // });

      // animation
      var mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach(function(animation) {
        actions.push (
          mixer.clipAction(animation).play()
        );
      });
      
      markerRoot.add(gltf.scene);
    },

    // called while loading is progressing
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },

    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened while loading model', error );
    }
  );
}
loadScene();



function loadSkepticScene() {

  // setup arToolkitContext
  // create atToolkitContext
  arToolkitSkepticContext = new THREEx.ArToolkitContext({
    // debug: true,
    // detectionMode: 'mono_and_matrix',
    // detectionMode: 'mono',
    cameraParametersUrl: '/assets/data/camera_para.dat',
  });

  // copy projection matrix to camera when initialization complete
  arToolkitSkepticContext.init( function onCompleted(){
    arToolkitSkepticController = arToolkitSkepticContext.arController;
    camera.projectionMatrix.copy( arToolkitSkepticContext.getProjectionMatrix() );
  });

  // setup markerRoots
  // build markerControls
  skepticMarkerRoot = new THREE.Group();
  scene.add(skepticMarkerRoot);

  let markerControls1 = new THREEx.ArMarkerControls(arToolkitSkepticContext, skepticMarkerRoot, {
    // type: 'barcode', 
    // barcodeValue: 39,
    type: 'pattern',
    patternUrl: '/assets/markers/hiro.patt', 
  });

  let geometry1 = new THREE.PlaneBufferGeometry(0,0, 1,1);
  let video = document.createElement( 'video' );
  video.innerHTML = '<source src="/assets/textures/skepticDrool/skepticDrool.mp4" type="video/mp4">';
  video.setAttribute('autoplay', true);
  video.setAttribute('loop', true);
  video.setAttribute('crossorigin', 'anonymous');
  
  let texture = new THREE.VideoTexture( video );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  let material1 = new THREE.MeshBasicMaterial( { map: texture } );
  
  var mesh1 = new THREE.Mesh( geometry1, material1 );
  mesh1.rotation.x = -Math.PI/2;
  
  skepticMarkerRoot.add(mesh1);
};

loadSkepticScene();





function loadStudioScene(url, options, callback) {
  // setup arToolkitContext
  // create atToolkitContext
  arToolkitStudioContext = new THREEx.ArToolkitContext({
    // debug: true,
    detectionMode: 'mono_and_matrix',
    matrixCodeType: '3x3',
    cameraParametersUrl: '/assets/data/camera_para.dat',
  });

  // copy projection matrix to camera when initialization complete
  arToolkitStudioContext.init( function onCompleted(){
    camera.projectionMatrix.copy( arToolkitStudioContext.getProjectionMatrix() );
  });

  // setup markerRoots
  // build markerControls
  markerStudioRoot = new THREE.Group();
  scene.add(markerStudioRoot);

  let markerControls1 = new THREEx.ArMarkerControls(arToolkitStudioContext, markerStudioRoot, {
    type: 'barcode', 
    barcodeValue: 40
  })

  // Load a glTF resource
  console.time('Loaded GLTF model');
  loader.load(
    // resource URL
    '/assets/models/iuStudio/iuStudio.gltf',

    // called when the resource is loaded
    function ( gltf ) {
      console.timeEnd('Loaded GLTF model');
      console.log(gltf);

      // material
      // gltf.scene.children.forEach(child => {
      //   if (child.isMesh) child.material = defaultMaterial;
      // });

      // animation
      var mixer = new THREE.AnimationMixer(gltf.scene);

      var walls = gltf.scene.getObjectByName("Walls");
      console.log(walls);
      gltf.scene.getObjectByName("Walls").children.forEach(child => child.material = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      }));
      gltf.scene.position.set(0.9,0,-5.4);
      gltf.animations.forEach(function(animation) {
        actions.push (
          mixer.clipAction(animation).play()
        );
      });
      
      markerStudioRoot.add(gltf.scene);
    },

    // called while loading is progressing
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },

    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened while loading model', error );
    }
  );
}
loadStudioScene();





// Render magic
function update() {
  if (actions.length) {
    actions.forEach(action => action.getMixer().update(clock.getDelta()));
  }
  if ( arToolkitSource.ready !== false )
  arToolkitContext.update( arToolkitSource.domElement );
  arToolkitSkepticContext.update( arToolkitSource.domElement );
  arToolkitStudioContext.update( arToolkitSource.domElement );

}

function render() {
  renderer.render( scene, camera );
}

function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}

animate();



























function ScreenCapture() {
  var sourceCanvas = arToolkitContext.arController.ctx.canvas;
  var drawingCanvas = renderer.domElement;
  
  mergeImages([sourceCanvas.toDataURL("image/png"), drawingCanvas.toDataURL("image/png")])
    .then(b64 => document.getElementById('screencapturepreview').src = b64);

  // var preview = document.getElementById('screencapturepreview');
  // preview.src=mergedCanvas.toDataURL("image/png");
  

  // Save image to device
  // var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
  // location.href=image; // it will save locally
}
