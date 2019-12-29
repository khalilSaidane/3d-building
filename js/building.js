var THREE = require('three');

var STLLoader = require('three-stl-loader')(THREE);

var $ = require('jquery');

var OrbitControls = require('three-orbitcontrols');

var initializeDomEvents = require('threex-domevents');
var THREEx = {};
initializeDomEvents(THREE, THREEx);

var Humanize = require('humanize-plus')

var container, controls, domEvents, camera, scene, loader;


init();
animate();

function init() {
      container = document.createElement( 'div' );
      document.body.appendChild( container );

      camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
      camera.position.set( 0, 0, 5 );

      cameraTarget = new THREE.Vector3( 0, - 0.25, 0 );

      scene = new THREE.Scene();
      scene.background = new THREE.Color( 'black' );
       scene.fog = new THREE.Fog( 0x72645b, 1, 15 );

      // Parse the json file and loop over calling the function that will load them
      loader = new STLLoader();
      $.getJSON('./data.json', function(buildingDict) {
            for(let buildingElements in buildingDict){
                  for(let i = 0; i < buildingDict[buildingElements].length; i++){
                        var elementInfo = buildingDict[buildingElements][i];
                        loadStl(elementInfo);
                  }
            }
      });

      // renderer
      renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.outputEncoding = THREE.sRGBEncoding;

      renderer.shadowMap.enabled = true;

      container.appendChild( renderer.domElement );
      //

      window.addEventListener( 'resize', onWindowResize, false );

      controls = new OrbitControls( camera, renderer.domElement );
      domEvents = new THREEx.DomEvents(camera, renderer.domElement)
}

// Load objects and affect the actions to them
function loadStl(info) {
      // Load objects
      var material = new THREE.MeshBasicMaterial( { color: '#c7c2be'} );
      var stlUrl = './models/stl/'.concat(info.id,'.stl');
      loader.load( stlUrl, function ( geometry ) {

            var mesh = new THREE.Mesh( geometry, material );
            mesh.scale.set( 0.03, 0.03, 0.03 );
            scene.add( mesh );

            highlightAndDisplayInfo(mesh, info)
      });
}

// Highlight on mouse in and out and display info when clicked
function highlightAndDisplayInfo(mesh,info){
      // High light on mouse in and out
      domEvents.addEventListener(mesh, 'mouseover', function(event) {
            mesh.material.color.set('#fdfdff');
      }, false);
      domEvents.addEventListener(mesh, 'mouseout', function(event) {
            mesh.material.color.set('#c7c2be');
      }, false);

      // Display information in div info on click
      domEvents.addEventListener(mesh, 'click', function(event) {
            // Changing measurements precision and adding commas to cost
            var area = Humanize.formatNumber(info.area,3);
            var volume = Humanize.formatNumber(info.volume,3);
            var length = Humanize.formatNumber(info.length,3);
            var cost_so_far = Humanize.intComma(info.cost_so_far);

            //
            document.getElementById('area').innerHTML ='Area: '.concat(area);
            document.getElementById('volume').innerHTML = 'Volume: '.concat(volume);
            document.getElementById('completeness').innerHTML = 'Completeness: '.concat(info.completeness);
            document.getElementById('cost').innerHTML = 'Cost so far: $'.concat(cost_so_far);
            document.getElementById('name').innerHTML = 'Name: '.concat(info.name);
            document.getElementById('length').innerHTML = 'Length: '.concat(length);
            // In case it's hidden
            $('#info-block').show();
      }, false);
}

function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
      requestAnimationFrame( animate );
      controls.update();
      render();
}

function render() {
      camera.lookAt( cameraTarget );
      renderer.render( scene, camera );
}


