<template>
  <div
    class="relative z-10 flex h-full w-full flex-col gap-2 rounded-5 bg-[#202020] p-1"
  >
    <div class="absolute -z-10 flex h-full w-full items-center justify-center">
      <i class="fa-light fa-spinner animate-spin text-2xl" />
    </div>
    <div
      v-if="screenTrack?.id === hmsStore.screenTrackId"
      class="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-5 bg-[#202020]"
    >
      <div
        class="absolute left-1/2 top-1/2 -m-[6.25rem] h-[12.5rem] w-[12.5rem] rounded-full"
        :class="level ? 'avatar-animate' : ''"
      />
      <BaseAvatarPicture
        v-if="picture"
        :picture="picture"
        class="!h-[12.5rem] !w-[12.5rem] !p-0"
      />
      <MeetPeerUserAvartar v-else :name="peer.name" />
    </div>
    <MeetVideo
      :mirror="false"
      :track-id="screenTrack?.id"
      object-fit="contain"
      :class="screenTrack?.degraded ? 'opacity-0' : ''"
    />
  </div>
</template>
<script>
import {
  selectScreenShareByPeerID,
  selectPeerMetadata,
  selectPeerAudioByID,
} from "@100mslive/hms-video-store";

import { hmsStore } from "@/utils/hms";
import BaseAvatarPicture from "@/components/Base/Avatar/Picture.vue";
import MeetPeerUserAvartar from "@/components/Meet/Peer/UserAvartar.vue";
import MeetVideo from "@/components/Meet/Video.vue";

export default {
  name: "ScreenShare",
  props: {
    peer: Object,
    pinId: [String, null],
    shareIds: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    BaseAvatarPicture,
    MeetPeerUserAvartar,
    MeetVideo,
  },
  setup() {},
  data() {
    return {
      unsub1: null,
      unsub2: null,
      screenTrack: null,
      level: 0,
    };
  },
  computed: {
    hmsStore() {
      return this.$store.state;
    },
    picture() {
      return hmsStore.getState(selectPeerMetadata(this.peer.id))?.picture;
    },
  },
  watch: {
    "peer.id"() {
      this.screenShare();
    },
    pinId() {
      this.screenShare();
    },
    shareIds() {
      this.screenShare();
    },
  },
  mounted() {
    this.screenShare();
  },
  beforeUnmount() {
    if (this.unsub2) {
      this.unsub2();
    }
  },
  methods: {
    async screenShare() {
      if (!this.peer) {
        return;
      }
      if (this.unsub1) {
        this.unsub1();
      }
      if (this.unsub2) {
        this.unsub2();
      }

      this.unsub1 = hmsStore.subscribe((level) => {
        this.level = level;
      }, selectPeerAudioByID(this.peer.id));

      this.unsub2 = hmsStore.subscribe((track) => {
        this.screenTrack = track;
      }, selectScreenShareByPeerID(this.peer.id));
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
</style>
