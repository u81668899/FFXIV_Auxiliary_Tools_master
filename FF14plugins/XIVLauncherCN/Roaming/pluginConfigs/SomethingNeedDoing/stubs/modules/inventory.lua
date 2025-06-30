--- @class Inventory
--- @field GetInventoryContainer fun(container: InventoryType): InventoryContainerWrapper
--- @field GetInventoryItem fun(container: InventoryType, slot: number): InventoryItemWrapper
--- @field GetItemCount fun(itemId: number): number
--- @field GetHqItemCount fun(itemId: number): number
--- @field GetCollectableItemCount fun(itemId: number, minimumCollectability: number): number
--- @field GetFreeInventorySlots fun(): number
--- @field GetInventoryItem fun(itemId: number): InventoryItemWrapper
--- @field GetItemsInNeedOfRepairs fun(durability: number): table<InventoryItemWrapper>
--- @field GetSpiritbondedItems fun(): table<InventoryItemWrapper>

--- @type Inventory
--- @as Inventory
Inventory = {}
