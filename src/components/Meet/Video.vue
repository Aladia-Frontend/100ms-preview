<template>
  <div class="h-full w-full">
    <video
      ref="videoElement"
      class="h-full w-full"
      :style="object_fit"
      :class="mirror && layout.mirrorLocalVideo ? 'scale-x-[-1]' : ''"
      autoPlay
      muted
      playsInline
    />
  </div>
</template>
<script>
import { selectVideoTrackByID } from "@100mslive/hms-video-store";

import { hmsActions, hmsStore } from "@/utils/hms";

export default {
  name: "MeetVideo",
  props: {
    mirror: {
      type: Boolean,
      default: false,
    },
    trackId: {
      type: String,
    },
    peerId: {
      type: String,
    },
    objectFit: {
      type: String,
      default: "cover",
    },
  },
  setup() {},
  data() {
    return {
      unsub: null,
    };
  },
  computed: {
    hmsStore() {
      return this.$store.state;
    },
    hmsLocalPeer() {
      return this.hmsStore.hmsLocalPeer;
    },
    object_fit() {
      return { "object-fit": this.objectFit };
    },
    layout() {
      return this.hmsStore.layout;
    },
    screenTrackId() {
      return this.hmsStore.screenTrackId;
    },
  },
  watch: {
    trackId() {
      this.trackId && this.manageVideo(this.trackId, this.$refs.videoElement);
    },
    "layout.onlyAudio"() {
      this.trackId && this.manageVideo(this.trackId, this.$refs.videoElement);
    },
    screenTrackId() {
      this.trackId && this.manageVideo(this.trackId, this.$refs.videoElement);
    },
  },
  beforeUnmount() {
    if (this.unsub) {
      this.unsub();
    }
  },
  methods: {
    manageVideo(trackId, videoElement) {
      if (this.unsub) {
        this.unsub();
      } // unsubscribe previous
      this.unsub = hmsStore.subscribe((track) => {
        if (!track || !videoElement) {
          return;
        }
        if (track.source === "screen") {
          hmsActions.detachVideo(track.id, videoElement); // 当监听到视频轨道发生变化先清空视频，才能再次绑定attachVideo
        }
        if (track?.enabled && this.isEnabled(track)) {
          hmsActions.attachVideo(track.id, videoElement);
        } else {
          hmsActions.detachVideo(track.id, videoElement);
        }
      }, selectVideoTrackByID(trackId));
    },
    isEnabled(track) {
      return this.hmsLocalPeer.id === track.peerId
        ? true
        : this.screenTrackId === track.id
        ? false
        : !this.layout.onlyAudio;
    },
  },
};
</script>
