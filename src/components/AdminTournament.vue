<template>
  <div>
    <!-- Score dialog -->
    <md-dialog :md-active.sync="showScoreDialog">
      <md-dialog-title>Matchpoäng</md-dialog-title>
      <md-tabs md-alignment="fixed">
        <md-tab :md-label="'Bord ' + (board.number + 1)" v-for="board in boards" :key="board.number">
          <md-field>
            <label>{{ state.players[board.players[0]].name }} poäng</label>
            <md-input v-model="state.players[board.players[0]].matches[state.current_match].match_score" type="number" max="5" required></md-input>
          </md-field>
          <md-field>
            <label>{{ state.players[board.players[1]].name }} poäng</label>
            <md-input v-model="state.players[board.players[1]].matches[state.current_match].match_score" type="number" max="5" required></md-input>
          </md-field>
          <md-field>
            <label>{{ state.players[board.players[2]].name }} poäng</label>
            <md-input v-model="state.players[board.players[2]].matches[state.current_match].match_score" type="number" max="5" required></md-input>
          </md-field>
          <md-field>
            <label>{{ state.players[board.players[3]].name }} poäng</label>
            <md-input v-model="state.players[board.players[3]].matches[state.current_match].match_score" type="number" max="5" required></md-input>
          </md-field>
        </md-tab>
      </md-tabs>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showScoreDialog = false">Stäng</md-button>
        <md-button class="md-primary" @click="setMatchScore()">Nästa match</md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Table of players -->
    <md-card>
      <md-card-content>
        <md-table v-model="state.players">
          <md-table-toolbar>
            <h1 class="md-title">Turnering</h1>
          </md-table-toolbar>
          <md-table-row slot="md-table-row" slot-scope="{ item }">
            <md-table-cell md-label="Spelare">{{ item.name }}</md-table-cell>
            <md-table-cell :md-label="'Runda ' + (match.number + 1)" v-for="match in item.matches" :key="match.number" :class="match.position != null ? 'position' + (match.position + 1) : ''">
              {{ match.board != null ? 'Bord' + (match.board + 1) : 'Ej spelad' }}
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-card-content>
      <md-card-actions>
        <md-button :disabled="state.current_match < 0" @click="showScoreDialog = true">Ge poäng</md-button>
        <md-button :disabled="state.current_match != -1" @click="drawInitialOrder()">Lotta</md-button>
      </md-card-actions>
    </md-card>
  </div>
</template>

<script>
import Shuffle from 'shuffle'

export default {
  name: 'AdminTournament',
  data: () => ({
    showScoreDialog: false,
    state: {},
    boards: []
  }),
  methods: {
    drawInitialOrder () {
      // Create and shuffle deck
      let tickets = []
      for (let i = 0, len = this.state.number_of_boards * 4; i < len; i++) {
        tickets.push({board: Math.floor((i + 4) / 4 - 1), position: i % 4})
      }
      let deck = Shuffle.shuffle({deck: tickets})
      // Assign boards and positions
      for (let i = 0, len = this.state.players.length; i < len; i++) {
        let draw = deck.draw()
        this.state.players[i].matches[0].board = draw.board
        this.state.players[i].matches[0].position = draw.position
      }
      // Enter first match and sort players
      this.state.current_match += 1
      this.sortPlayers()
      this.updateBoards()
    },
    sortPlayers () {
      const match = this.state.current_match
      this.state.players.sort(function (a, b) {
        if (a.matches[match].position > b.matches[match].position) return 1
        if (a.matches[match].position < b.matches[match].position) return -1
      })
      this.state.players.sort(function (a, b) {
        if (a.matches[match].board > b.matches[match].board) return 1
        if (a.matches[match].board < b.matches[match].board) return -1
      })
    },
    updateBoards () {
      // Clear array
      this.boards.splice(0, this.boards.length)
      for (let i = 0, len = this.state.number_of_boards; i < len; i++) {
        this.boards.push({number: i, match: this.state.current_match, players: []})
      }
      for (let i = 0, len = this.state.players.length; i < len; i++) {
        const playerBoardIndex = this.state.players[i].matches[this.state.current_match].board
        this.boards[playerBoardIndex].players.push(i)
      }
    },
    setMatchScore () {
      // TODO
    }
  },
  watch: {
    state: {
      handler () {
        localStorage.setItem(this.$route.query.t, JSON.stringify(this.state))
      },
      deep: true
    }
  },
  mounted: function () {
    if (localStorage.getItem(this.$route.query.t)) {
      this.state = JSON.parse(localStorage.getItem(this.$route.query.t))
    }
  }
}
</script>

<style scoped>
.position1 {
  color: white;
  background-color: blue;
}
.position2 {
  color: black;
  background-color: yellow;
}
.position3 {
  color: white;
  background-color: red;
}
.position4 {
  color: white;
  background-color: green;
}
</style>
