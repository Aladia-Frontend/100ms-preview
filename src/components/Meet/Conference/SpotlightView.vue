<template>
  <div class="relative z-10 h-full w-full">
    <div
      class="absolute left-4 top-4 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/30"
      data-cy="45bc5aaab7b3006f"
      @click="unSpotlight"
    >
      <i class="fa-regular fa-minimize text-base text-[#FAFAFA]" />
    </div>
    <MeetPeer
      v-if="hmsPeer"
      :peer="hmsPeer"
      :pin-id="pinId"
      :share-ids="shareIds"
      :spotlight-id="spotlightId"
    />
  </div>
</template>
<script>
import { hmsActions } from "@/utils/hms";
import MeetPeer from "@/components/Meet/Peer/index.vue";

export default {
  name: "SpotlightView",
  props: {
    spotlightId: {
      type: [String, null],
      default: null,
    },
    shareIds: {
      type: Array,
      default: () => [],
    },
    pinId: [String, null],
  },
  components: {
    MeetPeer,
  },
  setup() {},
  computed: {
    hmsStore() {
      return this.$store.state;
    },
    hmsPeer() {
      const spotlightId = this.spotlightId || this.hmsStore.spotlightId;
      return this.$store.getters.hmsPeers.filter(
        (peer) => peer.id === spotlightId
      )[0];
    },
    hmsLocalPeer() {
      return this.hmsStore.hmsLocalPeer;
    },
    isHost() {
      const roleName = this.hmsLocalPeer.roleName;
      return roleName === "host" || roleName === "co-host";
    },
  },
  methods: {
    unSpotlight() {
      if (this.isHost && this.spotlightId) {
        hmsActions.sessionStore.set("spotlightId", null);
      } else if (this.hmsStore.spotlightId) {
        this.hmsStore.spotlightId = null;
      }
    },
  },
};
</script>
