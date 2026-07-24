
local config = require('configs.config')

if not config.features.waypointHud then return end

CreateThread(function()
    ReplaceHudColourWithRgba(config.features.waypointHud.color.r, config.features.waypointHud.color.g, config.features.waypointHud.color.b, config.features.waypointHud.color.a, 255)
end)
