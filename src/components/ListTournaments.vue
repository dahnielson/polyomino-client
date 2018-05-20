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
            <md-input v-model.number="boards" type="number" min="0" required></md-input>
            <span class="md-error">Du måste ange ett antal bräden</span>
          </md-field>
          <md-button class="md-raised md-primary" :disabled="boards < 1" @click="setDone('first', 'second')">Fortsätt</md-button>
        </md-step>
        <md-step id="second" md-label="Antal matcher i turneringen" :md-editable="true" :md-done.sync="second">
          <p>Till första matchen slumpas vilka spelare som möter varandra. Till de nästföljande matcherna kommer spelarna att möta motståndare som presterat i genomsnitt lika bra som dem själva.</p>
          <md-field :class="messageClassMatches">
            <label>Antal matcher</label>
            <md-input v-model.number="matches" type="number" min="0" required></md-input>
            <span class="md-error">Du måste ange ett antal matcher</span>
          </md-field>
          <md-button class="md-raised md-primary" :disabled="matches < 1" @click="setDone('second', 'third')">Fortsätt</md-button>
        </md-step>
        <md-step id="third" md-label="Skapa turneringen" :md-editable="true" :md-done.sync="third">
          <p>Vill du skapa följande turnering?</p>
          <p>Antal bräden: {{ boards }}</p>
          <p>Antal matcher: {{ matches }}</p>
        </md-step>
      </md-steppers>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showCreateDialog = false">Stäng</md-button>
        <md-button class="md-primary" @click="createTournament()" :disabled="active !== 'third'">Skapa</md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Show empty state when no tournaments have yet been created -->
    <md-empty-state
      md-icon="casino"
      md-label="Skapa din första turnering"
      md-description="Skapa turneringar, håll reda på vem som ska spela mot vem härnäst.">
      <md-button class="md-primary md-raised" @click="showCreateDialog = true">Skapa turnering</md-button>
    </md-empty-state>
  </div>
</template>

<script>
import format from 'date-fns/format'
import generate from 'nanoid/generate'

function generateMatch (matchIndex) {
  return {
    number: matchIndex,
    board: null,
    position: null,
    matchScore: null,
    tournamentScore: null
  }
}

function generateMatches (numMatches) {
  let a = []
  for (let i = 0; i < numMatches; i++) {
    a.push(generateMatch(i))
  }
  return a
}

function generatePlayer (playerIndex, numMatches) {
  return {
    name: 'Spelare ' + (playerIndex + 1),
    matches: generateMatches(numMatches),
    totalMatchScore: 0,
    totalTournamentScore: 0
  }
}

function generatePlayers (numBoards, numMatches) {
  let a = []
  for (let i = 0; i < numBoards * 4; i++) {
    a.push(generatePlayer(i, numMatches))
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
    matches: null
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
          created: format(),
          numberOfBoards: this.boards,
          numberOfMatches: this.matches,
          currentMatch: -1,
          players: generatePlayers(this.boards, this.matches),
          boards: []
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
    messageClassMatches () {
      return {
        'md-invalid': this.matches != null && this.matches < 1
      }
    }
  }
}
</script>

<style>
</style>
