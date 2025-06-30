-- Usage:
-- luanet.load_assembly('Serilog')
-- LogEventLevel = luanet.import_type('Serilog.Events.LogEventLevel')
-- LogEventLevel.Verbose

--- @alias LogEventLevelValue
---| 0 # Verbose
---| 1 # Debug
---| 2 # Information
---| 3 # Warning
---| 4 # Error
---| 5 # Fatal

--- @class LogEventLevel
--- @field Verbose LogEventLevelValue
--- @field Debug LogEventLevelValue
--- @field Information LogEventLevelValue
--- @field Warning LogEventLevelValue
--- @field Error LogEventLevelValue
--- @field Fatal LogEventLevelValue
