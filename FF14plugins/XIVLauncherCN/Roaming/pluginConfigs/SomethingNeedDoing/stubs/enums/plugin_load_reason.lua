-- Usage:
-- luanet.load_assembly('Dalamud')
-- PluginLoadReason = luanet.import_type('Dalamud.Plugin.PluginLoadReason')
-- PluginLoadReason.Unknown

--- @alias PluginLoadReasonValue
---| 1 # Unknown
---| 2 # Installer
---| 4 # Update
---| 8 # Reload
---| 16 # Boot

--- @class PluginLoadReason
--- @field Unknown PluginLoadReasonValue
--- @field Installer PluginLoadReasonValue
--- @field Update PluginLoadReasonValue
--- @field Reload PluginLoadReasonValue
--- @field Boot PluginLoadReasonValue
