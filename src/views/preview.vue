<template>
  <div class="flex h-screen w-screen flex-col p-2">
    <MeetConference v-if="hmsStore.hmsIsConnectedToRoom" />
  </div>
</template>

<script>
import axios from "axios";
import { hmsActions } from "@/utils/hms";

import MeetConference from "@/components/Meet/Conference/index.vue";

export default {
  name: "MeetPreview",
  components: {
    MeetConference,
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    hmsStore() {
      return this.$store.state;
    },
    roomId() {
      return this.$route.query.roomId;
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      if (!this.hmsStore.hmsIsConnectedToRoom) {
        this.$store.dispatch("initialiseSubscribe");
      }
      if (!this.roomId) {
        return;
      }
      this.loading = true;

      const baseUrl = `https://prod-in2.100ms.live/hmsapi/aladia-io.app.100ms.live/api/token`;
      const { data } = await axios.post(baseUrl, {
        role: "__internal_recorder",
        room_id: this.roomId,
        user_id: "beam",
      });
      await hmsActions.join({
        userName: "beam",
        authToken: data.token,
        asRole: "__internal_recorder",
      });
      this.loading = false;
    },
  },
};
</script>
