<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <v-spacer></v-spacer>
        <v-btn @click="cancelVenue()"
          ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
        >
      </v-toolbar>
      <v-form>
        <v-container mt-0 pt-0>
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                v-model="venue.venueName"
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
                v-model="venue.comments"
                label="コメント"
                @focus="$event.target.select()"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row no-gutters justify-space-between>
            <v-col cols="6">
              <v-btn @click="updateVenue">登録</v-btn>
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
  (e: "changeComponent", componentName: string): void;
}>();

const propsVenueList = defineProps<{
  venue: any;
}>();

const venue = reactive({
  venueName: propsVenueList.venue.venueName,
  comments: propsVenueList.venue.comments,
  pos: propsVenueList.venue.pos,
});

const updateVenue = async () => {
  const { data: resUpdateVenue } = await useFetch("/api/UpdateVenue", {
    method: "POST",
    body: { venueName: venue.venueName, comments: venue.comments },
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
