import { createStore } from "vuex";
import { hmsStore, hmsSelectors } from "@/utils/hms";

export default createStore({
  state: {
    meet: {},
    course: null,

    pollId: null,
    openPopup: "",
    settingOpen: "",
    pinId: null,
    spotlightId: null,
    screenTrackId: null,

    pdfConfig: null,

    showPIP: false,

    end: {
      show: false,
      disconnect: false,
    },

    users: {
      host: null,
      "co-host": null,
      guest: null,
    },

    dialog: {
      hls: false,
      stophls: false,
      pdf: false,
      disconnect: false,
      share: false,
      mute: {
        open: false,
        data: {},
      },
    },

    notifications: {
      peerJoined: false,
      peerLeave: false,
      handRaised: false,
      error: true,
    },
    layout: {
      mirrorLocalVideo: true,
      onlyAudio: false,
      hideLocalVideo: false,
      maxTileCount: 49,
      view: "Tiled",
      hideWithoutVideo: false,
    },

    hmsLocalPeer: null,
    hmsAllPeers: [],
    hmsIsConnectedToRoom: null,
    hmsRoomState: null,
    hmsIsLocalAudioEnabled: null,
    hmsIsLocalVideoEnabled: null,
    hmsMessages: [],
    hmsDevices: [],
    hmsLocalMediaSettings: null,
    hmsIsLocalScreenShared: null,
    hmsIsSomeoneScreenSharing: null,
    hmsPeerScreenSharing: null,
    hmsPeersScreenSharing: [],
    hmsRoleNames: [],
    hmsHLSState: null,
    hmsWhiteboard: null,
    hmsPermissions: {},
    hmsSpeakers: [],
    hmsPolls: [],
    hmsHandRaisedPeers: [],
  },
  getters: {
    hmsPeers: (state) => {
      const uniqueIds = new Set();
      return state.hmsAllPeers.filter((peer) => {
        if (uniqueIds.has(peer.customerUserId)) {
          return false;
        } else {
          uniqueIds.add(peer.customerUserId);
          return true;
        }
      });
    },
  },
  mutations: {},
  actions: {
    // This will trigger a callback anytime the store changes
    initialiseSubscribe({ dispatch, state }) {
      for (const selectorName in hmsSelectors) {
        // we set the initial values
        hmsStore.subscribe((value) => {
          dispatch("updateHmsSelector", { value, selector: selectorName });
        }, hmsSelectors[selectorName]);
      }
    },
    updateHmsSelector({ state }, { value, selector }) {
      const parsedValue = value ? JSON.parse(JSON.stringify(value)) : undefined;
      state[selector] = parsedValue;
    },
  },
  modules: {},
});
