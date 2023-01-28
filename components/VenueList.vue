<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <v-btn @click="userList"><v-icon>mdi-account</v-icon></v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="addVenue"><v-icon>mdi-plus-circle</v-icon></v-btn>
      </v-toolbar>
      <v-list>
        <v-list-item v-if="venues.length === 0">No Venue</v-list-item>
        <v-list-item v-for="(venue, i) in venues" :key="i" :value="venue">
          <v-list-item-title @click="selectedVenue(venue)">{{
            venue.venueName
          }}</v-list-item-title>
          <template v-slot:append>
            <v-btn
              color="grey-lighten-1"
              icon="mdi-delete"
              variant="text"
              @click.stop="confirmDeleteVenue(venue)"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const emitsVenueList = defineEmits<{
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
    func: typeof deleteVenue,
    params: any
  ): void;
  (e: "changeComponent", componentName: string): void;
  (e: "setVenueInfo", venueInfo: any): void;
}>();

const venues = ref();

const { data: resGetVenues } = await useFetch("/api/GetVenues", {
  method: "GET",
});

venues.value = resGetVenues.value?.venues;

const userList = () => {
  emitsVenueList("changeComponent", "userList");
};

const selectedVenue = (venue: any) => {
  emitsVenueList("setVenueInfo", venue);
  emitsVenueList("changeComponent", "targetList");
};

const confirmDeleteVenue = (venue: any) => {
  emitsVenueList(
    "showConfirmDialog",
    true,
    "削除",
    "削除します。よろしいですか？",
    deleteVenue,
    venue
  );
};

const addVenue = () => {
  const venue = {
    venueName: "venueName" + Date.now(),
    comments: "comments" + Date.now(),
    pos: 0,
  };
  emitsVenueList("setVenueInfo", venue);
  emitsVenueList("changeComponent", "venueEdit");
};

const deleteVenue = async (venue: any) => {
  const { data: resDeleteVenue } = await useFetch("/api/DeleteVenue", {
    method: "POST",
    body: { venueName: venue.venueName },
  });

  if ((resDeleteVenue.value as any).msg === "") {
    venues.value = venues.value.filter(
      (venue_: any) => venue_.venueName !== venue.venueName
    );
  }
};
</script>

<style scoped lang="scss"></style>
