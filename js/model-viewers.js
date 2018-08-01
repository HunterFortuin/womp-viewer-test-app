$(document).ready(function() {
	initializeModelViewers();
});

var renderViewer;
async function initializeModelViewers() {
	var viewers = $('.js-container');

	if (viewers && viewers.length) {
		$.each(viewers, function(index, viewer) {
			var link = viewer.dataset.link;
			var camera, controls, scene, renderer;
			var mesh; //model to be calculated
			var manager = new THREE.LoadingManager();
			textureLoader = new THREE.TextureLoader();
			textureLoader.setCrossOrigin("anonymous");

			initViewer();

			function initViewer() {
				if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
				scene = new THREE.Scene();

				// configure viewer container
				var width = viewer.offsetWidth / 2
				viewer.style.height = width + "px"; // set height as width
				renderer = new THREE.WebGLRenderer({ antialias: true });
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(viewer.offsetWidth, viewer.offsetHeight);
				viewer.appendChild(renderer.domElement);

				// configure camera
				camera = new THREE.PerspectiveCamera(40, viewer.offsetWidth / viewer.offsetHeight, 1, 1000);
				camera.position.z = 150;

				// configure lights
				var light = new THREE.DirectionalLight(0xffffff);
				light.position.set(5, 5, 10);
				scene.add(light);
				var light = new THREE.DirectionalLight(0xffffff);
				light.position.set(-10, -10, 0);
				scene.add(light);
				var light = new THREE.AmbientLight(0x545159);
				scene.add(light);

				// configure scene background
				scene.background = new THREE.Color( 0xd3d3d3 );;

				// handle resize
				window.addEventListener('resize', onWindowResize, false);

				// load model
				var loader;

				THREE.DRACOLoader.setDecoderPath("./draco_decoder.js");
				THREE.DRACOLoader.setDecoderConfig({type: 'js'});
				var loader = new THREE.DRACOLoader();

				loader.load(link, function(geometry) {
					// Set Up Mesh
					var material = new THREE.MeshLambertMaterial({ color: 0x958D7B });

					if (geometry instanceof THREE.BufferGeometry){
						geometry = new THREE.Geometry().fromBufferGeometry(geometry);
					}

					mesh = new THREE.Mesh(geometry, material);
					mesh.rotation.set(-Math.PI / 2, 0, 0);
					mesh.position.set(geometry.center().x, geometry.center().y, geometry.center().z);

					mesh.geometry.mergeVertices();
					mesh.geometry.computeVertexNormals();

					scene.add(mesh);

					// Re-Position Camera
					geometry.computeBoundingBox();

					var center = geometry.boundingBox.getCenter();
					var size = geometry.boundingBox.getSize();
					var maxDim = Math.max(size.x, size.y, size.z);
					var fov = camera.fov * (Math.PI / 180);
					var cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2)) * 1.25;
					camera.position.set(center.x, center.y, cameraZ);

					// Set far edge
					var minZ = geometry.boundingBox.min.z;
					var cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;
					camera.far = cameraToFarEdge * 3;
					camera.updateProjectionMatrix();

					// set camera to rotate around center of loaded object
					controls.target = center;

					// prevent camera from zooming out far enough to create far plane cutoff
					controls.maxDistance = cameraToFarEdge * 2;

					renderViewer();
				});

				$('.js-container-fullscreen').click(function() {
					if (window.innerHeight == screen.height) {
						document.webkitExitFullscreen();
						onWindowResize();
					} else {
						this.parentNode.webkitRequestFullscreen();
					}
					setTimeout(function() { renderViewer(); }, 700); // re-render after fullscreen for distortion issues
				});
			}
			function onWindowResize() {
				var width = viewer.offsetWidth / 2
				viewer.style.height = width + "px"; // set height as width

				camera.aspect = viewer.offsetWidth / viewer.offsetHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(viewer.offsetWidth, viewer.offsetHeight);
			}
			function onProgress() {}
			function onError() {}
			renderViewer = function() {
				renderer.render(scene, camera);
			}

			// configure controls
			controls = new THREE.OrbitControls(camera, renderer.domElement);
			controls.addEventListener('change', renderViewer);
			controls.enablePan = false;

		});
	}
}
