//@input vec4 paddings = {0,0,0,0} {"hint" : "Left Right Bottom Top"}
//@input vec2 cellSize = {1,1} {"hint": "In world units"}
//@input vec2 spacing = {0,0} {"hint": "In world units"}
//@input string startCorner = "TOP_LEFT" {"widget":"combobox", "values": [{"label" : "Top Left", "value" : "TOP_LEFT"}, {"label" : "Top Right", "value" : "TOP_RIGHT"}, {"label" : "Bottom Right", "value" : "BOTTOM_RIGHT"}, {"label" : "Bottom Left", "value" : "BOTTOM_LEFT"}]}
//@input int startAxis = 0 {"widget":"combobox", "values": [{"label" : "X", "value" : 0}, {"label" : "Y", "value" : 1}]}
//@input string childAlignment = "MIDDLE_CENTER" {"widget":"combobox", "values": [{"label" : "Top Left", "value" : "TOP_LEFT"}, {"label" : "Top Center", "value" : "TOP_CENTER"}, {"label" : "Top Right", "value" : "TOP_RIGHT"}, {"label" : "Middle Right", "value" : "MIDDLE_RIGHT"}, {"label" : "Bottom Right", "value" : "BOTTOM_RIGHT"}, {"label" : "Bottom Center", "value" : "BOTTOM_CENTER"}, {"label" : "Bottom Left", "value" : "BOTTOM_LEFT"}, {"label" : "Middle Left", "value" : "MIDDLE_LEFT"}, {"label" : "Middle Center", "value" : "MIDDLE_CENTER"}]}
//@input int constraint = 0 {"widget":"combobox", "values": [{"label" : "Flexible", "value" : 0}, {"label" : "Fixed column count", "value" : 1}, {"label" : "Fixed row count", "value" : 2}]}
//@input int columns = 5 {"showIf": "constraint", "showIfValue" : "1"}
//@input int rows = 2 {"showIf": "constraint", "showIfValue" : "2"}
//@ui {"widget":"separator"}
//@input bool additional {"label":"Additional Settings"}
//@input  bool initializeOnStart = true  {"hint" : "Disable if you don't need to initialize it later from another script", "showIf" : "additional"}
//@input bool resizeParent  {"hint" : "Enable if you want to resize parent around children", "showIf" : "additional"}
//@input bool ignoreDisabled {"hint" : "Exclude disabled children objects from the grid", "showIf" : "additional"}
script.createEvent("OnStartEvent").bind(function() { require("LayoutGrid_wrapped")(script)})