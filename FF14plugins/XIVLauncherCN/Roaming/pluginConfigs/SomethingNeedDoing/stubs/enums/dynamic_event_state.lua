-- Usage:
-- luanet.load_assembly('FFXIVClientStructs')
-- DynamicEventState = luanet.import_type('FFXIVClientStructs.FFXIV.Client.Game.InstanceContent.DynamicEventState')
-- DynamicEventState.Inactive

--- @alias DynamicEventStateValue
---| 0 # Inactive
---| 1 # Register
---| 2 # Warmup
---| 3 # Battle

--- @class DynamicEventState
--- @field Inactive DynamicEventStateValue
--- @field Register DynamicEventStateValue
--- @field Warmup DynamicEventStateValue
--- @field Battle DynamicEventStateValue
