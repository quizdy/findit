<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <p class="ml-4">会場</p>
        <v-spacer></v-spacer>
        <v-btn class="ml-1" @click="userList"
          ><v-icon>mdi-account</v-icon></v-btn
        >
        <v-btn class="ml-1" @click="addVenue"
          ><v-icon>mdi-plus-circle</v-icon></v-btn
        >
      </v-toolbar>
      <v-list>
        <v-list-item v-if="venues.length === 0">No Venue</v-list-item>
        <v-list-item
          v-for="(venue, i) in venues"
          :key="i"
          :value="venue"
          :title="venue.venueName"
          :prepend-avatar="venue.image"
          @click="selectedVenue(venue)"
        >
          <template v-slot:append>
            <v-btn
              color="grey-lighten-1"
              icon="mdi-pencil"
              variant="text"
              @click.stop="editVenue(venue)"
            ></v-btn>
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
    location: string,
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

const venues = ref(<any[]>[]);

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
    lat: 0.0,
    lng: 0.0,
    comments: "comments" + Date.now(),
    pos: 0,
  };
  emitsVenueList("setVenueInfo", venue);
  emitsVenueList("changeComponent", "venueEdit");
};

const editVenue = (venue: any) => {
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
