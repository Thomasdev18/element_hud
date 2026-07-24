# element_hud

A modern and configurable HUD resource for FiveM, built for both **QBox** and **QBCore**. (Please use QBOX🙏)

`element_hud` provides separate interfaces for player information, vehicles and helicopters, together with persistent player settings stored through FiveM KVP.


> This project is **source available**, not open source under an OSI-approved licence.  
> You may use and modify the resource, but redistribution and resale are prohibited.

---

## Features

### Player HUD

Displays important player information such as:

- Health
- Armour
- Hunger
- Thirst
- Stress
- Stamina
- Voice activity
- Voice proximity
- Radio activity

### Vehicle HUD

Includes information such as:

- Speed
- RPM
- Current gear
- Fuel
- Engine health
- Seatbelt status
- Harness status
- Nitrous status
- Street and area information
- Camera direction

The speed unit can be configured for either:

- `KM/T`
- `MPH`

### Helicopter HUD

Vehicles classified as helicopters use a dedicated HUD with additional flight information:

- Altitude
- Pitch
- Roll
- Speed
- Fuel
- Engine health

### Persistent Settings

Player settings are saved and loaded through FiveM KVP.

This allows players to keep their HUD preferences after reconnecting or restarting the game.

---

## Supported Frameworks

| Framework | Status |
| --- | --- |
| QBox / `qbx_core` | Supported |
| QBCore / `qb-core` | Supported |

The resource automatically loads the appropriate framework bridge depending on which framework is running.

---

## Integrations

### Stress

The HUD is integrated with:

[jg-stress-addon](https://github.com/jgscripts/jg-stress-addon)

This integration can be replaced or modified if your server uses another stress system.

### Nitrous

The vehicle HUD supports nitrous information from:

[malice_nitro](https://github.com/QuantumMalice/malice_nitro)

The nitrous integration is isolated and can easily be changed to support another resource or state-bag structure.

---

## Requirements

- FiveM
- One of the supported frameworks:
  - `qbx_core`
  - `qb-core`
- `ox_lib`
- A compiled frontend build

Optional integrations:

- `jg-stress-addon`
- `malice_nitro`
- A compatible seatbelt or harness resource

---

## Installation

1. Download or clone the repository.

```bash
git clone https://github.com/YOUR_USERNAME/element_hud.git
````

2. Place the resource inside your server resources directory.

```text
resources/
└── [element]/
    └── element_hud/
```

3. Install and build the frontend dependencies if the compiled files are not already included.

```bash
cd web
npm install
npm run build
```

Use the package manager configured by the project if it differs from `npm`.

4. Add the resource to your `server.cfg`.

```cfg
ensure ox_lib
ensure qbx_core
ensure element_hud
```

For QBCore:

```cfg
ensure ox_lib
ensure qb-core
ensure element_hud
```


The exact configuration structure may differ depending on the current version of the resource.

---

## Framework Bridge

The framework-specific logic is separated into bridge modules.

```text
bridge/
├── qb.lua
└── qbx.lua
```

This keeps the main HUD logic framework-independent and makes it easier to add support for other frameworks later.

---

## Development

The frontend is built with:

* React
* TypeScript
* Mantine
* Zustand

---

## Licence

Copyright © 2026 Element. All rights reserved.

This project is distributed under the **Element Source-Available License Version 1.0**.

You may:

* View and download the source code
* Use the resource on a server or project operated by you
* Modify the resource for personal or internal use
* Use it on a commercially operated or monetised FiveM server
* Create a GitHub fork for development or contributing

You may not:

* Sell or resell the resource
* Sell modified versions of the resource
* Include it in a paid server pack
* Sublicense the resource
* Offer copies of the resource in exchange for payment
* Remove copyright or licence notices
* Claim the original work as your own

See the [`LICENSE`](LICENSE) file for the complete licence terms.

---

## Support

For questions, bug reports or feature suggestions, use one of the following:

* Open a GitHub issue
* Join the Element Discord
* Submit a pull request

When reporting a problem, include:

* Framework and version
* Relevant console errors
* Steps to reproduce the issue
* Any modifications made to the resource

---

## Credits

Created and maintained by **Thomas**.

Additional integrations:

* [JG Scripts — jg-stress-addon](https://github.com/jgscripts/jg-stress-addon)
* [QuantumMalice — malice_nitro](https://github.com/QuantumMalice/malice_nitro)
