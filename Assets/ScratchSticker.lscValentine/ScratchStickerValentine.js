// ScratchSticker.js
//
// Version 1.0.0
//
//

//@input Asset.Texture sticker
//@input vec2 center = {0.5, 0.5}
//@input float size = 1
//@input float rotation = 0
//@input float strokeWeight = 0.04
//@input string blockId
//@input Asset.Material finalMat
//@input Asset.ObjectPrefab prefab

var eventModule = require("./Event Module 101");

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

const inputs = {
    sticker: script.sticker,
    center: script.center,
    size: script.size,
    rotation: script.rotation
}

let turnOffClearMask = 0;
let interact, outputSt, stickerImage, strokeSo, rotationSo;
let shaderPrevPos;
let scratchOffCount = 0, totalScratchDistance = 0;
let paintMaskTex, scratchedOffTex, finalStickerTex;
let scratchStartSent = false;

function init() {
    const thisSo = script.getSceneObject();
    const parentCam = getParentCamera(thisSo);
    if (!parentCam) {
        print("ScrachSticker CC needs to be under an orthographic camera");
        return;
    }
    const parentRO = parentCam.renderOrder;
    const prefabRoot = script.prefab.instantiate(thisSo);
    prefabRoot.layer = thisSo.layer;

    // Find cameras
    rotationSo = getObjectByName(prefabRoot, "Device Rotation");
    const strokeCam = getCamera(prefabRoot, "Stroke Camera");
    const scratchCam = getCamera(prefabRoot, "Scratch Camera");
    const paintMaskCam = getCamera(prefabRoot, "Paint Mask Camera");
    const stickerCam = getCamera(prefabRoot, "Sticker Camera");

    // Fix render layers
    uniqueRendering(strokeCam.so, parentRO-4);
    uniqueRendering(scratchCam.so, parentRO-3);
    uniqueRendering(paintMaskCam.so, parentRO-2);
    uniqueRendering(stickerCam.so, parentRO-1);

    // set render targets
    const rts = createRenderTargets();
    strokeCam.cam.renderTarget = rts.stroke;
    scratchCam.cam.renderTarget = rts.scratch;
    paintMaskCam.cam.renderTarget = rts.paintMask;
    stickerCam.cam.renderTarget = rts.sticker;

    // assign new render targets to materials
    const scratchOffSo = getObjectByName(scratchCam.so, "Scratched Material");
    const scratchOffImg = scratchOffSo.getComponent("Component.Image");
    scratchOffImg.mainPass.sticker = rts.sticker;
    scratchOffImg.mainPass.stroke = rts.stroke;

    const addStrokeToMaskSo = getObjectByName(paintMaskCam.so, "Add Stroke To Mask");
    const addStrokeToMaskImg = addStrokeToMaskSo.getComponent("Component.Image");
    addStrokeToMaskImg.mainPass.lastStroke = rts.stroke;
    addStrokeToMaskImg.mainPass.maskTex = rts.paintMask;

    // fetch render targets
    paintMaskTex = paintMaskCam.cam.renderTarget;
    scratchedOffTex = scratchCam.cam.renderTarget;
    finalStickerTex = stickerCam.cam.renderTarget;
    
    // Create output scene object with final image component to render the result
    const outputRoot = global.scene.createSceneObject("Sticker Image");
    outputRoot.setParent(thisSo);
    outputRoot.layer = thisSo.layer;
    outputSt = outputRoot.createComponent("Component.ScreenTransform");
    const finalImage = outputRoot.createComponent("Component.Image");
    const finalMat = script.finalMat.clone();
    finalImage.addMaterial(finalMat);
    finalImage.stretchMode = StretchMode.Stretch;
    finalMat.mainPass.baseTex = finalStickerTex;

    // Create interaction component for scratch interaction
    interact = outputRoot.createComponent("Component.InteractionComponent");

    // Find needed Scene Objects
    const strokeSo = getObjectByName(strokeCam.so, "Line");
    const lineImage = strokeSo.getComponent("Component.Image");
    const lineMat = lineImage.mainMaterial;
    const strokeSt = strokeSo.getComponent("Component.ScreenTransform");
    lineMat.mainPass.aspect = getAspectRatio(strokeSt);
    lineMat.mainPass.thickness = script.strokeWeight;

    const stickerSo = getObjectByName(stickerCam.so, "Sticker");    
    stickerImage = stickerSo.getComponent("Component.Image");

    interact.onTouchStart.add(function(args) {
        shaderPos = shaderPrevPos = touchToShaderPos(args.position);
        lineMat.mainPass.p1 = shaderPos;
        lineMat.mainPass.p2 = shaderPos;
        strokeSo.enabled = true;
    });

    interact.onTouchMove.add(function(args) {
        const shaderPos = touchToShaderPos(args.position);
        lineMat.mainPass.p1 = shaderPrevPos;
        lineMat.mainPass.p2 = shaderPos;
        //const amount = getScratchedOffAmount();
        /*
        if (!scratchStartSent && amount>0) {
            scratchStartSent = true;
            script.onScratchStart.trigger();
        }
        */

        if (!scratchStartSent) {
            scratchStartSent = true;
            script.onScratchStart.trigger();
        }

        scratchOffCount += 10;


        //scratchOffCount += amount;
        /*
        if (scratchOffCount>200) {
            if (!global.deviceInfoSystem.isEditor()) {
                global.hapticFeedbackSystem.hapticFeedback(HapticFeedbackType.TapticEngine);
            }

             // NEW: spawn hearts via the separate controller
            if (global.heartCoinController) {
                // second parameter = how many hearts to spawn per scratch step
            global.heartCoinController.spawnFromScreenPos(args.position, 10);
            }       
            scratchOffCount=0;
        }
        */

        if (scratchOffCount>0) {
            if (!global.deviceInfoSystem.isEditor()) {
                global.hapticFeedbackSystem.hapticFeedback(HapticFeedbackType.TapticEngine);
            }

             // NEW: spawn hearts via the separate controller
            if (global.heartCoinController) {
                // second parameter = how many hearts to spawn per scratch step
            global.heartCoinController.spawnFromScreenPos(args.position, 10);
            }       
            scratchOffCount=0;
        }


       

        shaderPrevPos = shaderPos;
    });

    interact.onTouchEnd.add(function(args) {
        strokeSo.enabled = false;
        if (scratchStartSent) {
            script.onScratchEnd.trigger();
            scratchStartSent = false;
        }
    });

    /****************** API ******************/

    script.setSticker = function(sticker, center, size, rotation) {
        if (!sticker) {
            outputRoot.enabled = false;
            return;
        }

        stickerImage.mainPass.baseTex = sticker;
        outputSt.anchors.setCenter(new vec2(center.x, center.y));
        outputSt.anchors.setSize(new vec2(size, size));
        outputSt.scale = new vec3(1, 1, 1);
        const q = quat.fromEulerAngles(0, 0, -rotation*DEG_TO_RAD);
        outputSt.rotation = q;
    }

    script.resetPaintMask = function() {
        strokeSo.enabled = false;
        stickerImage.mainPass.maskTex = paintMaskTex;
        clearPaintMask();
    }

    script.setScratchEnabled = function(en) {
        interact.enabled = en;
    }

    script.onScratchStart = new eventModule.EventWrapper();
    script.onScratchEnd = new eventModule.EventWrapper();

    bindProperty("sticker", () => { script.setSticker(inputs.sticker, inputs.center, inputs.size, inputs.rotation); });
    bindProperty("center", () => { script.setSticker(inputs.sticker, inputs.center, inputs.size, inputs.rotation); });
    bindProperty("size", () => { script.setSticker(inputs.sticker, inputs.center, inputs.size, inputs.rotation); });
    bindProperty("rotation", () => { script.setSticker(inputs.sticker, inputs.center, inputs.size, inputs.rotation); });

    /*****************************************/

    script.resetPaintMask();
    script.setSticker(script.sticker, script.center, script.size, script.rotation);
    script.createEvent("UpdateEvent").bind(update);

    script.createEvent("OnStartEvent").bind(() => {
        if (global.EasyLens && global.EasyLens.VisualEdit) {
            const gizmo = global.EasyLens.VisualEdit.createScreenTransformGizmo(script.blockId, "sticker", outputRoot, {uniformScale: true});
            gizmo.onChange = (st) => {
                const center = st.anchors.getCenter();
                const size = inputs.size*st.scale.x;
                const rotation = normalizeAngle(-st.rotation.toEulerAngles().z*RAD_TO_DEG);
                global.EasyLens.VisualEdit.updateInputValue(script.blockId, "center", center);
                global.EasyLens.VisualEdit.updateInputValue(script.blockId, "size", size);
                global.EasyLens.VisualEdit.updateInputValue(script.blockId, "rotation", rotation);
            }
        }
    });
}

function update() {
    // stop mask clear
    if (turnOffClearMask>0) {
        turnOffClearMask--;
        if (turnOffClearMask<=0) {
            paintMaskTex.control.clearColorOption = ClearColorOption.None;
        }
    }
    
    // Apply device rotation to sticker effect
    const deviceRot = rotationSo.getTransform().getLocalRotation();
    stickerImage.mainPass.rotation = new vec2(deviceRot.x, deviceRot.y);
}

function createRenderTargets() {
    const w = 768;
    const h = 768;

    const strokeRT = global.scene.createRenderTargetTexture();
    strokeRT.control.useScreenResolution = false;
    strokeRT.control.resolution = new vec2(w,h);
    strokeRT.clearDepthEnabled = false;
	strokeRT.antialiasingMode = RenderTargetProvider.AntialiasingMode.Disabled;
    strokeRT.control.clearColorOption = ClearColorOption.CustomColor;
    strokeRT.control.clearColor = new vec4(0,0,0,1);

    const scratchOffRT = global.scene.createRenderTargetTexture();
    scratchOffRT.control.useScreenResolution = false;
    scratchOffRT.control.resolution = new vec2(64, 64);
    scratchOffRT.control.clearColorOption = ClearColorOption.CustomColor;
    scratchOffRT.control.clearColor = new vec4(0,0,0,1);
	scratchOffRT.antialiasingMode = RenderTargetProvider.AntialiasingMode.Disabled;

    const paintMaskRT = global.scene.createRenderTargetTexture();
    paintMaskRT.control.useScreenResolution = false;
    paintMaskRT.control.resolution = new vec2(w,h);
    paintMaskRT.control.clearColorOption = ClearColorOption.None;
	paintMaskRT.antialiasingMode = RenderTargetProvider.AntialiasingMode.Disabled;

    const stickerRT = global.scene.createRenderTargetTexture();
    stickerRT.control.useScreenResolution = false;
    stickerRT.control.resolution = new vec2(w,h);
    stickerRT.control.clearColorOption = ClearColorOption.CustomColor;
    stickerRT.control.clearColor = new vec4(0,0,0,0);
	stickerRT.antialiasingMode = RenderTargetProvider.AntialiasingMode.Disabled;

    return {
        stroke: strokeRT,
        scratch: scratchOffRT,
        paintMask: paintMaskRT,
        sticker: stickerRT
    };
}

function getCamera(root, name) {
    const so = getObjectByName(root, name);
    const cam = so.getComponent("Camera");
    return {
        so: so,
        cam: cam
    };
}

function getAspectRatio(st) {
    const tl = st.localPointToWorldPoint(new vec2(-1,1));
    const br = st.localPointToWorldPoint(new vec2(1, -1));
    return (br.x-tl.x) / (tl.y-br.y); 
}

function getScratchedOffAmount() {
    if (!(scratchedOffTex.control.getLoadStatus() == LoadStatus.Loaded)) {
        return 0;
    }

    const tex = ProceduralTextureProvider.createFromTexture(scratchedOffTex);
    const width = scratchedOffTex.getWidth();
    const height = scratchedOffTex.getHeight();
    const dataSize = width*height*4;
    const data = new Uint8Array(dataSize);
    tex.control.getPixels(0, 0, width, height, data);

    let count = 0;
    for (let i=0; i<dataSize; i+=4) {
        count += data[i];
    }
    return count;
}

function touchToShaderPos(pos) {
    const lpos = outputSt.screenPointToLocalPoint(pos);
    return new vec2(0.5+0.5*lpos.x, 0.5+0.5*lpos.y);
}

function clearPaintMask() {
    paintMaskTex.control.clearColor = new vec4(1,1,1,1);
    paintMaskTex.control.clearColorOption = ClearColorOption.CustomColor;
    turnOffClearMask = 2;    
}

/************************************/
/* Helpers
/************************************/

function normalizeAngle(ang) {
    while (ang<0) {
        ang+=360;
    }
    while (ang>360) {
        ang-=360;
    }
    return ang;
}

function uniqueRendering(root, renderOrder) {
    setUniqueRenderLayer(root);
    duplicateMaterials(root);

    if (renderOrder) {
        // set render order    
        const cam = root.getComponent("Component.Camera");
        if (!cam) {
            return;
        }
        cam.renderOrder = renderOrder;   
    }
}

function duplicateMaterials(root) {
    if (!root) {
        return;
    }
    
    forEachChild(root, (so) => {
        const images = so.getComponents("Component.Image");
        for (const i in images) {
            const materials = images[i].materials;
            const newMaterials = [];
            for (const j in materials) {
                newMaterials.push(materials[j].clone());
            }
            images[i].materials = newMaterials;
        }
    })
}

// Set unique render layer for heirarchy with a camera on top
function setUniqueRenderLayer(root) {
    if (!root) {
        return;
    }
    
    const cam = root.getComponent("Component.Camera");
    if (!cam) {
        return;
    }
    
    const layer = LayerSet.makeUnique();
    cam.renderLayer = layer;

    // set the new render layer on the entire hierarchy
    forEachChild(root, (so) => {
        so.layer = layer;
    });
}

// Get the parent camera of the so
function getParentCamera(so) {
    if (!so) {
        return null;
    }
    
    const cam = so.getComponent("Component.Camera");
    if (cam) {
        return cam;
    }
    
    return getParentCamera(so.getParent());
}

// Apply a function on entire hierarchy
function forEachChild(so, func) {
    func(so);
    
    for (let i=0; i<so.getChildrenCount(); i++) {
        forEachChild(so.getChild(i), func);
    }
}

// Finds an object by name within a parent scene object's hierarchy
function getObjectByName(obj, name) {
    if (!obj) {
        return null;
    }

    if (obj.name == name) {
        return obj;
    }

    for (var i=0; i<obj.getChildrenCount(); i++) {
        const c = getObjectByName(obj.getChild(i), name);
        if (c) {
            return c;
        }
    }

    return null;
}

function bindProperty(inputName, set) {
    Object.defineProperty(script, inputName, {
        set: function(val) {
            inputs[inputName] = val;
            if (set) {
                set(val);
            }
        },
        get: function(){
            return inputs[inputName];
        }
    });
}

try {
    init();
} catch(e) {
    print("Scratchable Sticker: "+e);
    print(e.stack);
}
