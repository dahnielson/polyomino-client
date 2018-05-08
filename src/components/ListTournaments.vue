<template>
  <div>
    <!-- Tournament creation dialog -->
    <md-dialog :md-active.sync="showCreateDialog">
      <md-dialog-title>Skapa turnering</md-dialog-title>
      <md-steppers :md-active-step.sync="active" md-vertical md-linear>
        <md-step id="first" md-label="Antal bräden i turneringen" :md-editable="true" :md-done.sync="first">
          <p>På varje bräde som ingår i turneringen spelar fyra spelare åt gången.</p>
          <md-field :class="messageClassBoards">
            <label>Antal bräden</label>
            <md-input v-model="boards" type="number" min="0" required></md-input>
            <span class="md-error">Du måste ange ett antal bräden</span>
          </md-field>
          <md-button class="md-raised md-primary" :disabled="boards < 1" @click="setDone('first', 'second')">Fortsätt</md-button>
        </md-step>
        <md-step id="second" md-label="Antal rundor i turneringen" :md-editable="true" :md-done.sync="second">
          <p>Till första rundan slumpas vilka spelare som möter varandra. Till de nästföljande rundorna kommer spelarna att möta motståndare som presterat i genomsnitt lika bra som dem själva.</p>
          <md-field :class="messageClassRounds">
            <label>Antal rundor</label>
            <md-input v-model="rounds" type="number" min="0" required></md-input>
            <span class="md-error">Du måste ange ett antal rundor</span>
          </md-field>
          <md-button class="md-raised md-primary" :disabled="rounds < 1" @click="setDone('second', 'third')">Fortsätt</md-button>
        </md-step>
        <md-step id="third" md-label="Skapa turneringen" :md-editable="true" :md-done.sync="third">
          <p>Antal bräden: {{ boards }}</p>
          <p>Antal rundor: {{ rounds }}</p>
        </md-step>
      </md-steppers>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showCreateDialog = false">Stäng</md-button>
        <md-button class="md-primary" @click="createTournament()" :disabled="active !== 'third'">Skapa</md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Show empty state when no tournaments have not yet been created -->
    <md-empty-state
      md-icon="casino"
      md-label="Skapa din första turnering"
      md-description="Skapa turneringar, håll reda på vem som ska spela mot vem härnäst.">
      <md-button class="md-primary md-raised" @click="showCreateDialog = true">Skapa turnering</md-button>
    </md-empty-state>
  </div>
</template>

<script>
import moment from 'moment'
import generate from 'nanoid/generate'

function generateRound (index) {
  return {
    number: index,
    board: null,
    position: null,
    match_point: null,
    tournament_point: null
  }
}

function generateRounds (numRounds) {
  let a = []
  for (let i = 0; i < numRounds; i++) {
    a.push(generateRound(i))
  }
  return a
}

function generatePlayer (index, numRounds) {
  return {
    name: 'Spelare ' + (index + 1),
    rounds: generateRounds(numRounds)
  }
}

function generatePlayers (numBoards, numRounds) {
  let a = []
  for (let i = 0; i < numBoards * 4; i++) {
    a.push(generatePlayer(i, numRounds))
  }
  return a
}

export default {
  name: 'ListTournaments',
  data: () => ({
    showCreateDialog: false,
    active: 'first',
    first: false,
    second: false,
    third: false,
    boards: null,
    rounds: null
  }),
  methods: {
    setDone (id, index) {
      this[id] = true
      if (index) {
        this.active = index
      }
    },
    createTournament () {
      const tid = generate('abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUV0123456789', 11)
      localStorage.setItem(
        tid,
        JSON.stringify({
          created: moment().format(),
          number_of_boards: parseInt(this.boards, 10),
          number_of_rounds: parseInt(this.rounds, 10),
          current_round: -1,
          players: generatePlayers(this.boards, this.rounds)
        })
      )
      this.$router.push({ name: 'admin', query: { t: tid } })
    }
  },
  computed: {
    messageClassBoards () {
      return {
        'md-invalid': this.boards != null && this.boards < 1
      }
    },
    messageClassRounds () {
      return {
        'md-invalid': this.rounds != null && this.rounds < 1
      }
    }
  }
}
</script>

<style>
</style>
