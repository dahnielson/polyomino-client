<template>
  <div>
    <md-steppers :md-active-step.sync="active" md-vertical md-linear>
      <md-step id="first" md-label="Antal bräden i turneringen" :md-editable="true" :md-done.sync="first">
        <p>På varje bräde som ingår i turneringen spelar fyra spelare åt gången.</p>
        <md-field :class="messageClassBoards">
          <label>Antal bräden</label>
          <md-input v-model="boards" type="number" min="0" required></md-input>
          <span class="md-error">Du måste ange ett antal bräden</span>
        </md-field>
        <md-button class="md-raised md-primary" :disabled="boardsDisabled" @click="setDone('first', 'second')">Fortsätt</md-button>
      </md-step>
      <md-step id="second" md-label="Antal rundor i turneringen" :md-editable="true" :md-done.sync="second">
        <p>Till första rundan slumpas vilka spelare som möter varandra. Till de nästföljande rundorna kommer spelarna att möta motståndare som presterat i genomsnitt lika bra som dem själva.</p>
        <md-field :class="messageClassRounds">
          <label>Antal rundor</label>
          <md-input v-model="rounds" type="number" min="0" required></md-input>
          <span class="md-error">Du måste ange ett antal rundor</span>
        </md-field>
        <md-button class="md-raised md-primary" :disabled="roundsDisabled" @click="setDone('second', 'third')">Fortsätt</md-button>
      </md-step>
      <md-step id="third" md-label="Skapa turneringen" :md-editable="true" :md-done.sync="third">
        <p>Antal bräden: {{ boards }}</p>
        <p>Antal rundor: {{ rounds }}</p>
        <md-button class="md-raised md-primary" @click="createTournament()">Ok, skapa turnering</md-button>
      </md-step>
    </md-steppers>
  </div>
</template>

<script>
import moment from 'moment'
import generate from 'nanoid/generate'

export default {
  name: 'create-tournament',
  data: () => ({
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
      const aid = generate('abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUV0123456789', 11)
      localStorage.setItem(
        aid,
        JSON.stringify({
          created: moment().format(),
          boards: this.boards,
          rounds: this.rounds
        })
      )
      this.$router.push({ name: 'admin', query: { a: aid } })
    }
  },
  computed: {
    boardsDisabled () {
      return this.boards < 1
    },
    roundsDisabled () {
      return this.rounds < 1
    },
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
