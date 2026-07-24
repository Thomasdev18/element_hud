if GetResourceState('qb-core') ~= 'started'
    or GetResourceState('qbx_core') == 'started'
then
    return {}
end

lib.print.info('Loading QB bridge')

local QBCore = exports['qb-core']:GetCoreObject()
local Bridge = {}

function Bridge.GetPlayerData()
    return QBCore.Functions.GetPlayerData() or {}
end

return Bridge
