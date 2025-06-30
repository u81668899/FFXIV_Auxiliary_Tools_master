-- Usage:
-- luanet.load_assembly('FFXIVClientStructs')
-- OceanFishingStatus = luanet.import_type('FFXIVClientStructs.FFXIV.Client.Game.InstanceContent.InstanceContentOceanFishing+OceanFishingStatus')
-- OceanFishingStatus.WaitingForPlayers

--- @alias OceanFishingStatusValue
---| 0 # WaitingForPlayers
---| 1 # SwitchingZone
---| 2 # Fishing
---| 3 # NewZone
---| 4 # Finished

--- @class OceanFishingStatus
--- @field WaitingForPlayers OceanFishingStatusValue
--- @field SwitchingZone OceanFishingStatusValue
--- @field Fishing OceanFishingStatusValue
--- @field NewZone OceanFishingStatusValue
--- @field Finished OceanFishingStatusValue
