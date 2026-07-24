return {
    debug = false,
    dontTiltMinimap = false, -- Will have an affect on performance as its a loop (I used this at Element, but its a preference)
    useMPH = true,
    useWeaponHud = true,
    hudSettings = {
        enabled = true,
        defaultHUDSettings = {
            hudDisabled = false,
            cinematicBarsHeight = 0,
            playerStatusIndicator = 'square',
            playerHudPosition = 'bottom-left',
            vehicleHudStyle = 'speedometer-column',
            compassStyle = 'default',
            compassPosition = 'top-center',
        }
    },
    lookAtPlayerWhileSpeaking = {
        enabled = true,
        distance = 20,
    },
    waypointSettings = {
        enabled = true,
        color = { r = 142, g = 77, b = 171, a = 247 },
    },
}
