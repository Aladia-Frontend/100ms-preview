<template>
  <div
    class="size-full overflow-hidden"
    :style="{ clipPath: clipPath }"
    :class="{
      'rounded-full': round,
      rounded: !round,
    }"
  >
    <div class="flex size-full items-center justify-center bg-black">
      <img
        v-if="picture"
        :src="picture"
        class="size-full object-cover group-hover/avatar:opacity-70"
      />
      <div
        v-else
        class="flex size-full items-center justify-center bg-[#2c2c2c] text-white/20 group-hover/avatar:bg-[#333333]"
      >
        <i :class="defaultIcon" />
      </div>
    </div>
    <div
      v-if="border"
      class="pointer-events-none absolute inset-0 rounded-full border border-white/10"
    />
  </div>
</template>

<script>
export default {
  name: 'AvatarPicture',
  props: {
    picture: {
      type: String,
      default: "",
    },
    defaultIcon: {
      type: String,
      default: "fa-solid fa-user",
    },
    border: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
      default: "sm",
    },
    hole: {
      type: Boolean,
      default: false,
    },
    round: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    clipPath() {
      if (!this.hole) {
        return "";
      }
      const { offset, radius } = {
        sm: { offset: 23.9, radius: 5.5 },
        md: { offset: 41, radius: 9 },
        lg: { offset: 70, radius: 13 },
        xl: { offset: 176, radius: 27 },
      }[this.size];
      return `path('M 0,0 H ${this.width} V ${
        this.width
      } H 0 V 0 Z M ${offset},${offset} m -${radius},0 a ${radius},${radius} 0 1,0 ${
        radius * 2
      },0 a ${radius},${radius} 0 1,0 -${radius * 2},0 Z')`;
    },
  },
};
</script>
