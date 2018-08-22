# Womp Viewer Test App
This app uses Three.JS to render DRACO files in the browser. Just open the index.html file to view a file that's being rendered.

# Smoothing Issues
Line 64 and 65 in the `js/model-viewers.js` are smoothing our models. Commenting them out will change the smoothing behavior. There are three viewers, two of which are commented out in the `index.html` file. Swapping out which one is uncommented and toggling if smoothing is enabled in the JS code will give you the opportunity to see the issues we're running in to.
