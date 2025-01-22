<template>
  <div
    ref="box"
    class="relative z-10 flex gap-2"
    :class="
      isSharing
        ? `${allWidth < 960 ? 'w-full' : 'w-[16.5rem]'}`
        : 'flex-1 items-center justify-center'
    "
  >
    <MeetPeer
      v-if="isSidebar"
      class="flex-1"
      :peer="hmsPeers[0]"
      :pin-id="pinId"
      :share-ids="shareIds"
      :spotlight-id="spotlightId"
    />
    <div
      class="flex gap-2.5"
      :class="[
        isExpand
          ? `h-full ${
              allWidth < 960
                ? 'w-full overflow-x-auto'
                : 'hide-scrollbar w-[16.5rem] flex-col overflow-y-auto'
            } `
          : 'w-full flex-wrap items-center justify-center',
      ]"
    >
      <div
        v-for="peer in isExpand ? expandPeers : showFilterPeers"
        :key="peer.id"
      >
        <div
          v-if="onIsShare(peer.id)"
          :style="{
            width: `${width}px`,
            height: `${height}px`,
          }"
          class="relative flex shrink-0 items-center justify-center overflow-hidden rounded-5"
        >
          <MeetPeer
            :peer="peer"
            :is-share="onIsShare(peer.id)"
            :pin-id="pinId"
            :share-ids="shareIds"
            :spotlight-id="spotlightId"
          />
        </div>
        <div
          :style="{
            width: `${width}px`,
            height: `${height}px`,
          }"
          class="relative flex shrink-0 items-center justify-center overflow-hidden rounded-5 border-2 transition-[border] duration-300"
          :class="
            hmsSpeakerIds.includes(peer.id)
              ? 'border-[#FFD700]'
              : 'border-transparent'
          "
        >
          <MeetPeer
            :peer="peer"
            :pin-id="pinId"
            :share-ids="shareIds"
            :spotlight-id="spotlightId"
          />
        </div>
      </div>

      <MeetPeerBox
        v-if="hideFilterPeers.length && !hideVideoPeer"
        :class="allWidth < 960 ? 'gap-1' : 'gap-5'"
        :style="{
          width: `${width}px`,
          height: `${height}px`,
        }"
        :peers="hideFilterPeers"
      />
      <div
        v-else-if="hideVideoPeer"
        :style="{
          width: `${width}px`,
          height: `${height}px`,
        }"
        class="relative flex shrink-0 items-center justify-center overflow-hidden rounded-5 border-2 transition-[border] duration-300"
        :class="
          hmsSpeakerIds.includes(hideVideoPeer.id)
            ? 'border-[#FFD700]'
            : 'border-transparent'
        "
      >
        <MeetPeer
          :peer="hideVideoPeer"
          :pin-id="pinId"
          :share-ids="shareIds"
          :spotlight-id="spotlightId"
        />
      </div>

      <MeetPeerBox
        v-if="!expand && isExpand && morePeers.length"
        class="cursor-pointer"
        :class="allWidth < 960 ? 'gap-1' : 'gap-5'"
        :style="{
          width: `${width}px`,
          height: `${height}px`,
        }"
        :peers="morePeers"
        data-cy="61799911216c5735"
        @click="expand = true"
      />

      <div
        v-if="expand && isExpand"
        class="mx-auto flex cursor-pointer items-center gap-2.5 rounded-5 p-1.5 px-2.5 text-[#FAFAFA] hover:bg-white/5"
        data-cy="651839b08c830b2c"
        @click="expand = false"
      >
        <i
          class="fa-regular fa-chevron-up text-base"
          :class="allWidth < 960 ? 'fa-chevron-left' : 'fa-chevron-up'"
        />
        <div v-if="allWidth >= 960">
          Show fewer users
        </div>
      </div>
      <div
        v-if="showPagination"
        class="absolute z-10 flex items-center rounded-5 bg-[#0C0C0C]"
        :class="
          isExpand
            ? 'bottom-14 ml-[6.375rem]'
            : 'bottom-3 left-1/2 -translate-x-1/2'
        "
      >
        <div
          class="flex h-[1.875rem] w-[1.875rem] items-center justify-center"
          :class="
            pageNumber === 1
              ? 'cursor-not-allowed text-[#303030]'
              : 'cursor-pointer text-[#FAFAFA]'
          "
          data-cy="59dc9f9f968cba7d"
          @click="onPrev"
        >
          <i class="fa-light fa-chevron-left text-base" />
        </div>
        <div
          class="flex h-[1.875rem] w-[1.875rem] items-center justify-center"
          :class="
            viewPeers.length > maxTileCount * pageNumber
              ? 'cursor-pointer text-[#FAFAFA]'
              : 'cursor-not-allowed text-[#303030]'
          "
          @click="onNext"
        >
          <i class="fa-light fa-chevron-right text-base" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  selectIsPeerVideoEnabled,
  selectIsPeerAudioEnabled,
  selectPeerMetadata,
} from "@100mslive/hms-video-store";
import { useWindowSize } from "@vueuse/core";
import { hmsStore } from "@/utils/hms";
import MeetPeer from "@/components/Meet/Peer/index.vue";
import MeetPeerBox from "@/components/Meet/Peer/Box.vue";

export default {
  name: "GalleryView",
  props: {
    isSharing: Boolean,
    isPopup: Boolean,
    shareIds: {
      type: Array,
      default: () => [],
    },
    pinId: [String, null],
    spotlightId: {
      type: [String, null],
      default: null,
    },
  },
  components: {
    MeetPeer,
    MeetPeerBox,
  },
  setup() {
    const { width } = useWindowSize();
    return { allWidth: width };
  },
  data() {
    return {
      pageNumber: 1,
      width: 264,
      height: 148,
      unsub1: null,
      unsub2: null,
      expand: false,
      sidebarNum: 3,
      speakIds: [],
      speakTime: null,
      speakDebounceTime: null,
      speakInitTime: null,
      timer: null,
      filterPeers: [],
      showFilterPeers: [],
      hideFilterPeers: [],
      hideVideoPeer: null,
    };
  },
  computed: {
    hmsStore() {
      return this.$store.state;
    },
    hmsWhiteboard() {
      return this.hmsStore.hmsWhiteboard;
    },
    pdfConfig() {
      return this.hmsStore.pdfConfig;
    },
    sharingId() {
      const ids = this.$store.getters.hmsPeers.map((r) => r.id);
      const shareIds = this.shareIds.filter((r) => ids.includes(r));
      let id = shareIds[shareIds.length - 1];
      if (ids.includes(this.pinId || this.hmsStore.pinId)) {
        id = this.pinId || this.hmsStore.pinId;
      }

      if (this.hmsWhiteboard?.open) {
        id = null;
      }
      // 如果本人有分享PDF，那么分享者一定是本人
      if (this.pdfConfig) {
        id = this.hmsLocalPeer.id;
      }

      return id;
    },
    sharingIds() {
      const ids = this.hmsStore.hmsPeersScreenSharing.map((r) => r.id);
      const isMore = ids.length > 1 || this.hmsWhiteboard?.open;
      return isMore ? ids.filter((r) => r !== this.sharingId) : [];
    },
    layout() {
      return this.hmsStore.layout;
    },
    view() {
      return this.layout.view;
    },
    maxTileCount() {
      return this.isSidebar
        ? this.layout.maxTileCount - 1
        : this.layout.maxTileCount;
    },
    hmsSpeakers() {
      return this.hmsStore.hmsSpeakers;
    },
    hmsSpeakerIds() {
      const speakIds = [];
      for (const key in this.hmsSpeakers) {
        if (!speakIds.includes(this.hmsSpeakers[key]?.peerID)) {
          speakIds.unshift(this.hmsSpeakers[key]?.peerID);
        }
      }
      return speakIds;
    },
    hmsPeers() {
      const hmsPeers = [];
      const pinPeers = [];
      const pinLocalPeers = [];
      const sharePeers = [];
      const speakPeers = [];
      const hostPeers = [];
      const coHostPeers = [];
      const uniqPeers = this.$store.getters.hmsPeers;
      for (let i = 0; i < uniqPeers.length; i++) {
        if (uniqPeers[i].id === this.pinId) {
          pinPeers.push(uniqPeers[i]);
        } else if (uniqPeers[i].id === this.hmsStore.pinId) {
          pinLocalPeers.push(uniqPeers[i]);
        } else if (this.shareIds.includes(uniqPeers[i].id)) {
          sharePeers.push(uniqPeers[i]);
        } else if (this.speakIds.includes(uniqPeers[i].id)) {
          speakPeers.push(uniqPeers[i]);
        } else if (uniqPeers[i].roleName === "host") {
          hostPeers.push(uniqPeers[i]);
        } else if (uniqPeers[i].roleName === "co-host") {
          coHostPeers.push(uniqPeers[i]);
        } else {
          hmsPeers.push(uniqPeers[i]);
        }
      }
      const reversedShareIds = [...this.shareIds].reverse();
      // 根据 shareIds倒序 对 sharePeers 进行排序
      sharePeers.sort(
        (a, b) =>
          reversedShareIds.indexOf(a.id) - reversedShareIds.indexOf(b.id)
      );

      const allPeers = [
        ...pinPeers,
        ...pinLocalPeers,
        ...sharePeers,
        ...speakPeers,
        ...hostPeers,
        ...coHostPeers,
        ...hmsPeers,
      ];

      if (this.layout.hideLocalVideo) {
        return allPeers.filter((peer) => !peer.isLocal);
      }
      // if (this.layout.hideWithoutVideo) {
      //   return allPeers.filter(
      //     (peer) =>
      //       peer.isLocal ||
      //       hmsStore.getState(selectIsPeerVideoEnabled(peer.id)),
      //   );
      // }
      return allPeers;
    },
    viewPeers() {
      if (this.isSidebar) {
        return this.hmsPeers.slice(1);
      }
      return this.hmsPeers;
    },
    hmsLocalPeer() {
      return this.hmsStore.hmsLocalPeer;
    },
    // filterPeers() {
    //   return this.viewPeers.slice(
    //     (this.pageNumber - 1) * this.maxTileCount,
    //     this.pageNumber * this.maxTileCount,
    //   );
    // },
    // showFilterPeers() {
    //   return this.layout.hideWithoutVideo
    //     ? this.filterPeers.filter(
    //         (peer) =>
    //           peer.isLocal ||
    //           hmsStore.getState(selectIsPeerVideoEnabled(peer.id)),
    //       )
    //     : this.filterPeers;
    // },
    // hideFilterPeers() {
    //   return this.layout.hideWithoutVideo
    //     ? this.filterPeers.filter(
    //         (peer) =>
    //           !peer.isLocal &&
    //           !hmsStore.getState(selectIsPeerVideoEnabled(peer.id)),
    //       )
    //     : [];
    // },
    expandPeers() {
      let sidebarNum = this.sidebarNum;
      if (this.layout.hideWithoutVideo && this.hideFilterPeers.length) {
        sidebarNum -= 1;
      }
      return this.expand
        ? this.showFilterPeers
        : this.showFilterPeers.slice(0, sidebarNum);
    },
    isSidebar() {
      return (
        (this.view === "Sidebar" || this.hmsStore.pinId || this.pinId) &&
        this.hmsPeers.length > 1 &&
        !this.isSharing
      );
    },
    isExpand() {
      return this.isSidebar || this.isSharing;
    },
    isMore() {
      return !!this.filterPeers.slice(this.sidebarNum).length;
    },
    morePeers() {
      let sidebarNum = this.sidebarNum;
      if (this.layout.hideWithoutVideo && this.hideFilterPeers.length) {
        sidebarNum -= 1;
      }
      return this.showFilterPeers.slice(sidebarNum);
    },
    showPagination() {
      const expand = this.morePeers.length ? this.expand : true;
      return (
        this.viewPeers.length > this.maxTileCount &&
        (!this.isExpand || (this.isExpand && expand))
      );
    },
    hmsHLSState() {
      return this.hmsStore.hmsHLSState;
    },
    startedAt() {
      return this.hmsHLSState?.variants[0]?.startedAt;
    },
    isRunning() {
      return this.hmsHLSState?.running;
    },
  },
  watch: {
    "layout.hideWithoutVideo"() {
      this.hideVideoPeer = null;
      if (this.layout.hideWithoutVideo) {
        this.onInterval();
      } else {
        this.timer && clearInterval(this.timer);
      }
      this.init();
    },
    "showFilterPeers.length"() {
      this.onResize();
    },
    viewPeers() {
      this.getFilterPeers();
    },
    hmsPeers() {
      this.getFilterPeers();
      this.onResize();
    },
    view() {
      this.expand = false;
      this.onResize();
    },
    isSharing() {
      this.onResize();
    },
    startedAt() {
      this.onResize();
    },
    isRunning() {
      this.onResize();
    },
    isPopup() {
      this.onResize();
    },
    maxTileCount() {
      this.pageNumber = 1;
      this.onResize();
    },
    hmsSpeakerIds() {
      if (
        this.hideFilterPeers.find((peer) =>
          this.hmsSpeakerIds.includes(peer.id)
        )
      ) {
        this.hideVideoPeer = this.hideFilterPeers.find((peer) =>
          this.hmsSpeakerIds.includes(peer.id)
        );
      }

      if (!this.isExpand) {
        return;
      }
      clearTimeout(this.speakTime);
      if (this.hmsSpeakerIds.length) {
        if (this.speakIds.length) {
          // clearTimeout(this.speakDebounceTime);
          // this.speakDebounceTime = setTimeout(() => {
          this.setSpeakIds();
          // }, 500);
        } else if (!this.speakInitTime) {
          this.speakInitTime = setTimeout(() => {
            this.speakInitTime = null;
            this.setSpeakIds();
          }, 1000);
        }
      } else {
        this.speakTime = setTimeout(() => {
          this.speakIds = [];
        }, 2000);
      }
      // this.speakIds = [];
      // for (const key in this.hmsSpeakers) {
      //   this.speakIds.push(this.hmsSpeakers[key]?.peerID);
      // }
    },
  },
  mounted() {
    this.init();
    window.addEventListener("resize", this.onResize);
  },
  beforeUnmount() {
    this.timer && clearInterval(this.timer);
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    init() {
      this.getFilterPeers();
      this.onResize();
    },
    onInterval() {
      this.timer && clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.getFilterPeers();
      }, 100);
    },
    getFilterPeers() {
      this.filterPeers = this.viewPeers.slice(
        (this.pageNumber - 1) * this.maxTileCount,
        this.pageNumber * this.maxTileCount
      );
      if (this.layout.hideWithoutVideo) {
        this.showFilterPeers = this.filterPeers.filter(
          (peer) =>
            peer.isLocal || hmsStore.getState(selectIsPeerVideoEnabled(peer.id))
        );
        this.hideFilterPeers = this.filterPeers
          .filter(
            (peer) =>
              !peer.isLocal &&
              !hmsStore.getState(selectIsPeerVideoEnabled(peer.id))
          )
          .map((peer) => ({
            ...peer,
            isAudioEnabled: hmsStore.getState(
              selectIsPeerAudioEnabled(peer.id)
            ),
          }));
        if (!this.hideFilterPeers.find((peer) => peer.isAudioEnabled)) {
          this.hideVideoPeer = null;
        }
        // this.hideVideoPeer = this.hideFilterPeers.find(
        //   (peer) => peer.isAudioEnabled,
        // );
      } else {
        this.hideVideoPeer = null;
        this.showFilterPeers = this.filterPeers;
        this.hideFilterPeers = [];
      }
    },
    async onResize() {
      let len = this.showFilterPeers.length;

      if (this.layout.hideWithoutVideo && this.hideFilterPeers.length) {
        len += 1;
      }

      await this.$nextTick();
      const dom = this.$refs.box.getBoundingClientRect();
      const scale = this.allWidth < 960 ? 2 : 1;
      if (this.allWidth < 960) {
        this.sidebarNum = Math.floor(dom.width / (274 / scale));
      } else {
        this.sidebarNum = Math.floor(dom.height / (158 / scale));
      }
      if (this.isExpand) {
        this.width = 264 / scale;
        this.height = 148 / scale;
        return;
      }

      const aspectRatioWidth = 16;
      const aspectRatioHeight = 9;
      // if (len % 2 === 0) {
      //   aspectRatioWidth = 1;
      //   aspectRatioHeight = 1;
      // }

      const { width, height } = this.calculateBlockSize(
        dom.width - 2,
        dom.height - 2,
        len,
        aspectRatioWidth,
        aspectRatioHeight,
        10
      );
      this.height = height;
      this.width = width;

      // this.height = dom.height;
      // if (dom.width < (this.height * 16) / 9) {
      //   this.width = dom.width;
      // } else {
      //   this.width = (this.height * 16) / 9;
      // }
      // if (len === 2) {
      //   this.width = (dom.width - 10) / 2;
      //   return;
      // }
      // if (len > 2 && len <= 12) {
      //   const num = Math.ceil(len / 2);
      //   this.height = (dom.height - 10) / 2;
      //   this.width = (dom.width - 10 * (num - 1)) / num;
      // }
      // if (len > 12 && len <= 18) {
      //   this.height = (dom.height - 20) / 3;
      //   this.width = (dom.width - 50) / 6;
      // }
      // if (len > 18) {
      //   const num = Math.ceil(len / 7);
      //   this.width = (dom.width - 60) / 7;
      //   this.height = (dom.height - 10 * (num - 1)) / num;
      // }
    },
    calculateBlockSize(
      containerWidth,
      containerHeight,
      blockCount,
      aspectRatioWidth,
      aspectRatioHeight,
      spacing
    ) {
      let bestWidth = 0;
      let bestHeight = 0;
      let minUnusedArea = Infinity;

      for (let rows = 1; rows <= blockCount; rows++) {
        const cols = Math.ceil(blockCount / rows);
        const totalSpacingWidth = (cols - 1) * spacing;
        const totalSpacingHeight = (rows - 1) * spacing;
        let blockWidth = (containerWidth - totalSpacingWidth) / cols;
        let blockHeight = blockWidth * (aspectRatioHeight / aspectRatioWidth);

        if (blockHeight > containerHeight) {
          blockHeight = containerHeight;
          blockWidth = blockHeight * (aspectRatioWidth / aspectRatioHeight);
        }

        if (blockHeight * rows + totalSpacingHeight <= containerHeight) {
          const unusedArea =
            containerWidth * containerHeight -
            (blockWidth * blockHeight * blockCount +
              totalSpacingWidth * totalSpacingHeight);
          if (unusedArea < minUnusedArea) {
            minUnusedArea = unusedArea;
            bestWidth = blockWidth;
            bestHeight = blockHeight;
          }
        }
      }
      return {
        width: bestWidth,
        height: bestHeight,
      };
    },
    onPrev() {
      if (this.pageNumber === 1) {
        return;
      }
      this.pageNumber -= 1;
      this.onResize();
    },
    onNext() {
      if (this.viewPeers.length <= this.maxTileCount * this.pageNumber) {
        return;
      }
      this.pageNumber += 1;
      this.onResize();
    },
    getPicture(id) {
      return hmsStore.getState(selectPeerMetadata(id))?.picture;
    },
    onIsShare(id) {
      return !!this.sharingIds.includes(id);
    },
    setSpeakIds() {
      this.hmsSpeakerIds.map((id) => {
        if (!this.speakIds.includes(id)) {
          this.speakIds.unshift(id);
        }
      });
      // for (const key in this.hmsSpeakers) {
      //   if (!this.speakIds.includes(this.hmsSpeakers[key]?.peerID)) {
      //     this.speakIds.unshift(this.hmsSpeakers[key]?.peerID);
      //   }
      // }
    },
  },
};
</script>
