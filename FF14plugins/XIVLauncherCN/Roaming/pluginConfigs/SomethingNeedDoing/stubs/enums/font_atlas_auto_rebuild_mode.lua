-- Usage:
-- luanet.load_assembly('Dalamud')
-- FontAtlasAutoRebuildMode = luanet.import_type('Dalamud.Interface.ManagedFontAtlas.FontAtlasAutoRebuildMode')
-- FontAtlasAutoRebuildMode.Disable

--- @alias FontAtlasAutoRebuildModeValue
---| 0 # Disable
---| 1 # OnNewFrame
---| 2 # Async

--- @class FontAtlasAutoRebuildMode
--- @field Disable FontAtlasAutoRebuildModeValue
--- @field OnNewFrame FontAtlasAutoRebuildModeValue
--- @field Async FontAtlasAutoRebuildModeValue
