return {
    debug = false,

    units = {
        -- Supported values: 'mph' or 'kph'
        speed = 'mph',
    },

    minimap = {
        -- Keeps the minimap upright instead of rotating it with the player.
        -- This uses a per-frame loop and therefore has a small performance cost.
        dontTiltMinimap = false,
    },

    features = {
        weaponHud = true,

        lookAtSpeaker = {
            enabled = false,
            distance = 20.0,
        },

        waypoint = {
            enabled = true,
            -- This is a GTA waypoint/blip color, not a HUD indicator color.
            color = { r = 142, g = 77, b = 171, a = 247 },
        },
    },

    hudSettings = {
        -- When false, the in-game settings menu and keybind are disabled.
        -- The defaults below are then forced for every player and saved player
        -- preferences are ignored.
        enabled = true,

        -- Only used when hudSettings.enabled is true.
        keybind = 'I',

        -- These values are used as the initial player settings. They are also
        -- the forced settings when hudSettings.enabled is false.
        defaults = {
            hudEnabled = true,
            cinematicBarsHeight = 0, -- DON'T CHANGE REALLY UNLESS YOU WANT TO HAVE THIS ENABLED BY DEFAULT

            player = {
                -- icons, minimal, circular
                layout = 'icons',

                -- bottom-left, top-left, top-right or bottom-center
                position = 'bottom-left',

                indicators = {
                    voice = {
                        visibility = 'always',
                        colors = {
                            inactive = 'gray',
                            voice = 'green',
                            radio = 'blue',
                        },
                    },
                    health = {
                        visibility = 'always',
                        color = 'red',
                    },
                    armor = {
                        visibility = 'dynamic',
                        color = 'blue',
                    },
                    hunger = {
                        visibility = 'always',
                        color = 'orange',
                    },
                    thirst = {
                        visibility = 'always',
                        color = 'cyan',
                    },
                    stamina = {
                        visibility = 'dynamic',
                        color = 'blue',
                    },
                    stress = {
                        visibility = 'dynamic',
                        color = 'violet',
                    },
                },
            },

            vehicle = {
                -- digital or dial
                layout = 'dial',

                -- icons, minimal or circular
                indicatorLayout = 'icons',

                indicators = {
                    gear = {
                        visibility = 'always',
                        color = 'blue',
                    },
                    seatbelt = {
                        visibility = 'always',
                        color = 'auto',
                    },
                    engine = {
                        visibility = 'always',
                        color = 'auto',
                    },
                    fuel = {
                        visibility = 'always',
                        color = 'auto',
                    },
                    nitrous = {
                        visibility = 'dynamic',
                        color = 'violet',
                    },
                },
            },

            compass = {
                -- full or compact
                layout = 'full',

                -- top-center or bottom-center
                position = 'top-center',
            },
        },
    },
}
