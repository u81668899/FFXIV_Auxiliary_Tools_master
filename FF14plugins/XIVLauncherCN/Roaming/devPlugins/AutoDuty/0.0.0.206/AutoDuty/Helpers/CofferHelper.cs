﻿using Dalamud.Plugin.Services;
using ECommons.DalamudServices;
using FFXIVClientStructs.FFXIV.Client.Game;
using System.Collections.Generic;
using System.Linq;
using ECommons.Throttlers;

namespace AutoDuty.Helpers
{
    using FFXIVClientStructs.FFXIV.Client.UI.Misc;
    using Lumina.Excel.Sheets;

    internal class CofferHelper : ActiveHelperBase<CofferHelper>
    {
        private readonly List<InventoryItem> doneItems = [];
        private          int                 initialGearset;

        internal override unsafe void Start()
        {
            base.Start();
            this.initialGearset = RaptureGearsetModule.Instance()->CurrentGearsetIndex;
            this.doneItems.Clear();
        }

        protected override string Name        { get; } = nameof(CofferHelper);
        protected override string DisplayName { get; } = "Opening Coffers";

        protected override unsafe void HelperUpdate(IFramework framework)
        {
            if (!this.UpdateBase())
                return;

            if (Conditions.Instance()->Mounted)
            {
                ActionManager.Instance()->UseAction(ActionType.GeneralAction, 23);
                return;
            }

            if (InventoryManager.Instance()->GetEmptySlotsInBag() < 1)
            {
                this.Stop();
                return;
            }

            if (PlayerHelper.IsCasting || !PlayerHelper.IsReadyFull || Player.IsBusy)
                return;

            this.DebugLog("Checking items");

            IEnumerable <InventoryItem> items = InventoryHelper.GetInventorySelection(InventoryType.Inventory1, InventoryType.Inventory2, InventoryType.Inventory3, InventoryType.Inventory4)
                                                               .Where(iv =>
                                                                      {
                                                                          Item? excelItem = InventoryHelper.GetExcelItem(iv.ItemId);
                                                                          return !this.doneItems.Contains(iv) && excelItem.HasValue && ValidCoffer(excelItem.Value);
                                                                      });


            RaptureGearsetModule* module = RaptureGearsetModule.Instance();
            
            if (items.Any())
            {
                this.DebugLog("item found");
                if (Plugin.Configuration.AutoOpenCoffersGearset != null && module->CurrentGearsetIndex != Plugin.Configuration.AutoOpenCoffersGearset)
                {
                    this.DebugLog("change gearset");
                    if (!module->IsValidGearset((int)Plugin.Configuration.AutoOpenCoffersGearset))
                    {
                        this.DebugLog("invalid gearset");
                        Plugin.Configuration.AutoOpenCoffersGearset = null;
                        Plugin.Configuration.Save();
                    } else
                    {
                        module->EquipGearset(Plugin.Configuration.AutoOpenCoffersGearset.Value);
                        return;
                    }
                }

                InventoryItem item = items.First();

                InventoryHelper.UseItem(item.ItemId);

                if (!PlayerHelper.IsCasting)
                {
                    this.DebugLog("failed to use item");
                    return;
                }

                this.DebugLog("item used");
                this.doneItems.Add(item);

            } else if (this.initialGearset != module->CurrentGearsetIndex)
            {
                if (!EzThrottler.Throttle("CofferChangeBack", 1000))
                    return;

                this.DebugLog("change back to original gearset");
                module->EquipGearset(this.initialGearset);
            }
            else
            {
                this.DebugLog("no items found");
                this.Stop();
            }
        }

        internal static bool ValidCoffer(Item item) => // Miscellany
            item.ItemAction.RowId is 1085 or 388 && item.ItemUICategory.RowId is 61 && (!Plugin.Configuration.AutoOpenCoffersBlacklistUse || !Plugin.Configuration.AutoOpenCoffersBlacklist.ContainsKey(item.RowId));
    }
}