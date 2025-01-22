import {
  HMSReactiveStore,
  selectDevices,
  selectHMSMessages,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectIsLocalScreenShared,
  selectIsLocalVideoEnabled,
  selectIsSomeoneScreenSharing,
  selectLocalMediaSettings,
  selectPeers,
  selectPeerScreenSharing,
  selectPeersScreenSharing,
  selectLocalPeer,
  selectAvailableRoleNames,
  selectHLSState,
  selectWhiteboard,
  selectPermissions,
  selectSpeakers,
  selectRoomState,
  selectPolls,
  selectHandRaisedPeers,
} from "@100mslive/hms-video-store";

const hms = new HMSReactiveStore();

// by default subscriber is notified about store changes post subscription only, this can be
// changed to call it right after subscribing too using this function.
hms.triggerOnSubscribe(); // optional, recommended

const hmsActions = hms.getActions();
const hmsStore = hms.getStore();
const hmsNotifications = hms.getNotifications();

const hmsSelectors = {
  hmsDevices: selectDevices,
  hmsMessages: selectHMSMessages,
  hmsIsConnectedToRoom: selectIsConnectedToRoom,
  hmsRoomState: selectRoomState,
  hmsIsLocalAudioEnabled: selectIsLocalAudioEnabled,
  hmsIsLocalScreenShared: selectIsLocalScreenShared,
  hmsIsLocalVideoEnabled: selectIsLocalVideoEnabled,
  hmsIsSomeoneScreenSharing: selectIsSomeoneScreenSharing,
  hmsLocalMediaSettings: selectLocalMediaSettings,
  hmsAllPeers: selectPeers,
  hmsPeerScreenSharing: selectPeerScreenSharing,
  hmsPeersScreenSharing: selectPeersScreenSharing,
  hmsLocalPeer: selectLocalPeer,
  hmsRoleNames: selectAvailableRoleNames,
  hmsHLSState: selectHLSState,
  hmsWhiteboard: selectWhiteboard,
  hmsPermissions: selectPermissions,
  hmsSpeakers: selectSpeakers,
  hmsPolls: selectPolls,
  hmsHandRaisedPeers: selectHandRaisedPeers,
};

export { hmsActions, hmsStore, hmsNotifications, hms, hmsSelectors };
