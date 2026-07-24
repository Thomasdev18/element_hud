local config = require('configs.config')

if not config.lookAtPlayerWhileSpeaking.enabled then return end

-- variables
local lastTargetPlayer, lastDist = nil, 100

local function debugTxt(...)
    if not config.debug then return end

    lib.print.info(...)
end

local function playerDist(ped1, ped2)
    local coords1 = GetEntityCoords(ped1)
    local coords2 = GetEntityCoords(ped2)
    local dist = #(coords1 - coords2)

    return dist
end

CreateThread(function()
    local sleep = 1000
    while true do
        local playerPed = cache.ped
        local coords = GetEntityCoords(playerPed)
        local nearbyPlayers = lib.getNearbyPlayers(coords, config.distance, false)
        if not nearbyPlayers or not next(nearbyPlayers) then
            sleep = 1000
        else
            sleep = 500

            for i = 1, #nearbyPlayers do
                local targetPed = nearbyPlayers[i].ped
                local targetPlayer = nearbyPlayers[i].id

                if NetworkIsPlayerActive(targetPlayer) and MumbleIsPlayerTalking(targetPlayer) and not IsPedShooting(playerPed) then
                    local dist = playerDist(playerPed, targetPed)

                    if (dist < lastDist) and (targetPlayer ~= lastTargetPlayer) then
                        TaskLookAtEntity(playerPed, targetPed, -1, 2048, 3)
                        lastDist = dist
                        lastTargetPlayer = targetPlayer

                        debugTxt(('Looking at %s'):format(GetPlayerName(targetPlayer)))
                    end
                else
                    if lastTargetPlayer then
                        TaskClearLookAt(playerPed)
                        lastDist = 100
                        lastTargetPlayer = nil

                        debugTxt('Reset Head')
                    end
                end
            end
        end

        Wait(sleep)
    end
end)
