-- Usage:
-- luanet.load_assembly('FFXIVClientStructs')
-- WeeklyBingoTaskStatus = luanet.import_type('FFXIVClientStructs.FFXIV.Client.Game.UI.PlayerState+WeeklyBingoTaskStatus')
-- WeeklyBingoTaskStatus.Open

--- @alias WeeklyBingoTaskStatusValue
---| 0 # Open
---| 1 # Claimable
---| 2 # Claimed

--- @class WeeklyBingoTaskStatus
--- @field Open WeeklyBingoTaskStatusValue
--- @field Claimable WeeklyBingoTaskStatusValue
--- @field Claimed WeeklyBingoTaskStatusValue
