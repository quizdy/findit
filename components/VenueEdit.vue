<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <v-spacer></v-spacer>
        <v-btn @click="cancelVenue"
          ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
        >
      </v-toolbar>
      <v-form>
        <v-container mt-0 pt-0>
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                v-model="venueInfo.venueName"
                label="会場名"
                required
                @focus="$event.target.select()"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <v-textarea
                solo
                v-model="venueInfo.comments"
                label="コメント"
                @focus="$event.target.select()"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row no-gutters justify-space-between>
            <v-col cols="6">
              <v-btn @click="confirmVenue">登録</v-btn>
            </v-col>
            <v-col cols="6" style="text-align: right">
              <v-btn @click="cancelVenue">キャンセル</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const emitsVenueEdit = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    msg: string
  ): void;
  (
    e: "showConfirmDialog",
    show: boolean,
    title: string,
    msg: string,
    func: typeof updateVenue,
    params: any
  ): void;
  (e: "changeComponent", componentName: string): void;
}>();

const propsVenueList = defineProps<{
  venueInfo: any;
}>();

const venueInfo = reactive({
  venueName: propsVenueList.venueInfo.venueName,
  comments: propsVenueList.venueInfo.comments,
  pos: propsVenueList.venueInfo.pos,
});

const confirmVenue = () => {
  if (!venueInfo.venueName) {
    emitsVenueEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "会場名を入力して下さい"
    );
    return;
  }

  emitsVenueEdit(
    "showConfirmDialog",
    true,
    "登録",
    "登録します。よろしいですか？",
    updateVenue,
    ""
  );
};

const updateVenue = async () => {
  const { data: resUpdateVenue } = await useFetch("/api/UpdateVenue", {
    method: "POST",
    body: { venueName: venueInfo.venueName, comments: venueInfo.comments },
  });

  if ((resUpdateVenue.value as any).msg === "") {
    emitsVenueEdit("changeComponent", "venueList");
  }
};

const cancelVenue = () => {
  emitsVenueEdit("changeComponent", "venueList");
};
</script>

<style scoped lang="scss"></style>
