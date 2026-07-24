local Bridge

if GetResourceState('qbx_core') == 'started' then
    Bridge = require 'bridge.qbx'
elseif GetResourceState('qb-core') == 'started' then
    Bridge = require 'bridge.qb'
else
    lib.print.warn('No supported framework found')
    Bridge = {}
end

Bridge.GetPlayerData = Bridge.GetPlayerData or function()
    return {}
end

return Bridge
