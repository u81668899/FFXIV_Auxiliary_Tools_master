-- Usage:
-- luanet.load_assembly('FFXIVClientStructs')
-- ItemFlags = luanet.import_type('FFXIVClientStructs.FFXIV.Client.Game.InventoryItem+ItemFlags')
-- ItemFlags.None

--- @alias ItemFlagsValue
---| 0 # None
---| 1 # HighQuality
---| 2 # CompanyCrestApplied
---| 4 # Relic
---| 8 # Collectable

--- @class ItemFlags
--- @field None ItemFlagsValue
--- @field HighQuality ItemFlagsValue
--- @field CompanyCrestApplied ItemFlagsValue
--- @field Relic ItemFlagsValue
--- @field Collectable ItemFlagsValue
