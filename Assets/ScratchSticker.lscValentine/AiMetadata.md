# Scratch Sticker

<!-- This is a comment -->
<!-- Version 1.0.0 -->
<!-- You can add decorations like **bold** and `italics` -->

- Description: This component adds a scratchable sticker to the screen. The sticker can be scratched off by the user.
<!--
Render Layer: [3D Face | 2D Background | 3D Background | 2D Pre Background | 3D UI | 2D UI | 2D Foreground | 3D Foreground]
-->
- Render Layer: 2D Foreground

## Composition Notes
<!-- These notes are used by the system to determine component inclusion in a lens. -->
The Scratch Sticker component overlays the composition with a scratch-off sticker. The user can scratch off the sticker with touch interaction. Multiple blocks can be added to a lens to provide multiple scratch stickers. This block provides its own touch interaction, no need to the TouchEvents block for the scratch interaction.

## Design Notes
<!-- These notes influence how the system populates the component's inputs. Please provide some examples of input values and explain how they affect the component's behavior. -->

## Coding Notes
<!-- These notes are for the coding agent, describe how to use the API of your component (inputs/functions/events) for different scenarios -->
When its desired to be able to scratch only one sticker (first one touched), in a lens that have multiple, use the onScratchStart event to know which sticker was scratched first, then use setScrachEnabled on the other stickers. Do not re-enable the other stickers after onScratchEnd event because the user will be able to scrach them too.

## Inputs

### sticker
- Description: The sticker image
<!-- 
Type: [string | int | float | boolean | vec2 | vec3 | vec4 | Asset.Texture | Asset.ObjectPrefab]
Asset.ObjectPrefab is for 3D object generators, Asset.Texture is for image generators
-->
- Type: Asset.Texture
<!--
Asset Provider: [ Sticker | Sprite | Background | 3D Object ]
-->
- Asset Provider: Sticker
<!-- Asset Style: Optional. Can be added when using Asset Provider to guide the style of the asset -->
- Asset Style: Illustration, only black and white, thick outlines, high contrast.
<!-- Default is not needed for Asset Provider input -->

### center
- Description: The center of the sticker on the screen. [-1 - 1, -1 - 1] left to right, bottom to top. [0,0] is the center of the screen, [-1,-1] is the bottom left corner, [1,1] is top right.
- Type: vec2
- Default: [0,0]

### size
- Description: The size of the sticker in the range 0 to 2. 2 fills the whole screen, 1 is half the screen. Use 1 for small sticker and above 1 for a large sticker.
- Type: float
- Default: 1

### rotation
- Description: The rotation angle of the sticker in degrees (0 - 360).
- Type: float
- Default: 0

### strokeWeight
- Description: The stroke width of the scratching effect. The higher the weight it will be easier to scratch the sticker. Keep the default value (0.05) for large sticker sizes (1 < size < 2), increase to 0.08 for smaller stickers (size < 0.8). 
- Type: float
- Default: 0.05

## Functions

### setSticker(sticker: Asset.Texture, center: vec2, size: float, rotation: float) : void
- Description: sets new sticker, change its center, size, or rotation. This function should be used to set a new sticker in run-time, or change its position, size, or orientation in runtime. When doing so, the controller can change only one parameter by taking the other parameters from the component's inputs.
- sticker: The sticker image texture
- center: The center of the sticker on the screen ([x,y] where x and y are in the range of [-1,1])
- size: The size of the sticker in the range of 0-2, 2 fills the whole screen, 1 is half the screen. Don't use values below 0.2.
- rotation: The rotation of the sticker in degrees (0 - 360)

### resetPaintMask(): void
- Description: Clears the "scratching", resets the sticker to its initial state (without any scratch).

<!-- Function with arguments -->
### setScratchEnabled(set: boolean): void
- Description: Set scratch enabled or disabled. The user can't scratch disabled stickers.
- set: whether to enable or disable the scratching.  

## Events

### onScratchStart()
- Description: fires when the user first touches the sticker, when starting to scratch it.

### onScratchEnd()
- Description: fires when the user leaves its touches from the sticker, when a scratch stroke ends.

<!-- Examples are optional -->
## Examples

### Example 1
- Description: Create a scratch sticker of a smiley face.
- Comment: Provides a large smiley face scratch sticker at the center of the screen.

#### Inputs
- sticker: "Sticker illustration of a smiley face, black and white only, bold, thick outlines, high contrast, simple graphic style. Clear contours, playful and iconic design."
- center: [0,0]
- size: 1.4
- rotation: 0
- strokeWeight: 0.05
