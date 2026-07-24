local config = require('configs.config')
local bridge = require('bridge.bridge')

local SPEED_MULTIPLIER = config.useMPH and 2.23694 or 3.6
local SPEED_UNIT = config.useMPH and 'MPH' or 'KMT'
local HUD_UPDATE_INTERVAL = 250
local VEHICLE_UPDATE_INTERVAL = 250
local HELICOPTER_UPDATE_INTERVAL = 250
local HELICOPTER_VEHICLE_CLASS = 15
local HUD_SETTINGS_KEY = 'hudSettings'

local DEFAULT_HUD_SETTINGS = config.hudSettings.defaultHUDSettings

local VALID_PLAYER_STATUS_INDICATORS = {
    square = true,
    bar = true,
    circle = true,
    segmented = true,
    ['segmented-bar'] = true,
}

local VALID_PLAYER_HUD_POSITIONS = {
    ['bottom-left'] = true,
    ['top-left'] = true,
    ['top-right'] = true,
    ['bottom-center'] = true,
}

local VALID_VEHICLE_HUD_STYLES = {
    bars = true,
    speedometer = true,
    ['speedometer-column'] = true,
}

local VALID_COMPASS_STYLES = {
    default = true,
    compact = true,
}

local VALID_COMPASS_POSITIONS = {
    ['top-center'] = true,
    ['bottom-center'] = true,
}

local cachedPlayerStats = {}
local cachedVehicleStats = {}
local cachedRoute = {}
local playerState = LocalPlayer.state
local vehicleLoopRunning = false
local seatbeltStarted = GetResourceState('qbx_seatbelt') == 'started'
local vehicleData = {
    open = false,
    isHelicopter = false,
    nitroActive = false,
    speed = 0
}

local hudState = {
    isOpen = false,
    isInvOpen = false,
    cinematicBarsActive = false,
    settingsOpen = false,
    hudDisabled = false
}

local function shouldShowHud()
    return hudState.isOpen and not hudState.hudDisabled and not hudState.cinematicBarsActive and not hudState.isInvOpen and not IsPauseMenuActive()
end

local function shouldShowCompass()
    if hudState.hudDisabled or hudState.cinematicBarsActive or hudState.isInvOpen or IsPauseMenuActive() then
        return false
    end
    if cache.vehicle and GetIsVehicleEngineRunning(cache.vehicle) then
        return true
    end
    return false
end

local function sendNUIMessage(action, data)
    SendNUIMessage({
        action = action,
        data = data
    })
end

local function updatePlayerHud(data)
    if hudState.hudDisabled then
        sendNUIMessage("UPDATE_STATS", { open = false })
        return
    end

    local shouldUpdate = false
    for k, v in pairs(data) do
        if cachedPlayerStats[k] ~= v then
            cachedPlayerStats[k] = v
            shouldUpdate = true
        end
    end
    if shouldUpdate then
        sendNUIMessage("UPDATE_STATS", cachedPlayerStats)
    end
end

local function updateVehicleHud(data)
    local changes = nil

    for key, value in pairs(data) do
        if cachedVehicleStats[key] ~= value then
            cachedVehicleStats[key] = value

            changes = changes or {}
            changes[key] = value
        end
    end

    if changes then
        sendNUIMessage('UPDATE_VEHICLE', changes)
    end
end

local function updateCompass(data)
    if hudState.hudDisabled then
        sendNUIMessage("UPDATE_COMPASS", { open = false })
        return
    end

    local shouldUpdate = false
    for k, v in pairs(data) do
        if cachedRoute[k] ~= v then
            cachedRoute[k] = v
            shouldUpdate = true
        end
    end
    if shouldUpdate then
        sendNUIMessage("UPDATE_COMPASS", cachedRoute)
    end
end

local function toggleMinimap(show)
    if hudState.hudDisabled then show = false end
    if show then
        sendNUIMessage("MINIMAP_SHOW", true)
    else
        sendNUIMessage("MINIMAP_HIDE", true)
    end
    DisplayRadar(show)
end

local function toggleSettings(show)
    if show and hudState.settingsOpen then return end
    sendNUIMessage("TOGGLE_SETTINGS", show)
    SetNuiFocus(show, show)
    hudState.settingsOpen = show
end

local function toggleHud(show)
    hudState.isOpen = show and not hudState.hudDisabled
    updatePlayerHud({ open = hudState.isOpen })

    if cache.vehicle then
        local vehShow = hudState.isOpen and GetIsVehicleEngineRunning(cache.vehicle)
        updateVehicleHud({ open = vehShow })
        toggleMinimap(vehShow)
        if vehShow then
            UpdateRoute()
        end
    end

    if not cache.vehicle and hudState.isOpen then
        UpdateRoute()
    end

    if not hudState.isOpen then
        toggleMinimap(false)
        updateCompass({ open = false })
    end
end

local function hudOn()
    toggleHud(true)
end

local function hudOff()
    toggleHud(false)
end

local function getPlayerStats()
    local stamina = 100 - GetPlayerSprintStaminaRemaining(cache.playerId)
    local oxygen = IsPedSwimmingUnderWater(cache.ped) and (GetPlayerUnderwaterTimeRemaining(cache.playerId) * 10) or 100
    local playerMode = IsEntityInWater(cache.ped) and 'water' or 'land'
    local playerData = bridge.GetPlayerData()

    if not playerData or not playerData.metadata then
        lib.print.info("Waiting for player data to load")
        return nil
    end

    return {
        health = math.max(0, math.ceil(GetEntityHealth(cache.ped) - 100)),
        armor = math.ceil(GetPedArmour(cache.ped)),
        thirst = playerData.metadata.thirst or 100,
        hunger = playerData.metadata.hunger or 100,
        stress = LocalPlayer.state.stress or 0,
        voice = playerState.proximity.distance or 0,
        talking = GetPlayerVoiceMethod(cache.playerId),
        stamina = playerMode == 'land' and stamina or oxygen,
    }
end

local function updatePlayerStats()
    if not shouldShowHud() then
        updatePlayerHud({ open = false })
        return
    end

    local stats = getPlayerStats()
    if not stats then return end

    updatePlayerHud({
        open = hudState.isOpen,
        health = stats.health,
        armor = stats.armor,
        hunger = stats.hunger,
        thirst = stats.thirst,
        stress = stats.stress,
        voice = stats.voice,
        talking = stats.talking,
        stamina = stats.stamina,
    })
end

local function getVehicleStats()
    if not cache.vehicle then return nil end

    local vehicle = cache.vehicle
    local plate = GetVehicleNumberPlateText(vehicle)
    local highGear = GetVehicleHighGear(vehicle)
    local currentGear = GetVehicleCurrentGear(vehicle)
    local engineState = GetIsVehicleEngineRunning(vehicle)
    local isHelicopter = GetVehicleClass(vehicle) == HELICOPTER_VEHICLE_CLASS

    local gearString = "N"
    if not engineState then
        gearString = ""
    elseif currentGear == 0 and GetEntitySpeed(vehicle) > 0 then
        gearString = "R"
    elseif currentGear == 1 and GetEntitySpeed(vehicle) < 0.1 and engineState then
        gearString = "N"
    elseif currentGear == 1 then
        gearString = "1"
    elseif currentGear > 1 then
        gearString = tostring(math.floor(currentGear))
    end

    local speed = math.floor(GetEntitySpeed(vehicle) * SPEED_MULTIPLIER)
    local rpm = math.ceil(CovertRPM(GetVehicleCurrentRpm(vehicle)))
    local fuel = math.ceil(GetVehicleFuelLevel(vehicle))
    local engineHealth = math.ceil(GetVehicleEngineHealth(vehicle) / 10)
    local nos = Entity(cache.vehicle).state.nitrous
    local pitch = isHelicopter and GetEntityPitch(vehicle) or 0
    local roll = isHelicopter and GetEntityRoll(vehicle) or 0
    local altitude = isHelicopter and GetEntityHeightAboveGround(vehicle) or 0

    local hasHarness = false
    if seatbeltStarted then
        hasHarness = playerState.harness or false
    end

    return {
        isHelicopter = isHelicopter,
        speed = speed,
        altitude = altitude,
        pitch = pitch,
        roll = roll,
        rpm = rpm,
        fuel = fuel,
        engineHealth = engineHealth,
        gears = highGear,
        currentGear = gearString,
        seatbelt = playerState.seatbelt or false,
        harness = hasHarness,
        nos = nos
    }
end

local function updateVehicleStats()
    if not shouldShowHud() or not cache.vehicle then
        updateVehicleHud({ open = false })
        toggleMinimap(false)
        return
    end

    local stats = getVehicleStats()
    if not stats then return end

    vehicleData.speed = stats.speed
    vehicleData.isHelicopter = stats.isHelicopter
    updateVehicleHud({
        open = hudState.isOpen,
        isHelicopter = stats.isHelicopter,
        speed = stats.speed,
        speedUnit = SPEED_UNIT,
        altitude = stats.altitude,
        pitch = stats.pitch,
        roll = stats.roll,
        rpm = stats.rpm,
        fuel = stats.fuel,
        engineHealth = stats.engineHealth,
        gears = stats.gears,
        currentGear = stats.currentGear,
        seatbelt = stats.seatbelt,
        harness = stats.harness,
        distance = stats.distance,
        nos = stats.nos
    })

    return stats.isHelicopter
end

function UpdateRoute()
    if not shouldShowCompass() or IsPauseMenuActive() then
        updateCompass({ open = false })
        return
    end

    local route = GetStreet()
    updateCompass({
        open = true,
        currentStreet = route.streetName,
        nextStreet = route.nextNearestStreet,
        direction = route.heading,
        zone = route.zone,
        heading = route.heading
    })
end

local function handleVehicleLoop()
    if vehicleLoopRunning then
        return
    end

    vehicleLoopRunning = true

    while cache.vehicle do
        if not shouldShowHud() then
            updateVehicleHud({ open = false })
            toggleMinimap(false)
            updateCompass({ open = false })
            Wait(500)
            goto continue
        end

        if GetIsVehicleEngineRunning(cache.vehicle) then
            updateVehicleHud({ open = hudState.isOpen })
            UpdateRoute()
            toggleMinimap(true)
            SetRadarZoom(1000)
            SetBlipAlpha(GetNorthRadarBlip(), 0)
            local nextRouteUpdate = GetGameTimer() + VEHICLE_UPDATE_INTERVAL

            while GetIsVehicleEngineRunning(cache.vehicle) do
                if not shouldShowHud() then
                    updateVehicleHud({ open = false })
                    toggleMinimap(false)
                    updateCompass({ open = false })
                    Wait(500)
                    break
                end

                local isHelicopter = updateVehicleStats()
                local now = GetGameTimer()
                if now >= nextRouteUpdate then
                    UpdateRoute()
                    nextRouteUpdate = now + VEHICLE_UPDATE_INTERVAL
                end
                vehicleData.open = hudState.isOpen
                Wait(isHelicopter and HELICOPTER_UPDATE_INTERVAL or VEHICLE_UPDATE_INTERVAL)
            end

            vehicleData.open = false
            vehicleData.isHelicopter = false
            toggleMinimap(false)
            updateVehicleHud({ open = false })
            updateCompass({ open = false })

            if config.debug then lib.print.info("Engine turned off") end
        end

        ::continue::
        Wait(500)
    end

    vehicleData.isHelicopter = false
    vehicleLoopRunning = false
    if config.debug then lib.print.info("Player exited the vehicle") end
end

local function onInvOpenChanged(_, _, invOpen)
    hudState.isInvOpen = invOpen
    if invOpen or hudState.hudDisabled or hudState.cinematicBarsActive then
        updatePlayerHud({ open = false })
        updateCompass({ open = false })
        if cache.vehicle then
            updateVehicleHud({ open = false })
            toggleMinimap(false)
        end
    else
        hudState.isOpen = not hudState.hudDisabled
        updatePlayerHud({ open = hudState.isOpen })
        if cache.vehicle and GetIsVehicleEngineRunning(cache.vehicle) then
            updateVehicleHud({ open = hudState.isOpen })
            UpdateRoute()
            toggleMinimap(hudState.isOpen)
        end
    end
end

local function onToggleCinematicBars(data, cb)
    local enabled = data.enabled
    hudState.cinematicBarsActive = enabled

    if enabled then
        updatePlayerHud({ open = false })
        updateCompass({ open = false })
        if cache.vehicle then
            updateVehicleHud({ open = false })
            toggleMinimap(false)
        end
    else
        updatePlayerHud({ open = hudState.isOpen and not hudState.hudDisabled })
        if cache.vehicle and GetIsVehicleEngineRunning(cache.vehicle) then
            updateVehicleHud({ open = hudState.isOpen and not hudState.hudDisabled })
            toggleMinimap(not hudState.hudDisabled)
            UpdateRoute()
        end
    end

    cb(1)
end

local function onCloseSettings(_, cb)
    hudState.settingsOpen = false
    toggleSettings(false)
    cb(1)
end

local function copyTable(source)
    local result = {}

    for key, value in pairs(source) do
        result[key] = value
    end

    return result
end

local function SaveHudSettings(settings)
    SaveData(HUD_SETTINGS_KEY, settings)
end

local function LoadHudSettings()
    local settings = LoadData(HUD_SETTINGS_KEY)
    local changed = false

    if type(settings) ~= 'table' then
        settings = copyTable(DEFAULT_HUD_SETTINGS)
        changed = true
    end

    for key, defaultValue in pairs(DEFAULT_HUD_SETTINGS) do
        if settings[key] == nil then
            settings[key] = defaultValue
            changed = true
        end
    end

    if type(settings.hudDisabled) ~= 'boolean' then
        settings.hudDisabled = DEFAULT_HUD_SETTINGS.hudDisabled
        changed = true
    end

    local cinematicHeight = tonumber(settings.cinematicBarsHeight)
    if not cinematicHeight then
        cinematicHeight = DEFAULT_HUD_SETTINGS.cinematicBarsHeight
        changed = true
    end

    cinematicHeight = math.max(0, math.min(cinematicHeight, 25))
    if settings.cinematicBarsHeight ~= cinematicHeight then
        settings.cinematicBarsHeight = cinematicHeight
        changed = true
    end

    if not VALID_PLAYER_STATUS_INDICATORS[settings.playerStatusIndicator] then
        settings.playerStatusIndicator = DEFAULT_HUD_SETTINGS.playerStatusIndicator
        changed = true
    end

    if not VALID_PLAYER_HUD_POSITIONS[settings.playerHudPosition] then
        settings.playerHudPosition = DEFAULT_HUD_SETTINGS.playerHudPosition
        changed = true
    end

    if not VALID_VEHICLE_HUD_STYLES[settings.vehicleHudStyle] then
        settings.vehicleHudStyle = DEFAULT_HUD_SETTINGS.vehicleHudStyle
        changed = true
    end

    if not VALID_COMPASS_STYLES[settings.compassStyle] then
        settings.compassStyle = DEFAULT_HUD_SETTINGS.compassStyle
        changed = true
    end

    if not VALID_COMPASS_POSITIONS[settings.compassPosition] then
        settings.compassPosition = DEFAULT_HUD_SETTINGS.compassPosition
        changed = true
    end

    if changed then
        SaveHudSettings(settings)
    end

    return settings
end

local function saveHudSetting(key, value)
    local settings = LoadHudSettings()
    settings[key] = value
    SaveHudSettings(settings)
end

local function disableHud(data)
    if type(data) ~= 'table' then return false end

    local disabled = data.disabled
    if disabled == nil then
        disabled = data.enabled
    end

    if type(disabled) ~= 'boolean' then return false end

    hudState.hudDisabled = disabled
    hudState.isOpen = not disabled
    saveHudSetting('hudDisabled', disabled)

    if disabled then
        updatePlayerHud({ open = false })
        updateVehicleHud({ open = false })
        updateCompass({ open = false })
        toggleMinimap(false)
    else
        updatePlayerStats()

        if cache.vehicle and GetIsVehicleEngineRunning(cache.vehicle) then
            updateVehicleStats()
            toggleMinimap(true)
            UpdateRoute()
        end
    end

    return true
end

local function registerEnumSettingCallback(callbackName, settingKey, payloadKey, allowedValues)
    RegisterNUICallback(callbackName, function(data, cb)
        local value = type(data) == 'table' and data[payloadKey] or nil

        if type(value) ~= 'string' or not allowedValues[value] then
            cb({ status = 'error', message = ('Invalid %s'):format(settingKey) })
            return
        end

        saveHudSetting(settingKey, value)
        cb({ status = 'ok' })
    end)
end

local function initializeHud()
    Wait(500)

    local hudSettings = LoadHudSettings()

    hudState.hudDisabled = hudSettings.hudDisabled
    hudState.cinematicBarsActive = hudSettings.cinematicBarsHeight > 0
    hudState.isOpen = not hudSettings.hudDisabled

    sendNUIMessage('UPDATE_SETTINGS', hudSettings)

    if config.debug then
        lib.print.info(('HUD settings loaded: %s'):format(json.encode(hudSettings)))
    end

    SetupMinimap()

    updatePlayerStats()
    TriggerEvent('qbx_divegear:client:requestHudState')

    if not cache.vehicle then
        toggleMinimap(false)
        updateCompass({ open = false })
    else
        handleVehicleLoop()
    end
end

AddStateBagChangeHandler('invOpen', ('player:%s'):format(cache.serverId), onInvOpenChanged)

AddEventHandler("pma-voice:radioActive", function(radioTalking)
    PlayerVoiceMethod = radioTalking and 'radio' or false
end)

AddStateBagChangeHandler('seatbelt', ('player:%s'):format(cache.serverId), function(_, _, value)
    seatbelt = value
end)

AddStateBagChangeHandler('proximity', ('player:%s'):format(cache.serverId), function(_, _, value)
    voiceProximity = value.distance
end)

RegisterNUICallback('toggleCinematicBars', function(data, cb)
    if type(data) ~= 'table' then
        cb({ status = 'error', message = 'Missing cinematic settings' })
        return
    end

    local enabled = data.enabled == true
    local height = tonumber(data.height) or (enabled and 10 or 0)
    height = math.max(0, math.min(height, 25))

    data.enabled = enabled
    data.height = height

    saveHudSetting('cinematicBarsHeight', height)
    onToggleCinematicBars(data, cb)
end)

RegisterNUICallback('closeSettings', onCloseSettings)

RegisterNUICallback('setHudDisabled', function(data, cb)
    if not disableHud(data) then
        cb({ status = 'error', message = 'Invalid HUD visibility value' })
        return
    end

    cb({ status = 'ok' })
end)

registerEnumSettingCallback(
    'setPlayerStatusIndicator',
    'playerStatusIndicator',
    'style',
    VALID_PLAYER_STATUS_INDICATORS
)

registerEnumSettingCallback(
    'setPlayerHudPosition',
    'playerHudPosition',
    'position',
    VALID_PLAYER_HUD_POSITIONS
)

registerEnumSettingCallback(
    'setVehicleHudStyle',
    'vehicleHudStyle',
    'style',
    VALID_VEHICLE_HUD_STYLES
)

registerEnumSettingCallback(
    'setCompassStyle',
    'compassStyle',
    'style',
    VALID_COMPASS_STYLES
)

registerEnumSettingCallback(
    'setCompassPosition',
    'compassPosition',
    'position',
    VALID_COMPASS_POSITIONS
)

CreateThread(function()
    while true do
        Wait(HUD_UPDATE_INTERVAL)
        updatePlayerStats()
    end
end)

lib.onCache('vehicle', function(vehicle)
    if not vehicle then return end
    Wait(250)
    handleVehicleLoop()
end)

lib.addKeybind({
    name = 'settings',
    description = 'Open Settings',
    defaultMapper = 'keyboard',
    default = 'I',
    onPressed = function()
        toggleSettings(true)
    end
})

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', initializeHud)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    if config.debug then lib.print.info('Hiding HUD') end
    updatePlayerHud({ open = false })
    updateVehicleHud({ open = false })
    toggleMinimap(false)
    hudState.isOpen = false
end)

AddEventHandler('onResourceStart', function(resource)
   if resource == GetCurrentResourceName() then
      initializeHud()
   end
end)

exports('getHudState', function()
    return hudState
end)
exports('hudOn', hudOn)
exports('hudOff', hudOff)
