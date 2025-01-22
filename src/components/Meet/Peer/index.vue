<template>
  <div
    ref="box"
    class="relative h-full w-full overflow-hidden rounded-5 bg-[#202020] transition-all"
  >
    <!--show avatar if video is either muted or degraded-->
    <div
      v-if="metaData.isBRBOn"
      class="absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#191e27]"
    >
      <div class="rounded border px-0.5 text-10">BRB</div>
    </div>
    <div
      v-if="
        !videoTrack?.enabled || videoTrack?.degraded || !isEnabled(videoTrack)
      "
      class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-[#202020]"
    >
      <div
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        :class="level ? 'avatar-animate' : ''"
        :style="{ width: `${Width}px`, height: `${Height}px` }"
      />
      <BaseAvatarPicture
        v-if="metaData?.picture"
        :picture="metaData?.picture"
        class="shrink-0 !p-0"
        :style="{ width: `${Width}px`, height: `${Height}px` }"
      />
      <MeetPeerUserAvartar
        v-else
        :name="peer.name"
        :style="{
          width: `${Width}px`,
          height: `${Height}px`,
          fontSize: `${Width / 3}px`,
        }"
      />
    </div>
    <MeetVideo
      :mirror="isShare ? false : peer.isLocal"
      :track-id="videoTrack?.id"
      :peer-id="peer.id"
    />
    <div
      class="absolute flex max-w-[80%] items-center truncate rounded-5 transition-all"
      :class="[blClass, expandClass]"
    >
      <div
        v-if="isExpand"
        class="bg-pill absolute left-0 top-0 h-6 w-full rounded-5 bg-[#FAFAFA]"
        :class="scale < 0.25 ? 'h-4' : 'h-6'"
      />
      <div
        v-if="peer.isHandRaised"
        class="z-10 flex items-center justify-center"
        :class="scale < 0.25 ? 'size-4' : 'size-6'"
      >
        <i class="fa-regular fa-hand" />
      </div>
      <div
        v-if="pinId === peer.id || hmsStore.pinId === peer.id"
        class="z-10 flex items-center justify-center"
        :class="scale < 0.25 ? 'size-4' : 'size-6'"
      >
        <i class="fa-regular fa-thumbtack" />
      </div>
      <div
        v-if="shareIds.includes(peer.id)"
        class="z-10 flex items-center justify-center"
        :class="scale < 0.25 ? 'size-4' : 'size-6'"
      >
        <i class="fa-regular fa-square-arrow-up" />
      </div>
      <div
        :class="isExpand ? 'name-pill relative z-10 overflow-hidden' : ''"
        class="flex items-center truncate"
        :style="textStyle"
      >
        <div class="truncate">
          {{ peer.name }}
        </div>
        <span v-if="!isJoin && hmsLocalPeer.id === peer.id">
          (You)
        </span>

        <span v-if="isShare" class="truncate">
          (Presentation)
        </span>
      </div>
      <MeetPeerConnectionQuality
        v-if="!isJoin"
        :is-show="!isExpand"
        :peer-id="peer.id"
      />
    </div>
    <div
      class="absolute flex h-6 w-6 items-center justify-center rounded-full"
      :class="[isAudioEnabled ? 'bg-black/30' : '', audioClass]"
    >
      <div
        v-if="isAudioEnabled"
        class="flex h-4 items-center gap-0.5 transition-all"
      >
        <div
          class="min-h-1 w-1 rounded-full bg-white"
          :class="levelLock ? 'waveform-bar' : ''"
          :style="{
            height: level ? `${(level / 4) * 2}%` : '',
          }"
        />
        <div
          class="min-h-1 w-1 rounded-full bg-white"
          :class="levelLock ? 'waveform-bar' : ''"
          :style="{
            height: level ? `${(level / 4) * 3}% ` : '',
          }"
        />
        <div
          class="min-h-1 w-1 rounded-full bg-white"
          :class="levelLock ? 'waveform-bar' : ''"
          :style="{
            height: level ? `${(level / 4) * 2}%` : '',
          }"
        />
      </div>
      <i
        v-if="!isAudioEnabled"
        class="fa-regular fa-microphone-slash text-[#FAFAFA]"
      />
    </div>
  </div>
</template>
<script>
import {
  selectCameraStreamByPeerID,
  selectScreenShareByPeerID,
  selectIsPeerAudioEnabled,
  selectIsPeerVideoEnabled,
  selectPeerAudioByID,
  selectPeerMetadata,
} from "@100mslive/hms-video-store";
import { ref } from 'vue';
import { useResizeObserver } from "@vueuse/core";
import { hmsActions, hmsStore } from "@/utils/hms";
import BaseAvatarPicture from "@/components/Base/Avatar/Picture.vue";
import MeetPeerUserAvartar from "@/components/Meet/Peer/UserAvartar.vue";
import MeetVideo from "@/components/Meet/Video.vue";
import MeetPeerConnectionQuality from "@/components/Meet/Peer/ConnectionQuality.vue";

export default {
  name: "MeetPeer",
  props: {
    peer: {
      type: Object,
    },
    isJoin: {
      type: Boolean,
      default: false,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    isShare: {
      type: Boolean,
      default: false,
    },
    shareIds: {
      type: Array,
      default: () => [],
    },
    pinId: [String, null],
    spotlightId: [String, null],
  },
  components: {
    BaseAvatarPicture,
    MeetPeerUserAvartar,
    MeetVideo,
    MeetPeerConnectionQuality,
  },
  setup() {
    const box = ref(null);
    const scale = ref(1);
    const Height = ref(40);
    const Width = ref(40);
    useResizeObserver(box, (entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        Height.value = height / 3;
        Width.value = height / 3;
        if (height < 540) {
          scale.value = height / 540;
        } else {
          scale.value = 1;
        }
      }
    });
    return { box, scale, Height, Width };
  },
  data() {
    return {
      videoTrack: null,
      isAudioEnabled: false,
      isVideoEnabled: false,
      unsub1: null,
      unsub2: null,
      unsub3: null,
      unsub4: null,
      level: 0,
      levelLock: false,
      metaData: {},
      lowerHand: false,
    };
  },
  computed: {
    hmsStore() {
      return this.$store.state;
    },
    hmsLocalPeer() {
      return this.hmsStore.hmsLocalPeer;
    },
    isHost() {
      const roleName = this.hmsLocalPeer.roleName;
      return roleName === "host" || roleName === "co-host";
    },
    blClass() {
      return this.scale < 1
        ? this.scale < 0.25
          ? "bottom-1 left-1 text-10"
          : "bottom-2 left-2 text-sm"
        : "bottom-4 left-4 text-base";
    },
    isExpand() {
      return (
        this.peer.isHandRaised ||
        this.pinId === this.peer.id ||
        this.hmsStore.pinId === this.peer.id ||
        this.shareIds.includes(this.peer.id)
      );
    },
    expandClass() {
      return this.isExpand
        ? this.scale < 0.25
          ? "h-4 pr-1 text-[#0A0A0A]"
          : "h-6 pr-1.5 text-[#0A0A0A]"
        : "font-semibold text-[#FAFAFA]";
    },
    audioClass() {
      return this.scale < 1
        ? this.scale < 0.25
          ? "top-1 right-1  scale-50 origin-top-right"
          : "top-2 right-2"
        : "top-4 right-4";
    },
    textStyle() {
      return this.isExpand
        ? {}
        : {
            textShadow: "0px 1px 1px rgba(0, 0, 0, 0.6)",
          };
    },
  },
  watch: {
    "peer.metadata"() {
      this.getMetaData();
    },
    peer() {
      this.init();
    },
    isShare() {
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  beforeUnmount() {
    this.unAll();
  },
  methods: {
    async init() {
      this.getMetaData();

      this.unAll();
      if (this.isShare) {
        this.unsub1 = hmsStore.subscribe((track) => {
          this.videoTrack = track;
        }, selectScreenShareByPeerID(this.peer.id));
      } else {
        this.unsub1 = hmsStore.subscribe((track) => {
          this.videoTrack = track;
        }, selectCameraStreamByPeerID(this.peer.id));
      }

      this.unsub2 = hmsStore.subscribe((enabled) => {
        this.isAudioEnabled = enabled;
      }, selectIsPeerAudioEnabled(this.peer.id));

      this.unsub4 = hmsStore.subscribe((enabled) => {
        this.isVideoEnabled = enabled;
      }, selectIsPeerVideoEnabled(this.peer.id));

      this.unsub3 = hmsStore.subscribe((level) => {
        this.level = level;
        if (this.level) {
          this.levelLock = true;
          if (!this.lowerHand && this.hmsLocalPeer?.isHandRaised) {
            this.lowerHand = true;
            setTimeout(() => {
              this.lowerHand = false;
              hmsActions.lowerLocalPeerHand();
            }, 60 * 1000);
          }
        } else {
          setTimeout(() => {
            this.levelLock = false;
          }, 1000);
        }
      }, selectPeerAudioByID(this.peer.id));
    },
    unAll() {
      if (this.unsub1) {
        this.unsub1();
      }
      if (this.unsub2) {
        this.unsub2();
      }
      if (this.unsub3) {
        this.unsub3();
      }
      if (this.unsub4) {
        this.unsub4();
      }
    },
    getMetaData() {
      this.metaData = hmsStore.getState(selectPeerMetadata(this.peer.id));
    },
    isEnabled(track) {
      return this.hmsLocalPeer.id === track.peerId
        ? true
        : !this.hmsStore.layout.onlyAudio;
    },
  },
};
</script>
<style scoped>
.avatar-animate::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid #cfa200;
  border-radius: 50%;
  animation: expand 2s linear infinite;
}
.avatar-animate::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid #cfa200;
  border-radius: 50%;
  opacity: 0;
  animation: expand 2s 1s linear infinite;
}
@keyframes expand {
  0% {
    border-width: 4px;
    transform: scale(1);
    opacity: 1;
  }
  50% {
    border-width: 2px;
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    border-width: 1px;
    transform: scale(2);
    opacity: 0;
  }
}
@keyframes waveform {
  0% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.3);
  }
  100% {
    transform: scaleY(1);
  }
}

.waveform-bar {
  transition: all 0.3s ease-in-out, all 0.5s ease-in-out;
  animation: waveform 0.6s infinite;
}

.bg-pill {
  animation: expandPill 1s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandPill {
  0% {
    transform: scale(0);
    width: 1.5rem;
  }
  36.7% {
    transform: scale(1.1);
    width: 1.5rem;
  }
  75% {
    transform: scale(1);
    width: 1.5rem;
  }
  100% {
    width: 100%;
  }
}

.name-pill {
  animation: expandName 1s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes expandName {
  0% {
    width: 0;
  }
  75% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
</style>
