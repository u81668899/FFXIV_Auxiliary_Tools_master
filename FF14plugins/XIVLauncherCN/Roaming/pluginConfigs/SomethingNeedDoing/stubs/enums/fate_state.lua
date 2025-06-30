-- Usage:
-- luanet.load_assembly('FFXIVClientStructs')
-- FateState = luanet.import_type('FFXIVClientStructs.FFXIV.Client.Game.Fate.FateState')
-- FateState.Preparing

--- @alias FateStateValue
---| 3 # Preparing
---| 4 # Running
---| 5 # Ending
---| 7 # Ended
---| 8 # Failed

--- @class FateState
--- @field Preparing FateStateValue
--- @field Running FateStateValue
--- @field Ending FateStateValue
--- @field Ended FateStateValue
--- @field Failed FateStateValue
