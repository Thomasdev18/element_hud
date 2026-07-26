if GetResourceState('es_extended') ~= 'started' then
    return {}
end

lib.print.info('Loading ESX bridge')

local ESX = exports.es_extended:getSharedObject()
local Bridge = {}
local playerData = ESX.GetPlayerData() or {}

RegisterNetEvent('esx:playerLoaded', function(xPlayer)
    if source == '' or source == 0 or type(xPlayer) ~= 'table' then return end

    playerData = xPlayer
end)

RegisterNetEvent('esx:onPlayerLogout', function()
    if source == '' or source == 0 then return end

    playerData = {}
end)

AddEventHandler('esx:setPlayerData', function(key, value)
    if GetInvokingResource() ~= 'es_extended' then return end

    playerData[key] = value
end)

local needs = { hunger = 100, thirst = 100 }

AddEventHandler('esx_status:onTick', function(status)
    for i = 1, #status do
        local entry = status[i]

        if needs[entry.name] ~= nil and type(entry.percent) == 'number' then
            needs[entry.name] = math.floor(entry.percent + 0.5)
        end
    end
end)

function Bridge.GetPlayerData()
    if next(playerData) == nil then return {} end

    local metadata = playerData.metadata or {}
    metadata.hunger = needs.hunger
    metadata.thirst = needs.thirst
    playerData.metadata = metadata

    return playerData
end

return Bridge
