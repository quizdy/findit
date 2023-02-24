<template>
  <v-card width="100%" max-width="800" class="mx-auto">
    <v-tabs v-model="tab" bg-color="light-blue" align-tabs="center" height="62">
      <v-tab value="tabMsg">
        <v-icon>mdi-email-outline</v-icon>
      </v-tab>
      <v-tab value="tabMission">
        <v-icon>mdi-information</v-icon>
      </v-tab>
    </v-tabs>
    <v-window v-model="tab" style="height: 70dvh">
      <v-window-item key="tabMsg" value="tabMsg">
        <v-container>
          <v-row>
            <v-col>
              <v-autocomplete
                label="参加者"
                :items="attendee"
                item-title="userName"
                item-value="userId"
                v-model="selectedUsers"
                variant="solo"
                multiple
                hide-details="auto"
                chips
                closable-chips
                color="blue-grey-lighten-2"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip
                    v-bind="props"
                    :prepend-avatar="item.raw.image"
                    :text="item.raw.userName"
                  ></v-chip>
                </template>

                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :prepend-avatar="item?.raw?.image"
                    :title="item?.raw?.userName"
                  ></v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                solo
                v-model="adminMsg"
                label="メッセージ"
                variant="solo"
                hide-details="auto"
                rows="10"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                @click="
                  closeAdminMsgDialog();
                  sendAdminMsg();
                "
              >
                メッセージ送信
              </v-btn>
            </v-col>
            <v-col style="text-align: right">
              <v-btn @click="closeAdminMsgDialog"> キャンセル </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-window-item>
      <v-window-item key="tabMission" value="tabMission">
        <v-list lines="two" class="pa-0">
          <v-list-item
            v-for="(mission, i) in missions"
            class="py-3"
            :style="
              i < missions.length - 1 ? 'border-bottom: 1px solid #eee;' : ''
            "
            :key="i"
            :value="mission"
            :title="mission.title"
            :subtitle="mission.comments"
            :prepend-avatar="mission.image"
            @click="
              selectedMission = mission;
              confirmDialog = true;
            "
          >
          </v-list-item>
        </v-list>
      </v-window-item>
    </v-window>
  </v-card>
  <client-only>
    <v-dialog v-model="confirmDialog">
      <ComfirmDialog title="ミッション発動" @ret="doMission" />
    </v-dialog>
  </client-only>
</template>

<script setup lang="ts">
const emitsAdminMsgDialog = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    adminMsg: string
  ): void;
  (e: "closeAdminMsgDialog"): void;
}>();

const propsAdminMsgDialog = defineProps<{
  venue: any;
}>();

const tab = ref("tabMsg");
const selectedUsers = ref(<any[]>[]);
const adminMsg = ref("");
const attendee = ref();
const missions = ref();
const selectedMission = ref();
const confirmDialog = ref(false);

const { data: resGetUsers } = await useFetch("/api/GetUsers", {
  method: "GET",
  params: {
    venueName: propsAdminMsgDialog.venue.venueName,
  },
});

attendee.value = resGetUsers.value?.users;

const { data: resGetVenue } = await useFetch("/api/GetVenue", {
  method: "GET",
  params: { venueName: propsAdminMsgDialog.venue.venueName },
});

const targets = (resGetVenue.value as any).venue.targets;

missions.value = targets.filter((_target: any) => _target.type !== "");

const sendAdminMsg = async () => {
  if (!adminMsg.value) {
    emitsAdminMsgDialog(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "メッセージを入力して下さい"
    );
    return;
  }

  if (Object.values(selectedUsers.value).length < 1) {
    emitsAdminMsgDialog(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "参加者を指定してください"
    );
    return;
  }

  await useFetch("/api/SendMsg", {
    method: "POST",
    body: {
      venueName: propsAdminMsgDialog.venue.venueName,
      sender: "admin",
      users: Object.values(selectedUsers.value),
      msg: adminMsg.value,
    },
  });

  emitsAdminMsgDialog(
    "setSnackbar",
    true,
    2000,
    "info",
    "bottom",
    "メッセージを送信しました"
  );

  adminMsg.value = "";
};

const doMission = async (ret: boolean) => {
  if (ret) {
    await useFetch("/api/SendMsg", {
      method: "POST",
      body: {
        venueName: propsAdminMsgDialog.venue.venueName,
        sender: "admin",
        users: attendee.value.map((_user: any) => _user["userId"]),
        msg: "#" + selectedMission.value,
      },
    });
  }
  confirmDialog.value = false;
};

const closeAdminMsgDialog = () => {
  emitsAdminMsgDialog("closeAdminMsgDialog");
};
</script>

<style scoped lang="scss"></style>