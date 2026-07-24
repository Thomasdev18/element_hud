local config = require 'configs.config'

---@param action string The action you wish to target
---@param data any The data you wish to send along with this action
function SendReactMessage(action, data)
    SendNUIMessage({
        action = action,
        data = data
    })
end

---                 North
---     45°           0°           315°
---       \    .- - - - - - -.    /
---          X                 X
---        .'   \           /   '.
---       |        \     /        |
--- West  |           X           |  East
---       |        /     \        |
---        '.   /           \   .'
---          X                 X
---       /    '- - - - - - -'    \
---     135°                      225°
---                 South
---

--- Returns the cardinal or intercardinal direction that the given entity is staring towards, or nil if the entity doesn't exist.
function GetCardinalDirection(entity)
    local heading = GetEntityHeading(entity) % 360

    if heading < 22.5 or heading >= 337.5 then
        return 'N'
    elseif heading >= 22.5 and heading < 67.5 then
        return 'NE'
    elseif heading >= 67.5 and heading < 112.5 then
        return 'E'
    elseif heading >= 112.5 and heading < 157.5 then
        return 'SE'
    elseif heading >= 157.5 and heading < 202.5 then
        return 'S'
    elseif heading >= 202.5 and heading < 247.5 then
        return 'SW'
    elseif heading >= 247.5 and heading < 292.5 then
        return 'W'
    else -- heading >= 292.5 and heading < 337.5
        return 'NW'
    end
end

--- Returns the cardinal or intercardinal direction that the player camera is staring towards.
function GetCamCardinalDirection()
    local camRot = GetGameplayCamRot(0)
    local heading = lib.math.round(360.0 - ((camRot.z + 360.0) % 360.0))

    if heading < 22.5 or heading >= 337.5 then
        return 'N'
    elseif heading >= 22.5 and heading < 67.5 then
        return 'NØ'
    elseif heading >= 67.5 and heading < 112.5 then
        return 'Ø'
    elseif heading >= 112.5 and heading < 157.5 then
        return 'SØ'
    elseif heading >= 157.5 and heading < 202.5 then
        return 'S'
    elseif heading >= 202.5 and heading < 247.5 then
        return 'SV'
    elseif heading >= 247.5 and heading < 292.5 then
        return 'V'
    else -- heading >= 292.5 and heading < 337.5
        return 'NV'
    end
end

function GetPlayerVoiceMethod(player)
    if PlayerVoiceMethod ~= "radio" then
        PlayerVoiceMethod = MumbleIsPlayerTalking(player) and "voice" or false
    end
    return PlayerVoiceMethod
end

local zoneNames = {
    AIRP = "OSLO LUFTHAVN",
    ALAMO = "MJØSA",
    ALTA = "ALTA",
    ARMYB = "FORT ZANCUDO",
    BANHAMC = "BANHAM CANYON DR",
    BANNING = "BANNING",
    BEACH = "TJUVHOLMEN",
    BHAMCA = "SANDVIKA",
    BRADP = "BRADDOCK PASS",
    BRADT = "BRADDOCK TUNNEL",
    BURTON = "BURTON",
    CALAFB = "CALAFIA BRIDGE",
    CANNY = "RATON CANYON",
    CCREAK = "CASSIDY CREEK",
    CHAMH = "CHAMBERLAIN HILLS",
    CHIL = "VINEWOOD HILLS",
    CHU = "SANDVIKA",
    CMSW = "MARIFJELL",
    CYPRE = "CYPRESS FLATS",
    DAVIS = "ULLEVÅL",
    DELBE = "DEL PERRO BEACH",
    DELPE = "DEL PERRO",
    DELSOL = "LA PUERTA",
    DESRT = "JESSHEIM",
    DOWNT = "SENTRUM",
    DTVINE = "GRÜNERLØKKA",
    EAST_V = "ØSTRE GRÜNERLØKKA",
    EBURO = "EL BURRO HEIGHTS",
    ELGORL = "EL GORDO LIGHTHOUSE",
    ELYSIAN = "AKER BRYGGE",
    GALFISH = "GALILEE",
    GOLF = "GWC AND GOLFING SOCIETY",
    GRAPES = "MINNESUND",
    GREATC = "GREAT CHAPARRAL",
    HARMO = "JESSHEIM",
    HAWICK = "HAWICK",
    HORS = "VINEWOOD RACETRACK",
    HUMLAB = "HUMANE LABS AND RESEARCH",
    JAIL = "BOLINGBROKE PENITENTIARY",
    KOREAT = "LITTLE SEOUL",
    LACT = "LAND ACT RESERVOIR",
    LAGO = "LAGO ZANCUDO",
    LDAM = "LAND ACT DAM",
    LEGSQU = "OSLO TORG",
    LMESA = "LA MESA",
    LOSPUER = "LA PUERTA",
    MIRR = "ENSJØ",
    MORN = "MORNINGWOOD",
    MOVIE = "RICHARDS MAJESTIC",
    MTCHIL = "MARIFJELL",
    MTGORDO = "MOUNT GORDO",
    MTJOSE = "MOUNT JOSIAH",
    MURRI = "MURRIETA HEIGHTS",
    NCHU = "NORDRE SANDVIKA",
    NOOSE = "N.O.O.S.E",
    OCEANA = "OSLOFJORDEN",
    PALCOV = "PALETO COVE",
    PALETO = "GOL",
    PALFOR = "GOLSKOGEN",
    PALHIGH = "PALOMINO HIGHLANDS",
    PALMPOW = "PALMER-TAYLOR POWER STATION",
    PBLUFF = "SANDVIKA RESORT",
    PBOX = "PILLBOX HILL",
    PROCOB = "PROCOPIO BEACH",
    RANCHO = "RANCHO",
    RGLEN = "RICHMAN GLEN",
    RICHM = "RICHMAN",
    ROCKF = "FROGNER",
    RTRAK = "REDWOOD LIGHTS TRACK",
    SANAND = "SAN ANDREAS",
    SANCHIA = "SAN CHIANSKI MOUNTAIN RANGE",
    SANDY = "HØNEFOSS",
    SKID = "SENTRUM POLITISTASJON",
    SLAB = "STAB CITY",
    STAD = "TELENOR ARENA",
    STRAW = "STRAWBERRY",
    TATAMO = "TATAVIAM MOUNTAINS",
    TERMINA = "OSLO HAVN",
    TEXTI = "TEXTILE CITY",
    TONGVAH = "TONGVA HILLS",
    TONGVAV = "TONGVA VALLEY",
    VCANA = "TJUVHOLMEN",
    VESP = "TJUVHOLMEN",
    VINE = "GRÜNERLØKKA",
    WINDF = "RON ALTERNATES WIND FARM",
    WVINE = "VESTRE GRÜNERLØKKA",
    ZANCUDO = "ZANCUDO RIVER",
    ZP_ORT = "OSLO HAVN",
    ZQ_UAR = "DAVIS QUARTZ",
    PROL = "PROLOGUE / NORTH YANKTON",
    ISHeist = "CAYO PERICO ISLAND"
}


local function GetZoneLabel(coords)
    local zoneCode = string.upper(GetNameOfZone(coords.x, coords.y, coords.z))
    return zoneNames[zoneCode]
end

function GetStreet()
    local playerPed = cache.ped
    local coords = GetEntityCoords(playerPed)

    local streetHash, crossingRoadHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    local streetName = string.upper(GetStreetNameFromHashKey(streetHash))
    local crossingRoadName = crossingRoadHash and string.upper(GetStreetNameFromHashKey(crossingRoadHash))
    local zone = GetZoneLabel(coords)
    local heading = GetCamCardinalDirection()

    return {
        streetName = streetName,
        heading = heading,
        nextNearestStreet = crossingRoadName,
        zone = zone
    }
end

function CovertRPM(value)
    local percentage = math.ceil(value * 10000 - 2001) / 80
    return math.max(0, math.min(percentage, 100))
end

function ConvertEngineHealthToPercentage(value)
    local percentage = ((value + 4000) / 5000) * 100
    percentage = math.max(0, math.min(percentage, 100))
    return percentage
end

function Round(num, numDecimalPlaces)
    local mult = 10 ^ (numDecimalPlaces or 0)
    return math.floor(num + 0.5 * mult)
end

function PreventBigmapFromStayingActive()
    local timeout = 0
    while true do

        SetBigmapActive(false, false)

        if timeout >= 10000 then
            return
        end

        timeout = timeout + 1000
        Wait(1000)
    end
end

function SetupMinimap()
    RequestStreamedTextureDict("squaremap", false)
    while not HasStreamedTextureDictLoaded("squaremap") do
        Wait(100)
    end

    SetBlipAlpha(GetNorthRadarBlip(), 0)

    SetMinimapClipType(0)
    AddReplaceTexture("platform:/textures/graphics", "radarmasksm", "squaremap", "radarmasksm")
    AddReplaceTexture("platform:/textures/graphics", "radarmask1g", "squaremap", "radarmasksm")

    local resolutionX, resolutionY = GetActiveScreenResolution()
    local ratio = 1.777 - resolutionX/resolutionY
    local aspectratio = 1.777 - GetAspectRatio()

    -- -0.00 = map pulled left
    -- 0.015 = map raised up
    -- 0.252 = map stretched
    -- 0.338 = map shorten

     -- Minimap background / blur
    SetMinimapComponentPosition(
        'minimap_blur',
        'L',
        'B',
        -0.0355,
        0.005,
        0.265 + ((aspectratio + ratio) / 4.2),
        0.295
    )

    -- Minimap main symbol and icons
    -- 0.0 = nav symbol and icons left
    -- 0.1638 = nav symbol and icons stretched
    -- 0.216 = nav symbol and icons raised up

    -- Main minimap and blips
    SetMinimapComponentPosition(
        'minimap',
        'L',
        'B',
        -0.010,
        -0.040,
        0.1538,
        0.200
    )

    -- Minimap mask
    SetMinimapComponentPosition(
        'minimap_mask',
        'L',
        'B',
        0.0,
        0.0,
        0.128,
        0.20
    )

    SetMinimapClipType(0)
    SetRadarBigmapEnabled(true, false)
    Wait(0)
    SetBlipAlpha(GetNorthRadarBlip(), 0)
    CreateThread(PreventBigmapFromStayingActive)
    minimap = RequestScaleformMovie('minimap')

    SetRadarZoom(10.0)
    return true
end

if config.minimap.dontTiltMinimap then
    CreateThread(function()
        while true do
            Wait(0)

            -- Keeps the minimap directly centered above the player
            DontTiltMinimapThisFrame()
        end
    end)
end
