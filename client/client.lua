local config = require('configs.config')
local bridge = require('bridge.bridge')

local speedUnitSetting = config.units and config.units.speed or (config.useMPH and 'mph' or 'kph')
local SPEED_MULTIPLIER = speedUnitSetting == 'mph' and 2.23694 or 3.6
local SPEED_UNIT = speedUnitSetting == 'mph' and 'MPH' or 'KMT'
local HUD_UPDATE_INTERVAL = 250
local VEHICLE_UPDATE_INTERVAL = 250
local HELICOPTER_UPDATE_INTERVAL = 250
local HELICOPTER_VEHICLE_CLASS = 15
local HUD_SETTINGS_KEY = 'hudSettings'
local HUD_SETTINGS_CONFIG = config.hudSettings or {}
local HUD_SETTINGS_ENABLED = HUD_SETTINGS_CONFIG.enabled ~= false
local RAW_HUD_SETTINGS_DEFAULTS = assert(HUD_SETTINGS_CONFIG.defaults or HUD_SETTINGS_CONFIG.defaultHUDSettings, 'Missing config.hudSettings.defaults')

local VALID_PLAYER_LAYOUTS = {
    icons = true,
    minimal = true,
    circular = true,
}

local VALID_PLAYER_HUD_POSITIONS = {
    ['bottom-left'] = true,
    ['top-left'] = true,
    ['top-right'] = true,
    ['bottom-center'] = true,
}

local VALID_VEHICLE_LAYOUTS = {
    digital = true,
    dial = true,
}

local VALID_VEHICLE_INDICATOR_LAYOUTS = {
    icons = true,
    minimal = true,
    circular = true,
}

local VALID_COMPASS_LAYOUTS = {
    full = true,
    compact = true,
}

local VALID_COMPASS_POSITIONS = {
    ['top-center'] = true,
    ['bottom-center'] = true,
}

local VALID_INDICATOR_VISIBILITY = {
    always = true,
    dynamic = true,
    hidden = true,
}

local VALID_INDICATOR_COLORS = {
    gray = true,
    red = true,
    pink = true,
    grape = true,
    violet = true,
    indigo = true,
    blue = true,
    cyan = true,
    teal = true,
    green = true,
    lime = true,
    yellow = true,
    orange = true,
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

local function updateNuiState(action, cacheTable, data)
    local changes

    for key, value in pairs(data) do
        if cacheTable[key] ~= value then
            cacheTable[key] = value

            changes = changes or {}
            changes[key] = value
        end
    end

    if changes then
        sendNUIMessage(action, changes)
    end
end

local function updatePlayerHud(data)
    updateNuiState('UPDATE_STATS', cachedPlayerStats, data)
end

local function updateVehicleHud(data)
    updateNuiState('UPDATE_VEHICLE', cachedVehicleStats, data)
end

local function updateCompass(data)
    updateNuiState('UPDATE_COMPASS', cachedRoute, data)
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
    if show and not HUD_SETTINGS_ENABLED then return end
    if show and hudState.settingsOpen then return end

    sendNUIMessage('TOGGLE_SETTINGS', show)
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
    local playerData = bridge.GetPlayerData()

    if not playerData or not playerData.metadata then
        lib.print.info('Waiting for player data to load')
        return nil
    end

    local isUnderwater = IsPedSwimmingUnderWater(cache.ped)
    local stamina = math.max(0, math.min(100, GetPlayerSprintStaminaRemaining(cache.playerId)))
    local oxygen = 100

    if isUnderwater then
        oxygen = math.max(0, math.min(100, GetPlayerUnderwaterTimeRemaining(cache.playerId) * 10))
    end

    return {
        health = math.max(0, math.ceil(GetEntityHealth(cache.ped) - 100)),
        armor = math.ceil(GetPedArmour(cache.ped)),
        thirst = playerData.metadata.thirst or 100,
        hunger = playerData.metadata.hunger or 100,
        stress = LocalPlayer.state.stress or 0,
        voice = playerState.proximity.distance or 0,
        talking = GetPlayerVoiceMethod(cache.playerId),
        stamina = math.floor((isUnderwater and oxygen or stamina) + 0.5),
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

local activeHudSettings

local function deepCopy(value)
    if type(value) ~= 'table' then return value end

    local result = {}

    for key, child in pairs(value) do
        result[key] = deepCopy(child)
    end

    return result
end

local DEFAULT_VEHICLE_STATE_COLORS = {
    seatbelt = {
        fastened = 'green',
        unfastened = 'red',
    },
    engine = {
        high = 'green',
        medium = 'orange',
        low = 'red',
    },
    fuel = {
        high = 'green',
        medium = 'orange',
        low = 'red',
    },
}

local function buildDefaultHudSettings()
    local defaults = deepCopy(RAW_HUD_SETTINGS_DEFAULTS)
    local vehicleIndicators = defaults.vehicle and defaults.vehicle.indicators

    if not vehicleIndicators then
        return defaults
    end

    for indicator, colors in pairs(DEFAULT_VEHICLE_STATE_COLORS) do
        local setting = vehicleIndicators[indicator]

        if type(setting) ~= 'table' then
            setting = {
                visibility = 'dynamic',
            }
            vehicleIndicators[indicator] = setting
        end

        local configuredColors = type(setting.colors) == 'table' and setting.colors or {}

        for state, fallbackColor in pairs(colors) do
            if not VALID_INDICATOR_COLORS[configuredColors[state]] then
                configuredColors[state] = fallbackColor
            end
        end

        setting.colors = configuredColors
        setting.color = nil
    end

    return defaults
end

local DEFAULT_HUD_SETTINGS = buildDefaultHudSettings()

local function createDefaultHudSettings()
    return {
        hudEnabled = DEFAULT_HUD_SETTINGS.hudEnabled,
        cinematicBarsHeight = DEFAULT_HUD_SETTINGS.cinematicBarsHeight,
        player = deepCopy(DEFAULT_HUD_SETTINGS.player),
        vehicle = deepCopy(DEFAULT_HUD_SETTINGS.vehicle),
        compass = deepCopy(DEFAULT_HUD_SETTINGS.compass),
    }
end

local function validateIndicatorGroup(settingsGroup, defaultGroup)
    local changed = false

    if type(settingsGroup) ~= 'table' then
        return deepCopy(defaultGroup), true
    end

    for indicator, defaultSetting in pairs(defaultGroup) do
        local setting = settingsGroup[indicator]

        if type(setting) ~= 'table' then
            settingsGroup[indicator] = deepCopy(defaultSetting)
            changed = true
        else
            if not VALID_INDICATOR_VISIBILITY[setting.visibility] then
                setting.visibility = defaultSetting.visibility
                changed = true
            end

            if type(defaultSetting.colors) == 'table' then
                if type(setting.colors) ~= 'table' then
                    setting.colors = deepCopy(defaultSetting.colors)
                    changed = true
                end

                for state, defaultColor in pairs(defaultSetting.colors) do
                    if not VALID_INDICATOR_COLORS[setting.colors[state]] then
                        setting.colors[state] = defaultColor
                        changed = true
                    end
                end

                setting.color = nil
            elseif not VALID_INDICATOR_COLORS[setting.color] then
                setting.color = defaultSetting.color
                changed = true
            end
        end
    end

    return settingsGroup, changed
end

local function validateHudSettings(settings)
    local changed = false

    if type(settings.hudEnabled) ~= 'boolean' then
        settings.hudEnabled = DEFAULT_HUD_SETTINGS.hudEnabled
        changed = true
    end

    local cinematicHeight = tonumber(settings.cinematicBarsHeight)
        or DEFAULT_HUD_SETTINGS.cinematicBarsHeight
    cinematicHeight = math.max(0, math.min(cinematicHeight, 25))

    if settings.cinematicBarsHeight ~= cinematicHeight then
        settings.cinematicBarsHeight = cinematicHeight
        changed = true
    end

    if type(settings.player) ~= 'table' then
        settings.player = deepCopy(DEFAULT_HUD_SETTINGS.player)
        changed = true
    end

    if not VALID_PLAYER_LAYOUTS[settings.player.layout] then
        settings.player.layout = DEFAULT_HUD_SETTINGS.player.layout
        changed = true
    end

    if not VALID_PLAYER_HUD_POSITIONS[settings.player.position] then
        settings.player.position = DEFAULT_HUD_SETTINGS.player.position
        changed = true
    end

    local playerIndicators, playerIndicatorsChanged = validateIndicatorGroup(
        settings.player.indicators,
        DEFAULT_HUD_SETTINGS.player.indicators
    )
    settings.player.indicators = playerIndicators
    changed = changed or playerIndicatorsChanged

    if type(settings.vehicle) ~= 'table' then
        settings.vehicle = deepCopy(DEFAULT_HUD_SETTINGS.vehicle)
        changed = true
    end

    if not VALID_VEHICLE_LAYOUTS[settings.vehicle.layout] then
        settings.vehicle.layout = DEFAULT_HUD_SETTINGS.vehicle.layout
        changed = true
    end

    if not VALID_VEHICLE_INDICATOR_LAYOUTS[settings.vehicle.indicatorLayout] then
        settings.vehicle.indicatorLayout = DEFAULT_HUD_SETTINGS.vehicle.indicatorLayout
        changed = true
    end

    local vehicleIndicators, vehicleIndicatorsChanged = validateIndicatorGroup(
        settings.vehicle.indicators,
        DEFAULT_HUD_SETTINGS.vehicle.indicators
    )
    settings.vehicle.indicators = vehicleIndicators
    changed = changed or vehicleIndicatorsChanged

    if type(settings.compass) ~= 'table' then
        settings.compass = deepCopy(DEFAULT_HUD_SETTINGS.compass)
        changed = true
    end

    if not VALID_COMPASS_LAYOUTS[settings.compass.layout] then
        settings.compass.layout = DEFAULT_HUD_SETTINGS.compass.layout
        changed = true
    end

    if not VALID_COMPASS_POSITIONS[settings.compass.position] then
        settings.compass.position = DEFAULT_HUD_SETTINGS.compass.position
        changed = true
    end

    return settings, changed
end

local function SaveHudSettings(settings)
    if not HUD_SETTINGS_ENABLED then return end
    SaveData(HUD_SETTINGS_KEY, settings)
end

local function LoadHudSettings()
    local settings = createDefaultHudSettings()

    if not HUD_SETTINGS_ENABLED then
        return validateHudSettings(settings)
    end

    local savedSettings = LoadData(HUD_SETTINGS_KEY)

    if type(savedSettings) == 'table' then
        settings.hudEnabled = savedSettings.hudEnabled
        settings.cinematicBarsHeight = savedSettings.cinematicBarsHeight
        settings.player = deepCopy(savedSettings.player)
        settings.vehicle = deepCopy(savedSettings.vehicle)
        settings.compass = deepCopy(savedSettings.compass)
    end

    local validatedSettings = validateHudSettings(settings)
    SaveHudSettings(validatedSettings)

    return validatedSettings
end

local function pushHudSettings()
    if not activeHudSettings then return end

    local payload = deepCopy(activeHudSettings)
    payload.settingsEnabled = HUD_SETTINGS_ENABLED
    sendNUIMessage('UPDATE_SETTINGS', payload)
end

local function saveActiveHudSettings()
    if not activeHudSettings then return false end

    local settings, changed = validateHudSettings(activeHudSettings)
    activeHudSettings = settings
    SaveHudSettings(activeHudSettings)
    pushHudSettings()

    return not changed
end

local function setHudEnabled(enabled)
    if type(enabled) ~= 'boolean' then return false end

    activeHudSettings.hudEnabled = enabled
    hudState.hudDisabled = not enabled
    hudState.isOpen = enabled
    saveActiveHudSettings()

    if not enabled then
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

local function canEditHudSettings(cb)
    if HUD_SETTINGS_ENABLED then return true end

    cb({ status = 'error', message = 'HUD settings are disabled by the server configuration' })
    return false
end

local function initializeHud()
    Wait(500)

    activeHudSettings = LoadHudSettings()

    hudState.hudDisabled = not activeHudSettings.hudEnabled
    hudState.cinematicBarsActive = activeHudSettings.cinematicBarsHeight > 0
    hudState.isOpen = activeHudSettings.hudEnabled

    pushHudSettings()

    if config.debug then
        lib.print.info(('HUD settings loaded: %s'):format(json.encode(activeHudSettings)))
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

RegisterNUICallback('closeSettings', onCloseSettings)

RegisterNUICallback('setHudEnabled', function(data, cb)
    if not canEditHudSettings(cb) then return end

    local enabled = type(data) == 'table' and data.enabled or nil

    if not setHudEnabled(enabled) then
        cb({ status = 'error', message = 'Invalid HUD enabled value' })
        return
    end

    cb({ status = 'ok' })
end)

RegisterNUICallback('setCinematicBars', function(data, cb)
    if not canEditHudSettings(cb) then return end

    local height = type(data) == 'table' and tonumber(data.height) or nil

    if not height then
        cb({ status = 'error', message = 'Invalid cinematic bar height' })
        return
    end

    height = math.max(0, math.min(height, 25))
    activeHudSettings.cinematicBarsHeight = height
    saveActiveHudSettings()

    onToggleCinematicBars({ enabled = height > 0, height = height }, function()
        cb({ status = 'ok' })
    end)
end)

RegisterNUICallback('setHudLayout', function(data, cb)
    if not canEditHudSettings(cb) then return end
    if type(data) ~= 'table' then
        cb({ status = 'error', message = 'Missing layout data' })
        return
    end

    local section = data.section
    local layout = data.layout

    if section == 'player' and VALID_PLAYER_LAYOUTS[layout] then
        activeHudSettings.player.layout = layout
    elseif section == 'vehicle' and VALID_VEHICLE_LAYOUTS[layout] then
        activeHudSettings.vehicle.layout = layout
    elseif section == 'compass' and VALID_COMPASS_LAYOUTS[layout] then
        activeHudSettings.compass.layout = layout
    else
        cb({ status = 'error', message = 'Invalid HUD layout' })
        return
    end

    saveActiveHudSettings()
    cb({ status = 'ok' })
end)

RegisterNUICallback('setHudPosition', function(data, cb)
    if not canEditHudSettings(cb) then return end
    if type(data) ~= 'table' then
        cb({ status = 'error', message = 'Missing position data' })
        return
    end

    local section = data.section
    local position = data.position

    if section == 'player' and VALID_PLAYER_HUD_POSITIONS[position] then
        activeHudSettings.player.position = position
    elseif section == 'compass' and VALID_COMPASS_POSITIONS[position] then
        activeHudSettings.compass.position = position
    else
        cb({ status = 'error', message = 'Invalid HUD position' })
        return
    end

    saveActiveHudSettings()
    cb({ status = 'ok' })
end)

RegisterNUICallback('setVehicleIndicatorLayout', function(data, cb)
    if not canEditHudSettings(cb) then return end

    local layout = type(data) == 'table' and data.layout or nil

    if not VALID_VEHICLE_INDICATOR_LAYOUTS[layout] then
        cb({ status = 'error', message = 'Invalid vehicle indicator layout' })
        return
    end

    activeHudSettings.vehicle.indicatorLayout = layout
    saveActiveHudSettings()
    cb({ status = 'ok' })
end)

RegisterNUICallback('setIndicatorVisibility', function(data, cb)
    if not canEditHudSettings(cb) then return end
    if type(data) ~= 'table' then
        cb({ status = 'error', message = 'Missing indicator data' })
        return
    end

    local section = data.section
    local indicator = data.indicator
    local visibility = data.visibility
    local sectionSettings = activeHudSettings[section]

    if (section ~= 'player' and section ~= 'vehicle')
        or type(sectionSettings) ~= 'table'
        or type(sectionSettings.indicators) ~= 'table'
        or type(sectionSettings.indicators[indicator]) ~= 'table'
        or not VALID_INDICATOR_VISIBILITY[visibility]
    then
        cb({ status = 'error', message = 'Invalid indicator visibility' })
        return
    end

    sectionSettings.indicators[indicator].visibility = visibility
    saveActiveHudSettings()
    cb({ status = 'ok' })
end)

RegisterNUICallback('setIndicatorColor', function(data, cb)
    if not canEditHudSettings(cb) then return end
    if type(data) ~= 'table' then
        cb({ status = 'error', message = 'Missing indicator data' })
        return
    end

    local section = data.section
    local indicator = data.indicator
    local color = data.color
    local sectionSettings = activeHudSettings[section]

    if (section ~= 'player' and section ~= 'vehicle')
        or type(sectionSettings) ~= 'table'
        or type(sectionSettings.indicators) ~= 'table'
        or type(sectionSettings.indicators[indicator]) ~= 'table'
        or type(sectionSettings.indicators[indicator].colors) == 'table'
        or not VALID_INDICATOR_COLORS[color]
    then
        cb({ status = 'error', message = 'Invalid indicator color' })
        return
    end

    sectionSettings.indicators[indicator].color = color
    saveActiveHudSettings()
    cb({ status = 'ok' })
end)

RegisterNUICallback('setVehicleIndicatorStateColor', function(data, cb)
    if not canEditHudSettings(cb) then return end

    if type(data) ~= 'table' then
        cb({ status = 'error', message = 'Missing vehicle color data' })
        return
    end

    local indicator = data.indicator
    local state = data.state
    local color = data.color
    local setting = activeHudSettings.vehicle.indicators[indicator]
    local defaultSetting = DEFAULT_HUD_SETTINGS.vehicle.indicators[indicator]

    if type(setting) ~= 'table'
        or type(setting.colors) ~= 'table'
        or type(defaultSetting) ~= 'table'
        or type(defaultSetting.colors) ~= 'table'
        or defaultSetting.colors[state] == nil
        or not VALID_INDICATOR_COLORS[color]
    then
        cb({ status = 'error', message = 'Invalid vehicle indicator state color' })
        return
    end

    setting.colors[state] = color
    saveActiveHudSettings()
    cb({ status = 'ok' })
end)

RegisterNUICallback('setVoiceIndicatorColor', function(data, cb)
    if not canEditHudSettings(cb) then return end
    if type(data) ~= 'table' then
        cb({ status = 'error', message = 'Missing voice color data' })
        return
    end

    local state = data.state
    local color = data.color
    local voiceSetting = activeHudSettings.player.indicators.voice

    if (state ~= 'inactive' and state ~= 'voice' and state ~= 'radio')
        or not VALID_INDICATOR_COLORS[color]
        or type(voiceSetting) ~= 'table'
        or type(voiceSetting.colors) ~= 'table'
    then
        cb({ status = 'error', message = 'Invalid voice indicator color' })
        return
    end

    voiceSetting.colors[state] = color
    saveActiveHudSettings()
    cb({ status = 'ok' })
end)

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

if HUD_SETTINGS_ENABLED then
    lib.addKeybind({
        name = 'settings',
        description = 'Open HUD Settings',
        defaultMapper = 'keyboard',
        default = HUD_SETTINGS_CONFIG.keybind or 'I',
        onPressed = function()
            toggleSettings(true)
        end
    })
end

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
