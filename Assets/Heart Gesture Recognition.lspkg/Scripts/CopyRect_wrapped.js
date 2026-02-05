function scriptBody(script){ 
// -----JS CODE-----
// TextureCrop.js
// Version: 0.1.0
// Event: On Update
// Description: Apply anchors to crop texture

/** @type {Texture} */
var textureInput = script.textureInput;

var obj = script.getSceneObject();
var rect = obj.getComponent("Component.ScreenTransform").anchors;

if(!script.textureInput){
    return;
}
script.textureInput.control.cropRect = rect;

 }; module.exports = scriptBody;