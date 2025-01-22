<template>
  <div
    ref="container"
    class="relative z-10 h-full w-full rounded-5 bg-[#202020]"
  >
    <div class="absolute -z-10 flex h-full w-full items-center justify-center">
      <i class="fa-light fa-spinner animate-spin text-2xl" />
    </div>
    <!-- <iframe
      ref="iframeRef"
      title="Embed View"
      :src="url"
      class="h-full w-full rounded-lg border-0"
    /> -->
  </div>
</template>
<script>
export default {
  name: "MeetWhiteboard",
  setup() {},
  computed: {
    hmsStore() {
      return this.$store.state;
    },
    hmsWhiteboard() {
      return this.hmsStore.hmsWhiteboard;
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (this.hmsWhiteboard?.open && this.hmsWhiteboard?.url) {
        const whiteboardIframe = document.createElement("iframe");
        whiteboardIframe.src = this.hmsWhiteboard.url;
        whiteboardIframe.style.height = "100%";
        whiteboardIframe.style.width = "100%";
        this.$refs.container.appendChild(whiteboardIframe);
      }
    },
  },
};
</script>
