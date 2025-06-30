﻿using ECommons.DalamudServices;
using ECommons.EzIpcManager;
using ECommons.Reflection;
using FFXIVClientStructs.FFXIV.Client.Game;
using FFXIVClientStructs.FFXIV.Client.UI.Misc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;
#nullable disable

namespace AutoDuty.IPC
{
    using System.ComponentModel;
    using ECommons.GameFunctions;
    using Helpers;

    internal static class AutoRetainer_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(AutoRetainer_IPCSubscriber), "AutoRetainer.PluginState", SafeWrapper.IPCException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("AutoRetainer");

        [EzIPC] internal static readonly Func<bool> IsBusy;
        [EzIPC] internal static readonly Func<Dictionary<ulong, HashSet<string>>> GetEnabledRetainers;
        [EzIPC] internal static readonly Func<bool> AreAnyRetainersAvailableForCurrentChara;
        [EzIPC] internal static readonly Action AbortAllTasks;
        [EzIPC] internal static readonly Action DisableAllFunctions;
        [EzIPC] internal static readonly Action EnableMultiMode;
        [EzIPC] internal static readonly Func<int> GetInventoryFreeSlotCount;
        [EzIPC] internal static readonly Action EnqueueHET;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }

    internal static class AM_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(AM_IPCSubscriber), "AutoBot", SafeWrapper.IPCException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("AutoBot");

        [EzIPC] internal static readonly Action Start;
        [EzIPC] internal static readonly Action Stop;
        [EzIPC] internal static readonly Func<bool> IsRunning;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }

    internal static class Marketbuddy_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(Marketbuddy_IPCSubscriber), "Marketbuddy", SafeWrapper.IPCException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("Marketbuddy");

        [EzIPC] internal static readonly Func<string, bool> IsLocked;
        [EzIPC] internal static readonly Func<string, bool> Lock;
        [EzIPC] internal static readonly Func<string, bool> Unlock;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }

    internal static class DiscardHelper_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(DiscardHelper_IPCSubscriber), "ARDiscard", SafeWrapper.AnyException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("ARDiscard");

        [EzIPC("IsRunning", true)] internal static readonly Func<bool> IsRunning;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }

    internal static class BossModReborn_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(BossModReborn_IPCSubscriber), "BossMod", SafeWrapper.AnyException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("BossModReborn");

        [EzIPC("AI.GetPreset", true)] internal static readonly Func<string> Presets_GetActive;

        [EzIPC("AI.SetPreset", true)] internal static readonly Action<string> Presets_SetActive;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }


    internal static class BossMod_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(BossMod_IPCSubscriber), "BossMod", SafeWrapper.AnyException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("BossMod") || IPCSubscriber_Common.IsReady("BossModReborn");

        [EzIPC] internal static readonly Func<uint, bool> HasModuleByDataId;
        [EzIPC] internal static readonly Func<IReadOnlyList<string>, bool, List<string>> Configuration;
        [EzIPC("Presets.Get", true)] internal static readonly Func<string, string?> Presets_Get;
        [EzIPC("Presets.Create", true)] internal static readonly Func<string, bool, bool> Presets_Create;
        [EzIPC("Presets.Delete", true)] internal static readonly Func<string, bool> Presets_Delete;
        [EzIPC("Presets.GetActive", true)] internal static readonly Func<string> Presets_GetActive;
        [EzIPC("Presets.SetActive", true)] internal static readonly Func<string, bool> Presets_SetActive;
        [EzIPC("Presets.ClearActive", true)] internal static readonly Func<bool> Presets_ClearActive;
        [EzIPC("Presets.GetForceDisabled", true)] internal static readonly Func<bool> Presets_GetForceDisabled; 
        [EzIPC("Presets.SetForceDisabled", true)] internal static readonly Func<bool> Presets_SetForceDisabled;
        /** string presetName, string moduleTypeName, string trackName, string value*/
        [EzIPC("Presets.AddTransientStrategy")] internal static readonly Func<string, string, string, string, bool> Presets_AddTransientStrategy;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);

        public static void AddPreset(string name, string preset)
        {
            //check if our preset does not exist
            if (Presets_Get(name) == null)
                //load it
                Svc.Log.Debug($"AutoDuty Preset Loaded: {Presets_Create(preset, true)}");
        }

        public static void RefreshPreset(string name, string preset)
        {
            if (Presets_Get(name) != null)
                Presets_Delete(name);
            AddPreset(name, preset);
        }

        public static void SetPreset(string name)
        {
            if (Presets_GetActive() != name)
            {
                Presets_SetActive(name);
                if (BossModReborn_IPCSubscriber.IsEnabled)
                {
                    if(BossModReborn_IPCSubscriber.Presets_GetActive() != name)
                    {
                        BossModReborn_IPCSubscriber.Presets_SetActive(name);
                    }
                }
            }
        }

        public static void DisablePresets()
        {
            if (!Presets_GetForceDisabled())
                Presets_SetForceDisabled();
        }

        public static void SetRange(float range)
        {
            if (Plugin.Configuration.AutoManageBossModAISettings)
            {
                if (IPCSubscriber_Common.IsReady("BossModReborn"))
                    if (Math.Abs(ReflectionHelper.BossModReborn_Reflection.MaxDistanceToTarget(ReflectionHelper.BossModReborn_Reflection.configInstance) - range) > 0.1)
                        ReflectionHelper.BossModReborn_Reflection.MaxDistanceToTarget(ReflectionHelper.BossModReborn_Reflection.configInstance) = range;

                Presets_AddTransientStrategy("AutoDuty",         "BossMod.Autorotation.MiscAI.StayCloseToTarget", "range", MathF.Round(range, 1).ToString(CultureInfo.InvariantCulture));
                Presets_AddTransientStrategy("AutoDuty Passive", "BossMod.Autorotation.MiscAI.StayCloseToTarget", "range", MathF.Round(range, 1).ToString(CultureInfo.InvariantCulture));
            }
        }
    }

    /* Seem's YesAlready is not Initializing this
    internal static class YesAlready_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(YesAlready_IPCSubscriber), "YesAlready", SafeWrapper.IPCException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("YesAlready");

        [EzIPC("YesAlready.SetPluginEnabled", false)] internal static readonly Action<bool> SetPluginEnabled;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }*/

    internal static class Deliveroo_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(Deliveroo_IPCSubscriber), "Deliveroo", SafeWrapper.IPCException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("Deliveroo");

        [EzIPC] internal static readonly Func<bool> IsTurnInRunning;
        //[EzIPC] internal static readonly Action TurnInStarted;
        //[EzIPC] internal static readonly Action TurnInStopped;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }

    internal static class Gearsetter_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(Gearsetter_IPCSubscriber), "Gearsetter", SafeWrapper.IPCException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("Gearsetter");

        [EzIPC] internal static readonly Func<byte, List<(uint ItemId, InventoryType? SourceInventory, byte? SourceInventorySlot, RaptureGearsetModule.GearsetItemIndex TargetSlot)>> GetRecommendationsForGearset;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }

    internal static class VNavmesh_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(VNavmesh_IPCSubscriber), "vnavmesh", SafeWrapper.IPCException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("vnavmesh");

        [EzIPC("Nav.IsReady",            true)] internal static readonly Func<bool>                                                           Nav_IsReady;
        [EzIPC("Nav.BuildProgress",      true)] internal static readonly Func<float>                                                          Nav_BuildProgress;
        [EzIPC("Nav.Reload",             true)] internal static readonly Func<bool>                                                           Nav_Reload;
        [EzIPC("Nav.Rebuild",            true)] internal static readonly Func<bool>                                                           Nav_Rebuild;
        [EzIPC("Nav.Pathfind",           true)] internal static readonly Func<Vector3, Vector3, bool, Task<List<Vector3>>>                    Nav_Pathfind;
        [EzIPC("Nav.PathfindCancelable", true)] internal static readonly Func<Vector3, Vector3, bool, CancellationToken, Task<List<Vector3>>> Nav_PathfindCancelable;
        [EzIPC("Nav.PathfindCancelAll",  true)] internal static readonly Action                                                               Nav_PathfindCancelAll;
        [EzIPC("Nav.PathfindInProgress", true)] internal static readonly Func<bool>                                                           Nav_PathfindInProgress;
        [EzIPC("Nav.PathfindNumQueued",  true)] internal static readonly Func<int>                                                            Nav_PathfindNumQueued;
        [EzIPC("Nav.IsAutoLoad",         true)] internal static readonly Func<bool>                                                           Nav_IsAutoLoad;
        [EzIPC("Nav.SetAutoLoad",        true)] internal static readonly Action<bool>                                                         Nav_SetAutoLoad;

        [EzIPC("Query.Mesh.NearestPoint", true)] internal static readonly Func<Vector3, float, float, Vector3> Query_Mesh_NearestPoint;
        [EzIPC("Query.Mesh.PointOnFloor", true)] internal static readonly Func<Vector3, bool, float, Vector3> Query_Mesh_PointOnFloor;

        [EzIPC("Path.MoveTo", true)] internal static readonly Action<List<Vector3>, bool> Path_MoveTo;
        [EzIPC("Path.Stop", true)] internal static readonly Action Path_Stop;
        [EzIPC("Path.IsRunning", true)] internal static readonly Func<bool> Path_IsRunning;
        [EzIPC("Path.NumWaypoints", true)] internal static readonly Func<int> Path_NumWaypoints;
        [EzIPC("Path.GetMovementAllowed", true)] internal static readonly Func<bool> Path_GetMovementAllowed;
        [EzIPC("Path.SetMovementAllowed", true)] internal static readonly Action<bool> Path_SetMovementAllowed;
        [EzIPC("Path.GetAlignCamera", true)] internal static readonly Func<bool> Path_GetAlignCamera;
        [EzIPC("Path.SetAlignCamera", true)] internal static readonly Action<bool> Path_SetAlignCamera;
        [EzIPC("Path.GetTolerance", true)] internal static readonly Func<float> Path_GetTolerance;
        [EzIPC("Path.SetTolerance", true)] internal static readonly Action<float> Path_SetTolerance;

        [EzIPC("SimpleMove.PathfindAndMoveTo", true)] internal static readonly Func<Vector3, bool, bool> SimpleMove_PathfindAndMoveTo;
        [EzIPC("SimpleMove.PathfindInProgress", true)] internal static readonly Func<bool> SimpleMove_PathfindInProgress;

        [EzIPC("Window.IsOpen", true)] internal static readonly Func<bool> Window_IsOpen;
        [EzIPC("Window.SetOpen", true)] internal static readonly Action<bool> Window_SetOpen;

        [EzIPC("DTR.IsShown", true)] internal static readonly Func<bool> DTR_IsShown;
        [EzIPC("DTR.SetShown", true)] internal static readonly Action<bool> DTR_SetShown;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }

    internal static class PandorasBox_IPCSubscriber
    {
        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(PandorasBox_IPCSubscriber), "PandorasBox", SafeWrapper.IPCException);

        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("PandorasBox");

        [EzIPC] internal static readonly Action<string, int> PauseFeature;
        [EzIPC] internal static readonly Action<string, bool> SetFeatureEnabled;
        [EzIPC] internal static readonly Func<string, bool> GetFeatureEnabled;
        [EzIPC] internal static readonly Action<string, string, bool> SetConfigEnabled;

        internal static void Dispose() => IPCSubscriber_Common.DisposeAll(_disposalTokens);
    }

    public static class Wrath_IPCSubscriber
    {
        /// <summary>
        ///     Why a lease was cancelled.
        /// </summary>
        public enum CancellationReason
        {
            [Description("The Wrath user manually elected to revoke your lease.")]
            WrathUserManuallyCancelled,

            [Description("Your plugin was detected as having been disabled, " +
                         "not that you're likely to see this.")]
            LeaseePluginDisabled,

            [Description("The Wrath plugin is being disabled.")]
            WrathPluginDisabled,

            [Description("Your lease was released by IPC call, " +
                         "theoretically this was done by you.")]
            LeaseeReleased,

            [Description("IPC Services have been disabled remotely. "                 +
                         "Please see the commit history for /res/ipc_status.txt. \n " +
                         "https://github.com/PunishXIV/WrathCombo/commits/main/res/ipc_status.txt")]
            AllServicesSuspended,
        }

        /// <summary>
        ///     The subset of <see cref="AutoRotationConfig" /> options that can be set
        ///     via IPC.
        /// </summary>
        public enum AutoRotationConfigOption
        {
            InCombatOnly         = 0, //bool
            DPSRotationMode      = 1,
            HealerRotationMode   = 2,
            FATEPriority         = 3,  //bool
            QuestPriority        = 4,  //bool
            SingleTargetHPP      = 5,  //int
            AoETargetHPP         = 6,  //int
            SingleTargetRegenHPP = 7,  //int
            ManageKardia         = 8,  //bool
            AutoRez              = 9,  //bool
            AutoRezDPSJobs       = 10, //bool
            AutoCleanse          = 11, //bool
            IncludeNPCs          = 12, //bool
            OnlyAttackInCombat   = 13, //bool
        }

        public enum DPSRotationMode
        {
            Manual          = 0,
            Highest_Max     = 1,
            Lowest_Max      = 2,
            Highest_Current = 3,
            Lowest_Current  = 4,
            Tank_Target     = 5,
            Nearest         = 6,
            Furthest        = 7,
        }

        /// <summary>
        ///     The subset of <see cref="AutoRotationConfig.HealerRotationMode" /> options
        ///     that can be set via IPC.
        /// </summary>
        public enum HealerRotationMode
        {
            Manual          = 0,
            Highest_Current = 1,
            Lowest_Current  = 2
            //Self_Priority,
            //Tank_Priority,
            //Healer_Priority,
            //DPS_Priority,
        }

        public enum SetResult
        {
            [Description("A default value that shouldn't ever be seen.")]
            IGNORED = -1,

            // Success Statuses

            [Description("The configuration was set successfully.")]
            Okay = 0,

            [Description("The configuration will be set, it is working asynchronously.")]
            OkayWorking = 1,

            // Error Statuses
            [Description("IPC services are currently disabled.")]
            IPCDisabled = 10,

            [Description("Invalid lease.")]
            InvalidLease = 11,

            [Description("Blacklisted lease.")]
            BlacklistedLease = 12,

            [Description("Configuration you are trying to set is already set.")]
            Duplicate = 13,

            [Description("Player object is not available.")]
            PlayerNotAvailable = 14,

            [Description("The configuration you are trying to set is not available.")]
            InvalidConfiguration = 15,

            [Description("The value you are trying to set is invalid.")]
            InvalidValue = 16,
        }

        private static Guid? _curLease;


        internal static bool IsEnabled => IPCSubscriber_Common.IsReady("WrathCombo");

        private static EzIPCDisposalToken[] _disposalTokens = EzIPC.Init(typeof(Wrath_IPCSubscriber), "WrathCombo", SafeWrapper.IPCException);

        /// <summary>
        ///     Register your plugin for control of Wrath Combo.
        /// </summary>
        /// <param name="internalPluginName">
        ///     The internal name of your plugin.<br />
        ///     Needs to be the actual internal name of your plugin, as it will be used
        ///     to check if your plugin is still loaded.
        /// </param>
        /// <param name="pluginName">
        ///     The name you want shown to Wrath users for options your plugin controls.
        /// </param>
        /// <param name="leaseCancelledCallback">
        ///     Your method to be called when your lease is cancelled, usually
        ///     by the user.<br />
        ///     The <see cref="CancellationReason" /> and a string with any additional
        ///     info will be passed to your method.
        /// </param>
        /// <returns>
        ///     Your lease ID to be used in <c>set</c> calls.<br />
        ///     Or <c>null</c> if your lease was not registered, which can happen for
        ///     multiple reasons:
        ///     <list type="bullet">
        ///         <item>
        ///             <description>
        ///                 A lease exists with the <c>pluginName</c>.
        ///             </description>
        ///         </item>
        ///         <item>
        ///             <description>
        ///                 Your lease was revoked by the user recently.
        ///             </description>
        ///         </item>
        ///         <item>
        ///             <description>
        ///                 The IPC service is currently disabled.
        ///             </description>
        ///         </item>
        ///     </list>
        /// </returns>
        /// <remarks>
        ///     Each lease is limited to controlling <c>60</c> configurations.
        /// </remarks>
        [EzIPC] private static readonly Func<string, string, string?, Guid?> RegisterForLeaseWithCallback;

        /// <summary>
        ///     Get the current state of the Auto-Rotation setting in Wrath Combo.
        /// </summary>
        /// <returns>Whether Auto-Rotation is enabled or disabled</returns>
        /// <remarks>
        ///     This is only the state of Auto-Rotation, not whether any combos are
        ///     enabled in Auto-Mode.
        /// </remarks>
        [EzIPC] internal static readonly Func<bool> GetAutoRotationState;

        /// <summary>
        ///     Set the state of Auto-Rotation in Wrath Combo.
        /// </summary>
        /// <param name="lease">Your lease ID from <see cref="RegisterForLease" /></param>
        /// <param name="enabled">
        ///     Optionally whether to enable Auto-Rotation.<br />
        ///     Only used to disable Auto-Rotation, as enabling it is the default.
        /// </param>
        /// <seealso cref="GetAutoRotationState" />
        /// <remarks>
        ///     This is only the state of Auto-Rotation, not whether any combos are
        ///     enabled in Auto-Mode.
        /// </remarks>
        /// <value>+1 <c>set</c></value>
        [EzIPC] private static readonly Func<Guid, bool, SetResult> SetAutoRotationState;

        /// <summary>
        ///     Checks if the current job has a Single and Multi-Target combo configured
        ///     that are enabled in Auto-Mode.
        /// </summary>
        /// <returns>
        ///     If the user's current job is fully ready for Auto-Rotation.
        /// </returns>
        [EzIPC] internal static readonly Func<bool> IsCurrentJobAutoRotationReady;

        /// <summary>
        ///     Sets up the user's current job for Auto-Rotation.<br />
        ///     This will enable the Single and Multi-Target combos, and enable them in
        ///     Auto-Mode.<br />
        ///     This will try to use the user's existing settings, only enabling default
        ///     states for jobs that are not configured.
        /// </summary>
        /// <value>
        ///     +2 <c>set</c><br />
        ///     (can be up to 38 for non-simple jobs, the highest being healers)
        /// </value>
        /// <param name="lease">Your lease ID from <see cref="RegisterForLease" /></param>
        /// <remarks>This can take a little bit to finish.</remarks>
        [EzIPC] private static readonly Func<Guid, SetResult> SetCurrentJobAutoRotationReady;

        /// <summary>
        ///     This cancels your lease, removing your control of Wrath Combo.
        /// </summary>
        /// <param name="lease">Your lease ID from <see cref="RegisterForLease" /></param>
        /// <remarks>
        ///     Will call your <c>leaseCancelledCallback</c> method if you provided one,
        ///     with the reason <see cref="CancellationReason.LeaseeReleased" />.
        /// </remarks>
        [EzIPC] private static readonly Action<Guid> ReleaseControl;

        /// <summary>
        ///     Get the state of Auto-Rotation Configuration in Wrath Combo.
        /// </summary>
        /// <param name="option">The option to check the value of.</param>
        /// <returns>The correctly-typed value of the configuration.</returns>
        [EzIPC] private static readonly Func<AutoRotationConfigOption, object?> GetAutoRotationConfigState;

        /// <summary>
        ///     Set the state of Auto-Rotation Configuration in Wrath Combo.
        /// </summary>
        /// <param name="lease">Your lease ID from <see cref="RegisterForLease" /></param>
        /// <param name="option">
        ///     The Auto-Rotation Configuration option you want to set.<br />
        ///     This is a subset of the Auto-Rotation options, flattened into a single
        ///     enum.
        /// </param>
        /// <param name="value">
        ///     The value you want to set the option to.<br />
        ///     All valid options can be parsed from an int, or the exact expected types.
        /// </param>
        /// <value>+1 <c>set</c></value>
        /// <seealso cref="AutoRotationConfigOption"/>
        /// <seealso cref="DPSRotationMode"/>
        /// <seealso cref="HealerRotationMode"/>
        [EzIPC] private static readonly Func<Guid, AutoRotationConfigOption, object, SetResult> SetAutoRotationConfigState;

        public static bool DoThing(Func<SetResult> action)
        {
            SetResult result = action();
            bool      check  = result.CheckResult();
            if (!check && result == SetResult.InvalidLease)
                check = action().CheckResult();
            return check;
        }

        private static bool CheckResult(this SetResult result)
        {
            switch (result)
            {
                case SetResult.Okay:
                case SetResult.OkayWorking:
                    return true;
                case SetResult.InvalidLease:
                    _curLease = null;
                    Register();
                    return false;
                case SetResult.BlacklistedLease:
                    Plugin.Configuration.AutoManageRotationPluginState = false;
                    Plugin.Configuration.Save();
                    return false;
                case SetResult.IPCDisabled:
                case SetResult.Duplicate:
                case SetResult.PlayerNotAvailable:
                case SetResult.InvalidConfiguration:
                case SetResult.InvalidValue:
                case SetResult.IGNORED:
                    return false;
                default:
                    throw new ArgumentOutOfRangeException(nameof(result), result, null);
            }
        }

        internal static bool SetJobAutoReady() => 
            Register() && DoThing(() => SetCurrentJobAutoRotationReady(_curLease!.Value));

        internal static void SetAutoMode(bool on)
        {
            if (Register())
            {
                bool autoRotationState = DoThing(() => SetAutoRotationState(_curLease!.Value, on));
                if (autoRotationState && on)
                {
                    SetAutoRotationConfigState(_curLease.Value, AutoRotationConfigOption.InCombatOnly,       false);
                    SetAutoRotationConfigState(_curLease.Value, AutoRotationConfigOption.AutoRez,            true);
                    SetAutoRotationConfigState(_curLease.Value, AutoRotationConfigOption.AutoRezDPSJobs,     true);
                    SetAutoRotationConfigState(_curLease.Value, AutoRotationConfigOption.IncludeNPCs,        true);
                    SetAutoRotationConfigState(_curLease.Value, AutoRotationConfigOption.OnlyAttackInCombat, false);

                    DPSRotationMode dpsConfig = Plugin.CurrentPlayerItemLevelandClassJob.Value.GetCombatRole() == CombatRole.Tank ?
                                                    Plugin.Configuration.Wrath_TargetingTank :
                                                    Plugin.Configuration.Wrath_TargetingNonTank;
                    SetAutoRotationConfigState(_curLease.Value, AutoRotationConfigOption.DPSRotationMode, dpsConfig);

                    SetAutoRotationConfigState(_curLease.Value, AutoRotationConfigOption.HealerRotationMode, HealerRotationMode.Lowest_Current);

                }
            }
        }

        internal static bool Register()
        {
            if (_curLease == null)
            {
                _curLease = RegisterForLeaseWithCallback("AutoDuty", "AutoDuty", null);

                if (_curLease == null && IsEnabled)
                {
                    Plugin.Configuration.AutoManageRotationPluginState = false;
                    Plugin.Configuration.Save();
                }
            }
            return _curLease != null;
        }

        internal static void CancelActions(int reason, string s)
        {
            switch ((CancellationReason) reason)
            {
                case CancellationReason.WrathUserManuallyCancelled:
                    Plugin.Configuration.AutoManageRotationPluginState = false;
                    Plugin.Configuration.Save();
                    break;
                case CancellationReason.LeaseePluginDisabled:
                case CancellationReason.WrathPluginDisabled:
                case CancellationReason.LeaseeReleased:
                case CancellationReason.AllServicesSuspended:
                default:
                    break;
            }

            _curLease = null;
            Svc.Log.Info($"Wrath lease cancelled via {(CancellationReason) reason} for: {s}");
        }

        internal static void Release()
        {
            if (_curLease.HasValue)
            {
                ReleaseControl(_curLease.Value);
                _curLease = null;
            }
        }

        internal static void Dispose()
        {
            Release();
            IPCSubscriber_Common.DisposeAll(_disposalTokens);
        }
    }


    internal class IPCSubscriber_Common
    {
        internal static bool IsReady(string pluginName) => DalamudReflector.TryGetDalamudPlugin(pluginName, out _, false, true);

        internal static Version Version(string pluginName) => DalamudReflector.TryGetDalamudPlugin(pluginName, out var dalamudPlugin, false, true) ? dalamudPlugin.GetType().Assembly.GetName().Version : new Version(0, 0, 0, 0);

        internal static void DisposeAll(EzIPCDisposalToken[] _disposalTokens)
        {
            foreach (var token in _disposalTokens)
            {
                try
                {
                    token.Dispose();
                }
                catch (Exception ex)
                {
                    Svc.Log.Error($"Error while unregistering IPC: {ex}");
                }
            }
        }
    }
}
