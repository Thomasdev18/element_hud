fx_version "cerulean"
lua54 "yes"
game "gta5"
use_experimental_fxv2_oal "yes"

author "Thomas"
description "An optimized HUD for fivem made with React Typescript and mantine"

ui_page "web/build/index.html"

files {
	"web/build/index.html",
    "web/build/**/*",
	"bridge/**/*"
}

shared_scripts {
    "@ox_lib/init.lua",
    "@qbx_core/modules/lib.lua",
    "configs/*.lua",
}

client_script {
    "client/**/*",
}

server_scripts {
    "server/**/*"
}
