local config = require('configs.config')

if not config.features.weaponHud then return end

local function updateWeapon(data)
    SendNUIMessage({
        action = "UPDATE_WEAPON",
        data = data
    })
end

local function weaponLoop()
    if not cache.weapon then
        updateWeapon({ open = false })
        return
    end

    while cache.weapon do
        local currentWeapon = exports.ox_inventory:getCurrentWeapon()
        if currentWeapon == nil then
            updateWeapon({ open = false })
            return
        end

        local currentAmmoItemName = currentWeapon.ammo
        local ammoInInv = exports.ox_inventory:Search('count', currentAmmoItemName)

        updateWeapon({
            open = true,
            currentAmmo = currentWeapon.metadata.ammo,
            totalAmmo = ammoInInv
        })
        Wait(250)
    end

    updateWeapon({ open = false })
end

lib.onCache('weapon', function(weapon)
    if not weapon then
        return
    end

    if not IsPlayerFreeAiming(PlayerId()) == 1 then
        return
    end

    Wait(250)
    weaponLoop()
end)
