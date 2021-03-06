<template>
  <div>
    <!-- Edit player dialog -->
    <md-dialog :md-active.sync="showPlayerDialog">
      <md-dialog-title>Redigera spelare</md-dialog-title>
      <md-field>
        <label>Namn</label>
        <md-input v-if="selectedPlayer" v-model="selectedPlayer.name"></md-input>
      </md-field>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showPlayerDialog = false">Stäng</md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Score dialog -->
    <md-dialog :md-active.sync="showScoreDialog">
      <md-dialog-title>Match {{ state.currentMatch + 1 }}</md-dialog-title>
      <md-tabs md-alignment="fixed">
        <md-tab :md-label="'Bord ' + (board.number + 1)" v-for="board in state.boards" :key="board.number">
          <md-field>
            <label>{{ state.players[board.players[0]].name }} poäng</label>
            <md-input v-model.number="state.players[board.players[0]].matches[state.currentMatch].matchScore" type="number" max="5" required></md-input>
          </md-field>
          <md-field>
            <label>{{ state.players[board.players[1]].name }} poäng</label>
            <md-input v-model.number="state.players[board.players[1]].matches[state.currentMatch].matchScore" type="number" max="5" required></md-input>
          </md-field>
          <md-field>
            <label>{{ state.players[board.players[2]].name }} poäng</label>
            <md-input v-model.number="state.players[board.players[2]].matches[state.currentMatch].matchScore" type="number" max="5" required></md-input>
          </md-field>
          <md-field>
            <label>{{ state.players[board.players[3]].name }} poäng</label>
            <md-input v-model.number="state.players[board.players[3]].matches[state.currentMatch].matchScore" type="number" max="5" required></md-input>
          </md-field>
        </md-tab>
      </md-tabs>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showScoreDialog = false">Stäng</md-button>
        <md-button class="md-primary" @click="showScoreDialog = false; gotoNextMatch()">Nästa match</md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Table of players -->
    <md-card>
      <md-card-content>
        <md-table v-model="state.players" @md-selected="onSelect">
          <md-table-toolbar>
            <h1 class="md-title">Turnering</h1>
          </md-table-toolbar>
          <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
            <md-table-cell md-label="Spelare">
              {{ item.name }}
            </md-table-cell>
            <md-table-cell :md-label="'Match ' + (match.number + 1)" v-for="match in item.matches" :key="match.number" :class="match.position != null ? 'position' + (match.position + 1) : ''">
              {{ match.board != null ? 'Bord ' + (match.board + 1) : 'Ej spelad' }}
            </md-table-cell>
            <md-table-cell md-label="Poäng">{{ item.totalTournamentScore }} ({{ item.totalMatchScore}})</md-table-cell>
            <md-table-cell>
              <md-button class="md-icon-button" @click="showPlayerDialog = true">
                  <md-icon>edit</md-icon>
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-card-content>
      <md-card-actions>
        <md-button :disabled="state.currentMatch < 0 || state.currentMatch === state.numberOfMatches" @click="showScoreDialog = true">Ge poäng</md-button>
        <md-button :disabled="state.currentMatch != -1" @click="drawInitialOrder()">Lotta</md-button>
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
    showPlayerDialog: false,
    selectedPlayer: null,
    state: {}
  }),
  methods: {
    onSelect (item) {
      this.selectedPlayer = item
    },
    drawInitialOrder () {
      // Create and shuffle deck
      let tickets = []
      for (let i = 0, len = this.state.numberOfBoards * 4; i < len; i++) {
        tickets.push({board: Math.floor((i + 4) / 4 - 1), position: i % 4})
      }
      let deck = Shuffle.shuffle({deck: tickets})
      // Assign boards and positions from draw
      this.state.currentMatch += 1
      for (let i = 0, len = this.state.players.length; i < len; i++) {
        let draw = deck.draw()
        this.state.players[i].matches[this.state.currentMatch].board = draw.board
        this.state.players[i].matches[this.state.currentMatch].position = draw.position
      }
      // Sort players by board
      this.state.players.sort(function (a, b) {
        if (a.matches[0].board > b.matches[0].board) {
          return 1
        } else if (a.matches[0].board < b.matches[0].board) {
          return -1
        } else {
          if (a.matches[0].position > b.matches[0].position) return 1
          if (a.matches[0].position < b.matches[0].position) return -1
          else return 0
        }
      })
      this.updateBoards()
    },
    gotoNextMatch () {
      // Calculate tournament scores from match scores
      for (let board = 0, len = this.state.boards.length; board < len; board++) {
        for (let lhsPlayer = 0; lhsPlayer < 4; lhsPlayer++) {
          let lhsPlayerTournamentScore = 0.0
          const lhsPlayerMatchScore = this.state.players[this.state.boards[board].players[lhsPlayer]].matches[this.state.currentMatch].matchScore
          for (let rhsPlayer = 0; rhsPlayer < 4; rhsPlayer++) {
            if (lhsPlayer === rhsPlayer) {
              continue // is same player
            }
            const rhsPlayerMatchScore = this.state.players[this.state.boards[board].players[rhsPlayer]].matches[this.state.currentMatch].matchScore
            if (lhsPlayerMatchScore === rhsPlayerMatchScore) {
              lhsPlayerTournamentScore += 0.5 // draw
            } else if (lhsPlayerMatchScore > rhsPlayerMatchScore) {
              lhsPlayerTournamentScore += 1.0 // win
            }
          }
          this.state.players[this.state.boards[board].players[lhsPlayer]].matches[this.state.currentMatch].tournamentScore = lhsPlayerTournamentScore
        }
      }
      // Accumulate scores
      for (let i = 0, len = this.state.players.length; i < len; i++) {
        this.state.players[i].totalMatchScore += this.state.players[i].matches[this.state.currentMatch].matchScore
        this.state.players[i].totalTournamentScore += this.state.players[i].matches[this.state.currentMatch].tournamentScore
      }
      if (this.state.currentMatch < this.state.numberOfMatches - 1) {
        // Sort players by score
        this.state.players.sort(function (a, b) {
          if (a.totalTournamentScore < b.totalTournamentScore) {
            return 1
          } else if (a.totalTournamentScore > b.totalTournamentScore) {
            return -1
          } else {
            if (a.totalMatchScore < b.totalMatchScore) return 1
            if (a.totalMatchScore > b.totalMatchScore) return -1
            else return 0
          }
        })
        // Assign boards and positions
        this.state.currentMatch += 1
        for (let i = 0, len = this.state.players.length; i < len; i++) {
          this.state.players[i].matches[this.state.currentMatch].board = Math.floor((i + 4) / 4 - 1)
          this.state.players[i].matches[this.state.currentMatch].position = i % 4
        }
        this.updateBoards()
      }
    },
    updateBoards () {
      this.state.boards.splice(0, this.state.boards.length) // << this clears the array
      for (let i = 0, len = this.state.numberOfBoards; i < len; i++) {
        this.state.boards.push({number: i, match: this.state.currentMatch, players: []})
      }
      for (let i = 0, len = this.state.players.length; i < len; i++) {
        const playerBoardIndex = this.state.players[i].matches[this.state.currentMatch].board
        this.state.boards[playerBoardIndex].players.push(i)
      }
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
  background-color: #448aff;
}
.position2 {
  color: black;
  background-color: #ffff00;
}
.position3 {
  color: white;
  background-color: #ff5252;
}
.position4 {
  color: white;
  background-color: #69f0ae;
}
</style>
