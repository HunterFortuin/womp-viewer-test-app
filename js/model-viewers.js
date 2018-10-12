var scene;
$(document).ready(function () {
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

		controls.handleResize();
		controls.update();
		renderer.render(scene, camera);
	}

	var redraw = true;

	function animate() {
		requestAnimationFrame(animate);

		controls.update();
		if (redraw)
			renderer.render(scene, camera);
		redraw = false;
	}

	var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 5;

	var controls = new THREE.TrackballControls(camera);
	controls.rotateSpeed = 10.0;
	controls.zoomSpeed = 1.5;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [65, 83, 68];
	controls.addEventListener('change', function () {
		redraw = true;
	});

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xfffff0);
	scene.fog = new THREE.Fog(0x050505, 2000, 3500);
	scene.add(new THREE.AmbientLight(0x444444));


	var light1 = new THREE.DirectionalLight(0xffffff, 1.0);
	light1.position.set(1, 1, -1);
	scene.add(light1);

	var light2 = new THREE.DirectionalLight(0xffffff, 1.0);
	light2.position.set(-1, -1, 1);
	scene.add(light2);

	var renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(scene.fog.color);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	var viewer = document.getElementById('js-viewer-container');
	viewer.appendChild(renderer.domElement);

	var model = viewer.dataset.link;

	/* An appropriate material can be used as a fourth arg for the NexusObject constructor

	 var texture = new THREE.DataTexture( new Uint8Array([1, 1, 1]), 1, 1, THREE.RGBFormat );
	 texture.needsUpdate = true;
	 var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map: texture } );
	 */


	function onNexusLoad() {
		var s = 1 / nexus_obj.geometry.boundingSphere.radius;
		var p = nexus_obj.geometry.boundingBox.getCenter().negate();
		nexus_obj.position.set(p.x * s, p.y * s, p.y * s); //.set(p.x, p.y, p.z); // = p; //.set(p.x, p.y, p.z);
		nexus_obj.scale.set(s, s, s);
		redraw = true;

		console.log(nexus_obj);
		//
		// var geometry = nexus_obj.geometry;
		//
		// var material = new THREE.MeshStandardMaterial({color: 0xffffff});
		//
		// if (geometry instanceof THREE.BufferGeometry) {
		// 	geometry = new THREE.Geometry().fromBufferGeometry(geometry);
		// }
		//
		// var mesh = new THREE.Mesh(geometry, material);
		// mesh.castShadow = true;
		// mesh.receiveShadow = true;
		// //mesh.geometry.mergeVertices();
		// mesh.geometry.computeVertexNormals();
		// scene.add(mesh);
	}

	var nexus_obj = new NexusObject(model, onNexusLoad, function () {
		redraw = true;
	}, renderer, new THREE.MeshStandardMaterial({color: 0xffffff}));

	//console.log(nexus_obj);



	scene.add(nexus_obj);

	window.addEventListener('resize', onWindowResize, false);

	animate();
});
