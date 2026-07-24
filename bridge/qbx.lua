if GetResourceState('qbx_core') ~= 'started' then
    return {}
end

lib.print.info('Loading QBX bridge')

local Bridge = {}

function Bridge.GetPlayerData()
    return exports.qbx_core:GetPlayerData() or {}
end

return Bridge
