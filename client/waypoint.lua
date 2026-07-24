
local config = require('configs.config')

if not config.waypointSettings.enabled then return end

CreateThread(function()
    ReplaceHudColourWithRgba(config.waypointSettings.color.r, config.waypointSettings.color.g, config.waypointSettings.color.b, config.waypointSettings.color.a, 255)
end)
