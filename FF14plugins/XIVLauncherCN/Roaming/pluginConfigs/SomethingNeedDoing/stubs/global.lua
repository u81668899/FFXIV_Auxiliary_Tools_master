--- @alias object any

--- @param value string
--- @return nil
function yield(value) end

--- @param assemblyName string
--- @param packageName string?
--- @return table
function import(assemblyName, packageName) end

--- @param assemblyName string
--- @param packageName string?
--- @return table
function CLRPackage(assemblyName, packageName) end

--- @class Luanet
--- @field load_assembly fun(assemblyName: string): boolean
--- @field import_type fun(typename: string): boolean
--- @field namespace fun(ns: string|string[]|table<string>): boolean
--- @field make_array fun(type: object, from: table): object[]
--- @field each fun(source: object[]|table): fun(): object
--- @field enum fun(enumType: string): table<string, integer>
--- @field enum fun(enumType: object, value: string|integer): object
--- @field ctype fun(proxy: object): object
--- @field make_object fun(methodTable: table, className: string): object
--- @field free_object fun(obj: object): nil
--- @field get_object_member fun(obj: object, member: string|integer): object

--- @type Luanet
--- @as Luanet
luanet = {}
