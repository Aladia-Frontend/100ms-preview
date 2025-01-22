<template>
  <div
    :style="{ background: avatarColor }"
    class="flex h-[12.5rem] w-[12.5rem] shrink-0 items-center justify-center rounded-full text-5xl font-medium"
  >
    {{ initials }}
  </div>
</template>
<script>
export default {
  name: "UserAvatar",
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup() {},
  data() {
    return {
      colors: [
        "#616161",
        "#3F51B5",
        "#4CAF50",
        "#FFA000",
        "#795548",
        "#E91E63",
        "#2F80FF",
        "#8BC34A",
        "#F57C00",
        "#673AB7",
        "#009688",
        "#FBC02D",
      ],
    };
  },
  computed: {
    initials() {
      return (this.name || "")
        .match(/(^\S\S?|\b\S)?/g)
        ?.join("")
        ?.match(/(^\S|\S$)?/g)
        ?.join("")
        .toUpperCase();
    },
    avatarColor() {
      // derive a color from the first letter
      const colorIndex =
        (this.initials?.codePointAt(0) || 0) % this.colors.length;
      return this.colors[colorIndex];
    },
  },
};
</script>
